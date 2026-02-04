"use client";

import { Bell, MapPin, Search, Stethoscope, MessageCircle, Scissors, ChevronRight, MoreHorizontal, Home, Clipboard, ShoppingBag, Sparkles } from "lucide-react";
import Link from "next/link";
import { ChatModal } from "../../components/ChatModal";
import { HealthModals } from "../../components/HealthModals";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Dashboard() {
    const [dailyTip, setDailyTip] = useState("");
    const [loadingTip, setLoadingTip] = useState(true);
    const [pet, setPet] = useState<any>(null);
    const [health, setHealth] = useState<any>(null);
    const [modalType, setModalType] = useState<'weight' | 'vaccination' | null>(null);

    const loadDashboardData = async () => {
        // Only set loading if we don't have data yet to avoid flicker on refresh
        if (!pet) setLoadingTip(true);
        try {
            // 1. Fetch Pet Profile
            const profileRes = await fetch("http://localhost:3000/api/pet");
            const profileData = await profileRes.json();

            if (profileData.pet) {
                setPet(profileData.pet);

                // 2. Fetch Daily Tip using this pet (only if we don't have one or on hard refresh)
                if (!dailyTip) {
                    const tipRes = await fetch("http://localhost:3000/api/daily-tip", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ pet: profileData.pet })
                    });
                    const tipData = await tipRes.json();
                    if (tipData.tip) {
                        setDailyTip(tipData.tip);
                    }
                }
            }

            // 3. Fetch Health Metrics
            const healthRes = await fetch("http://localhost:3000/api/health-metrics");
            const healthData = await healthRes.json();
            if (healthData.metrics) {
                setHealth(healthData.metrics);
            }

        } catch (error) {
            console.error("Failed to load dashboard data", error);
            setDailyTip("Hydration is key! Make sure your pet drinks water after their morning walk.");
        } finally {
            setLoadingTip(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    const getLastWeight = () => {
        if (!health?.weightHistory?.length) return "Unknown";
        return health.weightHistory[health.weightHistory.length - 1].weight + " kg";
    };

    const getVaccinationStatus = () => {
        if (!health?.nextVaccinationDate) return "Unknown";
        return `Due: ${health.nextVaccinationDate}`;
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
                    <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-[var(--color-secondary)] overflow-hidden border-4 border-white shadow-sm">
                            {/* Placeholder for Pet */}
                            <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${pet?.name || 'Bruno'}&backgroundColor=FFDAB9`}
                                alt={pet?.name || "Pet"}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-[var(--color-text-main)]">{pet?.name || "Your Pet"}</h1>
                            <div className="px-2 py-0.5 bg-green-100 rounded-full border border-green-200 flex items-center gap-1">
                                <span className="text-[10px] font-bold text-green-700">Healthy Today 💚</span>
                            </div>
                        </div>
                        <p className="text-[11px] text-[var(--color-text-secondary)] font-medium mt-0.5 ml-0.5 opacity-80">No immediate concerns</p>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1.5">Good Morning! ☀️</p>
                        <p className="text-xs text-[var(--color-text-secondary)] opacity-80">Here’s {pet?.name || "your pet"}'s care summary for today.</p>
                    </div>
                </div>

                <button className="p-3 bg-white rounded-full shadow-sm text-[var(--color-text-secondary)] hover:text-[var(--color-warning)] transition-colors">
                    <Bell size={20} />
                </button>
            </header>

            {/* Scrollable Content */}
            <div className="px-6 space-y-6">

                {/* Health Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div
                        onClick={() => setModalType('vaccination')}
                        className="bg-white p-5 rounded-[24px] shadow-sm flex flex-col justify-between h-full border border-gray-50 cursor-pointer hover:scale-[1.02] transition-transform active:scale-95"
                    >
                        <div>
                            <h3 className="font-bold text-[var(--color-text-main)] text-sm flex items-center gap-2">🩺 Vaccination</h3>
                            <p className="text-xs text-[var(--color-text-secondary)] mt-2 font-medium">{getVaccinationStatus()}</p>
                        </div>
                        <div className="w-full h-1.5 bg-[var(--color-background)] rounded-full mt-3 overflow-hidden">
                            <div className="h-full bg-[var(--color-primary)] w-[70%]" />
                        </div>
                    </div>

                    <div
                        onClick={() => setModalType('weight')}
                        className="bg-white p-5 rounded-[24px] shadow-sm flex flex-col justify-between h-full border border-gray-50 cursor-pointer hover:scale-[1.02] transition-transform active:scale-95"
                    >
                        <div>
                            <h3 className="font-bold text-[var(--color-text-main)] text-sm flex items-center gap-2">⚖️ Weight</h3>
                            <p className="text-xs text-[var(--color-text-secondary)] mt-2 font-medium">{getLastWeight()} • Steady</p>
                        </div>
                        {/* Mini graph placeholder */}
                        <div className="flex items-end gap-1 h-4 mt-3 opacity-50">
                            <div className="w-1.5 bg-[var(--color-secondary)] h-[40%] rounded-t-sm" />
                            <div className="w-1.5 bg-[var(--color-secondary)] h-[60%] rounded-t-sm" />
                            <div className="w-1.5 bg-[var(--color-secondary)] h-[50%] rounded-t-sm" />
                            <div className="w-1.5 bg-[var(--color-secondary)] h-[80%] rounded-t-sm" />
                            <div className="w-1.5 bg-[var(--color-secondary)] h-[70%] rounded-t-sm" />
                        </div>
                    </div>
                </div>

                {/* Care for Bruno Today */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-[var(--color-text-main)]">Care for {pet?.name || 'Your Pet'} Today</h2>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 hide-scrollbar">

                        {/* Ask AI */}
                        <ChatModal pet={pet} />

                        {/* Find Vet */}
                        <Link href="/dashboard/vet" className="flex flex-col items-center gap-2 min-w-[80px]">
                            <div className="w-16 h-16 rounded-[20px] bg-[var(--color-secondary)] shadow-lg shadow-[var(--color-secondary-soft)] flex items-center justify-center text-white">
                                <MapPin size={28} />
                            </div>
                            <span className="text-sm font-medium text-[var(--color-text-main)]">Find Vet</span>
                        </Link>

                        {/* Grooming */}
                        <button className="flex flex-col items-center gap-2 min-w-[80px]">
                            <div className="w-16 h-16 rounded-[20px] bg-[var(--color-primary-soft)] flex items-center justify-center text-[var(--color-primary-dark)]">
                                <Scissors size={28} />
                            </div>
                            <span className="text-sm font-medium text-[var(--color-text-main)]">Grooming</span>
                        </button>

                        {/* Pet Services */}
                        <Link href="/dashboard/services" className="flex flex-col items-center gap-2 min-w-[80px]">
                            <div className="w-16 h-16 rounded-[20px] bg-white flex items-center justify-center text-[var(--color-text-secondary)] border border-gray-50">
                                <ShoppingBag size={28} />
                            </div>
                            <span className="text-sm font-medium text-[var(--color-text-main)]">Pet Services</span>
                        </Link>

                    </div>
                </section>

                {/* Articles / Daily Tip */}
                <section className="bg-gradient-to-br from-green-50 to-emerald-50/50 p-5 rounded-[24px] shadow-sm flex items-start gap-4 border border-green-100/50">
                    <div className="w-12 h-12 rounded-xl bg-white flex-shrink-0 flex items-center justify-center text-[var(--color-primary-dark)] shadow-sm">
                        <Sparkles size={24} className="fill-[var(--color-primary)] text-[var(--color-primary)] opacity-80" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-[var(--color-text-main)]">Today’s Tip for {pet?.name || 'Your Pet'} 🐶</h3>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1 line-clamp-2 leading-relaxed opacity-90">
                            {loadingTip ? `Fetching a personalized tip for ${pet?.name || 'your pet'}...` : dailyTip}
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
                <button className="flex flex-col items-center gap-1 hover:text-[var(--color-primary-dark)] transition-colors">
                    <MessageCircle size={24} />
                    <span className="text-[10px] font-medium">Assistant</span>
                </button>

                {/* Services */}
                <Link href="/dashboard/services" className="flex flex-col items-center gap-1 hover:text-[var(--color-primary-dark)] transition-colors">
                    <MapPin size={24} />
                    <span className="text-[10px] font-medium">Services</span>
                </Link>

                {/* Records */}
                <Link href="/dashboard/records" className="flex flex-col items-center gap-1 hover:text-[var(--color-primary-dark)] transition-colors">
                    <Clipboard size={24} />
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
                currentWeight={health?.weightHistory?.[health.weightHistory.length - 1]?.weight?.toString()}
                onSuccess={loadDashboardData}
            />

        </motion.main>
    );
}
