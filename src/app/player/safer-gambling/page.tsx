'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, Clock, Ban, CheckCircle2, AlertTriangle, 
  HelpCircle, Lock, Calendar, RefreshCw 
} from 'lucide-react';

export default function SaferGamblingPage() {
  const [dailyLimit, setDailyLimit] = useState('100.00');
  const [sessionDuration, setSessionDuration] = useState('60');
  const [exclusionPeriod, setExclusionPeriod] = useState('6_months');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleUpdateLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/me/safer-gambling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'DEPOSIT_LIMIT',
          limitType: 'DAILY',
          amountGbp: parseFloat(dailyLimit)
        })
      });
      if (res.ok) {
        setFeedback('Daily deposit limit set to £' + parseFloat(dailyLimit).toFixed(2) + '. Enforced immediately on server.');
      }
    } catch (e: any) {
      setFeedback('Error: ' + e.message);
    }
  };

  const handleSelfExclude = async () => {
    if (!confirm('Are you sure you want to self-exclude? This action blocks access to all games and deposits across the platform and cannot be revoked early.')) {
      return;
    }
    try {
      const res = await fetch('/api/v1/me/safer-gambling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'SELF_EXCLUSION',
          duration: exclusionPeriod
        })
      });
      if (res.ok) {
        setFeedback('Self-exclusion applied. All gameplay and monetary actions have been suspended.');
      }
    } catch (e: any) {
      setFeedback('Error: ' + e.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-[#c4bfd0] mb-1">
          <Link href="/" className="hover:text-white">Lobby</Link>
          <span>/</span>
          <span className="text-[#ff5a7a] font-semibold">Safer Gambling Hub</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-[#ff5a7a]" />
          <span>Safer Gambling & Player Protection</span>
        </h1>
        <p className="text-xs text-[#c4bfd0] mt-1">
          Keep your gaming enjoyable and in control. Set financial limits, session reality checks, or self-exclude.
        </p>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-[#10b981]/20 border border-[#10b981]/40 text-white flex items-center gap-3 animate-fade-in text-xs font-semibold">
          <CheckCircle2 className="w-5 h-5 text-[#10b981] shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* UK Helpline Banner */}
      <div className="p-4 rounded-xl bg-[#ff5a7a]/10 border border-[#ff5a7a]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-sm">Need immediate, confidential support?</h3>
          <p className="text-xs text-[#c4bfd0] mt-0.5">
            National Gambling Helpline is available 24/7 on <strong>0808 8020 133</strong> or live chat at BeGambleAware.org.
          </p>
        </div>
        <a
          href="https://www.begambleaware.org"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-full bg-[#ff5a7a] hover:bg-[#ff5a7a]/90 text-white text-xs font-semibold whitespace-nowrap transition-colors"
        >
          Visit BeGambleAware
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deposit Limits */}
        <div className="p-6 rounded-2xl bg-[#242424] border border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold">
            <Lock className="w-5 h-5 text-[#b45df0]" />
            <span>Deposit Limits</span>
          </div>
          <p className="text-xs text-[#c4bfd0]">
            Cap the maximum funds you can deposit within a 24-hour rolling period. Reductions take effect immediately; increases require a cooling-off period.
          </p>
          <form onSubmit={handleUpdateLimit} className="space-y-4">
            <div>
              <label className="text-xs text-[#c4bfd0] block mb-1">Daily Limit (GBP £)</label>
              <input
                type="number"
                min="5"
                max="5000"
                step="5"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
                className="w-full bg-[#1f1f1f] border border-white/10 rounded-lg p-2.5 text-sm text-white font-mono focus:border-[#b45df0] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-full text-xs font-semibold text-white bg-[#7e0ac2] hover:bg-[#9a13e6] shadow-md shadow-[#7e0ac2]/40"
            >
              Update Daily Limit
            </button>
          </form>
        </div>

        {/* Reality Checks & Session Limits */}
        <div className="p-6 rounded-2xl bg-[#242424] border border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold">
            <Clock className="w-5 h-5 text-[#b45df0]" />
            <span>Session Reality Check</span>
          </div>
          <p className="text-xs text-[#c4bfd0]">
            Receive an on-screen prompt showing time elapsed and net gaming performance during your active sessions.
          </p>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[#c4bfd0] block mb-1">Alert Interval</label>
              <select
                value={sessionDuration}
                onChange={(e) => setSessionDuration(e.target.value)}
                className="w-full bg-[#1f1f1f] border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-[#b45df0] focus:outline-none"
              >
                <option value="30">Every 30 Minutes</option>
                <option value="60">Every 60 Minutes (Default)</option>
                <option value="120">Every 2 Hours</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(`Session reality check set to every ${sessionDuration} minutes.`)}
              className="w-full py-2.5 rounded-full text-xs font-semibold text-white bg-[#2a2a2a] hover:bg-[#333] border border-white/10"
            >
              Save Reality Check
            </button>
          </div>
        </div>
      </div>

      {/* Self-Exclusion Section */}
      <div className="p-6 rounded-2xl bg-[#242424] border border-[#ff5a7a]/40 space-y-4">
        <div className="flex items-center gap-2 text-[#ff5a7a] font-bold">
          <Ban className="w-5 h-5" />
          <span>Self-Exclusion (GAMSTOP Compatible Policy)</span>
        </div>
        <p className="text-xs text-[#c4bfd0] leading-relaxed">
          If you feel you are losing control of your gambling, you can self-exclude. Self-exclusion will immediately lock your account, terminate open gaming sessions, and block all deposit and wagering activities across the entire platform.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <select
            value={exclusionPeriod}
            onChange={(e) => setExclusionPeriod(e.target.value)}
            className="w-full sm:w-64 bg-[#1f1f1f] border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-[#ff5a7a] focus:outline-none"
          >
            <option value="6_months">6 Months</option>
            <option value="1_year">1 Year</option>
            <option value="5_years">5 Years</option>
          </select>
          <button
            type="button"
            onClick={handleSelfExclude}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#ff5a7a] hover:bg-[#ff5a7a]/90 shadow-lg shadow-[#ff5a7a]/30 transition-all"
          >
            Activate Self-Exclusion
          </button>
        </div>
      </div>
    </div>
  );
}
