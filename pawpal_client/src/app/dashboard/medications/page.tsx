"use client";

import { useState, useEffect } from 'react';
import { Pill, Plus, X, Clock, Calendar, AlertCircle } from 'lucide-react';

import { API_BASE_URL } from '@/lib/config';

interface Medication {
    id: number;
    petId: number;
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate?: string;
    timeOfDay?: string;
    instructions?: string;
    isActive: boolean;
    pet?: {
        name: string;
        species: string;
    };
}

export default function MedicationsPage() {
    const [medications, setMedications] = useState<Medication[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState<'all' | 'active'>('active');
    const [formData, setFormData] = useState({
        name: '',
        dosage: '',
        frequency: '',
        startDate: '',
        endDate: '',
        timeOfDay: '',
        instructions: ''
    });

    useEffect(() => {
        loadMedications();
    }, [filter]);

    const loadMedications = async () => {
        try {
            const endpoint = filter === 'active'
                ? `${API_BASE_URL}/api/medications/pet/1/active`
                : `${API_BASE_URL}/api/medications/pet/1`;

            const response = await fetch(endpoint);
            const data = await response.json();
            setMedications(data.medications || []);
        } catch (error) {
            console.error('Error loading medications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(`${API_BASE_URL}/api/medications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    petId: 1,
                    endDate: formData.endDate || null
                })
            });

            if (response.ok) {
                setShowForm(false);
                setFormData({
                    name: '',
                    dosage: '',
                    frequency: '',
                    startDate: '',
                    endDate: '',
                    timeOfDay: '',
                    instructions: ''
                });
                loadMedications();
            }
        } catch (error) {
            console.error('Error creating medication:', error);
        }
    };

    const deactivateMedication = async (id: number) => {
        try {
            await fetch(`${API_BASE_URL}/api/medications/${id}/deactivate`, {
                method: 'POST'
            });
            loadMedications();
        } catch (error) {
            console.error('Error deactivating medication:', error);
        }
    };

    const deleteMedication = async (id: number) => {
        if (!confirm('Are you sure you want to delete this medication?')) return;

        try {
            await fetch(`${API_BASE_URL}/api/medications/${id}`, {
                method: 'DELETE'
            });
            loadMedications();
        } catch (error) {
            console.error('Error deleting medication:', error);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg text-gray-600">Loading medications...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">💊 Medications</h1>
                        <p className="text-gray-600">Track your pet's medication schedule</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                        <Plus size={20} />
                        <span>Add Medication</span>
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setFilter('active')}
                        className={`px-6 py-2 rounded-xl font-medium transition-all ${filter === 'active'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-6 py-2 rounded-xl font-medium transition-all ${filter === 'all'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        All
                    </button>
                </div>

                {/* Add Medication Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Add Medication</h2>
                                <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Medication Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        placeholder="Antibiotics"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Dosage *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.dosage}
                                        onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        placeholder="10mg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Frequency *</label>
                                    <select
                                        required
                                        value={formData.frequency}
                                        onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    >
                                        <option value="">Select frequency</option>
                                        <option value="Once daily">Once daily</option>
                                        <option value="Twice daily">Twice daily</option>
                                        <option value="Three times daily">Three times daily</option>
                                        <option value="Every 8 hours">Every 8 hours</option>
                                        <option value="Every 12 hours">Every 12 hours</option>
                                        <option value="As needed">As needed</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Time of Day</label>
                                    <input
                                        type="text"
                                        value={formData.timeOfDay}
                                        onChange={(e) => setFormData({ ...formData, timeOfDay: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        placeholder="Morning, Evening, or 08:00,20:00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date (Optional)</label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
                                    <textarea
                                        value={formData.instructions}
                                        onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        rows={3}
                                        placeholder="Take with food"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-shadow"
                                >
                                    Add Medication
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Medications List */}
                <div className="space-y-4">
                    {medications.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
                            <Pill size={64} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No medications {filter === 'active' ? 'active' : 'found'}</h3>
                            <p className="text-gray-500 mb-6">Add a medication to start tracking</p>
                            <button
                                onClick={() => setShowForm(true)}
                                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-2xl hover:shadow-lg transition-shadow"
                            >
                                Add Medication
                            </button>
                        </div>
                    ) : (
                        medications.map((medication) => (
                            <div
                                key={medication.id}
                                className={`bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow ${!medication.isActive ? 'opacity-60' : ''
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-3 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl">
                                                <Pill size={24} className="text-emerald-700" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">{medication.name}</h3>
                                                <p className="text-gray-600">{medication.dosage} • {medication.frequency}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-gray-600 ml-14">
                                            {medication.timeOfDay && (
                                                <div className="flex items-center gap-2">
                                                    <Clock size={16} />
                                                    <span>{medication.timeOfDay}</span>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} />
                                                <span>
                                                    {formatDate(medication.startDate)}
                                                    {medication.endDate && ` - ${formatDate(medication.endDate)}`}
                                                </span>
                                            </div>

                                            {medication.instructions && (
                                                <div className="flex items-start gap-2 mt-2">
                                                    <AlertCircle size={16} className="mt-0.5" />
                                                    <span className="text-sm">{medication.instructions}</span>
                                                </div>
                                            )}
                                        </div>

                                        {!medication.isActive && (
                                            <div className="ml-14 mt-2">
                                                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                                    Inactive
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        {medication.isActive && (
                                            <button
                                                onClick={() => deactivateMedication(medication.id)}
                                                className="p-2 bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 transition-colors text-sm"
                                                title="Mark as inactive"
                                            >
                                                Stop
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteMedication(medication.id)}
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
