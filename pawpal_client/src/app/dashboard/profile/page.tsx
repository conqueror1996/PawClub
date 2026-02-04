"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, User, Mail, Phone, LogOut, ChevronRight, Bell, Shield, Moon, Plus, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../../../lib/config";
import Link from "next/link";

export default function ProfilePage() {
    const router = useRouter();
    const [pets, setPets] = useState<any[]>([]);
    const [user, setUser] = useState({
        name: "PawParent",
        email: "user@example.com",
        phone: "+1 234 567 890"
    });

    useEffect(() => {
        // Fetch pets for the "My Pets" section
        const fetchPets = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/pets`);
                const data = await res.json();
                if (data.pets) setPets(data.pets);
            } catch (error) {
                console.error("Failed to load pets", error);
            }
        };
        fetchPets();
    }, []);

    const MenuItem = ({ icon, label, onClick, value }: { icon: any, label: string, onClick?: () => void, value?: string }) => (
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
        >
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                    {icon}
                </div>
                <span className="font-medium text-gray-700 text-sm">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                {value && <span className="text-xs text-gray-400 font-medium">{value}</span>}
                <ChevronRight size={16} className="text-gray-300" />
            </div>
        </button>
    );

    return (
        <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gray-50 pb-24"
        >
            {/* Header */}
            <header className="bg-white px-6 py-6 sticky top-0 z-10 shadow-sm flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={24} className="text-gray-700" />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Profile</h1>
            </header>

            <div className="p-6 space-y-6">

                {/* User Card */}
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full bg-gray-100 mb-4 overflow-hidden relative group cursor-pointer">
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=PawParent"
                            alt="User"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Settings size={20} />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                    <p className="text-gray-500 text-sm mt-1">{user.email}</p>
                    <button className="mt-4 px-6 py-2 rounded-full border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                        Edit Profile
                    </button>
                </div>

                {/* My Pets */}
                <section>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">My Pets</h3>
                    <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100">
                        {pets.map((pet, idx) => (
                            <div key={pet.id} className="p-4 flex items-center justify-between border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-orange-50 overflow-hidden">
                                        <img src={pet.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${pet.name}`} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">{pet.name}</p>
                                        <p className="text-xs text-gray-400">{pet.breed || 'Unknown Breed'}</p>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-gray-300" />
                            </div>
                        ))}
                        <Link href="/?mode=add" className="w-full p-4 flex items-center justify-center gap-2 text-[var(--color-primary)] font-bold text-sm hover:bg-gray-50 transition-colors">
                            <Plus size={18} /> Add New Pet
                        </Link>
                    </div>
                </section>

                {/* App Settings */}
                <section>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">App Settings</h3>
                    <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100">
                        <MenuItem icon={<Bell size={18} />} label="Notifications" value="On" />
                        <MenuItem icon={<Moon size={18} />} label="Dark Mode" value="System" />
                        <MenuItem icon={<Shield size={18} />} label="Privacy & Security" />
                    </div>
                </section>

                {/* Other */}
                <section>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">Support</h3>
                    <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100">
                        <MenuItem icon={<Mail size={18} />} label="Help & Support" />
                        <MenuItem icon={<Settings size={18} />} label="About PawPal" value="v1.0.2" />
                    </div>
                </section>

                <button className="w-full py-4 text-red-500 font-bold bg-red-50 rounded-[24px] hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
                    <LogOut size={20} /> Sign Out
                </button>

            </div>
        </motion.main>
    );
}
