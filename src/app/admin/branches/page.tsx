'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GitFork, Users, ShieldCheck, MapPin, Plus } from 'lucide-react';

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState([
    {
      id: 'br_london_central',
      name: 'London Central Operations',
      code: 'LON-01',
      status: 'ACTIVE',
      managerId: 'usr_mgr_london',
      assignedStaffCount: 8,
      playerCount: 185
    },
    {
      id: 'br_manchester_north',
      name: 'Manchester North Hub',
      code: 'MAN-02',
      status: 'ACTIVE',
      managerId: 'usr_mgr_manchester',
      assignedStaffCount: 5,
      playerCount: 120
    },
    {
      id: 'br_birmingham_west',
      name: 'Birmingham West Operations',
      code: 'BHX-03',
      status: 'ACTIVE',
      managerId: 'usr_mgr_birmingham',
      assignedStaffCount: 4,
      playerCount: 74
    }
  ]);

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <GitFork className="w-8 h-8 text-[#b45df0]" />
          <span>Branch & Scope Governance</span>
        </h1>
        <p className="text-xs text-[#c4bfd0] mt-1">
          Operational tenant and partner data scoping per Document 06. Queries are constrained at the database layer.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-[#242424] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Configured Organizational Scopes</h2>
          <span className="text-xs text-[#10b981] font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Row-Level Scoping Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-[#1f1f1f] text-[#c4bfd0] border-b border-white/10">
                <th className="p-3">Branch Scope ID</th>
                <th className="p-3">Branch Name</th>
                <th className="p-3">Code</th>
                <th className="p-3">Assigned Manager</th>
                <th className="p-3 text-center">Staff Count</th>
                <th className="p-3 text-center">Attributed Players</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {branches.map((b) => (
                <tr key={b.id} className="hover:bg-white/5">
                  <td className="p-3 font-bold text-white">{b.id}</td>
                  <td className="p-3 text-[#b45df0] font-semibold">{b.name}</td>
                  <td className="p-3 text-[#c4bfd0]">{b.code}</td>
                  <td className="p-3 text-white">{b.managerId}</td>
                  <td className="p-3 text-center text-[#c4bfd0]">{b.assignedStaffCount}</td>
                  <td className="p-3 text-center text-white font-bold">{b.playerCount}</td>
                  <td className="p-3 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10b981]/20 text-[#10b981]">
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
