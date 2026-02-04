"use client";

import { useState, useEffect } from 'react';
import { Calendar, MapPin, User, Plus, X, Check, Clock } from 'lucide-react';

import { API_BASE_URL } from '@/lib/config';

interface Appointment {
    id: number;
    petId: number;
    title: string;
    description?: string;
    appointmentDate: string;
    location?: string;
    vetName?: string;
    status: string;
    notes?: string;
    pet?: {
        name: string;
        species: string;
    };
}

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        petId: '',
        title: '',
        description: '',
        appointmentDate: '',
        location: '',
        vetName: '',
        notes: ''
    });

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        try {
            // For now, assume petId = 1 (we can extend this later for multi-pet)
            const response = await fetch(`${API_BASE_URL}/api/appointments/pet/1`);
            const data = await response.json();
            setAppointments(data.appointments || []);
        } catch (error) {
            console.error('Error loading appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(`${API_BASE_URL}/api/appointments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    petId: 1 // Default for now
                })
            });

            if (response.ok) {
                setShowForm(false);
                setFormData({
                    petId: '',
                    title: '',
                    description: '',
                    appointmentDate: '',
                    location: '',
                    vetName: '',
                    notes: ''
                });
                loadAppointments();
            }
        } catch (error) {
            console.error('Error creating appointment:', error);
        }
    };

    const updateAppointmentStatus = async (id: number, status: string) => {
        try {
            await fetch(`${API_BASE_URL}/api/appointments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            loadAppointments();
        } catch (error) {
            console.error('Error updating appointment:', error);
        }
    };

    const deleteAppointment = async (id: number) => {
        if (!confirm('Are you sure you want to delete this appointment?')) return;

        try {
            await fetch(`${API_BASE_URL}/api/appointments/${id}`, {
                method: 'DELETE'
            });
            loadAppointments();
        } catch (error) {
            console.error('Error deleting appointment:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg text-gray-600">Loading appointments...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">🗓️ Appointments</h1>
                        <p className="text-gray-600">Manage your pet's vet appointments</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                        <Plus size={20} />
                        <span>New Appointment</span>
                    </button>
                </div>

                {/* Add Appointment Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">New Appointment</h2>
                                <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Annual Checkup"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Date & Time *</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={formData.appointmentDate}
                                        onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Vet Clinic</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Happy Paws Clinic"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Vet Name</label>
                                    <input
                                        type="text"
                                        value={formData.vetName}
                                        onChange={(e) => setFormData({ ...formData, vetName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Dr. Smith"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        rows={3}
                                        placeholder="Vaccination and health check"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-shadow"
                                >
                                    Create Appointment
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Appointments List */}
                <div className="space-y-4">
                    {appointments.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
                            <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No appointments yet</h3>
                            <p className="text-gray-500 mb-6">Schedule your pet's first vet appointment</p>
                            <button
                                onClick={() => setShowForm(true)}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-2xl hover:shadow-lg transition-shadow"
                            >
                                Add Appointment
                            </button>
                        </div>
                    ) : (
                        appointments.map((appointment) => (
                            <div key={appointment.id} className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-gray-900">{appointment.title}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                                {appointment.status}
                                            </span>
                                        </div>

                                        <div className="space-y-2 text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} />
                                                <span>{formatDate(appointment.appointmentDate)}</span>
                                            </div>

                                            {appointment.location && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={16} />
                                                    <span>{appointment.location}</span>
                                                </div>
                                            )}

                                            {appointment.vetName && (
                                                <div className="flex items-center gap-2">
                                                    <User size={16} />
                                                    <span>{appointment.vetName}</span>
                                                </div>
                                            )}
                                        </div>

                                        {appointment.description && (
                                            <p className="mt-3 text-gray-700">{appointment.description}</p>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        {appointment.status === 'scheduled' && (
                                            <button
                                                onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                                                className="p-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors"
                                                title="Mark as completed"
                                            >
                                                <Check size={20} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteAppointment(appointment.id)}
                                            className="p-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
                                            title="Delete"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
