'use client';

import { useState } from 'react';
import { GitFork, ShieldCheck } from 'lucide-react';

export default function AdminBranchesPage() {
  const [branches] = useState([
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
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-[#191919] tracking-tight flex items-center gap-2.5">
          <GitFork className="w-6 h-6 text-[#317CFF]" />
          <span>Branch & scope governance</span>
        </h1>
        <p className="text-xs text-[#6F6F6F] mt-1">
          Operational tenant and partner data scoping per Document 06. Queries are constrained at the database layer.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-[rgba(0,0,0,0.08)] space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#191919]">Configured organizational scopes</h2>
          <span className="text-xs text-[#1FAE5B] font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Row-level scoping active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-[#F8F8F8] text-[#6F6F6F] border-b border-[rgba(0,0,0,0.08)]">
                <th className="p-3 font-medium">Branch scope ID</th>
                <th className="p-3 font-medium">Branch name</th>
                <th className="p-3 font-medium">Code</th>
                <th className="p-3 font-medium">Assigned manager</th>
                <th className="p-3 text-center font-medium">Staff count</th>
                <th className="p-3 text-center font-medium">Attributed players</th>
                <th className="p-3 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(0,0,0,0.06)]">
              {branches.map((b) => (
                <tr key={b.id} className="hover:bg-[#F8F8F8] transition-colors">
                  <td className="p-3 font-semibold text-[#191919]">{b.id}</td>
                  <td className="p-3 text-[#317CFF] font-medium">{b.name}</td>
                  <td className="p-3 text-[#6F6F6F]">{b.code}</td>
                  <td className="p-3 text-[#191919]">{b.managerId}</td>
                  <td className="p-3 text-center text-[#6F6F6F]">{b.assignedStaffCount}</td>
                  <td className="p-3 text-center text-[#191919] font-medium">{b.playerCount}</td>
                  <td className="p-3 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#1FAE5B]/10 text-[#1FAE5B]">
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
