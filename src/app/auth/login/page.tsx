'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck, User, Building2, AlertCircle } from 'lucide-react';
import { useTenant } from '@/components/tenant/TenantContext';

export default function LoginPage() {
  const router = useRouter();
  const { tenantSlug, branding } = useTenant();
  const [email, setEmail] = useState('player@atlas-gaming.co.uk');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocalhost, setIsLocalhost] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname.toLowerCase();
      setIsLocalhost(host === 'localhost' || host === '127.0.0.1' || host.endsWith('.platform.internal'));
    }
    if (tenantSlug) {
      setEmail(`player@${tenantSlug}.com`);
    }
  }, [tenantSlug]);

  const performLogin = async (loginEmail: string, loginPassword: string) => {
    try {
      setLoading(true);
      setError(null);
      const search = typeof window !== 'undefined' ? window.location.search : '';
      const res = await fetch(`/api/v1/auth/login${search}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.message || json.error || `Login failed (HTTP ${res.status})`);
      }

      const role = json.data?.user?.role || 'PLAYER';
      window.dispatchEvent(new Event('atlas-auth-updated'));

      if (role === 'SUPER_ADMIN') {
        document.cookie = 'atlas_tenant=atlas; path=/; max-age=86400; SameSite=Lax';
        window.location.href = '/admin/dashboard';
      } else if (role === 'OPERATOR_ADMIN') {
        router.push('/client-admin');
      } else {
        router.push('/player/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email, password);
  };

  const quickLogin = (targetEmail: string) => {
    setEmail(targetEmail);
    setPassword('Password123!');
    performLogin(targetEmail, 'Password123!');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white border border-[rgba(0,0,0,0.08)] space-y-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="text-center space-y-2">
          <div className="w-11 h-11 rounded-full bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] flex items-center justify-center mx-auto text-[#191919]">
            <ShieldCheck className="w-5 h-5 text-[#317CFF]" />
          </div>
          <h1 className="text-2xl font-semibold text-[#191919] tracking-tight">
            Sign in to {branding.brandName || 'Project Atlas'}
          </h1>
          <p className="text-xs text-[#6F6F6F]">
            Access your verified account, wallet, or administration console
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-[#E5484D]/10 border border-[#E5484D]/20 text-xs text-[#E5484D] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#191919] block mb-1.5">Email address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#6F6F6F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white text-sm text-[#191919] rounded-full border border-[rgba(0,0,0,0.12)] focus:border-[#317CFF] focus:outline-none transition-colors"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[#191919]">Password</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#6F6F6F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white text-sm text-[#191919] rounded-full border border-[rgba(0,0,0,0.12)] focus:border-[#317CFF] focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-5 rounded-full text-xs font-medium text-white bg-[#191919] hover:bg-[#333333] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign in'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Role Testing Controls */}
        <div className="pt-4 border-t border-[rgba(0,0,0,0.08)] space-y-2.5">
          <div className="text-[11px] font-medium text-[#6F6F6F] text-center">
            Quick test login ({tenantSlug})
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => quickLogin(`player@${tenantSlug}.com`)}
              className="px-3 py-2 rounded-full bg-[#F8F8F8] hover:bg-[#EEEEEE] border border-[rgba(0,0,0,0.08)] text-[11px] font-medium text-[#191919] flex items-center justify-center gap-1.5 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-[#1FAE5B]" />
              <span>Customer Login</span>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => quickLogin(`admin@${tenantSlug}.com`)}
              className="px-3 py-2 rounded-full bg-[#F8F8F8] hover:bg-[#EEEEEE] border border-[rgba(0,0,0,0.08)] text-[11px] font-medium text-[#191919] flex items-center justify-center gap-1.5 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-[#317CFF]" />
              <span>Client Admin</span>
            </button>
          </div>
          {(isLocalhost || tenantSlug === 'atlas') && (
            <button
              type="button"
              disabled={loading}
              onClick={() => quickLogin('admin@atlasgaming.uk')}
              className="w-full px-3 py-2 rounded-full bg-[#F8F8F8] hover:bg-[#EEEEEE] border border-[rgba(0,0,0,0.08)] text-[11px] font-medium text-[#191919] flex items-center justify-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#317CFF]" />
              <span>Platform Super Admin</span>
            </button>
          )}
        </div>

        <div className="text-center text-xs text-[#6F6F6F] border-t border-[rgba(0,0,0,0.08)] pt-4">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-[#317CFF] font-medium hover:underline">
            Register (18+ UK)
          </Link>
        </div>
      </div>
    </div>
  );
}
