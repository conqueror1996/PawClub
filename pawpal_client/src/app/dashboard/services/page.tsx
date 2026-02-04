"use client";

import { ArrowLeft, Scissors, Bone, Dog, Footprints, Clock, MapPin, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const SERVICES = [
    {
        id: "grooming",
        title: "Grooming",
        description: "Bath, haircut, nail trimming & spa",
        icon: <Scissors size={24} className="text-pink-500" />,
        bg: "bg-pink-50"
    },
    {
        id: "walking",
        title: "Dog Walking",
        description: "30 or 60 min walks in your area",
        icon: <Footprints size={24} className="text-green-500" />,
        bg: "bg-green-50"
    },
    {
        id: "training",
        title: "Training",
        description: "Obedience, tricks, and behavior",
        icon: <Bone size={24} className="text-orange-500" />,
        bg: "bg-orange-50"
    },
    {
        id: "boarding",
        title: "Boarding",
        description: "Overnight stays & daycare",
        icon: <Dog size={24} className="text-blue-500" />,
        bg: "bg-blue-50"
    }
];

export default function ServicesPage() {
    const router = useRouter();

    return (
        <motion.main
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="min-h-screen bg-gray-50 pb-24"
        >
            {/* Header */}
            <header className="bg-white px-6 py-6 sticky top-0 z-10 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-gray-700" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">Pet Services</h1>
                </div>
            </header>

            <div className="p-6">
                <div className="grid grid-cols-1 gap-4">
                    {SERVICES.map(service => (
                        <motion.button
                            key={service.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-50 flex items-center gap-4 hover:shadow-md text-left"
                        >
                            <div className={`w-16 h-16 rounded-2xl ${service.bg} flex items-center justify-center flex-shrink-0`}>
                                {service.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 text-lg">{service.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                            </div>
                        </motion.button>
                    ))}
                </div>

                {/* Promo */}
                <div className="mt-8 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-[24px] p-6 text-white text-center shadow-lg shadow-[var(--color-primary-soft)]">
                    <Star className="mx-auto fill-white/20 text-white mb-2" size={32} />
                    <h3 className="text-lg font-bold">PawPal Premium</h3>
                    <p className="text-white/80 text-sm mt-2 mb-4">Get 20% off all services and unlimited vet chat.</p>
                    <button className="bg-white text-[var(--color-primary-dark)] px-6 py-3 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 transition-colors">
                        Upgrade Now
                    </button>
                </div>
            </div>
        </motion.main>
    );
}
