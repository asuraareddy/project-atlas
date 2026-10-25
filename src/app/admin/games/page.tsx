'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Gamepad2, Play, Pause, AlertOctagon, CheckCircle2, RefreshCw, Dice5, Target, Layers } from 'lucide-react';

export default function AdminGamesPage() {
  const [games, setGames] = useState([
    {
      id: 'game_matka_main',
      name: 'Matka Draw Engine',
      category: 'Number Draw',
      status: 'LIVE',
      activeMarkets: 5,
      provider: 'Client Matka API (Core)',
      realMoneyEnabled: false
    },
    {
      id: 'game_carrom_pvp',
      name: 'Carrom Tabletop Arena',
      category: 'Multiplayer Skill',
      status: 'LIVE',
      activeMarkets: 3,
      provider: 'Carrom Realtime Engine',
      realMoneyEnabled: false
    },
    {
      id: 'game_ludo_circuit',
      name: 'Ludo Grand Circuit',
      category: 'Board Strategy',
      status: 'LIVE',
      activeMarkets: 3,
      provider: 'Ludo Matchmaker v1',
      realMoneyEnabled: false
    },
    {
      id: 'game_pool_8ball',
      name: '8-Ball Pool Pro',
      category: 'Cue Sports',
      status: 'LIVE',
      activeMarkets: 2,
      provider: 'Pool Provider Engine',
      realMoneyEnabled: false
    }
  ]);

  const [feedback, setFeedback] = useState<string | null>(null);

  const toggleStatus = (id: string) => {
    setGames((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status: g.status === 'LIVE' ? 'PAUSED' : 'LIVE' } : g))
    );
    setFeedback(`Game status updated for ${id}. Action logged.`);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-[#b45df0]" />
            <span>Game Operations & Provider Feeds</span>
          </h1>
          <p className="text-xs text-[#c4bfd0] mt-1">
            Catalogue configuration, provider health, market kill switches, and draw result approval.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-[#10b981]/20 border border-[#10b981]/40 text-xs text-[#10b981] font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Games Table */}
      <div className="p-6 rounded-2xl bg-[#242424] border border-white/10 space-y-4">
        <h2 className="text-lg font-bold text-white">Configured Game Modules</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-[#1f1f1f] text-[#c4bfd0] border-b border-white/10">
                <th className="p-3">Module ID</th>
                <th className="p-3">Display Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Provider Adapter</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Kill Switch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {games.map((g) => (
                <tr key={g.id} className="hover:bg-white/5">
                  <td className="p-3 font-bold text-white">{g.id}</td>
                  <td className="p-3 text-[#b45df0] font-semibold">{g.name}</td>
                  <td className="p-3 text-[#c4bfd0]">{g.category}</td>
                  <td className="p-3 text-[#9c9aa8]">{g.provider}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      g.status === 'LIVE' ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-[#ff5a7a]/20 text-[#ff5a7a]'
                    }`}>
                      {g.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => toggleStatus(g.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        g.status === 'LIVE'
                          ? 'bg-[#ff5a7a] hover:bg-[#ff5a7a]/90 text-white'
                          : 'bg-[#10b981] hover:bg-[#10b981]/90 text-white'
                      }`}
                    >
                      {g.status === 'LIVE' ? 'Pause Game' : 'Resume Game'}
                    </button>
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
