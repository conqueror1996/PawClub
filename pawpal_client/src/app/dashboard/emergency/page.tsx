"use client";

import { useState, useEffect } from 'react';
import {
    AlertTriangle,
    Phone,
    MapPin,
    ChevronLeft,
    Clipboard,
    Stethoscope,
    Activity,
    Share2,
    Heart,
    Thermometer,
    Scale,
    Navigation,
    Clock,
    X,
    FileText
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/config';

interface EmergencyData {
    pet: any;
    healthMetrics: any;
    medicalHistory: any[];
    medications: any[];
}

export default function EmergencyPage() {
    const [data, setData] = useState<EmergencyData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showResume, setShowResume] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        loadEmergencyData();
    }, []);

    const loadEmergencyData = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/pets/1`);
            const json = await res.json();
            setData({
                pet: json.pet,
                healthMetrics: json.pet.healthMetrics,
                medicalHistory: json.pet.medicalHistory || [],
                medications: json.pet.medications || []
            });
        } catch (error) {
            console.error("Failed to load emergency data:", error);
        } finally {
            setLoading(false);
        }
    };

    const copyResume = () => {
        if (!data) return;
        const resume = `
--- PAWPAL EMERGENCY RESUME ---
PET: ${data.pet.name} (${data.pet.species} - ${data.pet.breed})
AGE: ${data.pet.age} years | WEIGHT: ${data.pet.weight}
GENDER: ${data.pet.gender}

CURRENT MEDICATIONS:
${data.medications.length > 0 ? data.medications.map(m => `- ${m.name}: ${m.dosage} (${m.frequency})`).join('\n') : "None"}

MEDICAL HISTORY:
${data.medicalHistory.length > 0 ? data.medicalHistory.map(h => `- ${h.date}: ${h.event}`).join('\n') : "No records"}

PRIMARY VET: Dr. Smith (Mock) - 555-0199
-------------------------------
        `;
        navigator.clipboard.writeText(resume);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return (
        <div className="min-h-screen bg-red-600 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-white">
                <AlertTriangle className="animate-pulse" size={48} />
                <p className="font-black text-xl tracking-tighter uppercase">Initializing SOS Mode...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white">
            {/* Critical Header */}
            <div className="bg-red-600 text-white p-8 rounded-b-[40px] shadow-2xl shadow-red-200">
                <div className="max-w-xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <Link href="/dashboard" className="bg-white/20 p-2 rounded-full backdrop-blur-md">
                            <ChevronLeft size={24} />
                        </Link>
                        <span className="bg-white text-red-600 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">Emergency Mode</span>
                        <div className="w-10 h-10" /> {/* Spacer */}
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-3xl bg-white/20 border-2 border-white/50 flex items-center justify-center overflow-hidden">
                                {data?.pet.profilePhoto ? (
                                    <img src={data.pet.profilePhoto} className="w-full h-full object-cover" />
                                ) : (
                                    <Heart size={40} className="text-white/80" />
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-white text-red-600 p-2 rounded-2xl shadow-lg animate-bounce">
                                <AlertTriangle size={20} />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tight">{data?.pet.name}</h1>
                            <p className="text-red-100 font-medium">Critical Support Dashboard</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-xl mx-auto p-6 -mt-8">
                {/* Immediate Actions */}
                <div className="grid grid-cols-1 gap-4 mb-8">
                    <button
                        onClick={() => window.location.href = 'tel:5550199'}
                        className="bg-white border-4 border-red-600 p-6 rounded-[32px] flex items-center justify-between shadow-xl active:scale-95 transition-all group"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                                <Phone size={28} />
                            </div>
                            <div className="text-left">
                                <h3 className="font-black text-xl text-gray-900">Call Emergency Vet</h3>
                                <p className="text-sm text-red-600 font-bold">Priority line • Open 24/7</p>
                            </div>
                        </div>
                        <ChevronRight className="text-gray-300" />
                    </button>

                    <button
                        onClick={() => window.open(`https://www.google.com/maps/search/emergency+vet+near+me`, '_blank')}
                        className="bg-blue-600 text-white p-6 rounded-[32px] flex items-center justify-between shadow-xl shadow-blue-100 active:scale-95 transition-all group"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-transform">
                                <Navigation size={28} />
                            </div>
                            <div className="text-left">
                                <h3 className="font-black text-xl">Find Nearest Hospital</h3>
                                <p className="text-blue-100 text-sm font-medium">Get directions immediately</p>
                            </div>
                        </div>
                        <ChevronRight className="text-white/50" />
                    </button>
                </div>

                {/* Health Resume Section */}
                <section className="mb-8">
                    <div className="flex justify-between items-center mb-4 px-2">
                        <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Rapid Health Resume</h2>
                        <button
                            onClick={() => setShowResume(true)}
                            className="bg-gray-100 text-gray-600 p-2 rounded-xl"
                        >
                            <FileText size={20} />
                        </button>
                    </div>

                    <div className="bg-gray-50 border border-gray-100 rounded-[32px] p-6 space-y-6">
                        {/* Vital Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-3">
                                <Scale className="text-orange-500" size={20} />
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase">Weight</p>
                                    <p className="font-bold text-gray-900">{data?.pet.weight}</p>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-3">
                                <Activity className="text-blue-500" size={20} />
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase">Age</p>
                                    <p className="font-bold text-gray-900">{data?.pet.age}y</p>
                                </div>
                            </div>
                        </div>

                        {/* Medications */}
                        <div>
                            <h4 className="text-xs font-black text-gray-400 uppercase mb-3 flex items-center gap-2">
                                <Clipboard size={14} className="text-red-500" /> Active Medications
                            </h4>
                            <div className="space-y-2">
                                {data?.medications.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic">No active medications</p>
                                ) : (
                                    data?.medications.map((m, i) => (
                                        <div key={i} className="bg-white p-3 rounded-xl border border-gray-100 flex justify-between items-center">
                                            <span className="font-bold text-gray-800 text-sm">{m.name}</span>
                                            <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-lg font-bold">{m.dosage}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Allergies/History */}
                        <div>
                            <h4 className="text-xs font-black text-gray-400 uppercase mb-3 flex items-center gap-2">
                                <Stethoscope size={14} className="text-red-500" /> Recent History
                            </h4>
                            <div className="space-y-2">
                                {data?.medicalHistory.slice(0, 2).map((h, i) => (
                                    <div key={i} className="flex gap-3 items-start">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5" />
                                        <p className="text-sm text-gray-600"><span className="font-bold text-gray-900">{h.event}</span> ({h.date})</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={copyResume}
                        className={`w-full mt-4 flex items-center justify-center gap-2 py-4 rounded-2xl font-black transition-all ${copied ? 'bg-green-600 text-white' : 'bg-gray-900 text-white shadow-xl shadow-gray-200 active:scale-95'}`}
                    >
                        {copied ? (
                            <> <Share2 size={20} /> Copied to Clipboard! </>
                        ) : (
                            <> <Clipboard size={20} /> Copy Resume for Vet </>
                        )}
                    </button>
                </section>

                {/* Secondary Contacts */}
                <div className="grid grid-cols-2 gap-3 mb-10">
                    <button className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 shadow-sm">
                            <Clock size={20} />
                        </div>
                        <span className="text-[10px] font-black text-gray-900 uppercase">Recent Vet</span>
                    </button>
                    <button className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 shadow-sm">
                            <Phone size={20} />
                        </div>
                        <span className="text-[10px] font-black text-gray-900 uppercase">Pet Insurance</span>
                    </button>
                </div>
            </main>

            {/* Resume Overlay Modal */}
            <AnimatePresence>
                {showResume && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 z-50 p-6 flex items-center justify-center backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-[40px] w-full max-w-lg p-8 relative overflow-hidden"
                        >
                            <button
                                onClick={() => setShowResume(false)}
                                className="absolute top-6 right-6 text-gray-300 hover:text-gray-900"
                            >
                                <X size={32} />
                            </button>

                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
                                    <FileText size={32} />
                                </div>
                                <h2 className="text-3xl font-black tracking-tight text-gray-900">Health Resume</h2>
                            </div>

                            <div className="space-y-6 font-mono text-sm border-2 border-dashed border-gray-200 p-6 rounded-3xl bg-gray-50/50">
                                <div>
                                    <p className="text-gray-400 uppercase text-xs mb-1 font-sans font-black">Identity</p>
                                    <p className="text-gray-900 font-bold">{data?.pet.name} | {data?.pet.breed} | {data?.pet.age}y</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 uppercase text-xs mb-1 font-sans font-black">Medication List</p>
                                    {data?.medications.map((m, i) => (
                                        <p key={i} className="text-red-600 font-bold">● {m.name} ({m.dosage})</p>
                                    ))}
                                </div>
                                <div>
                                    <p className="text-gray-400 uppercase text-xs mb-1 font-sans font-black">Medical Notes</p>
                                    <p className="text-gray-800">Last Weight: {data?.pet.weight}</p>
                                    {data?.medicalHistory.map((h, i) => (
                                        <p key={i} className="text-gray-600">→ {h.event} ({h.date})</p>
                                    ))}
                                </div>
                            </div>

                            <p className="text-center text-gray-400 text-xs mt-6 font-medium">Generated by PawPal Emergency Assistant</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ChevronRight({ className }: { className?: string }) {
    return <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>;
}
