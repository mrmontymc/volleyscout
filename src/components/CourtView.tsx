import React from 'react';
import { CourtZone, Player, Team } from '../types/volleyball';
import { RotateCw, ArrowLeftRight, Volleyball } from 'lucide-react';

interface CourtViewProps {
  homeTeam: Team;
  awayTeam: Team;
  homeLineup: Record<CourtZone, string>;
  awayLineup: Record<CourtZone, string>;
  servingTeamId: string;
  homeRotation: number;
  awayRotation: number;
  selectedPlayerId?: string;
  onSelectPlayer: (player: Player, team: Team) => void;
  onRotateHome: () => void;
  onRotateAway: () => void;
  onOpenSubstitution: (team: Team, zone: CourtZone) => void;
  homeLiberoId?: string;
  awayLiberoId?: string;
}

// Coordinate layout on a half-court (viewed from above):
// Front row (near net): Pos 4 (left), Pos 3 (center), Pos 2 (right)
// Back row: Pos 5 (left), Pos 6 (center), Pos 1 (right)
const ZONE_POSITIONS: Record<CourtZone, { x: string; y: string; label: string }> = {
  4: { x: '18%', y: '28%', label: 'P4 (Banda Sinistra)' },
  3: { x: '50%', y: '25%', label: 'P3 (Centro)' },
  2: { x: '82%', y: '28%', label: 'P2 (Opposto/Banda Dx)' },
  5: { x: '20%', y: '75%', label: 'P5 (Difesa Sinistra)' },
  6: { x: '50%', y: '78%', label: 'P6 (Difesa Centro/Pipe)' },
  1: { x: '80%', y: '75%', label: 'P1 (Battuta/Difesa Dx)' },
};

export const CourtView: React.FC<CourtViewProps> = ({
  homeTeam,
  awayTeam,
  homeLineup,
  awayLineup,
  servingTeamId,
  homeRotation,
  awayRotation,
  selectedPlayerId,
  onSelectPlayer,
  onRotateHome,
  onRotateAway,
  onOpenSubstitution,
}) => {
  const [activeTabSide, setActiveTabSide] = React.useState<'both' | 'home' | 'away'>('both');

  const renderHalfCourt = (
    team: Team,
    lineup: Record<CourtZone, string>,
    rotation: number,
    isHome: boolean,
    onRotate: () => void
  ) => {
    const isServing = servingTeamId === team.id;

    return (
      <div className="flex-1 flex flex-col">
        {/* Team Bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 text-white">
          <div className="flex items-center gap-2">
            <span
              className="w-3.5 h-3.5 rounded-full inline-block border border-white/30"
              style={{ backgroundColor: team.primaryColor }}
            />
            <span className="font-bold text-sm tracking-wide">{team.name}</span>
            <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-mono">
              Rot. P{rotation}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isServing && (
              <span className="flex items-center gap-1 text-xs text-amber-400 font-semibold bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded-full animate-pulse">
                <Volleyball className="w-3 h-3" />
                Al servizio (Z1)
              </span>
            )}
            <button
              onClick={onRotate}
              className="flex items-center gap-1 text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded transition-colors"
              title="Ruota squadra in senso orario"
              aria-label={`Ruota rotazione ${team.name}`}
            >
              <RotateCw className="w-3 h-3 text-cyan-400" />
              <span>Ruota</span>
            </button>
          </div>
        </div>

        {/* Volleyball Half-Court Canvas */}
        <div className="relative aspect-[9/9] sm:aspect-[4/3] bg-gradient-to-b from-amber-800/20 via-amber-900/10 to-amber-950/20 p-3 select-none overflow-hidden border border-slate-700">
          {/* Taraflex / Wood Court markings */}
          <div className="absolute inset-2 border-2 border-orange-400/80 bg-orange-950/30 rounded-sm">
            {/* Net / Antenna bar at top */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-white to-red-600 border-b-2 border-slate-300 shadow-sm flex items-center justify-center">
              <span className="text-[9px] uppercase tracking-widest text-slate-900 font-bold px-2 bg-white/90 rounded">
                RETE / NET
              </span>
            </div>

            {/* 3m Attack Line */}
            <div className="absolute top-[38%] left-0 right-0 border-b-2 border-dashed border-orange-400/80 flex items-center justify-end px-2">
              <span className="text-[10px] text-orange-300/80 font-mono tracking-wider">
                Linea 3m (Attacco)
              </span>
            </div>

            {/* Subtle Center Guide */}
            <div className="absolute top-0 bottom-0 left-1/2 border-l border-orange-500/15" />

            {/* Zone Markers & Players */}
            {([4, 3, 2, 5, 6, 1] as CourtZone[]).map((zone) => {
              const playerId = lineup[zone];
              const player = team.players.find((p) => p.id === playerId);
              const pos = ZONE_POSITIONS[zone];
              const isSelected = player && selectedPlayerId === player.id;
              const isZoneServer = zone === 1 && isServing;

              return (
                <div
                  key={zone}
                  style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)' }}
                  className="absolute flex flex-col items-center group cursor-pointer"
                >
                  {/* Zone Watermark */}
                  <span className="text-[11px] font-bold text-orange-400/30 tracking-widest mb-0.5">
                    Z{zone}
                  </span>

                  {/* Player Token */}
                  {player ? (
                    <button
                      type="button"
                      onClick={() => onSelectPlayer(player, team)}
                      className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex flex-col items-center justify-center font-bold transition-all shadow-md active:scale-95 ${
                        isSelected
                          ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-slate-900 scale-105 z-20'
                          : 'hover:scale-105 hover:ring-2 hover:ring-white/60'
                      }`}
                      style={{
                        backgroundColor: player.isLibero ? '#10B981' : team.primaryColor,
                        color: '#FFFFFF',
                      }}
                      title={`${player.number} - ${player.name} (${player.role})`}
                      aria-label={`Giocatore ${player.number} ${player.name}`}
                    >
                      {/* Server ball badge */}
                      {isZoneServer && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-400 text-slate-900 rounded-full flex items-center justify-center shadow">
                          <Volleyball className="w-3.5 h-3.5" />
                        </div>
                      )}

                      {/* Jersey Number */}
                      <span className="text-base sm:text-lg leading-none font-extrabold drop-shadow">
                        #{player.number}
                      </span>
                      {/* Role Abbreviation */}
                      <span className="text-[9px] uppercase tracking-tighter opacity-90">
                        {player.isLibero ? 'LIB' : player.role.slice(0, 3)}
                      </span>
                    </button>
                  ) : (
                    <div className="w-12 h-12 rounded-full border border-dashed border-slate-600 flex items-center justify-center text-xs text-slate-500">
                      Vuoto
                    </div>
                  )}

                  {/* Player Name and Quick Sub Button */}
                  {player && (
                    <div className="mt-1 flex items-center gap-1 bg-slate-900/80 backdrop-blur-xs px-1.5 py-0.5 rounded border border-slate-800 text-[11px] max-w-[110px] truncate text-center">
                      <span className="text-slate-200 truncate">{player.name.split(' ').pop()}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenSubstitution(team, zone);
                        }}
                        className="text-slate-400 hover:text-cyan-400 p-0.5 rounded hover:bg-slate-800"
                        title="Sostituisci questo giocatore"
                        aria-label={`Sostituisci ${player.name} in zona ${zone}`}
                      >
                        <ArrowLeftRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
      {/* Mobile switcher for side */}
      <div className="sm:hidden flex border-b border-slate-800 bg-slate-950 p-1 gap-1">
        <button
          onClick={() => setActiveTabSide('both')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded ${
            activeTabSide === 'both' ? 'bg-cyan-600 text-white' : 'text-slate-400'
          }`}
        >
          Entrambi i campi
        </button>
        <button
          onClick={() => setActiveTabSide('home')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded ${
            activeTabSide === 'home' ? 'bg-red-600 text-white' : 'text-slate-400'
          }`}
        >
          {homeTeam.shortName}
        </button>
        <button
          onClick={() => setActiveTabSide('away')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded ${
            activeTabSide === 'away' ? 'bg-sky-600 text-white' : 'text-slate-400'
          }`}
        >
          {awayTeam.shortName}
        </button>
      </div>

      {/* Courts Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        {(activeTabSide === 'both' || activeTabSide === 'home') &&
          renderHalfCourt(homeTeam, homeLineup, homeRotation, true, onRotateHome)}
        {(activeTabSide === 'both' || activeTabSide === 'away') &&
          renderHalfCourt(awayTeam, awayLineup, awayRotation, false, onRotateAway)}
      </div>
    </div>
  );
};
