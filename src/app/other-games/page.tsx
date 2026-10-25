'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layers, CircleDot, Play, ShieldCheck, RefreshCw, CheckCircle2, Sparkles, Trophy } from 'lucide-react';
import { GameRoom } from '@/domain/games/adapters/types';

interface OtherGame {
  id: string;
  name: string;
  category: string;
  description: string;
  status: string;
}

export default function OtherGamesPage() {
  const [games, setGames] = useState<OtherGame[]>([]);
  const [poolRooms, setPoolRooms] = useState<GameRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchOtherGames = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/games/other');
      if (res.ok) {
        const json = await res.json();
        setGames(json.data.games);
        setPoolRooms(json.data.poolRooms);
      }
    } catch (err) {
      console.error('Failed to load other games:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOtherGames();
  }, []);

  const handleLaunch = (title: string) => {
    setActionMessage(`Session allocated for ${title}. Launching sandbox module...`);
    setTimeout(() => {
      setActionMessage(null);
    }, 3500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#c4bfd0] mb-1">
            <Link href="/" className="hover:text-white">Lobby</Link>
            <span>/</span>
            <span className="text-[#b45df0] font-semibold">Other Games</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Layers className="w-8 h-8 text-[#b45df0]" />
            <span>Other Games & Skill Lounge</span>
          </h1>
          <p className="text-xs text-[#c4bfd0] mt-1">
            Certified 8-Ball Pool, Snooker Blitz, and operator-approved skill tournaments with transparent rule engines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOtherGames}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#242424] border border-white/10 text-xs font-medium text-white hover:border-[#b45df0] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#b45df0] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Catalogue</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-[#10b981]/20 border border-[#10b981]/40 text-white flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#10b981] shrink-0" />
          <span className="text-xs font-semibold">{actionMessage}</span>
        </div>
      )}

      {/* Featured 8-Ball Pool Section */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#242424] via-[#2a2a2a] to-[#242424] border border-white/15 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7e0ac2] flex items-center justify-center text-white">
              <CircleDot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">8-Ball Pool Pro Championship</h2>
              <p className="text-xs text-[#c4bfd0]">PVP Realtime Ball Physics & Cue Trajectory</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 self-start sm:self-auto">
            Certified Pool Provider
          </span>
        </div>

        {/* Live Pool Tables */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {poolRooms.map((room) => (
            <div key={room.roomId} className="p-4 rounded-xl bg-[#1f1f1f] border border-white/10 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-white">{room.name}</p>
                <p className="text-xs text-[#c4bfd0]">Stake: £{(room.stakeMinor / 100).toFixed(2)} | Players: {room.currentPlayers}/{room.maxPlayers}</p>
              </div>
              <button
                disabled={room.status !== 'waiting'}
                onClick={() => handleLaunch(room.name)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  room.status === 'waiting'
                    ? 'bg-[#7e0ac2] hover:bg-[#9a13e6] text-white shadow-md'
                    : 'bg-white/5 text-[#6b6975] cursor-not-allowed'
                }`}
              >
                {room.status === 'waiting' ? 'Enter Match' : 'Full'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Extensible Games Catalog */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Available Titles Under Other Games</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {games.map((game) => (
            <div
              key={game.id}
              className="card-dark p-6 bg-[#242424] border border-white/10 hover:border-[#b45df0]/50 rounded-xl space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#1f1f1f] text-[#b45df0] border border-white/10">
                    {game.category}
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    game.status === 'available'
                      ? 'bg-[#10b981]/20 text-[#10b981]'
                      : 'bg-[#ff5a7a]/20 text-[#ff5a7a]'
                  }`}>
                    {game.status === 'available' ? 'Available' : 'Maintenance'}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white">{game.name}</h3>
                <p className="text-xs text-[#c4bfd0] leading-relaxed mt-2">{game.description}</p>
              </div>

              <div>
                <button
                  disabled={game.status !== 'available'}
                  onClick={() => handleLaunch(game.name)}
                  className={`w-full py-2.5 rounded-full text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    game.status === 'available'
                      ? 'bg-[#7e0ac2] hover:bg-[#9a13e6] text-white shadow-md shadow-[#7e0ac2]/30'
                      : 'bg-white/5 text-[#6b6975] cursor-not-allowed'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{game.status === 'available' ? 'Launch Game' : 'Under Review'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
