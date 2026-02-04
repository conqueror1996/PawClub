"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, Plus, Calendar, Syringe, Stethoscope, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "../../../lib/config";

interface MedicalRecord {
    date: string;
    event: string; // e.g., "Vaccination", "Checkup"
    description: string;
    type?: 'vaccine' | 'checkup' | 'surgery' | 'other';
}

export default function RecordsPage() {
    const router = useRouter();
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // New Record Form State
    const [newDate, setNewDate] = useState("");
    const [newEvent, setNewEvent] = useState("");
    const [newDesc, setNewDesc] = useState("");

    const fetchRecords = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/medical-history`);
            const data = await res.json();
            if (data.history) {
                // Normalize legacy mock data (strings) into objects
                const normalized = data.history.map((item: any) => {
                    if (typeof item === 'string') {
                        return { date: 'Past', event: item, description: '' };
                    }
                    return item;
                });

                // Sort by date descending
                const sorted = normalized.sort((a: any, b: any) => {
                    if (a.date === 'Past') return 1;
                    if (b.date === 'Past') return -1;
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                });
                setRecords(sorted);
            }
        } catch (error) {
            console.error("Failed to fetch records", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    const handleAddRecord = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDate || !newEvent) return;

        try {
            await fetch(`${API_BASE_URL}/api/medical-history`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    date: newDate,
                    event: newEvent,
                    description: newDesc
                })
            });
            setIsAdding(false);
            setNewDate("");
            setNewEvent("");
            setNewDesc("");
            fetchRecords();
        } catch (error) {
            console.error("Failed to add record", error);
        }
    };

    const getIcon = (event: string) => {
        if (!event || typeof event !== 'string') return <FileText size={20} className="text-gray-400" />;
        const lower = event.toLowerCase();
        if (lower.includes('vaccin') || lower.includes('shot')) return <Syringe size={20} className="text-blue-500" />;
        if (lower.includes('checkup') || lower.includes('exam')) return <Stethoscope size={20} className="text-green-500" />;
        return <FileText size={20} className="text-[var(--color-primary)]" />;
    };

    return (
        <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gray-50 pb-24"
        >
            {/* Header */}
            <header className="bg-white px-6 py-6 sticky top-0 z-10 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-gray-700" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">Medical Records</h1>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="p-2 bg-[var(--color-primary-soft)] text-[var(--color-primary-dark)] rounded-full hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                >
                    <Plus size={24} />
                </button>
            </header>

            {/* Content */}
            <div className="p-6 space-y-6">

                {/* Add Form */}
                {isAdding && (
                    <div className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100 animate-slide-down">
                        <h3 className="font-bold text-gray-800 mb-4">Add New Record</h3>
                        <form onSubmit={handleAddRecord} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Date</label>
                                <input
                                    type="date"
                                    value={newDate}
                                    onChange={e => setNewDate(e.target.value)}
                                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Event / Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Annual Vaccination"
                                    value={newEvent}
                                    onChange={e => setNewEvent(e.target.value)}
                                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Notes</label>
                                <textarea
                                    placeholder="Any details..."
                                    value={newDesc}
                                    onChange={e => setNewDesc(e.target.value)}
                                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] min-h-[80px]"
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="flex-1 py-3 text-sm font-bold text-gray-500 bg-gray-100 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 text-sm font-bold text-white bg-[var(--color-primary)] rounded-xl"
                                >
                                    Save Record
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Timeline */}
                <div className="pl-4 border-l-2 border-gray-200 space-y-8">
                    {loading ? (
                        <p className="text-gray-400 text-sm">Loading records...</p>
                    ) : records.length === 0 ? (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                            <p className="text-gray-500 mb-2">No records found.</p>
                            <p className="text-xs text-gray-400">Tap the + button to add your pet's medical history.</p>
                        </div>
                    ) : (
                        records.map((record, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="relative"
                            >
                                {/* Dot */}
                                <div className="absolute -left-[25px] top-0 w-4 h-4 rounded-full bg-white border-4 border-[var(--color-primary)]" />

                                <div className="bg-white p-5 rounded-[20px] shadow-sm border border-gray-50">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-gray-50 rounded-full">
                                                {getIcon(record.event)}
                                            </div>
                                            <h3 className="font-bold text-gray-800">{record.event}</h3>
                                        </div>
                                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-lg flex items-center gap-1">
                                            <Calendar size={12} /> {record.date as string}
                                        </span>
                                    </div>
                                    {record.description && (
                                        <p className="text-sm text-gray-600 ml-1 leading-relaxed">{record.description}</p>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </motion.main>
    );
}
