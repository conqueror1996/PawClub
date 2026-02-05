"use client";

import { useState, useEffect } from 'react';
import {
    Beef,
    GlassWater,
    HeartPulse,
    Timer,
    CheckCircle2,
    Plus,
    ChevronRight,
    Utensils,
    Zap,
    Cigarette as Bone,
    Smile,
    X,
    Trash2,
    Calendar
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/config';

interface MealPlan {
    id: number;
    mealName: string;
    foodType?: string;
    amount: string;
    scheduledAt: string;
    isCompleted: boolean;
}

interface RitualLog {
    id: number;
    activity: string;
    duration: number;
    date: string;
    notes?: string;
}

export default function NutritionRitualsPage() {
    const [pet, setPet] = useState<any>(null);
    const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
    const [ritualLogs, setRitualLogs] = useState<RitualLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddMeal, setShowAddMeal] = useState(false);
    const [showLogRitual, setShowLogRitual] = useState(false);

    const [mealForm, setMealForm] = useState({
        mealName: 'Breakfast',
        foodType: 'Dry Food',
        amount: '',
        scheduledAt: '08:00'
    });

    const [ritualForm, setRitualForm] = useState({
        activity: 'Play',
        duration: 15,
        notes: ''
    });

    const [waterCount, setWaterCount] = useState(0);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Fetch first pet for demo
            const petRes = await fetch(`${API_BASE_URL}/api/pets/1`);
            const petData = await petRes.json();
            setPet(petData.pet);

            const mealsRes = await fetch(`${API_BASE_URL}/api/meal-plans/pet/1`);
            const mealsData = await mealsRes.json();
            setMealPlans(mealsData.meals || []);

            const ritualsRes = await fetch(`${API_BASE_URL}/api/rituals/pet/1`);
            const ritualsData = await ritualsRes.json();
            setRitualLogs(ritualsData.rituals || []);
        } catch (error) {
            console.error("Failed to load nutrition data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMeal = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/api/meal-plans`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...mealForm, petId: 1 })
            });
            if (res.ok) {
                setShowAddMeal(false);
                setMealForm({ mealName: 'Breakfast', foodType: 'Dry Food', amount: '', scheduledAt: '08:00' });
                loadData();
            }
        } catch (error) {
            console.error("Failed to add meal:", error);
        }
    };

    const toggleMeal = async (id: number) => {
        try {
            await fetch(`${API_BASE_URL}/api/meal-plans/${id}/toggle`, { method: 'PATCH' });
            setMealPlans(prev => prev.map(m => m.id === id ? { ...m, isCompleted: !m.isCompleted } : m));
        } catch (error) {
            console.error("Failed to toggle meal:", error);
        }
    };

    const deleteMeal = async (id: number) => {
        try {
            await fetch(`${API_BASE_URL}/api/meal-plans/${id}`, { method: 'DELETE' });
            loadData();
        } catch (error) {
            console.error("Failed to delete meal:", error);
        }
    };

    const handleLogRitual = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/api/rituals`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...ritualForm, petId: 1 })
            });
            if (res.ok) {
                setShowLogRitual(false);
                setRitualForm({ activity: 'Play', duration: 15, notes: '' });
                loadData();
            }
        } catch (error) {
            console.error("Failed to log ritual:", error);
        }
    };

    const getHappinessScore = () => {
        if (!pet) return 0;
        const mealCompletion = mealPlans.length > 0
            ? (mealPlans.filter(m => m.isCompleted).length / mealPlans.length) * 50
            : 0;
        const ritualScore = Math.min(ritualLogs.length * 10, 50);
        return Math.min(Math.round(mealCompletion + ritualScore + (waterCount * 5)), 100);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-emerald-50/30">
            <div className="flex flex-col items-center gap-4">
                <Utensils className="animate-bounce text-emerald-500" size={40} />
                <p className="text-emerald-800 font-medium">Preparing nutritional data...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/50 pb-32">
            {/* Header / Happiness Summary */}
            <div className="bg-emerald-600 text-white p-8 rounded-b-[40px] shadow-lg shadow-emerald-100 mb-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-emerald-100 text-sm font-bold uppercase tracking-widest mb-1">Act of Love</p>
                            <h1 className="text-3xl font-bold">Nutrition & Rituals</h1>
                        </div>
                        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                            <Utensils size={24} />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 flex items-center gap-6 border border-white/10">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full border-4 border-emerald-400/30 flex items-center justify-center">
                                <span className="text-2xl font-black">{getHappinessScore()}%</span>
                            </div>
                            <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 p-1 rounded-full shadow-lg">
                                <Smile size={16} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">{pet?.name}'s Happiness Today</h2>
                            <p className="text-emerald-100 text-sm">
                                {getHappinessScore() >= 80 ? "Feeling absolutely loved! ✨" :
                                    getHappinessScore() >= 50 ? "Doing great, keep it up!" :
                                        "Let's add some more love to the day."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-6 space-y-8">

                {/* Hydration Tracker */}
                <section>
                    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <GlassWater size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Hydration</h3>
                                <p className="text-xs text-gray-500">Fresh water is vital 💧</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-blue-50/50 p-2 rounded-2xl">
                            <button
                                onClick={() => setWaterCount(Math.max(0, waterCount - 1))}
                                className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all font-bold"
                            > - </button>
                            <span className="text-lg font-black text-blue-900 min-w-[2ch] text-center">{waterCount}</span>
                            <button
                                onClick={() => setWaterCount(waterCount + 1)}
                                className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all font-bold"
                            > + </button>
                        </div>
                    </div>
                </section>

                {/* Meal Schedule */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Utensils className="text-emerald-500" size={20} /> Today's Meals
                        </h3>
                        <button
                            onClick={() => setShowAddMeal(true)}
                            className="text-emerald-600 text-sm font-bold flex items-center gap-1 hover:bg-emerald-50 px-3 py-1.5 rounded-xl transition-colors"
                        >
                            <Plus size={16} /> Add Goal
                        </button>
                    </div>

                    {mealPlans.length === 0 ? (
                        <div className="bg-emerald-50/30 border-2 border-dashed border-emerald-100 rounded-3xl p-8 text-center">
                            <Utensils className="mx-auto text-emerald-200 mb-3" size={32} />
                            <p className="text-sm text-emerald-800 font-medium">No meal plan created</p>
                            <button onClick={() => setShowAddMeal(true)} className="mt-4 text-emerald-600 text-xs font-bold underline">Set up schedule</button>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {mealPlans.map((meal) => (
                                <motion.div
                                    layout
                                    key={meal.id}
                                    className={`bg-white rounded-3xl p-5 border shadow-sm flex items-center justify-between transition-all ${meal.isCompleted ? 'border-emerald-100 bg-emerald-50/10' : 'border-gray-100'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${meal.isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-50 text-gray-400'}`}>
                                            <Timer size={22} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className={`font-black text-sm ${meal.isCompleted ? 'text-emerald-900' : 'text-gray-900'}`}>{meal.mealName}</h4>
                                                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-bold uppercase">{meal.scheduledAt}</span>
                                            </div>
                                            <p className="text-xs text-gray-500">{meal.amount} • {meal.foodType || 'Balanced diet'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => deleteMeal(meal.id)}
                                            className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => toggleMeal(meal.id)}
                                            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${meal.isCompleted ? 'bg-emerald-600 text-white rotate-0' : 'bg-gray-50 text-gray-300'}`}
                                        >
                                            <CheckCircle2 size={24} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Bonding Rituals */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <HeartPulse className="text-rose-500" size={20} /> Daily Rituals
                        </h3>
                        <p className="text-xs text-gray-500 font-medium">Keep the tail wagging</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                        {[
                            { name: 'Play', icon: Bone, color: 'bg-orange-50 text-orange-600' },
                            { name: 'Walk', icon: Zap, color: 'bg-indigo-50 text-indigo-600' },
                            { name: 'Cuddle', icon: HeartPulse, color: 'bg-rose-50 text-rose-600' },
                            { name: 'Training', icon: Timer, color: 'bg-amber-50 text-amber-600' },
                        ].map((act) => (
                            <button
                                key={act.name}
                                onClick={() => {
                                    setRitualForm({ ...ritualForm, activity: act.name });
                                    setShowLogRitual(true);
                                }}
                                className="bg-white rounded-[28px] p-5 shadow-sm border border-gray-100 flex flex-col items-center gap-3 hover:scale-105 transition-all group active:scale-95"
                            >
                                <div className={`w-14 h-14 rounded-3xl ${act.color} flex items-center justify-center group-hover:shadow-lg transition-all`}>
                                    <act.icon size={28} />
                                </div>
                                <span className="text-xs font-black text-gray-900">{act.name}</span>
                                <Plus size={14} className="text-gray-300" />
                            </button>
                        ))}
                    </div>

                    {/* Ritual History */}
                    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Completed Today</h4>
                        {ritualLogs.length === 0 ? (
                            <p className="text-sm text-gray-400 py-4 text-center italic">No rituals logged yet today.</p>
                        ) : (
                            <div className="space-y-4">
                                {ritualLogs.map((log) => (
                                    <div key={log.id} className="flex gap-4 items-start">
                                        <div className="w-2 h-2 rounded-full bg-rose-400 mt-2 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{log.activity} Session</p>
                                            <p className="text-xs text-gray-500">{log.duration} minutes • {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            {log.notes && <p className="text-xs bg-gray-50 text-gray-600 p-2 rounded-lg mt-1 italic">"{log.notes}"</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* Bottom Nav Placeholder / Back link */}
            <div className="fixed bottom-8 left-0 right-0 px-6 flex justify-center">
                <Link href="/dashboard" className="bg-white text-gray-900 px-8 py-3 rounded-full shadow-2xl border border-gray-100 font-bold flex items-center gap-2 hover:bg-gray-50 transition-all">
                    <ChevronRight className="rotate-180" size={18} /> Back to Dashboard
                </Link>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showAddMeal && (
                    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="bg-white rounded-[40px] p-8 w-full max-w-md shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Add Meal Goal</h2>
                                <button onClick={() => setShowAddMeal(false)}><X size={24} className="text-gray-400" /></button>
                            </div>
                            <form onSubmit={handleAddMeal} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Meal Name</label>
                                    <select
                                        className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 font-medium"
                                        value={mealForm.mealName}
                                        onChange={e => setMealForm({ ...mealForm, mealName: e.target.value })}
                                    >
                                        <option>Breakfast</option>
                                        <option>Lunch</option>
                                        <option>Dinner</option>
                                        <option>Snack</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">Time</label>
                                        <input
                                            type="time"
                                            className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 font-medium"
                                            value={mealForm.scheduledAt}
                                            onChange={e => setMealForm({ ...mealForm, scheduledAt: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">Amount</label>
                                        <input
                                            placeholder="1 cup"
                                            className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 font-medium"
                                            value={mealForm.amount}
                                            onChange={e => setMealForm({ ...mealForm, amount: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Food Type</label>
                                    <input
                                        placeholder="Healthy Kibble"
                                        className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 font-medium"
                                        value={mealForm.foodType}
                                        onChange={e => setMealForm({ ...mealForm, foodType: e.target.value })}
                                    />
                                </div>
                                <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-[20px] font-black text-lg shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all mt-4">
                                    Save Plan 🥗
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}

                {showLogRitual && (
                    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="bg-white rounded-[40px] p-8 w-full max-w-md shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Log {ritualForm.activity}</h2>
                                <button onClick={() => setShowLogRitual(false)}><X size={24} className="text-gray-400" /></button>
                            </div>
                            <form onSubmit={handleLogRitual} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Duration (min)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 font-medium"
                                        value={ritualForm.duration}
                                        onChange={e => setRitualForm({ ...ritualForm, duration: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Notes</label>
                                    <textarea
                                        placeholder="How did it go? 💛"
                                        className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 font-medium resize-none"
                                        rows={3}
                                        value={ritualForm.notes}
                                        onChange={e => setRitualForm({ ...ritualForm, notes: e.target.value })}
                                    />
                                </div>
                                <button type="submit" className="w-full bg-rose-600 text-white py-4 rounded-[20px] font-black text-lg shadow-lg shadow-rose-100 hover:bg-rose-700 transition-all mt-4">
                                    Complete Ritual ✨
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
