"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Scissors, Bone, Dog, Footprints, Clock, MapPin, Star, Calendar, Check, X } from "lucide-react";

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
    const [selectedService, setSelectedService] = useState<any>(null);
    const [bookingDate, setBookingDate] = useState("");
    const [isBooked, setIsBooked] = useState(false);

    const handleBook = (e: React.FormEvent) => {
        e.preventDefault();
        setIsBooked(true);
        // Reset after 2 seconds
        setTimeout(() => {
            setIsBooked(false);
            setSelectedService(null);
            setBookingDate("");
        }, 2000);
    };

    return (
        <motion.main
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="min-h-screen bg-gray-50 pb-24 relative"
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
                            onClick={() => setSelectedService(service)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-50 flex items-center gap-4 hover:shadow-md text-left transition-all"
                        >
                            <div className={`w-16 h-16 rounded-2xl ${service.bg} flex items-center justify-center flex-shrink-0`}>
                                {service.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 text-lg">{service.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                            </div>
                            <div className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600">
                                Book
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

            {/* Booking Modal */}
            {selectedService && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl"
                    >
                        {isBooked ? (
                            <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                                    <Check size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">Booking Confirmed!</h3>
                                <p className="text-gray-500 text-sm">We've scheduled your {selectedService.title.toLowerCase()} appointment.</p>
                            </div>
                        ) : (
                            <>
                                <div className={`p-6 ${selectedService.bg} flex justify-between items-start`}>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Book {selectedService.title}</h2>
                                        <p className="text-sm text-gray-600 mt-1">Select a preferred time</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedService(null)}
                                        className="p-2 bg-white/50 hover:bg-white rounded-full transition-colors"
                                    >
                                        <X size={20} className="text-gray-600" />
                                    </button>
                                </div>

                                <form onSubmit={handleBook} className="p-6 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-500 ml-1">Date & Time</label>
                                        <div className="relative">
                                            <input
                                                type="datetime-local"
                                                required
                                                value={bookingDate}
                                                onChange={(e) => setBookingDate(e.target.value)}
                                                className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-500">Service Fee</span>
                                            <span className="font-bold">$45.00</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Booking Fee</span>
                                            <span className="font-bold">$2.00</span>
                                        </div>
                                        <div className="border-t border-gray-200 my-2 pt-2 flex justify-between font-bold text-gray-800">
                                            <span>Total</span>
                                            <span>$47.00</span>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-[var(--color-primary)] text-white font-bold py-4 rounded-[24px] shadow-lg shadow-[var(--color-primary-soft)] hover:bg-[var(--color-primary-dark)] active:scale-[0.98] transition-all"
                                    >
                                        Confirm Booking
                                    </button>
                                </form>
                            </>
                        )}
                    </motion.div>
                </div>
            )}

        </motion.main>
    );
}
