'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('player@atlas-gaming.co.uk');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push('/player/dashboard');
    }, 800);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md p-8 rounded-2xl bg-[#242424] border border-white/10 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#7e0ac2]/20 border border-[#b45df0]/40 flex items-center justify-center mx-auto text-[#b45df0]">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Sign in to Project Atlas</h1>
          <p className="text-xs text-[#c4bfd0]">Access your verified gaming account and ledger</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#c4bfd0] block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#9c9aa8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-[#1f1f1f] text-sm text-white rounded-lg border border-white/10 focus:border-[#b45df0] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#c4bfd0] block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9c9aa8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-[#1f1f1f] text-sm text-white rounded-lg border border-white/10 focus:border-[#b45df0] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full text-xs font-semibold text-white bg-[#7e0ac2] hover:bg-[#9a13e6] shadow-lg shadow-[#7e0ac2]/40 transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-[#c4bfd0] border-t border-white/10 pt-4">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-[#b45df0] font-semibold hover:underline">
            Register (18+ UK)
          </Link>
        </div>
      </div>
    </div>
  );
}
