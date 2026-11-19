'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Layers,
  CircleDot,
  Play,
  RefreshCw,
  CheckCircle2,
  Flame,
  Target,
  Gamepad2,
  Users,
} from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'pool' | 'carrom' | 'ludo'>('pool');
  const [poolRooms, setPoolRooms] = useState<GameRoom[]>([]);
  const [carromRooms, setCarromRooms] = useState<GameRoom[]>([]);
  const [ludoRooms, setLudoRooms] = useState<GameRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchOtherGames = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/games/other');
      if (res.ok) {
        const json = await res.json();
        setGames(json.data.games || []);
        setPoolRooms(json.data.poolRooms || []);
        setCarromRooms(json.data.carromRooms || []);
        setLudoRooms(json.data.ludoRooms || []);
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

  const currentRooms =
    activeTab === 'pool'
      ? poolRooms
      : activeTab === 'carrom'
      ? carromRooms
      : ludoRooms;

  const currentRoute =
    activeTab === 'pool' ? '/pool' : activeTab === 'carrom' ? '/carrom' : '/ludo';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 bg-[#F8F8F8] text-[#191919]">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs mb-1 text-[#6F6F6F]">
            <Link href="/" className="hover:text-[#191919]">
              Lobby
            </Link>
            <span>/</span>
            <span className="text-[#317CFF] font-medium">Other Games</span>
          </div>
          <h1 className="text-3xl font-normal tracking-tight flex items-center gap-3 text-[#191919]">
            <Layers className="w-7 h-7 text-[#191919]" />
            <span>Other Games & Skill Lounge</span>
          </h1>
          <p className="text-xs mt-1 text-[#6F6F6F] font-normal">
            Certified 8-Ball Pool Pro, Carrom Tabletop, Ludo Grand Circuit, and Ace2Three Indian Rummy with server-verified rule engines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOtherGames}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(0,0,0,0.08)] bg-white text-xs font-normal text-[#191919] hover:bg-[#F8F8F8] shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#317CFF] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh catalogue</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-[10px] bg-[#1FAE5B]/10 border border-[#1FAE5B]/20 text-[#1FAE5B] flex items-center gap-3 animate-fade-in text-xs font-normal">
          <CheckCircle2 className="w-5 h-5 text-[#1FAE5B] shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Featured Live Matchmaking Lounge (Pool, Carrom & Ludo) */}
      <div className="p-6 rounded-[10px] border border-[rgba(0,0,0,0.08)] space-y-5 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-[rgba(0,0,0,0.06)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-normal uppercase tracking-wider text-[#317CFF] bg-[#317CFF]/10 px-2 py-0.5 rounded-full">
                Live Matchmaking Lounge
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1FAE5B]/10 text-[#1FAE5B] font-normal border border-[#1FAE5B]/20">
                Active Tables
              </span>
            </div>
            <h2 className="text-xl font-normal text-[#191919]">
              Skill & Tabletop Championships
            </h2>
          </div>

          {/* Table Category Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)]">
            <button
              onClick={() => setActiveTab('pool')}
              className={`flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-normal transition-all ${
                activeTab === 'pool'
                  ? 'bg-[#191919] text-white shadow-sm'
                  : 'text-[#6F6F6F] hover:text-[#191919]'
              }`}
            >
              <CircleDot className="w-3.5 h-3.5" />
              <span>8-Ball Pool</span>
            </button>

            <button
              onClick={() => setActiveTab('carrom')}
              className={`flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-normal transition-all ${
                activeTab === 'carrom'
                  ? 'bg-[#191919] text-white shadow-sm'
                  : 'text-[#6F6F6F] hover:text-[#191919]'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Carrom</span>
            </button>

            <button
              onClick={() => setActiveTab('ludo')}
              className={`flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-normal transition-all ${
                activeTab === 'ludo'
                  ? 'bg-[#191919] text-white shadow-sm'
                  : 'text-[#6F6F6F] hover:text-[#191919]'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Ludo</span>
            </button>
          </div>
        </div>

        {/* Live Tables Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {currentRooms.map((room) => (
            <div
              key={room.roomId}
              className="p-4 rounded-[10px] border border-[rgba(0,0,0,0.06)] bg-[#F8F8F8] flex items-center justify-between transition-all"
            >
              <div>
                <p className="font-medium text-sm text-[#191919]">{room.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-mono text-[#6F6F6F]">
                    Stake: {(room.stakeMinor / 100).toFixed(2)} {room.currency}
                  </span>
                  <span className="text-[10px] text-[#B8B8B8]">•</span>
                  <span className="text-[11px] text-[#317CFF] font-normal flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{room.currentPlayers}/{room.maxPlayers}</span>
                  </span>
                </div>
              </div>

              {room.status === 'waiting' ? (
                <Link
                  href={currentRoute}
                  className="px-4 py-1.5 rounded-full text-xs font-normal text-white bg-[#191919] hover:bg-[#333333] shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Enter match</span>
                </Link>
              ) : (
                <button
                  disabled
                  className="px-4 py-1.5 rounded-full text-xs font-normal bg-[#F8F8F8] text-[#6F6F6F] cursor-not-allowed border border-[rgba(0,0,0,0.08)]"
                >
                  In progress
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Available Titles Catalogue */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-normal text-[#191919]">
            All Titles Under Other Games
          </h2>
          <p className="text-xs text-[#6F6F6F] mt-0.5 font-normal">
            Select any game title to enter the tournament lounge or launch local practice mode.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <div
              key={game.id}
              className="p-6 rounded-[10px] space-y-4 flex flex-col justify-between border border-[rgba(0,0,0,0.08)] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all hover:border-[rgba(0,0,0,0.16)] text-[#191919]"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-normal uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F8F8F8] text-[#6F6F6F] border border-[rgba(0,0,0,0.08)]">
                    {game.category}
                  </span>
                  <span className="text-[11px] font-normal px-2.5 py-0.5 rounded-full bg-[#1FAE5B]/10 text-[#1FAE5B]">
                    {game.status === 'available' ? 'Available' : 'Maintenance'}
                  </span>
                </div>

                {/* Game specific branding headers */}
                {game.id === 'game_ace2three' && (
                  <div className="relative w-full h-24 mb-3 rounded-[10px] overflow-hidden bg-[#F8F8F8] border border-[rgba(0,0,0,0.08)] flex items-center justify-center p-3">
                    <div className="relative w-36 h-12">
                      <Image
                        src="/games/ace2three/ui/a23_logo2.png"
                        alt="Ace2Three Logo"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                )}

                <h3 className="text-base font-medium flex items-center gap-2 text-[#191919]">
                  {game.id === 'game_ace2three' && <Flame className="w-4 h-4 text-[#317CFF] shrink-0" />}
                  {game.id === 'game_pool_8ball' && <CircleDot className="w-4 h-4 text-[#317CFF] shrink-0" />}
                  {game.id === 'game_carrom' && <Target className="w-4 h-4 text-[#317CFF] shrink-0" />}
                  {game.id === 'game_ludo' && <Gamepad2 className="w-4 h-4 text-[#317CFF] shrink-0" />}
                  <span>{game.name}</span>
                </h3>

                <p className="text-xs leading-relaxed mt-2 text-[#6F6F6F] font-normal">
                  {game.description}
                </p>
              </div>

              <div>
                {game.id === 'game_pool_8ball' ? (
                  <Link
                    href="/pool"
                    className="w-full py-2.5 rounded-full text-xs font-normal flex items-center justify-center gap-2 bg-[#191919] hover:bg-[#333333] text-white shadow-sm transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Play 8-Ball Pool Pro</span>
                  </Link>
                ) : game.id === 'game_carrom' ? (
                  <Link
                    href="/carrom"
                    className="w-full py-2.5 rounded-full text-xs font-normal flex items-center justify-center gap-2 bg-[#191919] hover:bg-[#333333] text-white shadow-sm transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Play Carrom Tabletop</span>
                  </Link>
                ) : game.id === 'game_ludo' ? (
                  <Link
                    href="/ludo"
                    className="w-full py-2.5 rounded-full text-xs font-normal flex items-center justify-center gap-2 bg-[#191919] hover:bg-[#333333] text-white shadow-sm transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Play Ludo Grand Circuit</span>
                  </Link>
                ) : game.id === 'game_ace2three' ? (
                  <Link
                    href="/ace2three"
                    className="w-full py-2.5 rounded-full text-xs font-normal flex items-center justify-center gap-2 bg-[#191919] hover:bg-[#333333] text-white shadow-sm transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Play Ace2Three Rummy</span>
                  </Link>
                ) : (
                  <button
                    disabled={game.status !== 'available'}
                    onClick={() => handleLaunch(game.name)}
                    className="w-full py-2.5 rounded-full text-xs font-normal flex items-center justify-center gap-2 bg-[#191919] hover:bg-[#333333] text-white shadow-sm transition-all"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Launch Game</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
