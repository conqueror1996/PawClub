"use client";

import { ArrowRight, Dog, Heart, User, PawPrint, Camera, Upload } from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState<'role' | 'form'>('role');
  const [role, setRole] = useState<'Mother' | 'Father' | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    userName: '',
    petName: '',
    species: 'Dog',
    breed: '',
    age: '',
    profilePhoto: null as string | null
  });

  const handleRoleSelect = (selectedRole: 'Mother' | 'Father') => {
    setRole(selectedRole);
    setStep('form');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a fake local URL for preview purposes
      const objectUrl = URL.createObjectURL(file);
      setFormData({ ...formData, profilePhoto: objectUrl });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalPhotoUrl = '';

      // 1. Upload Photo if selected
      const file = fileInputRef.current?.files?.[0];
      if (file) {
        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
          const uploadRes = await fetch(`${API_BASE_URL}/api/upload`, {
            method: 'POST',
            body: uploadData,
          });
          const uploadResult = await uploadRes.json();
          if (uploadResult.url) {
            finalPhotoUrl = uploadResult.url;
          }
        } catch (uploadError) {
          console.error("Photo upload failed:", uploadError);
          // Continue without photo if upload fails, or handle error visibly
        }
      }

      // 2. Create the pet
      // Note: In a full app, we would create the User first. 
      // For now, we'll create the pet to get the dashboard working.
      const res = await fetch(`${API_BASE_URL}/api/pets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.petName,
          species: formData.species,
          breed: formData.breed || 'Unknown',
          age: parseInt(formData.age) || 1,
          weight: '10kg', // Default
          gender: 'Unknown',
          activityLevel: 'Moderate',
          profilePhoto: finalPhotoUrl || ''
        })
      });

      const data = await res.json();

      if (data.pet) {
        // Redirect to dashboard with the new pet selected
        router.push(`/dashboard?petId=${data.pet.id}`);
      }
    } catch (error) {
      console.error("Failed to create pet", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden bg-[var(--color-background)]">
      {/* Background Decor - Soft Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vh] h-[50vh] bg-[var(--color-primary-soft)] rounded-full blur-[80px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vh] h-[50vh] bg-[var(--color-secondary-soft)] rounded-full blur-[80px] opacity-60 pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center animate-fade-in spacing-y-8">

        {/* Illustration Placeholder (Smaller for Step 2) */}
        <div className={`transition-all duration-500 ${step === 'form' ? 'w-32 h-32 mb-4' : 'w-64 h-64 mb-6'} relative flex items-center justify-center`}>
          <div className={`${step === 'form' ? 'w-28 h-28' : 'w-56 h-56'} bg-[var(--color-secondary-soft)] rounded-full flex items-center justify-center shadow-sm transition-all duration-500`}>
            {formData.profilePhoto ? (
              <img src={formData.profilePhoto} alt="Preview" className="w-full h-full rounded-full object-cover border-4 border-white shadow-md" />
            ) : (
              <Dog size={step === 'form' ? 40 : 80} className="text-[var(--color-secondary)] opacity-80" />
            )}

          </div>
          {step === 'role' && (
            <>
              <Heart className="absolute top-4 right-10 text-[var(--color-warning)] fill-[var(--color-warning)] opacity-60 w-6 h-6 animate-bounce" style={{ animationDuration: '3s' }} />
              <Heart className="absolute bottom-8 left-6 text-[var(--color-primary)] fill-[var(--color-primary)] opacity-60 w-4 h-4" />
            </>
          )}
        </div>

        {/* Text */}
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold text-[var(--color-text-main)]">
            {step === 'role' ? 'Welcome to PawPal' : `Hi, Pet ${role}! 👋`}
          </h1>
          <p className="text-[var(--color-text-secondary)] text-lg px-4 leading-relaxed">
            {step === 'role'
              ? 'A caring friend helping you take care of your pet.'
              : 'Let’s get to know your furry friend.'}
          </p>
          {step === 'form' && (
            <p className="text-sm text-[var(--color-text-tertiary)] font-medium">This helps PawPal give personalized care tips.</p>
          )}
        </div>

        {/* STEP 1: ROLE SELECTION */}
        {step === 'role' && (
          <div className="w-full space-y-4 animate-slide-up">
            <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-4">
              How do you identify?
            </p>

            <button
              onClick={() => handleRoleSelect('Mother')}
              className="w-full bg-white hover:bg-[var(--color-primary-soft)] border-2 border-[var(--color-primary-soft)] hover:border-[var(--color-primary)] transition-all duration-300 rounded-[24px] p-5 flex items-center gap-4 group shadow-sm hover:shadow-md cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-[var(--color-primary-soft)] flex items-center justify-center text-[var(--color-primary-dark)] group-hover:scale-110 transition-transform">
                <Heart size={24} className="fill-current" />
              </div>
              <div className="flex-1 text-left">
                <span className="block text-lg font-bold text-[var(--color-text-main)]">Pet Mother</span>
                <span className="text-sm text-[var(--color-text-secondary)]">I'm a dog/cat mom</span>
              </div>
              <ArrowRight className="text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all" />
            </button>

            <button
              onClick={() => handleRoleSelect('Father')}
              className="w-full bg-white hover:bg-[var(--color-secondary-soft)] border-2 border-[var(--color-secondary-soft)] hover:border-[var(--color-secondary)] transition-all duration-300 rounded-[24px] p-5 flex items-center gap-4 group shadow-sm hover:shadow-md cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-[var(--color-secondary-soft)] flex items-center justify-center text-[var(--color-secondary-dark)] group-hover:scale-110 transition-transform">
                <Heart size={24} className="fill-current" />
              </div>
              <div className="flex-1 text-left">
                <span className="block text-lg font-bold text-[var(--color-text-main)]">Pet Father</span>
                <span className="text-sm text-[var(--color-text-secondary)]">I'm a dog/cat dad</span>
              </div>
              <ArrowRight className="text-[var(--color-secondary)] opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all" />
            </button>
          </div>
        )}

        {/* STEP 2: FORM */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="w-full space-y-5 animate-slide-up text-left">

            {/* User Name */}
            <div>
              <label className="block text-sm font-bold text-[var(--color-text-secondary)] mb-2 ml-1">Your Name</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  placeholder="Your Name (e.g. Alex)"
                  required
                  value={formData.userName}
                  onChange={e => setFormData({ ...formData, userName: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 rounded-[20px] border border-gray-100 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text-main)] font-medium shadow-sm transition-all"
                />
              </div>
            </div>

            {/* Pet Name */}
            <div>
              <label className="block text-sm font-bold text-[var(--color-text-secondary)] mb-2 ml-1">Pet's Name</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <PawPrint size={20} />
                </div>
                <input
                  type="text"
                  placeholder="Pet's Name"
                  required
                  value={formData.petName}
                  onChange={e => setFormData({ ...formData, petName: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 rounded-[20px] border border-gray-100 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text-main)] font-medium shadow-sm transition-all"
                />
              </div>
            </div>

            {/* Species Select Buttons */}
            <div>
              <label className="block text-sm font-bold text-[var(--color-text-secondary)] mb-2 ml-1">Your Pet Is</label>
              <div className="grid grid-cols-2 gap-3">
                {['Dog', 'Cat'].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFormData({ ...formData, species: s })}
                    className={`p-4 rounded-[20px] border cursor-pointer transition-all flex items-center justify-center gap-2 font-bold shadow-sm ${formData.species === s
                      ? 'bg-[var(--color-primary-soft)] border-[var(--color-primary)] text-[var(--color-primary-dark)] scale-[1.02]'
                      : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200 hover:bg-gray-50'
                      }`}
                  >
                    <span>{s === 'Dog' ? '🐶' : '🐱'}</span>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Breed */}
              <div>
                <label className="block text-sm font-bold text-[var(--color-text-secondary)] mb-2 ml-1">Breed <span className="font-normal text-xs opacity-60">(if known)</span></label>
                <input
                  type="text"
                  placeholder="e.g. Labrador"
                  value={formData.breed}
                  onChange={e => setFormData({ ...formData, breed: e.target.value })}
                  className="w-full px-4 py-4 rounded-[20px] border border-gray-100 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text-main)] font-medium shadow-sm transition-all"
                />
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-bold text-[var(--color-text-secondary)] mb-2 ml-1">Age</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Years"
                    min="0"
                    max="30"
                    value={formData.age}
                    onChange={e => setFormData({ ...formData, age: e.target.value })}
                    className="w-full pl-4 pr-12 py-4 rounded-[20px] border border-gray-100 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text-main)] font-medium shadow-sm transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">years</span>
                </div>
              </div>
            </div>

            {/* Photo Upload (Optional) */}
            <div>
              <label className="block text-sm font-bold text-[var(--color-text-secondary)] mb-2 ml-1">Add a photo <span className="font-normal text-xs opacity-60">(optional)</span></label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-200 hover:border-[var(--color-primary)] rounded-[20px] p-4 flex items-center justify-center gap-2 cursor-pointer transition-colors bg-white/50 hover:bg-white"
              >
                <Camera size={20} className="text-gray-400" />
                <span className="text-gray-500 font-medium">
                  {formData.profilePhoto ? 'Change Photo' : 'Upload Photo'}
                </span>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--color-primary)] text-white font-bold py-4 rounded-[24px] shadow-lg shadow-[var(--color-primary-soft)] hover:bg-[var(--color-primary-dark)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6"
            >
              {loading ? 'Creating Profile...' : 'Meet PawPal'} <ArrowRight size={20} />
            </button>

            <button
              type="button"
              onClick={() => setStep('role')}
              className="w-full text-center text-sm text-gray-400 hover:text-gray-600 mt-0 py-2"
            >
              Change Role
            </button>

            <p className="text-xs text-center text-gray-300 mt-2">Takes less than a minute</p>

          </form>
        )}

        {/* Footer/Skip */}
        {step === 'role' && (
          <div className="mt-8">
            <Link href="/dashboard" className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary-dark)] text-sm font-medium transition-colors">
              I'll set this up later
            </Link>
          </div>
        )}

      </div>
    </main>
  );
}
