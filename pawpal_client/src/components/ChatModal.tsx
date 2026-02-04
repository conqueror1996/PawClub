"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Sparkles } from "lucide-react";
import { API_BASE_URL } from "../lib/config";

export function ChatModal({ pet }: { pet: any }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMsg = inputValue;
        setInputValue("");
        setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pet: pet || { // Fallback if no pet provided
                        name: "Bruno",
                        species: "Dog",
                        breed: "Golden Retriever",
                        age: 5,
                        weight: "32kg",
                        gender: "Male",
                        activityLevel: "Moderate"
                    },
                    history: [],
                    memory: messages.slice(-5).map(m => `${m.role === 'user' ? 'User' : 'Bot'}: ${m.text}`), // Keep last 5 msgs for context
                    userMessage: userMsg,
                }),
            });

            const data = await response.json();
            setMessages((prev) => [...prev, { role: "bot", text: data.response || "Something went wrong..." }]);
        } catch (error) {
            console.error(error);
            setMessages((prev) => [...prev, { role: "bot", text: "⚠️ I'm having trouble connecting to my brain right now. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex flex-col items-center gap-2 min-w-[80px] group cursor-pointer"
            >
                <div className="w-16 h-16 rounded-[20px] bg-[var(--color-primary)] shadow-lg shadow-[var(--color-primary-soft)] flex items-center justify-center text-white group-hover:scale-105 transition-transform duration-300">
                    <MessageCircle size={28} />
                </div>
                <span className="text-sm font-medium text-[var(--color-text-main)]">Ask AI</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-lg h-[80vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden relative animate-slide-up">

                        {/* Header */}
                        <div className="bg-[var(--color-primary)] p-4 flex items-center justify-between text-white shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-full">
                                    <Bot size={24} className="fill-current" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-lg">PawPal AI</h2>
                                    <p className="text-xs text-white/80">Always here for {pet?.name || 'Bruno'}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 space-y-4 opacity-70">
                                    <Sparkles size={48} className="text-[var(--color-primary-soft)]" />
                                    <p>Ask me anything about {pet?.name || 'your pet'}'s health, diet, or behavior!</p>
                                </div>
                            )}

                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[85%] p-4 rounded-2xl text-sm whitespace-pre-wrap ${msg.role === "user"
                                            ? "bg-[var(--color-primary)] text-white rounded-br-none"
                                            : "bg-white border border-gray-100 text-gray-700 shadow-sm rounded-bl-none"
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                                        <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-bounce delay-100" />
                                        <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-bounce delay-200" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSend();
                                }}
                                className="flex items-center gap-2"
                            >
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={`Ask about ${pet?.name || 'your pet'}...`}
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] transition-all text-gray-800 placeholder:text-gray-400"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !inputValue.trim()}
                                    className="p-3 bg-[var(--color-primary)] text-white rounded-full hover:bg-[var(--color-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center min-w-[44px]"
                                >
                                    <Send size={20} className={isLoading ? "opacity-0" : "ml-0.5"} />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
