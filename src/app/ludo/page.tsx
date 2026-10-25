'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Gamepad2, Users, Trophy, Play, ShieldCheck, RefreshCw, CheckCircle2, Dice6 } from 'lucide-react';
import { GameRoom } from '@/domain/games/adapters/types';

export default function LudoPage() {
  const [rooms, setRooms] = useState<GameRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinedSession, setJoinedSession] = useState<string | null>(null);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/games/ludo/rooms');
      if (res.ok) {
        const json = await res.json();
        setRooms(json.data.rooms);
      }
    } catch (err) {
      console.error('Failed to load Ludo rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleJoin = (room: GameRoom) => {
    setJoinedSession(`Matched into ${room.name}! Game board initializing...`);
    setTimeout(() => {
      setJoinedSession(null);
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
            <span className="text-[#b45df0] font-semibold">Ludo Board</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-[#b45df0]" />
            <span>Ludo Grand Circuit</span>
          </h1>
          <p className="text-xs text-[#c4bfd0] mt-1">
            2-4 Player board races with cryptographic randomness and anti-collusion surveillance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchRooms}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#242424] border border-white/10 text-xs font-medium text-white hover:border-[#b45df0] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#b45df0] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Rooms</span>
          </button>
        </div>
      </div>

      {joinedSession && (
        <div className="p-4 rounded-xl bg-[#10b981]/20 border border-[#10b981]/40 text-white flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#10b981] shrink-0" />
          <span className="text-xs font-semibold">{joinedSession}</span>
        </div>
      )}

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#242424] border border-white/10 space-y-1">
          <span className="text-[11px] text-[#c4bfd0] uppercase tracking-wider block">Dice Fairness</span>
          <p className="text-sm font-bold text-white flex items-center gap-2">
            <Dice6 className="w-4 h-4 text-[#10b981]" /> CSPRNG Cryptographic Dice
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[#242424] border border-white/10 space-y-1">
          <span className="text-[11px] text-[#c4bfd0] uppercase tracking-wider block">Matchmaking</span>
          <p className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-[#b45df0]" /> 1v1 Quick & 4-Player Circuit
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[#242424] border border-white/10 space-y-1">
          <span className="text-[11px] text-[#c4bfd0] uppercase tracking-wider block">Integrity</span>
          <p className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#10b981]" /> Collusion & Bot Detection
          </p>
        </div>
      </div>

      {/* Live Ludo Rooms */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Active Match Circuits</h2>
          <span className="text-xs text-[#c4bfd0]">{rooms.length} Open Boards</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div
              key={room.roomId}
              className="card-dark p-6 bg-[#242424] border border-white/10 hover:border-[#b45df0]/50 rounded-xl space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded bg-[#7e0ac2]/20 text-[#b45df0] border border-[#7e0ac2]/40">
                    {room.mode}
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    room.status === 'waiting'
                      ? 'bg-[#10b981]/20 text-[#10b981]'
                      : 'bg-[#f59e0b]/20 text-[#f59e0b]'
                  }`}>
                    {room.status === 'waiting' ? 'Seat Open' : 'In Progress'}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white">{room.name}</h3>

                <div className="mt-4 p-3 bg-[#1f1f1f] rounded-lg border border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between text-[#c4bfd0]">
                    <span>Participation Stake:</span>
                    <span className="font-bold text-white">£{(room.stakeMinor / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#c4bfd0]">
                    <span>Players Queued:</span>
                    <span className="font-bold text-white flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#b45df0]" />
                      {room.currentPlayers} / {room.maxPlayers}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <button
                  disabled={room.status !== 'waiting'}
                  onClick={() => handleJoin(room)}
                  className={`w-full py-2.5 rounded-full text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    room.status === 'waiting'
                      ? 'bg-[#7e0ac2] hover:bg-[#9a13e6] text-white shadow-md shadow-[#7e0ac2]/30'
                      : 'bg-white/5 text-[#6b6975] cursor-not-allowed'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{room.status === 'waiting' ? 'Enter Match' : 'Full'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
