'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ShieldAlert, Award, Lock, HelpCircle, PhoneCall, Mail } from 'lucide-react';
import { useTenant } from '@/components/tenant/TenantContext';

export function AmbaariFooter() {
  const { tenantSlug } = useTenant();

  return (
    <footer className="w-full bg-[#1e2b37] border-t border-[#314659] text-slate-300 font-['Roboto_Condensed',sans-serif] text-xs pt-8 pb-16 sm:pb-8">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Top Badges & Certifications Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#17222d] border border-[#2b3c4d]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 font-black text-xs shrink-0">
              18+
            </div>
            <div>
              <div className="font-bold text-white text-xs">Strictly 18+</div>
              <div className="text-[10px] text-slate-400">Underage gaming is prohibited</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-white text-xs">100% Certified RNG</div>
              <div className="text-[10px] text-slate-400">Fair outcomes independently tested</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Lock className="w-8 h-8 text-cyan-400 shrink-0" />
            <div>
              <div className="font-bold text-white text-xs">SSL 256-bit Encryption</div>
              <div className="text-[10px] text-slate-400">Bank-grade data security</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Award className="w-8 h-8 text-amber-400 shrink-0" />
            <div>
              <div className="font-bold text-white text-xs">Instant 24/7 Payouts</div>
              <div className="text-[10px] text-slate-400">UPI, NetBanking & Crypto</div>
            </div>
          </div>
        </div>

        {/* 4-Column Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-white">AMBAARI</span>
              <span className="text-lg font-black text-[#f59e0b]">999</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              AMBAARI999 is the official sports betting exchange and licensed live casino provider. Offering seamless cricket match odds, in-play ball-by-ball markets, and real dealer table games.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3 border-b border-[#314659] pb-1">
              Gaming Products
            </h4>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              <li>
                <Link href={`/sports?tenant=${tenantSlug}`} className="hover:text-white transition-colors">
                  Cricket Exchange (Live Odds)
                </Link>
              </li>
              <li>
                <Link href={`/sports?tenant=${tenantSlug}&sport=1`} className="hover:text-white transition-colors">
                  Football / Soccer Markets
                </Link>
              </li>
              <li>
                <Link href={`/casino?tenant=${tenantSlug}&cat=live`} className="hover:text-white transition-colors">
                  Live Dealer Casino (Roulette, Blackjack)
                </Link>
              </li>
              <li>
                <Link href={`/casino?tenant=${tenantSlug}&cat=slots`} className="hover:text-white transition-colors">
                  1Stake Vegas Slots
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3 border-b border-[#314659] pb-1">
              Safety & Regulations
            </h4>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              <li>
                <Link href="/player/safer-gambling" className="hover:text-white transition-colors flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-red-400" />
                  <span>Responsible Gaming</span>
                </Link>
              </li>
              <li>
                <span className="cursor-pointer hover:text-white">Exchange Rules & Settlement</span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-white">Terms & Conditions</span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-white">Privacy & Cookie Policy</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3 border-b border-[#314659] pb-1">
              Customer Support
            </h4>
            <div className="space-y-2 text-slate-400 text-xs">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#0088CC]" />
                <span>support@ambaari999.com</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>24x7 WhatsApp Helpdesk</span>
              </div>
              <div className="p-2 rounded bg-[#17222d] border border-[#2b3c4d] text-[10px] text-amber-300">
                ⭐ Telegram Channel: @ambaari999_official
              </div>
            </div>
          </div>
        </div>

        {/* Accepted Payment Icons */}
        <div className="pt-4 border-t border-[#314659] flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="font-bold uppercase tracking-wider text-white">Accepted Payments:</span>
            <span className="px-2 py-0.5 rounded bg-[#273847] text-white font-bold">UPI</span>
            <span className="px-2 py-0.5 rounded bg-[#273847] text-white font-bold">IMPS</span>
            <span className="px-2 py-0.5 rounded bg-[#273847] text-white font-bold">PAYTM</span>
            <span className="px-2 py-0.5 rounded bg-[#273847] text-amber-400 font-bold">USDT (TRC20)</span>
            <span className="px-2 py-0.5 rounded bg-[#273847] text-cyan-400 font-bold">BTC / ETH</span>
          </div>

          <div>
            © 2026 AMBAARI999. All Rights Reserved. Exclusively operated for authorized domain.
          </div>
        </div>
      </div>
    </footer>
  );
}

