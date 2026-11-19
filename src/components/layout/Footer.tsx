'use client';

import Link from 'next/link';
import { Shield, ShieldAlert, Award, AlertTriangle } from 'lucide-react';
import { useTenant } from '@/components/tenant/TenantContext';
import { AmbaariFooter } from '@/components/ambaari/AmbaariFooter';

export function Footer() {
  const { branding, tenantSlug } = useTenant();

  // Client-Specific Layout Isolation: Ambaari 999
  if (branding.layoutTheme === 'ambaari' || tenantSlug === 'ambaari999') {
    return <AmbaariFooter />;
  }
  return (
    <footer className="w-full bg-[#F8F8F8] border-t border-[rgba(0,0,0,0.08)] text-[#6F6F6F] text-xs pt-12 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Safer Gambling & Regulatory Banner */}
        <div className="p-4 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#E5484D]/10 border border-[#E5484D]/20 flex items-center justify-center shrink-0">
              <span className="font-medium text-[#E5484D] text-sm">18+</span>
            </div>
            <div>
              <p className="font-medium text-[#191919]">Underage gambling is an offence</p>
              <p className="text-[#6F6F6F] text-[11px]">
                Please gamble responsibly. For confidential help, contact the National Gambling Helpline on 0808 8020 133 or visit BeGambleAware.org.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/player/safer-gambling"
              className="px-4 py-1.5 rounded-full bg-white hover:bg-[#F8F8F8] text-[#191919] border border-[rgba(0,0,0,0.08)] text-xs font-normal transition-colors"
            >
              Player protection tools
            </Link>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-[#191919] font-medium mb-3 text-sm">Game categories</h4>
            <ul className="space-y-2">
              <li><Link href="/matka" className="hover:text-[#191919] transition-colors">Matka (Number Draw)</Link></li>
              <li><Link href="/casino" className="hover:text-[#191919] transition-colors">Casino Games</Link></li>
              <li><Link href="/sports" className="hover:text-[#191919] transition-colors">Sports Exchange</Link></li>
              <li><Link href="/other-games" className="hover:text-[#191919] transition-colors">Other Games (Carrom, Ludo, Pool, Rummy)</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#191919] font-medium mb-3 text-sm">Player services</h4>
            <ul className="space-y-2">
              <li><Link href="/player/wallet" className="hover:text-[#191919] transition-colors">My wallet & balances</Link></li>
              <li><Link href="/player/deposit" className="hover:text-[#191919] transition-colors">Direct crypto QR deposit</Link></li>
              <li><Link href="/player/withdrawals" className="hover:text-[#191919] transition-colors">Withdrawal requests</Link></li>
              <li><Link href="/player/history" className="hover:text-[#191919] transition-colors">Gaming & ledger history</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#191919] font-medium mb-3 text-sm">Security & compliance</h4>
            <ul className="space-y-2">
              <li><Link href="/player/safer-gambling" className="hover:text-[#191919] transition-colors">Deposit & time limits</Link></li>
              <li><Link href="/player/safer-gambling" className="hover:text-[#191919] transition-colors">Self-exclusion & time-out</Link></li>
              <li><Link href="/legal/fairness" className="hover:text-[#191919] transition-colors">RNG & game fairness</Link></li>
              <li><Link href="/legal/segregation" className="hover:text-[#191919] transition-colors">Customer funds protection</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#191919] font-medium mb-3 text-sm">Operator & legal</h4>
            <ul className="space-y-2">
              <li><Link href="/legal/terms" className="hover:text-[#191919] transition-colors">Terms & conditions</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-[#191919] transition-colors">Privacy notice (UK GDPR)</Link></li>
              <li><Link href="/player/support" className="hover:text-[#191919] transition-colors">Complaints & dispute procedure</Link></li>
              <li><Link href="/admin/dashboard" className="text-[#317CFF] hover:underline font-normal">Internal administration</Link></li>
            </ul>
          </div>
        </div>

        {/* Regulatory Disclosure Statement */}
        <div className="border-t border-[rgba(0,0,0,0.08)] pt-6 text-[11px] text-[#B8B8B8] space-y-2">
          <p>
            Project Atlas operates under technical standards aligned with the UK Gambling Commission Remote Technical Standards (RTS) and Licence Conditions and Codes of Practice (LCCP). Real-money game participation and monetary deposit flows require completed identity and age verification. All real-money capabilities in development environments utilize non-redeemable practice credits.
          </p>
          <p>
            © 2026 Project Atlas. All rights reserved. Registered Operator Domain.
          </p>
        </div>

      </div>
    </footer>
  );
}
