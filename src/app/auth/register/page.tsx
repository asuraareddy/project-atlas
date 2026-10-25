'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Calendar, MapPin, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: 'Alex Phillips',
    email: 'player@atlas-gaming.co.uk',
    dob: '1998-05-14',
    country: 'United Kingdom',
    password: 'SecurePassword123!'
  });
  const [termsAgreed, setTermsAgreed] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAgreed) return;
    setLoading(true);
    setTimeout(() => {
      router.push('/player/dashboard');
    }, 800);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg p-8 rounded-2xl bg-[#242424] border border-white/10 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#7e0ac2]/20 border border-[#b45df0]/40 flex items-center justify-center mx-auto text-[#b45df0]">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Player Account</h1>
          <p className="text-xs text-[#c4bfd0]">Registration is restricted to individuals aged 18+ in Great Britain</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#c4bfd0] block mb-1">Full Legal Name</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#1f1f1f] text-sm text-white rounded-lg border border-white/10 focus:border-[#b45df0] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#c4bfd0] block mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#1f1f1f] text-sm text-white rounded-lg border border-white/10 focus:border-[#b45df0] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#c4bfd0] block mb-1">Date of Birth (18+)</label>
              <input
                type="date"
                required
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#1f1f1f] text-sm text-white rounded-lg border border-white/10 focus:border-[#b45df0] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#c4bfd0] block mb-1">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#1f1f1f] text-sm text-white rounded-lg border border-white/10 focus:border-[#b45df0] focus:outline-none"
            />
          </div>

          <div className="flex items-start gap-2.5 pt-2">
            <input
              type="checkbox"
              id="terms"
              required
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
              className="mt-0.5 rounded border-white/20 bg-[#1f1f1f] text-[#7e0ac2] focus:ring-[#7e0ac2]"
            />
            <label htmlFor="terms" className="text-[11px] text-[#c4bfd0] leading-normal">
              I certify that I am at least 18 years of age and a resident of Great Britain. I accept the{' '}
              <Link href="/legal/terms" className="text-[#b45df0] hover:underline">Terms & Conditions</Link> and{' '}
              <Link href="/legal/privacy" className="text-[#b45df0] hover:underline">Privacy Policy</Link>.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !termsAgreed}
            className="w-full py-3 rounded-full text-xs font-semibold text-white bg-[#7e0ac2] hover:bg-[#9a13e6] shadow-lg shadow-[#7e0ac2]/40 transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Creating Account & Verifying Identity...' : 'Complete Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-[#c4bfd0] border-t border-white/10 pt-4">
          Already registered?{' '}
          <Link href="/auth/login" className="text-[#b45df0] font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
