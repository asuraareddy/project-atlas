'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight } from 'lucide-react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAgreed) return;
    try {
      setLoading(true);
      const search = typeof window !== 'undefined' ? window.location.search : '';
      const res = await fetch(`/api/v1/auth/register${search}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          displayName: formData.fullName,
        }),
      });
      if (res.ok) {
        window.dispatchEvent(new Event('atlas-auth-updated'));
        router.push('/player/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg p-8 rounded-2xl bg-white border border-[rgba(0,0,0,0.08)] space-y-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="text-center space-y-2">
          <div className="w-11 h-11 rounded-full bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] flex items-center justify-center mx-auto text-[#191919]">
            <ShieldCheck className="w-5 h-5 text-[#317CFF]" />
          </div>
          <h1 className="text-2xl font-semibold text-[#191919] tracking-tight">Create player account</h1>
          <p className="text-xs text-[#6F6F6F]">Registration is restricted to individuals aged 18+ in Great Britain</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#191919] block mb-1.5">Full legal name</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-4 py-2.5 bg-white text-sm text-[#191919] rounded-full border border-[rgba(0,0,0,0.12)] focus:border-[#317CFF] focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#191919] block mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-white text-sm text-[#191919] rounded-full border border-[rgba(0,0,0,0.12)] focus:border-[#317CFF] focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#191919] block mb-1.5">Date of birth (18+)</label>
              <input
                type="date"
                required
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full px-4 py-2.5 bg-white text-sm text-[#191919] rounded-full border border-[rgba(0,0,0,0.12)] focus:border-[#317CFF] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#191919] block mb-1.5">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2.5 bg-white text-sm text-[#191919] rounded-full border border-[rgba(0,0,0,0.12)] focus:border-[#317CFF] focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-start gap-2.5 pt-2">
            <input
              type="checkbox"
              id="terms"
              required
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
              className="mt-0.5 rounded border-[rgba(0,0,0,0.2)] text-[#191919] focus:ring-[#317CFF]"
            />
            <label htmlFor="terms" className="text-[11px] text-[#6F6F6F] leading-normal">
              I certify that I am at least 18 years of age and a resident of Great Britain. I accept the{' '}
              <Link href="/legal/terms" className="text-[#317CFF] hover:underline">Terms & Conditions</Link> and{' '}
              <Link href="/legal/privacy" className="text-[#317CFF] hover:underline">Privacy Policy</Link>.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !termsAgreed}
            className="w-full py-2.5 px-5 rounded-full text-xs font-medium text-white bg-[#191919] hover:bg-[#333333] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Creating account & verifying identity...' : 'Complete registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-[#6F6F6F] border-t border-[rgba(0,0,0,0.08)] pt-4">
          Already registered?{' '}
          <Link href="/auth/login" className="text-[#317CFF] font-medium hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
