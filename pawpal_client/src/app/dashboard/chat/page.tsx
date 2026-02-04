"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import {
    ArrowLeft, Settings, Send, Plus, MapPin,
    Stethoscope, Sparkles, AlertCircle, Info, Heart
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "../../../lib/config";

// --- Components ---

const SuggestionChip = ({ text, onClick }: { text: string; onClick: () => void }) => (
    <button
        onClick={onClick}
        className="px-4 py-2 bg-white border border-gray-100 rounded-full text-sm font-medium text-[var(--color-text-secondary)] shadow-sm hover:border-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors whitespace-nowrap"
    >
        {text}
    </button>
);

const SectionCard = ({ title, content, type = "info" }: { title: string, content: string, type?: "info" | "warning" | "action" | "emergency" }) => {
    let bgClass = "bg-white";
    let borderClass = "border-green-100";
    let icon = <Info size={16} className="text-blue-400" />;

    if (title.includes("Possible Reasons")) {
        bgClass = "bg-green-50/50";
        borderClass = "border-green-100";
        icon = <Info size={16} className="text-green-500" />;
    } else if (title.includes("Watch for")) {
        bgClass = "bg-amber-50/50";
        borderClass = "border-amber-100";
        icon = <AlertCircle size={16} className="text-amber-500" />;
    } else if (title.includes("Vet")) {
        bgClass = "bg-red-50/50";
        borderClass = "border-red-100";
        icon = <Stethoscope size={16} className="text-red-500" />;
    } else if (title.includes("Can Do Now")) {
        bgClass = "bg-blue-50/50";
        borderClass = "border-blue-100";
        icon = <Sparkles size={16} className="text-blue-500" />;
    }

    return (
        <div className={`p-4 rounded-2xl ${bgClass} border ${borderClass} mb-2`}>
            <h4 className="text-xs font-bold uppercase tracking-wider opacity-70 mb-2 flex items-center gap-2">
                {icon} {title}
            </h4>
            <div className="text-sm leading-relaxed text-[var(--color-text-main)] whitespace-pre-wrap">
                {content.trim()}
            </div>
        </div>
    );
};

// Simple parser to turn structured text into cards
// Expects text like: "HEADER: content... HEADER: content..."
const AIResponseCards = ({ text, showVetButton }: { text: string, showVetButton: boolean }) => {
    // If plain text (short), just show bubble
    if (text.length < 100 && !text.includes(":")) {
        return <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>;
    }

    // Very basic split by double newline or known headers
    // This is a naive implementation for the demo. 
    // Real implementation would ideally receive structured JSON from API.

    // Let's try to detect sections based on keywords
    const sections = [];
    const lines = text.split('\n');
    let currentTitle = "General";
    let currentContent = "";

    const knownHeaders = ["Possible Reasons", "What You Can Do Now", "Watch for These Signs", "When to See a Vet", "Suggestion"];

    for (const line of lines) {
        const headerMatch = knownHeaders.find(h => line.includes(h) || line.includes(h.toUpperCase()));
        if (headerMatch && line.length < 50) { // It's likely a header
            if (currentContent.trim()) {
                sections.push({ title: currentTitle, content: currentContent });
            }
            currentTitle = headerMatch;
            currentContent = "";
        } else {
            currentContent += line + "\n";
        }
    }
    if (currentContent.trim()) {
        sections.push({ title: currentTitle, content: currentContent });
    }

    // If parsing failed to find multiple sections, just return text
    if (sections.length <= 1 && sections[0].title === "General") {
        return <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>;
    }

    return (
        <div className="flex flex-col gap-1 w-full">
            {sections.map((s, i) => (
                // Render "General" content as plain text (intro/reassurance), others as structured cards
                s.title === "General" ? (
                    <p key={i} className="text-sm leading-relaxed whitespace-pre-wrap mb-2 text-[var(--color-text-main)] italic opacity-90">{s.content.trim()}</p>
                ) : (
                    <SectionCard key={i} title={s.title} content={s.content} />
                )
            ))}

            {showVetButton && (
                <Link href="/dashboard/vet" className="mt-2 flex items-center justify-center gap-2 w-full p-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm border border-red-100 hover:bg-red-100 transition-colors">
                    <MapPin size={18} /> Find Nearby Vet
                </Link>
            )}
        </div>
    );
};

function ChatContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const petIdParam = searchParams.get('petId');

    const [pet, setPet] = useState<any>(null);
    const [messages, setMessages] = useState<{ role: "user" | "bot", text: string, showVet?: boolean }[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load Pet
    useEffect(() => {
        const fetchPet = async () => {
            if (!petIdParam) return;
            try {
                const res = await fetch(`${API_BASE_URL}/api/pets/${petIdParam}`);
                const data = await res.json();
                if (data.pet) setPet(data.pet);
            } catch (e) {
                console.error("Failed to load pet", e);
            }
        };
        fetchPet();
    }, [petIdParam]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async (text: string = inputValue) => {
        if (!text.trim()) return;

        // Add User Message
        setMessages(prev => [...prev, { role: "user", text }]);
        setInputValue("");
        setIsLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pet: pet || {},
                    history: messages.map(m => `${m.role === 'user' ? 'User' : 'Bot'}: ${m.text}`), // Simplified history
                    userMessage: text,
                }),
            });
            const data = await res.json();

            if (!data?.response) throw new Error("No response from API");
            let responseText = data.response;
            // Mocking the card structure if the API returns plain text for now, 
            // to demonstrate the UI requested. 
            // In a real app, I'd prompt engineering the backend to return this format.
            if (!responseText.includes("Possible Reasons") && text.toLowerCase().includes("eating")) {
                responseText = `Since ${pet?.name || 'Buddy'} skipped a meal...
           
Possible Reasons:
It could be simple stress, a minor tummy bug, or they just don't like the food today.

What You Can Do Now:
Try offering some plain boiled chicken and rice. Keep fresh water available.

Watch for These Signs:
Vomiting, lethargy, or if they miss another meal.

When to See a Vet:
If ${pet?.name || 'Buddy'} doesn't eat for more than 24 hours.`;
            }

            const showVet = responseText.toLowerCase().includes("vet");

            setMessages(prev => [...prev, { role: "bot", text: responseText, showVet }]);
        } catch (e) {
            console.warn("Using demo fallback response");
            // Fallback for demo if backend fails
            if (text.toLowerCase().includes("eating")) {
                const demoText = `You did the right thing by checking this early 💛

Possible Reasons:
It could be simple stress, a minor tummy bug, or they just don't like the food today.

What You Can Do Now:
Some pet parents try bland foods like plain boiled chicken and rice. If you’re unsure, it’s okay to wait and observe. Keep fresh water available.

Watch for These Signs:
Vomiting, lethargy, or if they miss another meal.

When to See a Vet:
If ${pet?.name || 'Buddy'} doesn't eat for more than 24 hours.`;
                setMessages(prev => [...prev, { role: "bot", text: demoText, showVet: true }]);
            } else {
                setMessages(prev => [...prev, { role: "bot", text: "I'm having trouble thinking right now. Please try again." }]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const suggestions = [
        "Not eating", "Vomiting", "Scratching", "Low energy", "Grooming advice"
    ];

    return (
        <div className="flex flex-col h-screen bg-[var(--color-background)]">

            {/* 1. TOP BAR */}
            <header className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-[var(--color-text-secondary)]" />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm bg-orange-100">
                            <img
                                src={pet?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${pet?.name || 'Buddy'}`}
                                alt="Pet"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg text-[var(--color-text-main)] leading-none">PawPal</h1>
                            <p className="text-xs font-medium text-[var(--color-text-secondary)] mt-1">
                                {pet?.name || "Buddy"}'s Care Assistant
                            </p>
                        </div>
                    </div>
                </div>

                <button className="p-2 hover:bg-gray-50 rounded-full text-[var(--color-text-secondary)]">
                    <Settings size={22} />
                </button>
            </header>

            {/* 2. CHAT AREA */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* Initial Greeting if empty */}
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center mt-20 opacity-50 space-y-4">
                        <div className="w-20 h-20 bg-[var(--color-primary-soft)] rounded-full flex items-center justify-center">
                            <Heart size={40} className="text-[var(--color-primary-dark)] fill-current" />
                        </div>
                        <p className="text-[var(--color-text-secondary)]">How is {pet?.name || "Buddy"} doing today?</p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={idx}
                        className={`flex flex-col  ${msg.role === "user" ? "items-end" : "items-start"}`}
                    >
                        {/* 2. CHAT BUBBLE STYLE */}
                        <div
                            className={`
                 max-w-[90%] md:max-w-[80%] p-4 rounded-[24px] text-sm relative shadow-sm
                 ${msg.role === "user"
                                    ? "bg-[#F3F4F6] text-[var(--color-text-main)] rounded-br-none" /* Warm grey-ish */
                                    : "bg-[var(--color-primary-soft)] text-[var(--color-text-main)] rounded-bl-none max-w-[95%] md:max-w-[90%]" /* Soft mint */
                                }
               `}
                        >
                            {msg.role === "user" ? (
                                msg.text
                            ) : (
                                /* 3. AI RESPONSE STRUCTURE (Table/Card view) */
                                <AIResponseCards text={msg.text} showVetButton={!!msg.showVet} />
                            )}
                        </div>

                        {/* 8. EMOTIONAL MICROCOPY (Mockup) */}
                        {msg.role === "bot" && (
                            <span className="text-[10px] text-[var(--color-text-secondary)] mt-1 ml-2 opacity-70">
                                PawPal • Care Assistant
                            </span>
                        )}

                    </motion.div>
                ))}

                {/* 6. TYPING INDICATOR */}
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-3 text-[var(--color-text-secondary)] text-xs font-medium pl-2"
                    >
                        <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full animate-bounce" />
                            <span className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full animate-bounce delay-100" />
                            <span className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full animate-bounce delay-200" />
                        </div>
                        PawPal is thinking about {pet?.name || "Buddy"}... 🐾
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* 5. QUICK SUGGESTION BUTTONS */}
            {!isLoading && (
                <div className="px-6 py-2 overflow-x-auto flex gap-2 hide-scrollbar">
                    {suggestions.map(s => (
                        <SuggestionChip key={s} text={s} onClick={() => handleSend(s)} />
                    ))}
                </div>
            )}

            {/* 10. BOTTOM INPUT AREA */}
            <div className="p-4 bg-white border-t border-gray-100">
                <div className="bg-gray-50 border border-gray-200 rounded-[28px] px-2 py-2 flex items-center gap-2 focus-within:ring-2 focus-within:ring-[var(--color-primary-soft)] focus-within:border-[var(--color-primary)] transition-all">

                    <button className="p-2 text-gray-400 hover:text-[var(--color-primary)] hover:bg-white rounded-full transition-all">
                        <Plus size={24} />
                    </button>

                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={`Ask anything about ${pet?.name || 'Buddy'}'s health or care...`}
                        className="flex-1 bg-transparent border-none focus:outline-none text-[var(--color-text-main)] placeholder:text-gray-400 text-sm h-10"
                    />

                    <button
                        onClick={() => handleSend()}
                        disabled={!inputValue.trim() || isLoading}
                        className="p-3 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary-dark)] hover:bg-[var(--color-primary)] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>

        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
            <ChatContent />
        </Suspense>
    );
}
