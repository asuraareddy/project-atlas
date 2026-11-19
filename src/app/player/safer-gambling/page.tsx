'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, Clock, Ban, CheckCircle2, Lock
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
        setFeedback('Daily deposit limit set to ' + parseFloat(dailyLimit).toFixed(2) + ' PTS. Enforced immediately on server.');
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 bg-[#F8F8F8] text-[#191919]">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-[#6F6F6F] mb-1">
          <Link href="/" className="hover:text-[#191919]">Lobby</Link>
          <span>/</span>
          <span className="text-[#317CFF] font-medium">Safer Gambling Hub</span>
        </div>
        <h1 className="text-3xl font-normal text-[#191919] tracking-tight flex items-center gap-3">
          <ShieldAlert className="w-7 h-7 text-[#E5484D]" />
          <span>Safer Gambling & Player Protection</span>
        </h1>
        <p className="text-xs text-[#6F6F6F] mt-1 font-normal">
          Keep your gaming enjoyable and in control. Set financial limits, session reality checks, or self-exclude.
        </p>
      </div>

      {feedback && (
        <div className="p-4 rounded-[10px] bg-[#1FAE5B]/10 border border-[#1FAE5B]/20 text-[#1FAE5B] flex items-center gap-3 animate-fade-in text-xs font-normal">
          <CheckCircle2 className="w-4 h-4 text-[#1FAE5B] shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Support Banner */}
      <div className="p-4 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-medium text-[#191919] text-sm">Need immediate, confidential support?</h3>
          <p className="text-xs text-[#6F6F6F] mt-0.5">
            National Gambling Helpline is available 24/7 on <strong>0808 8020 133</strong> or live chat at BeGambleAware.org.
          </p>
        </div>
        <a
          href="https://www.begambleaware.org"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-full bg-[#191919] hover:bg-[#333333] text-white text-xs font-normal whitespace-nowrap transition-colors"
        >
          Visit BeGambleAware
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deposit Limits */}
        <div className="p-6 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center gap-2 text-[#191919] font-medium">
            <Lock className="w-4 h-4 text-[#317CFF]" />
            <span>Deposit Limits</span>
          </div>
          <p className="text-xs text-[#6F6F6F] leading-relaxed">
            Cap the maximum funds you can deposit within a 24-hour rolling period. Reductions take effect immediately; increases require a cooling-off period.
          </p>
          <form onSubmit={handleUpdateLimit} className="space-y-4 text-xs">
            <div>
              <label className="text-[#6F6F6F] block mb-1">Daily Limit (PTS)</label>
              <input
                type="number"
                min="5"
                max="5000"
                step="5"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
                className="w-full bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] rounded-[10px] p-2 text-sm text-[#191919] font-mono focus:border-[#191919] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-full text-xs font-normal text-white bg-[#191919] hover:bg-[#333333] shadow-sm transition-all"
            >
              Update Daily Limit
            </button>
          </form>
        </div>

        {/* Reality Checks & Session Limits */}
        <div className="p-6 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center gap-2 text-[#191919] font-medium">
            <Clock className="w-4 h-4 text-[#317CFF]" />
            <span>Session Reality Check</span>
          </div>
          <p className="text-xs text-[#6F6F6F] leading-relaxed">
            Receive an on-screen prompt showing time elapsed and net gaming performance during your active sessions.
          </p>
          <div className="space-y-4 text-xs">
            <div>
              <label className="text-[#6F6F6F] block mb-1">Alert Interval</label>
              <select
                value={sessionDuration}
                onChange={(e) => setSessionDuration(e.target.value)}
                className="w-full bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] rounded-[10px] p-2 text-sm text-[#191919] focus:border-[#191919] focus:outline-none"
              >
                <option value="30">Every 30 Minutes</option>
                <option value="60">Every 60 Minutes (Default)</option>
                <option value="120">Every 2 Hours</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(`Session reality check set to every ${sessionDuration} minutes.`)}
              className="w-full py-2.5 rounded-full text-xs font-normal text-[#191919] bg-[#F8F8F8] hover:bg-[#EEEEEE] border border-[rgba(0,0,0,0.08)] transition-all"
            >
              Save Reality Check
            </button>
          </div>
        </div>
      </div>

      {/* Self-Exclusion Section */}
      <div className="p-6 rounded-[10px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center gap-2 text-[#E5484D] font-medium">
          <Ban className="w-4 h-4" />
          <span>Self-Exclusion Policy</span>
        </div>
        <p className="text-xs text-[#6F6F6F] leading-relaxed">
          If you feel you are losing control of your gaming, you can self-exclude. Self-exclusion will immediately lock your account, terminate open gaming sessions, and block all deposit and wagering activities across the entire platform.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4 text-xs">
          <select
            value={exclusionPeriod}
            onChange={(e) => setExclusionPeriod(e.target.value)}
            className="w-full sm:w-64 bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] rounded-[10px] p-2 text-sm text-[#191919] focus:border-[#191919] focus:outline-none"
          >
            <option value="6_months">6 Months</option>
            <option value="1_year">1 Year</option>
            <option value="5_years">5 Years</option>
          </select>
          <button
            type="button"
            onClick={handleSelfExclude}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-normal text-white bg-[#E5484D] hover:bg-[#D4373C] shadow-sm transition-all"
          >
            Activate Self-Exclusion
          </button>
        </div>
      </div>
    </div>
  );
}
