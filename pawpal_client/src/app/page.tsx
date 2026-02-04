import { ArrowRight, Dog, Heart } from "lucide-react";
import Link from "next/link";

export default function Onboarding() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor - Soft Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vh] h-[50vh] bg-[var(--color-primary-soft)] rounded-full blur-[80px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vh] h-[50vh] bg-[var(--color-secondary-soft)] rounded-full blur-[80px] opacity-60 pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center animate-fade-in spacing-y-8">

        {/* Illustration Placeholder */}
        <div className="w-64 h-64 mb-8 relative flex items-center justify-center">
          {/* Ideally this would be the 'happy golden retriever' illustration */}
          <div className="w-56 h-56 bg-[var(--color-secondary-soft)] rounded-full flex items-center justify-center shadow-sm">
            <Dog size={80} className="text-[var(--color-secondary)] opacity-80" />
          </div>
          {/* Decorative elements around illustration */}
          <Heart className="absolute top-4 right-10 text-[var(--color-warning)] fill-[var(--color-warning)] opacity-60 w-6 h-6 animate-bounce" style={{ animationDuration: '3s' }} />
          <Heart className="absolute bottom-8 left-6 text-[var(--color-primary)] fill-[var(--color-primary)] opacity-60 w-4 h-4" />
        </div>

        {/* Text */}
        <div className="mb-10 space-y-3">
          <h1 className="text-3xl font-bold text-[var(--color-text-main)]">
            Welcome to PawPal
          </h1>
          <p className="text-[var(--color-text-secondary)] text-lg px-4 leading-relaxed">
            A caring friend helping you take care of your pet.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-4">
          <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-4">
            How do you identify?
          </p>

          <button className="w-full bg-white hover:bg-[var(--color-primary-soft)] border-2 border-[var(--color-primary-soft)] hover:border-[var(--color-primary)] transition-all duration-300 rounded-[24px] p-5 flex items-center gap-4 group shadow-sm hover:shadow-md cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-[var(--color-primary-soft)] flex items-center justify-center text-[var(--color-primary-dark)] group-hover:scale-110 transition-transform">
              <Heart size={24} className="fill-current" />
            </div>
            <div className="flex-1 text-left">
              <span className="block text-lg font-bold text-[var(--color-text-main)]">Pet Mother</span>
              <span className="text-sm text-[var(--color-text-secondary)]">I'm a dog/cat mom</span>
            </div>
            <ArrowRight className="text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all" />
          </button>

          <button className="w-full bg-white hover:bg-[var(--color-secondary-soft)] border-2 border-[var(--color-secondary-soft)] hover:border-[var(--color-secondary)] transition-all duration-300 rounded-[24px] p-5 flex items-center gap-4 group shadow-sm hover:shadow-md cursor-pointer">
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

        {/* Footer/Skip */}
        <div className="mt-8">
          <Link href="/dashboard" className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary-dark)] text-sm font-medium transition-colors">
            I'll set this up later
          </Link>
        </div>

      </div>
    </main>
  );
}
