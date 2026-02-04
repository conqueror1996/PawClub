"use client";

import { useState } from "react";
import { X, Calendar, Scale, Save, Loader2 } from "lucide-react";
import { API_BASE_URL } from "../lib/config";

interface HealthModalsProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'weight' | 'vaccination' | null;
    currentWeight?: string;
    onSuccess: () => void;
}

export function HealthModals({ isOpen, onClose, type, currentWeight, onSuccess }: HealthModalsProps) {
    const [loading, setLoading] = useState(false);
    const [weight, setWeight] = useState(currentWeight || "");
    const [date, setDate] = useState("");

    if (!isOpen || !type) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload: any = {};
        let historyPayload: any = null;

        if (type === 'weight') {
            payload.weight = Number(weight);
            // Create a history record for weight update
            historyPayload = {
                date: new Date().toISOString().split('T')[0], // Today's date
                event: "Weight Check",
                description: `Recorded weight: ${weight} kg`
            };
        } else {
            payload.nextVaccinationDate = date;
            // Create a history record for vaccination schedule
            historyPayload = {
                date: new Date().toISOString().split('T')[0],
                event: "Vaccination Scheduled",
                description: `Next vaccination due on ${date}`
            };
        }

        try {
            // 1. Update the actual metric
            await fetch(`${API_BASE_URL}/api/health-metrics`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            // 2. Add to medical history log automatically
            if (historyPayload) {
                await fetch(`${API_BASE_URL}/api/medical-history`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(historyPayload)
                });
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to update", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden animate-scale-up relative">
                {/* Header */}
                <div className={`p-6 ${type === 'weight' ? 'bg-indigo-50' : 'bg-green-50'} flex justify-between items-start`}>
                    <div>
                        <h2 className="text-xl font-bold text-[var(--color-text-main)]">
                            {type === 'weight' ? 'Update Weight' : 'Update Preventives'}
                        </h2>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                            {type === 'weight' ? 'Track your pet’s growth' : 'Schedule next preventive care'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/50 hover:bg-white rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {type === 'weight' ? (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--color-text-secondary)] ml-1">Current Weight (kg)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.1"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-[20px] pl-12 pr-5 py-4 font-bold text-lg text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                                    placeholder="0.0"
                                    autoFocus
                                />
                                <Scale className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--color-text-secondary)] ml-1">Next Vaccination Date</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-[20px] pl-12 pr-5 py-4 font-bold text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                                    autoFocus
                                />
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[var(--color-primary)] text-white font-bold py-4 rounded-[24px] shadow-lg shadow-[var(--color-primary-soft)] hover:bg-[var(--color-primary-dark)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                        {loading ? "Updating..." : "Update Record"}
                    </button>
                </form>
            </div>
        </div>
    );
}
