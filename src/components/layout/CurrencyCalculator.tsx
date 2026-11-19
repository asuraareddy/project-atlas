'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Calculator, ArrowLeftRight, Settings2, X } from 'lucide-react';
import { useTenant } from '@/components/tenant/TenantContext';

export function CurrencyCalculator({ showAdminLink = false }: { showAdminLink?: boolean }) {
  const { tenantName, tenantSlug, pointConfig } = useTenant();
  const [isOpen, setIsOpen] = useState(false);
  const [pointsInput, setPointsInput] = useState('1');
  const [currencyInput, setCurrencyInput] = useState('1');
  const containerRef = useRef<HTMLDivElement>(null);

  const rate = pointConfig?.pointToCurrencyRate && pointConfig.pointToCurrencyRate > 0
    ? pointConfig.pointToCurrencyRate
    : 1.0;
  const currencyCode = pointConfig?.currencyCode || 'UNDEFINED';
  const unitName = pointConfig?.pointUnitName || 'PTS';

  // Sync converted currency whenever active tenant's rate updates from anywhere
  useEffect(() => {
    const pts = parseFloat(pointsInput);
    if (isFinite(pts)) {
      setCurrencyInput(formatNum(pts * rate));
    }
  }, [rate]);

  // Close on outside click or Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    window.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  const formatNum = (val: number) => {
    if (!isFinite(val)) return '0';
    return Number.isInteger(val) ? String(val) : Number(val.toFixed(4)).toString();
  };

  const handlePointsChange = (val: string) => {
    setPointsInput(val);
    const num = parseFloat(val);
    setCurrencyInput(isFinite(num) ? formatNum(num * rate) : '');
  };

  const handleCurrencyChange = (val: string) => {
    setCurrencyInput(val);
    const num = parseFloat(val);
    setPointsInput(isFinite(num) ? formatNum(num / rate) : '');
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left z-50">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F8F8F8] hover:bg-[#EEEEEE] border border-[rgba(0,0,0,0.08)] text-xs font-normal text-[#191919] transition-all"
        title={`Point & Currency Calculator (1 ${unitName} = ${rate} ${currencyCode})`}
      >
        <Calculator className="w-3.5 h-3.5 text-[#317CFF]" />
        <span className="hidden md:inline font-mono text-[11px]">
          1 {unitName} = {rate} {currencyCode}
        </span>
        <span className="md:hidden font-mono text-[11px]">Calc</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-[rgba(0,0,0,0.08)] shadow-2xl p-4 space-y-3.5 z-50">
          <div className="flex items-center justify-between border-b border-[rgba(0,0,0,0.08)] pb-2.5">
            <div>
              <div className="text-xs font-semibold text-[#191919] flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-[#317CFF]" />
                <span>Currency & Point Calculator</span>
              </div>
              <div className="text-[10px] text-[#6F6F6F] truncate max-w-[210px] mt-0.5">
                {tenantName} ({tenantSlug})
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-[#F8F8F8] text-[#6F6F6F] hover:text-[#191919]"
              aria-label="Close calculator"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="px-3 py-2 rounded-xl bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#6F6F6F]">Active Ratio:</span>
            <span className="font-semibold text-[#1FAE5B]">
              1 {unitName} = {rate} {currencyCode}
            </span>
          </div>

          <div className="space-y-2.5">
            <div>
              <label className="text-[11px] font-medium text-[#6F6F6F] block mb-1">
                Points ({unitName})
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={pointsInput}
                onChange={(e) => handlePointsChange(e.target.value)}
                className="w-full px-3.5 py-2 rounded-full bg-white border border-[rgba(0,0,0,0.12)] text-xs font-mono text-[#191919] focus:border-[#317CFF] focus:outline-none"
                placeholder="0"
              />
            </div>

            <div className="flex items-center justify-center text-[#6F6F6F]">
              <ArrowLeftRight className="w-3.5 h-3.5 rotate-90" />
            </div>

            <div>
              <label className="text-[11px] font-medium text-[#6F6F6F] block mb-1">
                Equivalent ({currencyCode})
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={currencyInput}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="w-full px-3.5 py-2 rounded-full bg-white border border-[rgba(0,0,0,0.12)] text-xs font-mono text-[#191919] focus:border-[#317CFF] focus:outline-none"
                placeholder="0"
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 pt-1">
            {[1, 100, 1000, 10000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePointsChange(String(preset))}
                className="flex-1 py-1 rounded-full bg-[#F8F8F8] hover:bg-[#EEEEEE] border border-[rgba(0,0,0,0.08)] text-[10px] font-mono text-[#191919] transition-colors"
              >
                {preset.toLocaleString()}
              </button>
            ))}
          </div>

          {(showAdminLink || tenantSlug === 'atlas') && (
            <div className="pt-2 border-t border-[rgba(0,0,0,0.08)] flex justify-end">
              <Link
                href="/admin/point-valuation"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#317CFF] hover:underline"
              >
                <Settings2 className="w-3 h-3" />
                <span>Configure client ratio</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
