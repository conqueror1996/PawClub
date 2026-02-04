"use client";

import { useState, useEffect } from 'react';
import { Plus, X, PawPrint, Edit2, Trash2, Heart } from 'lucide-react';
import Link from 'next/link';

import { API_BASE_URL } from '@/lib/config';

interface Pet {
    id: number;
    name: string;
    species: string;
    breed: string;
    age: number;
    weight: string;
    gender: string;
    activityLevel: string;
    profilePhoto?: string;
    appointments?: any[];
    medications?: any[];
    photos?: any[];
}

export default function PetsPage() {
    const [pets, setPets] = useState<Pet[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingPet, setEditingPet] = useState<Pet | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        species: '',
        breed: '',
        age: '',
        weight: '',
        gender: '',
        activityLevel: '',
        profilePhoto: ''
    });

    useEffect(() => {
        loadPets();
    }, []);

    const loadPets = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/pets`);
            const data = await response.json();
            setPets(data.pets || []);
        } catch (error) {
            console.error('Error loading pets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingPet
                ? `${API_BASE_URL}/api/pets/${editingPet.id}`
                : `${API_BASE_URL}/api/pets`;

            const method = editingPet ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setShowForm(false);
                setEditingPet(null);
                setFormData({
                    name: '',
                    species: '',
                    breed: '',
                    age: '',
                    weight: '',
                    gender: '',
                    activityLevel: '',
                    profilePhoto: ''
                });
                loadPets();
            }
        } catch (error) {
            console.error('Error saving pet:', error);
        }
    };

    const deletePet = async (id: number) => {
        if (!confirm('Are you sure you want to delete this pet? This will also delete all associated records.')) return;

        try {
            await fetch(`${API_BASE_URL}/api/pets/${id}`, {
                method: 'DELETE'
            });
            loadPets();
        } catch (error) {
            console.error('Error deleting pet:', error);
        }
    };

    const startEdit = (pet: Pet) => {
        setEditingPet(pet);
        setFormData({
            name: pet.name,
            species: pet.species,
            breed: pet.breed,
            age: pet.age.toString(),
            weight: pet.weight,
            gender: pet.gender,
            activityLevel: pet.activityLevel,
            profilePhoto: pet.profilePhoto || ''
        });
        setShowForm(true);
    };

    const getDefaultPetImage = (species: string) => {
        const colors = {
            Dog: 'from-amber-400 to-orange-500',
            Cat: 'from-purple-400 to-pink-500',
            Bird: 'from-blue-400 to-cyan-500',
            Rabbit: 'from-gray-400 to-gray-500',
        };
        return colors[species as keyof typeof colors] || 'from-green-400 to-teal-500';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg text-gray-600">Loading pets...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">🐾 My Pets</h1>
                        <p className="text-gray-600">Manage all your furry friends</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingPet(null);
                            setFormData({
                                name: '',
                                species: '',
                                breed: '',
                                age: '',
                                weight: '',
                                gender: '',
                                activityLevel: '',
                                profilePhoto: ''
                            });
                            setShowForm(true);
                        }}
                        className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                        <Plus size={20} />
                        <span>Add Pet</span>
                    </button>
                </div>

                {/* Pet Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editingPet ? 'Edit Pet' : 'Add New Pet'}
                                </h2>
                                <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Bruno"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Species *</label>
                                    <select
                                        required
                                        value={formData.species}
                                        onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                        <option value="">Select species</option>
                                        <option value="Dog">Dog</option>
                                        <option value="Cat">Cat</option>
                                        <option value="Bird">Bird</option>
                                        <option value="Rabbit">Rabbit</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Breed *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.breed}
                                        onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Golden Retriever"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Age *</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.age}
                                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="5"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Weight *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.weight}
                                            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="32kg"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                                    <select
                                        required
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                        <option value="">Select gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Activity Level *</label>
                                    <select
                                        required
                                        value={formData.activityLevel}
                                        onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                        <option value="">Select activity level</option>
                                        <option value="Low">Low</option>
                                        <option value="Moderate">Moderate</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo URL</label>
                                    <input
                                        type="url"
                                        value={formData.profilePhoto}
                                        onChange={(e) => setFormData({ ...formData, profilePhoto: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="https://example.com/photo.jpg"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-shadow"
                                >
                                    {editingPet ? 'Update Pet' : 'Add Pet'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Pets Grid */}
                {pets.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
                        <PawPrint size={64} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No pets yet</h3>
                        <p className="text-gray-500 mb-6">Add your first pet to get started</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-2xl hover:shadow-lg transition-shadow"
                        >
                            Add Your First Pet
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pets.map((pet) => (
                            <div key={pet.id} className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                                {/* Pet Avatar */}
                                <div className="flex items-center gap-4 mb-4">
                                    {pet.profilePhoto ? (
                                        <img
                                            src={pet.profilePhoto}
                                            alt={pet.name}
                                            className="w-20 h-20 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${getDefaultPetImage(pet.species)} flex items-center justify-center text-white text-2xl font-bold`}>
                                            {pet.name.charAt(0)}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-gray-900">{pet.name}</h3>
                                        <p className="text-gray-600">{pet.species} • {pet.breed}</p>
                                    </div>
                                </div>

                                {/* Pet Details */}
                                <div className="space-y-2 mb-4 text-sm text-gray-600">
                                    <div className="flex justify-between">
                                        <span>Age:</span>
                                        <span className="font-medium text-gray-900">{pet.age} years</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Weight:</span>
                                        <span className="font-medium text-gray-900">{pet.weight}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Gender:</span>
                                        <span className="font-medium text-gray-900">{pet.gender}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Activity:</span>
                                        <span className="font-medium text-gray-900">{pet.activityLevel}</span>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                {pet.appointments || pet.medications || pet.photos ? (
                                    <div className="flex gap-4 mb-4 text-xs text-gray-500">
                                        {pet.appointments && pet.appointments.length > 0 && (
                                            <span>📅 {pet.appointments.length} upcoming</span>
                                        )}
                                        {pet.medications && pet.medications.length > 0 && (
                                            <span>💊 {pet.medications.length} active</span>
                                        )}
                                        {pet.photos && pet.photos.length > 0 && (
                                            <span>📸 {pet.photos.length} photos</span>
                                        )}
                                    </div>
                                ) : null}

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Link
                                        href={`/dashboard`}
                                        className="flex-1 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl hover:bg-indigo-200 transition-colors text-center font-medium"
                                    >
                                        View Details
                                    </Link>
                                    <button
                                        onClick={() => startEdit(pet)}
                                        className="p-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 size={20} />
                                    </button>
                                    <button
                                        onClick={() => deletePet(pet.id)}
                                        className="p-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
