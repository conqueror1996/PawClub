"use client";

import { Bell, MapPin, Search, Stethoscope, MessageCircle, Scissors, ChevronRight, MoreHorizontal, Home, Clipboard as ClipboardIcon, ShoppingBag, Sparkles, Activity, ArrowRight, Scale, Pill, ChevronDown, Menu, Mic, Plus, Settings, User, X } from "lucide-react";
import Link from "next/link";
import { ChatModal } from "../../components/ChatModal";
import { HealthModals } from "../../components/HealthModals";
import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../../lib/config";
import { useSearchParams, usePathname } from "next/navigation";

// Separate component that uses useSearchParams
function DashboardContent() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [pets, setPets] = useState<any[]>([]);
    const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
    const [dailyTip, setDailyTip] = useState("");
    const [loadingTip, setLoadingTip] = useState(true);
    const [pet, setPet] = useState<any>(null);
    const [modalType, setModalType] = useState<'weight' | 'vaccination' | null>(null);



    // Initial load: Get all pets then load the active one
    useEffect(() => {
        const init = async () => {
            try {
                // 1. Fetch all pets to populate the switcher
                const petsRes = await fetch(`${API_BASE_URL}/api/pets`);
                const petsData = await petsRes.json();

                if (petsData.pets && petsData.pets.length > 0) {
                    setPets(petsData.pets);

                    // Determine which pet to show
                    const paramId = searchParams.get('petId');

                    let activeId = petsData.pets[0].id;
                    if (paramId && petsData.pets.find((p: any) => p.id === Number(paramId))) {
                        activeId = Number(paramId);
                    }

                    console.log("Setting active pet ID:", activeId, "from param:", paramId);
                    setSelectedPetId(activeId);
                }
            } catch (error) {
                console.error("Failed to load pets list:", error);
            }
        };
        init();
    }, [searchParams]);

    // Load specific pet data when selection changes
    useEffect(() => {
        if (selectedPetId) {
            loadPetData(selectedPetId);
        }
    }, [selectedPetId]);

    const loadPetData = async (id: number) => {
        setLoadingTip(true);
        try {
            console.log(`Fetching details for pet ID: ${id}`);
            const res = await fetch(`${API_BASE_URL}/api/pets/${id}`);
            const data = await res.json();

            if (data.pet) {
                setPet(data.pet);

                // Fetch daily tip for this specific pet
                const tipRes = await fetch(`${API_BASE_URL}/api/daily-tip`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ pet: data.pet })
                });
                const tipData = await tipRes.json();
                if (tipData.tip) setDailyTip(tipData.tip);
            }
        } catch (error) {
            console.error("Failed to load pet details:", error);
            setDailyTip("Hydration is key! Make sure your pet drinks water after their morning walk.");
        } finally {
            setLoadingTip(false);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    const getLastWeight = () => {
        const history = pet?.healthMetrics?.weightHistory;
        if (!history?.length) return "Unknown";
        return history[history.length - 1].weight + " kg";
    };

    const getVaccinationStatus = () => {
        if (!pet?.healthMetrics?.nextVaccinationDate) return "Unknown";
        return `Due: ${pet.healthMetrics.nextVaccinationDate}`;
    };

    return (
        <motion.main
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="min-h-screen bg-[var(--color-background)] pb-24"
        >
            {/* Header / Pet Switcher */}
            <header className="px-6 pt-12 pb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Avatar with Ring */}
                    <div className="relative group cursor-pointer">
                        <div className="w-14 h-14 rounded-full bg-[var(--color-secondary)] overflow-hidden border-4 border-white shadow-sm group-hover:scale-105 transition-transform">
                            <img
                                src={pet?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${pet?.name || 'Bruno'}&backgroundColor=FFDAB9`}
                                alt={pet?.name || "Pet"}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 relative">
                            {/* Pet Switcher Dropdown */}
                            <div className="relative">
                                <select
                                    value={selectedPetId || ''}
                                    onChange={(e) => setSelectedPetId(Number(e.target.value))}
                                    className="appearance-none bg-transparent text-xl font-bold text-[var(--color-text-main)] pr-6 cursor-pointer focus:outline-none"
                                >
                                    {pets.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                <ChevronRight size={16} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 rotate-90" />
                            </div>

                            <div className="px-2 py-0.5 bg-green-100 rounded-full border border-green-200 flex items-center gap-1">
                                <span className="text-[10px] font-bold text-green-700">Healthy Today 💚</span>
                            </div>
                        </div>
                        <p className="text-[11px] text-[var(--color-text-secondary)] font-medium mt-0.5 ml-0.5 opacity-80">No immediate concerns</p>
                        <h2 className="text-xl font-bold text-gray-900 mb-1 leading-tight">
                            {getGreeting()} <span className="text-2xl">☀️</span>
                        </h2>
                        <p className="text-gray-500 text-sm">Here's how {pet?.name || 'your pet'} is doing today.</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Link
                        href="/dashboard/pets"
                        className="p-3 bg-white rounded-full shadow-sm text-gray-500 hover:text-[var(--color-primary)] transition-colors relative"
                        title="Manage Pets"
                        aria-label="Manage Pets"
                    >
                        <MoreHorizontal size={20} />
                    </Link>
                    <Link
                        href="/dashboard/notifications"
                        className="p-3 bg-white rounded-full shadow-sm text-gray-500 hover:text-[var(--color-warning)] transition-colors relative"
                        title="Notifications"
                        aria-label="Notifications"
                    >
                        <Bell size={20} />
                        {/* Optional unread dot could go here */}
                    </Link>
                </div>
            </header>

            {/* Scrollable Content */}
            <div className="px-6 space-y-6">

                {/* Health Overview Section */}
                <section>
                    <div className="flex items-center justify-between mb-3 px-2">
                        <h2 className="text-lg font-bold text-gray-900">{pet?.name || 'Pet'}'s Health Overview</h2>
                        {(!pet?.healthMetrics?.weightHistory?.length || !pet?.healthMetrics?.nextVaccinationDate) && (
                            <span className="text-[10px] text-orange-500 font-medium bg-orange-50 px-2 py-1 rounded-full animate-pulse">
                                Add details to unlock tips
                            </span>
                        )}
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 snap-x">
                        {/* Vaccination Card */}
                        <div
                            onClick={() => setModalType('vaccination')}
                            className="snap-center shrink-0 w-40 bg-white p-4 rounded-[24px] shadow-sm border border-gray-50 flex flex-col justify-between h-40 relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform active:scale-95"
                        >
                            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                            <div className="relative z-10">
                                <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-3">
                                    <Activity size={18} />
                                </div>
                                <p className="text-gray-400 text-xs font-medium">Vaccination</p>
                                <h3 className="text-gray-800 font-bold text-lg leading-tight mt-1">
                                    {getVaccinationStatus() === 'No records yet' ? 'No records yet' : getVaccinationStatus()}
                                </h3>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); setModalType('vaccination'); }}
                                className="text-blue-500 text-xs font-bold flex items-center gap-1 mt-auto hover:gap-2 transition-all"
                            >
                                {getVaccinationStatus() === 'No records yet' ? 'Add Record' : 'Update'} <ArrowRight size={12} />
                            </button>
                        </div>

                        {/* Weight Card - Dynamic Graph */}
                        <div
                            onClick={() => setModalType('weight')}
                            className="snap-center shrink-0 w-40 bg-white p-4 rounded-[24px] shadow-sm border border-gray-50 flex flex-col justify-between h-40 relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform active:scale-95"
                        >
                            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-50 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center text-orange-500">
                                        <Scale size={18} />
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                                        {getLastWeight() === 'No records yet' ? 'No Weight' : getLastWeight()}
                                    </span>
                                </div>

                                {/* Dynamic Bar Graph */}
                                <div className="flex-1 flex items-end gap-1 pb-1">
                                    {(() => {
                                        const history = pet?.healthMetrics?.weightHistory || [];
                                        const recent = history.slice(-7);

                                        if (recent.length === 0) {
                                            return <div className="text-[10px] text-gray-400 w-full text-center self-center">No history yet</div>;
                                        }

                                        const weights = recent.map((r: any) => r.weight);
                                        const max = Math.max(...weights) * 1.1;

                                        return recent.map((record: any, idx: number) => {
                                            const heightPercent = max > 0 ? (record.weight / max) * 100 : 0;
                                            return (
                                                <div key={idx} className="flex-1 flex flex-col justify-end group/bar relative">
                                                    <div
                                                        className="w-full bg-[var(--color-secondary)] rounded-t-sm hover:opacity-100 opacity-70 transition-all"
                                                        style={{ height: `${Math.max(heightPercent, 10)}%` }}
                                                    />
                                                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                        {record.weight}kg
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>

                                <button
                                    onClick={(e) => { e.stopPropagation(); setModalType('weight'); }}
                                    className="text-[var(--color-secondary)] text-xs font-bold flex items-center gap-1 mt-auto hover:gap-2 transition-all"
                                >
                                    Log Weight <ArrowRight size={12} />
                                </button>
                            </div>
                        </div>

                        {/* Medications Card */}
                        <Link href="/dashboard/medications" className="snap-center shrink-0 w-40 bg-white p-4 rounded-[24px] shadow-sm border border-gray-50 flex flex-col justify-between h-40 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                            <div className="relative z-10">
                                <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-3">
                                    <Pill size={18} />
                                </div>
                                <p className="text-gray-400 text-xs font-medium">Medications</p>
                                <h3 className="text-gray-800 font-bold text-lg leading-tight mt-1">2 Active</h3>
                            </div>
                            <div className="text-emerald-500 text-xs font-bold flex items-center gap-1 mt-auto hover:gap-2 transition-all">
                                Manage <ArrowRight size={12} />
                            </div>
                        </Link>
                    </div>
                </section>

                {/* Quick Care Grid */}
                <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-4 px-2">How can we help {pet?.name || 'your pet'}?</h2>
                    <div className="flex gap-2 overflow-x-auto pb-4">
                        <Link href={`/dashboard/chat?petId=${pet?.id || ''}`} className="flex flex-col items-center gap-2 group min-w-[72px]">
                            <div className="w-16 h-16 rounded-[24px] bg-[var(--color-primary)] text-white flex items-center justify-center text-2xl shadow-lg shadow-orange-100 group-hover:scale-105 transition-transform">
                                💬
                            </div>
                            <span className="text-xs font-medium text-gray-600">Ask AI</span>
                        </Link>

                        <Link href="/dashboard/vet" className="flex flex-col items-center gap-2 group min-w-[72px]">
                            <div className="w-16 h-16 rounded-[24px] bg-white border border-gray-100 flex items-center justify-center text-2xl shadow-sm group-hover:border-[var(--color-primary)] transition-colors">
                                🩺
                            </div>
                            <span className="text-xs font-medium text-gray-600">Find Vet</span>
                        </Link>

                        <Link href="/dashboard/medications" className="flex flex-col items-center gap-2 group min-w-[72px]">
                            <div className="w-16 h-16 rounded-[24px] bg-white border border-gray-100 flex items-center justify-center text-2xl shadow-sm group-hover:border-emerald-500 transition-colors">
                                💊
                            </div>
                            <span className="text-xs font-medium text-gray-600">Meds</span>
                        </Link>

                        <Link href="/dashboard/photos" className="flex flex-col items-center gap-2 group min-w-[72px]">
                            <div className="w-16 h-16 rounded-[24px] bg-white border border-gray-100 flex items-center justify-center text-2xl shadow-sm group-hover:border-pink-500 transition-colors">
                                📸
                            </div>
                            <span className="text-xs font-medium text-gray-600">Gallery</span>
                        </Link>

                        <Link href="/dashboard/services" className="flex flex-col items-center gap-2 group min-w-[72px]">
                            <div className="w-16 h-16 rounded-[24px] bg-white border border-gray-100 flex items-center justify-center text-2xl shadow-sm group-hover:border-[var(--color-secondary)] transition-colors">
                                ⭐
                            </div>
                            <span className="text-xs font-medium text-gray-600">Services</span>
                        </Link>
                    </div>
                </div>

                {/* Articles / Daily Tip */}
                <section className="bg-gradient-to-br from-green-50 to-emerald-50/50 p-5 rounded-[24px] shadow-sm flex items-start gap-4 border border-green-100/50">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm shrink-0">
                        {loadingTip ? '...' : (dailyTip ? '💡' : '✨')}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-sm mb-1">Today's Tip for {pet?.name || 'Your Pet'} 🐶</h3>
                        <p className="text-xs text-gray-600 leading-relaxed">
                            {loadingTip ? "Loading helpful tip..." : (dailyTip || `Remember to check ${pet?.name || 'your pet'}'s ears weekly, as floppy ears can trap moisture and cause infections. 💡`)}
                        </p>
                    </div>
                </section>

            </div>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-background)] px-6 py-3 flex justify-between items-center rounded-t-[32px] shadow-[0_-5px_20px_rgba(0,0,0,0.03)] text-[var(--color-text-secondary)] pb-6">

                {/* Home */}
                <button className="flex flex-col items-center gap-1 text-[var(--color-primary-dark)]">
                    <Home size={24} className="stroke-[2.5px]" />
                    <span className="text-[10px] font-bold">Home</span>
                </button>

                {/* Assistant */}
                <Link
                    href={`/dashboard/chat?petId=${selectedPetId || ''}`}
                    className="flex flex-col items-center gap-1 hover:text-[var(--color-primary-dark)] transition-colors"
                >
                    <MessageCircle size={24} />
                    <span className="text-[10px] font-medium">Assistant</span>
                </Link>

                {/* Services */}
                <Link href="/dashboard/services" className="flex flex-col items-center gap-1 hover:text-[var(--color-primary-dark)] transition-colors">
                    <MapPin size={24} />
                    <span className="text-[10px] font-medium">Services</span>
                </Link>

                {/* Records */}
                <Link href="/dashboard/records" className={`flex flex-col items-center gap-1 ${pathname.includes('/records') ? 'text-[var(--color-primary)]' : 'text-gray-400'}`}>
                    <ClipboardIcon size={24} />
                    <span className="text-[10px] font-medium">Records</span>
                </Link>

                {/* Profile */}
                <Link href="/dashboard/profile" className="flex flex-col items-center gap-1 hover:text-[var(--color-primary-dark)] transition-colors">
                    <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden ring-1 ring-gray-100">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=User" alt="User" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-medium">Profile</span>
                </Link>
            </nav>

            <HealthModals
                isOpen={!!modalType}
                onClose={() => setModalType(null)}
                type={modalType}
                currentWeight={pets.length > 0 && selectedPetId ? getLastWeight() : "0"}
                onSuccess={() => selectedPetId && loadPetData(selectedPetId)}
            />

        </motion.main>
    );
}

// Default export wraps the content in Suspense
export default function Dashboard() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
            <DashboardContent />
        </Suspense>
    );
}
