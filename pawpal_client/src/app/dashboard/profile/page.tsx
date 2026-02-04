"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        species: "Dog",
        breed: "",
        age: "",
        weight: "",
        gender: "Male",
        activityLevel: "Moderate"
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("http://localhost:3000/api/pet");
                const data = await res.json();
                if (data.pet) {
                    setFormData({
                        ...data.pet,
                        age: data.pet.age.toString().replace(" years", ""),
                        weight: data.pet.weight.toString().replace("kg", "")
                    });
                }
            } catch (error) {
                console.error("Failed to load profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Format data back to match typical format if needed, or just save raw
            // For consistency with existing mock data format:
            const payload = {
                ...formData,
                age: Number(formData.age), // ensure number
                weight: `${formData.weight}` // keep as string or number depending on your preference. The mock used "32kg" string but "32" number is better for forms. Let's send raw number for now or append kg if backend expects strict string.
                // The mock data had "5 years" and "32kg". Let's standardize to numbers in DB long term, but for now let's just save what we have.
                // Actually, let's keep it simple.
            };

            await fetch("http://localhost:3000/api/pet", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            // Go back to dashboard on success
            router.push("/dashboard");
        } catch (error) {
            console.error("Failed to save", error);
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
                <Loader2 className="animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

    return (
        <motion.main
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen bg-[var(--color-background)] p-6 pb-24"
        >

            {/* Header */}
            <header className="flex items-center gap-4 mb-8">
                <Link href="/dashboard" className="p-2 bg-white rounded-full shadow-sm text-gray-600 hover:text-[var(--color-primary)] transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-xl font-bold text-[var(--color-text-main)]">Edit Profile</h1>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">

                {/* Avatar Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-24 h-24 rounded-full bg-[var(--color-secondary)] border-4 border-white shadow-md overflow-hidden mb-3">
                        <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name || 'Pet'}&backgroundColor=FFDAB9`}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)]">Avatar is auto-generated based on name</p>
                </div>

                {/* Name */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--color-text-secondary)] ml-1">Pet Name</label>
                    <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-white border border-gray-100 rounded-[20px] px-5 py-4 font-bold text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                        placeholder="e.g. Bruno"
                    />
                </div>

                {/* Species & Breed */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--color-text-secondary)] ml-1">Species</label>
                        <select
                            name="species"
                            value={formData.species}
                            onChange={handleChange}
                            className="w-full bg-white border border-gray-100 rounded-[20px] px-5 py-4 text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all appearance-none"
                        >
                            <option value="Dog">Dog</option>
                            <option value="Cat">Cat</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--color-text-secondary)] ml-1">Breed</label>
                        <input
                            name="breed"
                            value={formData.breed}
                            onChange={handleChange}
                            className="w-full bg-white border border-gray-100 rounded-[20px] px-5 py-4 text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                            placeholder="e.g. Golden Retriever"
                        />
                    </div>
                </div>

                {/* Age & Weight */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--color-text-secondary)] ml-1">Age (Years)</label>
                        <input
                            name="age"
                            type="number"
                            value={formData.age}
                            onChange={handleChange}
                            className="w-full bg-white border border-gray-100 rounded-[20px] px-5 py-4 text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                            placeholder="5"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--color-text-secondary)] ml-1">Weight (kg)</label>
                        <input
                            name="weight"
                            type="number"
                            value={formData.weight}
                            onChange={handleChange}
                            className="w-full bg-white border border-gray-100 rounded-[20px] px-5 py-4 text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                            placeholder="32"
                        />
                    </div>
                </div>

                {/* Gender & Activity */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--color-text-secondary)] ml-1">Gender</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full bg-white border border-gray-100 rounded-[20px] px-5 py-4 text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all appearance-none"
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--color-text-secondary)] ml-1">Activity Level</label>
                        <select
                            name="activityLevel"
                            value={formData.activityLevel}
                            onChange={handleChange}
                            className="w-full bg-white border border-gray-100 rounded-[20px] px-5 py-4 text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all appearance-none"
                        >
                            <option value="Low">Low (Couch Potato)</option>
                            <option value="Moderate">Moderate</option>
                            <option value="High">High (Athlete)</option>
                        </select>
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-[var(--color-primary)] text-white font-bold py-4 rounded-[24px] shadow-lg shadow-[var(--color-primary-soft)] hover:bg-[var(--color-primary-dark)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                        {saving ? "Saving..." : "Save Profile"}
                    </button>
                </div>

            </form>

        </motion.main>
    );
}
