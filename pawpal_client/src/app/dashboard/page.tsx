"use client";

import { Bell, MapPin, Search, Stethoscope, MessageCircle, Scissors, ChevronRight, MoreHorizontal, Home, Clipboard as ClipboardIcon, ShoppingBag, Sparkles, Activity, ArrowRight, Scale, Pill, ChevronDown, Menu, Mic, Plus, Settings, User, X, AlertCircle, PawPrint, Heart, AlertTriangle, History } from "lucide-react";
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
                if (tipData.tip) {
                    // Safety fix: Ensure backend placeholder names are replaced with actual pet name
                    const cleanTip = tipData.tip.replace(/Bruno/g, data.pet.name).replace(/Pet/g, data.pet.name);
                    setDailyTip(cleanTip);
                }
            }
        } catch (error) {
            console.error("Failed to load pet details:", error);
            setDailyTip(`Hydration is key! Make sure ${pet?.name || 'your pet'} drinks water after the morning walk.`);
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
        if (!history?.length) return "No weight history logged";
        return history[history.length - 1].weight + " kg";
    };

    const getVaccinationStatus = () => {
        if (!pet?.healthMetrics?.nextVaccinationDate) return "No vaccination records yet";
        return `Due: ${pet.healthMetrics.nextVaccinationDate}`;
    };

    const getHealthMetrics = () => {
        if (!pet) return { score: 0, label: 'Loading...', color: 'text-gray-400', subText: 'Loading data...', actionItems: [] };

        const hasVaccine = !!pet?.healthMetrics?.nextVaccinationDate;
        const hasWeight = (pet?.healthMetrics?.weightHistory?.length || 0) > 0;

        // Base score from health records
        let score = 50 + (hasVaccine ? 25 : 0) + (hasWeight ? 25 : 0);

        const actionItems = [];
        if (!hasVaccine) actionItems.push("Vaccination overdue");
        if (!hasWeight) actionItems.push("Weight not logged");

        // Bonus for "Happiness" (randomized slightly to feel dynamic)
        const happinessBonus = 10;
        score = Math.min(score, 100);

        if (actionItems.length === 0) actionItems.push("All clear!");

        if (score >= 90) return { score, label: 'Excellent Condition 🏆', color: 'text-green-700', subText: 'Feeling loved & healthy!', actionItems };
        if (score >= 75) return { score, label: 'Doing Good 🌟', color: 'text-amber-700', subText: 'Keep it up!', actionItems };
        return { score, label: 'Needs Attention ⚠️', color: 'text-red-600', subText: `${actionItems.length} items need care`, actionItems };
    };

    const health = getHealthMetrics();

    return (
        <motion.main
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="min-h-screen bg-[var(--color-background)] pb-24"
        >
            {/* Header / Pet Switcher */}
            <header className="px-6 pt-8 pb-4">
                {/* Level 1: Primary Focus - Pet Status Card + Nav */}
                <div className="flex items-start justify-between gap-4 mb-6">
                    {/* Compact Pet Status Card */}
                    <div className="flex-1 bg-white p-4 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="relative w-12 h-12 shrink-0">
                            <div className="w-12 h-12 rounded-full bg-[var(--color-secondary)] overflow-hidden border-2 border-white shadow-sm">
                                <img
                                    src={pet?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${pet?.name || 'Bruno'}&backgroundColor=FFDAB9`}
                                    alt={pet?.name || "Pet"}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1">
                                <select
                                    value={selectedPetId || ''}
                                    onChange={(e) => setSelectedPetId(Number(e.target.value))}
                                    className="font-bold text-gray-900 bg-transparent text-lg focus:outline-none cursor-pointer truncate max-w-[140px]"
                                >
                                    {pets.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="text-gray-400" />
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-[10px] font-bold ${health.color} flex items-center gap-1`}>
                                    {health.label}
                                </span>
                                <span className={`text-[10px] truncate w-24 ${health.score < 90 ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {health.actionItems.length > 0 ? `• ${health.actionItems.length} items` : `• ${health.subText}`}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Nav Icons */}
                    <div className="flex gap-2 shrink-0">
                        <Link
                            href="/dashboard/pets"
                            className="w-12 h-12 bg-white rounded-full shadow-sm text-gray-500 hover:text-[var(--color-primary)] transition-colors flex items-center justify-center border border-gray-50"
                            title="Pet List"
                        >
                            <PawPrint size={20} />
                        </Link>
                        <Link
                            href="/dashboard/notifications"
                            className="w-12 h-12 bg-white rounded-full shadow-sm text-gray-500 hover:text-[var(--color-warning)] transition-colors flex items-center justify-center border border-gray-50"
                            title="Notifications"
                        >
                            <Bell size={20} />
                        </Link>
                    </div>
                </div>

                {/* Level 2: Emotional Context (Greeting) */}
                <div className="px-2">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        {getGreeting()} <span className="text-xl">☀️</span>
                    </h2>
                    <p className="text-gray-500 text-xs mt-0.5">Here's how {pet?.name || 'your pet'}'s doing today.</p>
                </div>
            </header>

            {/* Scrollable Content */}
            <div className="px-6 space-y-6">

                {/* EMPTY STATE: No Pets */}
                {pets.length === 0 && !loadingTip && (
                    <div className="text-center py-12 px-2 animate-fade-in">
                        <div className="w-32 h-32 bg-[var(--color-primary-soft)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-[var(--color-primary)]/20 relative">
                            <span className="text-5xl">🐶</span>
                            <span className="text-4xl absolute -bottom-2 -right-2">🐱</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Let’s add your first furry friend 🐶</h3>
                        <p className="text-gray-500 max-w-xs mx-auto mb-8 leading-relaxed">
                            PawPal gives personalized care tips once we know your pet.
                        </p>
                        <Link
                            href="/dashboard/pets"
                            className="bg-[var(--color-primary)] text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-orange-200 hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 mx-auto w-full max-w-xs"
                        >
                            <Plus size={24} />
                            <span>Add Your Pet</span>
                        </Link>
                        <Link href="/dashboard/services" className="block mt-4 text-sm font-bold text-gray-400 hover:text-[var(--color-primary)]">
                            Explore PawPal first
                        </Link>
                    </div>
                )}

                {/* Health Overview Section - Only show if pets exist */}
                {pets.length > 0 && (
                    <>

                        {/* Level 3: Health Score (Important, but Not First) */}
                        <section className="mb-10">
                            <div className="flex items-center justify-between px-2 mb-3">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Health Score</h3>
                            </div>
                            {(() => {
                                const hasVaccine = !!pet?.healthMetrics?.nextVaccinationDate;
                                const hasWeight = (pet?.healthMetrics?.weightHistory?.length || 0) > 0;
                                const radius = 40;
                                const circumference = 2 * Math.PI * radius;
                                const strokeDashoffset = circumference - (health.score / 100) * circumference;

                                return (
                                    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 relative overflow-hidden flex items-center gap-6">
                                        {/* Score Circle */}
                                        <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle cx="48" cy="48" r={radius} stroke="#f3f4f6" strokeWidth="8" fill="none" />
                                                <circle
                                                    cx="48" cy="48" r={radius}
                                                    stroke={health.score > 80 ? "#10b981" : (health.score > 60 ? "#f59e0b" : "#ef4444")}
                                                    strokeWidth="8"
                                                    fill="none"
                                                    strokeDasharray={circumference}
                                                    strokeDashoffset={strokeDashoffset}
                                                    strokeLinecap="round"
                                                    style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-3xl font-bold text-gray-900">{health.score}</span>
                                                <span className="text-[10px] uppercase font-bold text-gray-400">Score</span>
                                            </div>
                                        </div>

                                        {/* Breakdown */}
                                        <div className="flex-1 space-y-3">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 leading-none">
                                                    {health.label}
                                                </h3>
                                                <p className={`text-xs mt-1 font-medium ${health.score < 70 ? 'text-red-500' : 'text-gray-500'}`}>
                                                    {health.subText}
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                {!hasVaccine && (
                                                    <button
                                                        onClick={() => setModalType('vaccination')}
                                                        className="bg-red-50 text-red-700 text-[11px] font-bold px-3 py-2 rounded-xl flex items-center justify-between hover:bg-red-100 transition-colors w-full"
                                                    >
                                                        <span className="flex items-center gap-1"><AlertCircle size={12} /> Vaccine Due</span>
                                                        <ArrowRight size={12} />
                                                    </button>
                                                )}
                                                {!hasWeight && (
                                                    <button
                                                        onClick={() => setModalType('weight')}
                                                        className="bg-gray-50 text-gray-600 text-[11px] font-bold px-3 py-2 rounded-xl flex items-center justify-between hover:bg-gray-100 transition-colors w-full"
                                                    >
                                                        <span className="flex items-center gap-1"><Scale size={12} /> Weight Not Logged</span>
                                                        <ArrowRight size={12} />
                                                    </button>
                                                )}
                                                {hasVaccine && hasWeight && (
                                                    <div className="text-[11px] text-green-700 font-bold flex items-center gap-1 bg-green-50 px-3 py-2 rounded-xl">
                                                        <Activity size={12} /> All health tasks up to date!
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </section>

                        {/* Level 4: Smart Insights (Card with Header) */}
                        <section className="mb-10">
                            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                                {/* Header */}
                                <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex items-center gap-2">
                                    <Sparkles size={16} className="text-emerald-600" />
                                    <h2 className="text-sm font-bold text-emerald-900 uppercase tracking-wider">PawPal Insights</h2>
                                </div>

                                {/* Content */}
                                <div className="p-5 space-y-4">
                                    {/* Weight Insight */}
                                    {pet?.healthMetrics?.weightHistory?.length >= 2 && (
                                        <div className="flex gap-4 items-start">
                                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                                <Scale size={18} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-sm">Weight Trend</h4>
                                                <p className="text-xs text-gray-600 leading-relaxed mt-1">
                                                    {pet?.healthMetrics?.weightHistory.slice(-1)[0].weight > pet?.healthMetrics?.weightHistory.slice(-2)[0].weight
                                                        ? `${pet?.name}'s weight is up slightly. Ensure they're getting enough exercise! 🏃`
                                                        : `${pet?.name} is maintaining a steady weight. Great job! ⚖️`}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Seasonal / Grooming Insight */}
                                    <div className="flex gap-4 items-start">
                                        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                                            <Scissors size={18} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-sm">Grooming Tip</h4>
                                            <p className="text-xs text-gray-600 leading-relaxed mt-1">
                                                {pet?.species === 'Dog' ?
                                                    `Pavement heat check! If it's too hot for your hand, it's too hot for ${pet?.name || 'Buddy'}'s paws. 🐾` :
                                                    `Brushing ${pet?.name || 'your cat'} weekly reduces hairballs and stress. 🐱`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Level 5: Health Records (Horizontal List) */}
                        <section className="mb-10">
                            <div className="flex items-center justify-between mb-4 px-2">
                                <h2 className="text-lg font-bold text-gray-900">{pet?.name || 'Pet'}'s Health Records</h2>
                                <Link href="/dashboard/records" className="text-xs font-bold text-[var(--color-primary)] hover:underline">
                                    View All
                                </Link>
                            </div>

                            <div className="bg-white p-2 rounded-[32px] border border-gray-100 shadow-sm">
                                <div className="flex gap-2 overflow-x-auto p-2 snap-x">
                                    {/* Vaccination Card */}
                                    <div
                                        onClick={() => setModalType('vaccination')}
                                        className="snap-center shrink-0 w-40 bg-gray-50 p-4 rounded-[24px] border border-gray-100 flex flex-col justify-between h-40 relative overflow-hidden group cursor-pointer hover:bg-blue-50 hover:border-blue-100 transition-all"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm">
                                                <Activity size={18} />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wide">Vaccination</p>
                                            <h3 className="text-gray-900 font-bold text-sm leading-tight mt-1">
                                                {getVaccinationStatus().includes('No vaccination') ? 'No vaccination records yet' : getVaccinationStatus().replace('Due: ', '')}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Weight Card */}
                                    <div
                                        onClick={() => setModalType('weight')}
                                        className="snap-center shrink-0 w-40 bg-gray-50 p-4 rounded-[24px] border border-gray-100 flex flex-col justify-between h-40 relative overflow-hidden group cursor-pointer hover:bg-orange-50 hover:border-orange-100 transition-all"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-orange-500 shadow-sm">
                                                <Scale size={18} />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wide">Weight</p>
                                            <h3 className="text-gray-900 font-bold text-sm leading-tight mt-1">
                                                {getLastWeight()}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Medications Card */}
                                    <Link href="/dashboard/medications" className="snap-center shrink-0 w-40 bg-gray-50 p-4 rounded-[24px] border border-gray-100 flex flex-col justify-between h-40 relative overflow-hidden group cursor-pointer hover:bg-emerald-50 hover:border-emerald-100 transition-all">
                                        <div className="flex justify-between items-start">
                                            <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-emerald-500 shadow-sm">
                                                <Pill size={18} />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wide">Meds</p>
                                            <h3 className="text-gray-900 font-bold text-sm leading-tight mt-1">2 Active</h3>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </section>

                        {/* Level 6: Emergency SOS Card */}
                        <section className="mb-10 px-2">
                            <Link href="/dashboard/emergency" className="bg-gradient-to-r from-red-600 to-rose-600 rounded-[32px] p-6 shadow-xl shadow-red-100 flex items-center justify-between group active:scale-95 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-md group-hover:rotate-12 transition-transform">
                                        <AlertTriangle size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-black text-lg leading-tight uppercase tracking-tight">Emergency SOS</h3>
                                        <p className="text-red-100 text-xs font-bold">Health Resume & Vet Finder</p>
                                    </div>
                                </div>
                                <div className="bg-white/10 p-2 rounded-full">
                                    <ChevronRight className="text-white" size={20} />
                                </div>
                            </Link>
                        </section>

                        {/* Level 7: Action Area (Grid) */}
                        <section className="mb-10 mt-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 px-2">How can we help {pet?.name || 'your pet'}?</h2>

                            <div className="grid grid-cols-4 gap-2">
                                <Link href={`/dashboard/chat?petId=${pet?.id || ''}`} className="flex flex-col items-center gap-2 group">
                                    <div className="w-16 h-16 rounded-[24px] bg-[var(--color-primary)] text-white flex items-center justify-center text-2xl shadow-lg shadow-orange-100 group-hover:scale-105 transition-transform">
                                        💬
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-600 text-center">Ask AI</span>
                                </Link>

                                <Link href="/dashboard/vet" className="flex flex-col items-center gap-2 group">
                                    <div className="w-16 h-16 rounded-[24px] bg-white border border-gray-100 flex items-center justify-center text-2xl shadow-sm group-hover:border-[var(--color-primary)] transition-colors">
                                        🩺
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-600 text-center">Find Vet</span>
                                </Link>

                                <Link href="/dashboard/photos" className="flex flex-col items-center gap-2 group">
                                    <div className="w-16 h-16 rounded-[24px] bg-white border border-gray-100 flex items-center justify-center text-2xl shadow-sm group-hover:border-pink-500 transition-colors">
                                        📸
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-600 text-center">Gallery</span>
                                </Link>

                                <Link href="/dashboard/nutrition" className="flex flex-col items-center gap-2 group">
                                    <div className="w-16 h-16 rounded-[24px] bg-white border border-gray-100 flex items-center justify-center text-2xl shadow-sm group-hover:border-emerald-500 transition-colors">
                                        🥗
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-600 text-center">Meals</span>
                                </Link>
                            </div>
                        </section>

                        {/* Level 7: Daily Tip (Soft Footer) */}
                        <section className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-[32px] border border-orange-100/50 relative overflow-hidden flex items-start gap-4 mb-4">
                            <div className="absolute top-0 right-0 p-4 opacity-5 text-4xl pointer-events-none grayscale">
                                {pet?.species?.toLowerCase() === 'cat' ? '🐱' : '🐶'}
                            </div>
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-sm shrink-0 text-amber-500">
                                {loadingTip ? '...' : '💡'}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm mb-1">
                                    Today's Tip for {pet?.name || 'Your Pet'}
                                </h3>
                                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                    {loadingTip ? "Loading..." : (dailyTip || `Remember to keep ${pet?.name || 'your pet'} hydrated and cool! 💧`)}
                                </p>
                            </div>
                        </section>
                    </>
                )}

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
