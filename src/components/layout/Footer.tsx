'use client';

import Link from 'next/link';
import { Shield, ShieldAlert, Award, AlertTriangle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-[#171717] border-t border-white/10 text-[#c4bfd0] text-xs pt-12 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Safer Gambling & Regulatory Banner */}
        <div className="p-4 rounded-xl bg-[#242424] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#ff5a7a]/20 border border-[#ff5a7a]/40 flex items-center justify-center shrink-0">
              <span className="font-bold text-[#ff5a7a] text-sm">18+</span>
            </div>
            <div>
              <p className="font-semibold text-white">Underage Gambling is an Offence</p>
              <p className="text-[#c4bfd0] text-[11px]">
                Please gamble responsibly. For confidential help, contact the National Gambling Helpline on 0808 8020 133 or visit BeGambleAware.org.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/player/safer-gambling"
              className="px-4 py-2 rounded-full bg-[#ff5a7a]/10 hover:bg-[#ff5a7a]/20 text-[#ff5a7a] border border-[#ff5a7a]/30 font-medium transition-colors"
            >
              Player Protection Tools
            </Link>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-white font-semibold mb-3 tracking-wide text-sm">Game Categories</h4>
            <ul className="space-y-2">
              <li><Link href="/matka" className="hover:text-white transition-colors">Matka (Number Draw)</Link></li>
              <li><Link href="/carrom" className="hover:text-white transition-colors">Carrom Multiplayer</Link></li>
              <li><Link href="/ludo" className="hover:text-white transition-colors">Ludo Online</Link></li>
              <li><Link href="/other-games" className="hover:text-white transition-colors">Other Games (Pool & Skill)</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 tracking-wide text-sm">Player Services</h4>
            <ul className="space-y-2">
              <li><Link href="/player/wallet" className="hover:text-white transition-colors">My Wallet & Balances</Link></li>
              <li><Link href="/player/deposit" className="hover:text-white transition-colors">Direct Crypto QR Deposit</Link></li>
              <li><Link href="/player/withdrawals" className="hover:text-white transition-colors">Withdrawal Requests</Link></li>
              <li><Link href="/player/history" className="hover:text-white transition-colors">Gaming & Ledger History</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 tracking-wide text-sm">Security & Compliance</h4>
            <ul className="space-y-2">
              <li><Link href="/player/safer-gambling" className="hover:text-white transition-colors">Deposit & Time Limits</Link></li>
              <li><Link href="/player/safer-gambling" className="hover:text-white transition-colors">Self-Exclusion & Time-Out</Link></li>
              <li><Link href="/legal/fairness" className="hover:text-white transition-colors">RNG & Game Fairness</Link></li>
              <li><Link href="/legal/segregation" className="hover:text-white transition-colors">Customer Funds Protection</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 tracking-wide text-sm">Operator & Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/legal/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy Notice (UK GDPR)</Link></li>
              <li><Link href="/player/support" className="hover:text-white transition-colors">Complaints & Dispute Procedure</Link></li>
              <li><Link href="/admin/dashboard" className="text-[#b45df0] hover:underline font-medium">Internal Administration</Link></li>
            </ul>
          </div>
        </div>

        {/* Regulatory Disclosure Statement */}
        <div className="border-t border-white/10 pt-6 text-[11px] text-[#9c9aa8] space-y-2">
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
