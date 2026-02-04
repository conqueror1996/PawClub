"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Bell, Calendar, Info, CheckCircle, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

// Mock notification data (Simulation of what would come from backend)
const MOCK_NOTIFICATIONS = [
    {
        id: 1,
        type: "reminder",
        title: "Vaccination Due Soon",
        message: "Bruno's annual vaccination is due in 3 weeks. Book an appointment now.",
        date: "2 hours ago",
        read: false,
        icon: <AlertTriangle size={20} className="text-amber-500" />,
        bg: "bg-amber-50"
    },
    {
        id: 2,
        type: "info",
        title: "Daily Tip Ready",
        message: "Check out today's grooming tip specially curated for golden retrievers!",
        date: "5 hours ago",
        read: false,
        icon: <Info size={20} className="text-blue-500" />,
        bg: "bg-blue-50"
    },
    {
        id: 3,
        type: "success",
        title: "Weight Updated",
        message: "Bruno's weight of 24.5kg has been successfully recorded.",
        date: "Yesterday",
        read: true,
        icon: <CheckCircle size={20} className="text-green-500" />,
        bg: "bg-green-50"
    },
    {
        id: 4,
        type: "event",
        title: "Grooming Appointment",
        message: "Reminder: Grooming session at PawSpa scheduled for tomorrow at 10 AM.",
        date: "Yesterday",
        read: true,
        icon: <Calendar size={20} className="text-purple-500" />,
        bg: "bg-purple-50"
    }
];

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

    const markAsRead = (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
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
                    <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
                </div>
                <button
                    onClick={markAllRead}
                    className="text-xs font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
                >
                    Mark all read
                </button>
            </header>

            <div className="p-6 space-y-4">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center pt-20 text-center opacity-50">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Bell size={32} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">No new notifications</p>
                    </div>
                ) : (
                    notifications.map((n) => (
                        <motion.div
                            layout
                            key={n.id}
                            onClick={() => markAsRead(n.id)}
                            className={`p-4 rounded-[24px] border transition-all cursor-pointer relative overflow-hidden ${n.read ? 'bg-white border-gray-100 opacity-80' : 'bg-white border-white shadow-sm hover:shadow-md'}`}
                        >
                            {/* Unread Indicator */}
                            {!n.read && (
                                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                            )}

                            <div className="flex gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center ${n.bg}`}>
                                    {n.icon}
                                </div>
                                <div className="flex-1 pr-4">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`font-bold text-sm ${n.read ? 'text-gray-600' : 'text-gray-900'}`}>{n.title}</h3>
                                        <span className="text-[10px] text-gray-400 font-medium">{n.date}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{n.message}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </motion.main>
    );
}
