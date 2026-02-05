"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, User, Mail, Phone, LogOut, ChevronRight, Bell, Shield, Moon, Plus, Settings, X, Camera, Save, Info, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "../../../lib/config";
import Link from "next/link";

export default function ProfilePage() {
    const router = useRouter();
    const [pets, setPets] = useState<any[]>([]);
    const [user, setUser] = useState({
        name: "PawParent",
        email: "user@example.com",
        phone: "+1 234 567 890",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=PawParent"
    });

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState(user);

    useEffect(() => {
        // Load user from local storage if available
        const savedUser = localStorage.getItem("pawpal_user");
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }

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

    const handleSaveProfile = () => {
        setUser(editForm);
        localStorage.setItem("pawpal_user", JSON.stringify(editForm));
        setIsEditing(false);
    };

    const MenuItem = ({ icon, label, onClick, value, href }: { icon: any, label: string, onClick?: () => void, value?: string, href?: string }) => {
        const Content = () => (
            <>
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
            </>
        );

        if (href) {
            return (
                <Link href={href} className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                    <Content />
                </Link>
            );
        }

        return (
            <button
                onClick={onClick}
                className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
            >
                <Content />
            </button>
        );
    };

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
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden">
                    <div className="w-24 h-24 rounded-full bg-orange-100 mb-4 overflow-hidden relative group cursor-pointer border-4 border-white shadow-sm">
                        <img
                            src={user.avatar}
                            alt="User"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                    <p className="text-gray-500 text-sm mt-1">{user.email}</p>
                    <p className="text-gray-400 text-xs mt-1">{user.phone}</p>

                    <button
                        onClick={() => {
                            setEditForm(user);
                            setIsEditing(true);
                        }}
                        className="mt-4 px-6 py-2 rounded-full border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2"
                    >
                        <Settings size={14} /> Edit Profile
                    </button>
                </div>

                {/* My Pets */}
                <section>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">My Pets</h3>
                    <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100">
                        {pets.length === 0 ? (
                            <div className="p-6 text-center">
                                <p className="text-sm text-gray-400 mb-2">No pets added yet</p>
                            </div>
                        ) : (
                            pets.map((pet) => (
                                <Link
                                    href={`/dashboard?petId=${pet.id}`}
                                    key={pet.id}
                                    className="p-4 flex items-center justify-between border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-orange-50 overflow-hidden border border-gray-100">
                                            <img src={pet.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${pet.name}`} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">{pet.name}</p>
                                            <p className="text-xs text-gray-400">{pet.breed || 'Unknown Breed'}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-300" />
                                </Link>
                            ))
                        )}
                        <Link href="/dashboard/pets" className="w-full p-4 flex items-center justify-center gap-2 text-[var(--color-primary)] font-bold text-sm hover:bg-gray-50 transition-colors bg-orange-50/30">
                            <Plus size={18} /> Manage Pets
                        </Link>
                    </div>
                </section>

                {/* Community Impact - Care Beyond Buddy */}
                <section>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">Community Impact</h3>
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[24px] overflow-hidden shadow-lg p-5 relative text-white">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Heart size={80} fill="currentColor" />
                        </div>

                        <div className="relative z-10">
                            <h4 className="font-bold text-lg mb-1 flex items-center gap-2">
                                <Heart size={20} className="text-pink-300" fill="currentColor" /> Care Beyond Buddy
                            </h4>
                            <p className="text-indigo-100 text-sm mb-4 leading-relaxed opacity-90">
                                Join local food drives and support street animals in your area.
                            </p>

                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 mb-4">
                                <p className="text-xs font-bold text-indigo-100 uppercase tracking-wider mb-1">Your Impact</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-bold">8</span>
                                    <span className="text-sm font-medium opacity-80 mb-1">street dogs fed this month 🐾</span>
                                </div>
                            </div>

                            <button className="w-full py-2.5 bg-white text-indigo-600 font-bold text-sm rounded-xl hover:bg-indigo-50 transition-colors shadow-sm">
                                Support Local Drive
                            </button>
                        </div>
                    </div>
                </section>

                {/* App Settings */}
                <section>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">App Settings</h3>
                    <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100">
                        <MenuItem icon={<Bell size={18} />} label="Notifications" href="/dashboard/notifications" value="On" />
                        <MenuItem icon={<Moon size={18} />} label="Dark Mode" value="System" />
                        <MenuItem icon={<Shield size={18} />} label="Privacy & Security" />
                    </div>
                </section>

                {/* Support */}
                <section>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">Support</h3>
                    <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100">
                        <MenuItem icon={<Mail size={18} />} label="Help & Support" />
                        <MenuItem icon={<Info size={18} />} label="About PawPal" value="v1.0.2" />
                    </div>
                </section>

                <button className="w-full py-4 text-red-500 font-bold bg-red-50 rounded-[24px] hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
                    <LogOut size={20} /> Sign Out
                </button>

            </div>

            {/* Edit User Modal */}
            <AnimatePresence>
                {isEditing && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
                            onClick={() => setIsEditing(false)}
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-50 p-6 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
                                <button onClick={() => setIsEditing(false)} className="p-2 bg-gray-100 rounded-full text-gray-500">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4 pb-8">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label>
                                    <div className="relative">
                                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                            className="w-full bg-gray-50 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email</label>
                                    <div className="relative">
                                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="email"
                                            value={editForm.email}
                                            onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                            className="w-full bg-gray-50 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Phone</label>
                                    <div className="relative">
                                        <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="tel"
                                            value={editForm.phone}
                                            onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                            className="w-full bg-gray-50 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleSaveProfile}
                                    className="w-full py-3.5 bg-[var(--color-primary)] text-white font-bold rounded-xl shadow-lg shadow-orange-200 mt-4 flex items-center justify-center gap-2"
                                >
                                    <Save size={18} /> Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.main>
    );
}
