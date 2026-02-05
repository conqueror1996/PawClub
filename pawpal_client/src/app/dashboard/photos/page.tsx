"use client";

import { useState, useEffect } from 'react';
import { Image as ImageIcon, Plus, X, Edit2, Heart } from 'lucide-react';

import { API_BASE_URL } from '@/lib/config';

interface Photo {
    id: number;
    petId: number;
    url: string;
    caption?: string;
    uploadedAt: string;
    pet?: {
        name: string;
        species: string;
    };
}

export default function PhotoGalleryPage() {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const [editingCaption, setEditingCaption] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        url: '',
        caption: ''
    });
    const [captionText, setCaptionText] = useState('');

    useEffect(() => {
        loadPhotos();
    }, []);

    const loadPhotos = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/photos/pet/1`);
            const data = await response.json();
            setPhotos(data.photos || []);
        } catch (error) {
            console.error('Error loading photos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(`${API_BASE_URL}/api/photos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    petId: 1
                })
            });

            if (response.ok) {
                setShowUploadForm(false);
                setFormData({ url: '', caption: '' });
                loadPhotos();
            }
        } catch (error) {
            console.error('Error uploading photo:', error);
        }
    };

    const updateCaption = async (id: number, caption: string) => {
        try {
            await fetch(`${API_BASE_URL}/api/photos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ caption })
            });
            setEditingCaption(null);
            loadPhotos();
        } catch (error) {
            console.error('Error updating caption:', error);
        }
    };

    const deletePhoto = async (id: number) => {
        if (!confirm('Are you sure you want to delete this photo?')) return;

        try {
            await fetch(`${API_BASE_URL}/api/photos/${id}`, {
                method: 'DELETE'
            });
            setSelectedPhoto(null);
            loadPhotos();
        } catch (error) {
            console.error('Error deleting photo:', error);
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
                <div className="text-lg text-gray-600">Loading photos...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">📸 Photo Gallery</h1>
                        <p className="text-gray-600">Cherish your favorite moments together</p>
                    </div>
                    <button
                        onClick={() => setShowUploadForm(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                        <Plus size={20} />
                        <span>Upload Photo</span>
                    </button>
                </div>

                {/* Upload Form Modal */}
                {showUploadForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Upload Photo</h2>
                                <button onClick={() => setShowUploadForm(false)} className="text-gray-500 hover:text-gray-700">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleUpload} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Photo URL *</label>
                                    <input
                                        type="url"
                                        required
                                        value={formData.url}
                                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                        placeholder="https://example.com/photo.jpg"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        For demo purposes, use an image URL. In production, this would be a file upload.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
                                    <textarea
                                        value={formData.caption}
                                        onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                        rows={3}
                                        placeholder="Playing at the park 🐕"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-shadow"
                                >
                                    Upload Photo
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Photo Detail Modal */}
                {selectedPhoto && (
                    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPhoto(null)}>
                        <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
                            <button
                                onClick={() => setSelectedPhoto(null)}
                                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition"
                            >
                                <X size={32} />
                            </button>

                            <img
                                src={selectedPhoto.url}
                                alt={selectedPhoto.caption || 'Pet photo'}
                                className="w-full max-h-[80vh] object-contain rounded-2xl"
                            />

                            <div className="bg-white rounded-2xl p-6 mt-4">
                                {editingCaption === selectedPhoto.id ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={captionText}
                                            onChange={(e) => setCaptionText(e.target.value)}
                                            className="flex-1 px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-500"
                                            placeholder="Add a caption..."
                                            autoFocus
                                        />
                                        <button
                                            onClick={() => updateCaption(selectedPhoto.id, captionText)}
                                            className="px-4 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setEditingCaption(null)}
                                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="text-gray-900 text-lg mb-2">
                                                {selectedPhoto.caption || 'No caption'}
                                            </p>
                                            <p className="text-gray-500 text-sm">
                                                Uploaded on {formatDate(selectedPhoto.uploadedAt)}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingCaption(selectedPhoto.id);
                                                    setCaptionText(selectedPhoto.caption || '');
                                                }}
                                                className="p-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200"
                                            >
                                                <Edit2 size={20} />
                                            </button>
                                            <button
                                                onClick={() => deletePhoto(selectedPhoto.id)}
                                                className="p-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Photo Grid */}
                {photos.length === 0 ? (
                    <div className="text-center py-12 px-6">
                        <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-pink-50">
                            <ImageIcon size={32} className="text-pink-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No photos of your pet yet 📸</h3>
                        <p className="text-gray-500 max-w-xs mx-auto mb-8 leading-relaxed">
                            Add photos to create a memory gallery and track special moments.
                        </p>
                        <button
                            onClick={() => setShowUploadForm(true)}
                            className="bg-gradient-to-r from-rose-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-pink-200 hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 mx-auto"
                        >
                            <Plus size={20} />
                            <span>Upload First Photo</span>
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {photos.map((photo) => (
                            <div
                                key={photo.id}
                                onClick={() => setSelectedPhoto(photo)}
                                className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all hover:scale-105"
                            >
                                <img
                                    src={photo.url}
                                    alt={photo.caption || 'Pet photo'}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                        {photo.caption && (
                                            <p className="text-white text-sm font-medium mb-1 line-clamp-2">
                                                {photo.caption}
                                            </p>
                                        )}
                                        <p className="text-white/80 text-xs">
                                            {formatDate(photo.uploadedAt)}
                                        </p>
                                    </div>
                                </div>
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Heart size={24} className="text-white drop-shadow-lg" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {photos.length > 0 && (
                    <div className="mt-8 text-center text-gray-500">
                        {photos.length} {photos.length === 1 ? 'photo' : 'photos'} in your gallery
                    </div>
                )}
            </div>
        </div>
    );
}
