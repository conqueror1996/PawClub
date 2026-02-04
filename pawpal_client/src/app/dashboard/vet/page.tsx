"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Star, MapPin, Phone, Clock, Navigation } from "lucide-react";

const MOCK_VETS = [
    {
        id: 1,
        name: "PawPal Veterinary Clinic",
        address: "123 Pet Lane, Downtown",
        rating: 4.8,
        reviews: 124,
        isOpen: true,
        image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80",
        distance: "0.8 km"
    },
    {
        id: 2,
        name: "City Pet Hospital",
        address: "456 Avenue, Uptown",
        rating: 4.5,
        reviews: 89,
        isOpen: true,
        image: "https://images.unsplash.com/photo-1628009368231-76033527212e?w=800&q=80",
        distance: "1.2 km"
    },
    {
        id: 3,
        name: "Emergency Vet Care 24/7",
        address: "789 Highway Rd",
        rating: 4.9,
        reviews: 210,
        isOpen: true,
        image: "https://images.unsplash.com/photo-1599443015574-be5fe355a5e3?w=800&q=80",
        distance: "2.5 km"
    }
];

export default function VetFinderPage() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-gray-50 pb-ปลอดภัย">
            {/* Header */}
            <header className="bg-white px-6 py-6 sticky top-0 z-10 shadow-sm flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={24} className="text-gray-700" />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Find a Vet</h1>
            </header>

            {/* Content */}
            <div className="p-6 space-y-6">
                {/* Search / Filter (Mock) */}
                <div className="flex gap-2">
                    <button className="flex-1 py-3 bg-white text-gray-600 rounded-xl text-sm font-medium shadow-sm border border-gray-100 hover:border-gray-200">
                        Open Now
                    </button>
                    <button className="flex-1 py-3 bg-[var(--color-primary)] text-white rounded-xl text-sm font-bold shadow-md shadow-[var(--color-primary-soft)]">
                        Nearby
                    </button>
                    <button className="flex-1 py-3 bg-white text-gray-600 rounded-xl text-sm font-medium shadow-sm border border-gray-100 hover:border-gray-200">
                        Top Rated
                    </button>
                </div>

                {/* List */}
                <div className="space-y-4">
                    {MOCK_VETS.map(vet => (
                        <div key={vet.id} className="bg-white p-4 rounded-[24px] shadow-sm flex gap-4 border border-gray-50 hover:shadow-md transition-shadow">
                            <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-200">
                                <img src={vet.image} alt={vet.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-gray-900 text-sm leading-tight">{vet.name}</h3>
                                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                                            {vet.isOpen ? "OPEN" : "CLOSED"}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                        <MapPin size={12} /> {vet.distance} • {vet.address}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                                        <span className="text-xs font-bold text-gray-800">{vet.rating}</span>
                                        <span className="text-xs text-gray-400">({vet.reviews})</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-3">
                                    <button className="flex-1 py-2 bg-gray-50 text-gray-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-gray-100">
                                        <Navigation size={14} /> Directions
                                    </button>
                                    <button className="flex-1 py-2 bg-[var(--color-secondary)] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-opacity-90 shadow-sm shadow-[var(--color-secondary-soft)]">
                                        <Phone size={14} /> Call
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
