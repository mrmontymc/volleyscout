import React, { useState } from 'react';
import { Player, PlayerRole, Team } from '../types/volleyball';
import {
  Users,
  Plus,
  Shield,
  Trash2,
  Edit2,
  Check,
  X,
  UserCheck,
  Star
} from 'lucide-react';

interface TeamsManagementProps {
  teams: Team[];
  onUpdateTeam: (team: Team) => void;
  onAddTeam: (team: Team) => void;
  onDeleteTeam: (teamId: string) => void;
}

const ROLES: PlayerRole[] = ['Palleggiatore', 'Schiacciatore', 'Centrale', 'Opposto', 'Libero'];

export const TeamsManagement: React.FC<TeamsManagementProps> = ({
  teams,
  onUpdateTeam,
  onAddTeam,
  onDeleteTeam,
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || '');
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);

  // New Team Form State
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamShort, setNewTeamShort] = useState('');
  const [newTeamCoach, setNewTeamCoach] = useState('');
  const [newTeamColor, setNewTeamColor] = useState('#DC2626');

  // New Player Form State
  const [newPlayerNumber, setNewPlayerNumber] = useState<number>(1);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerRole, setNewPlayerRole] = useState<PlayerRole>('Schiacciatore');
  const [newPlayerHeight, setNewPlayerHeight] = useState<number>(195);
  const [newPlayerHand, setNewPlayerHand] = useState<'Destro' | 'Mancino'>('Destro');
  const [newPlayerCaptain, setNewPlayerCaptain] = useState(false);

  const activeTeam = teams.find(t => t.id === selectedTeamId) || teams[0];

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName) return;

    const newTeam: Team = {
      id: `team_${Date.now()}`,
      name: newTeamName,
      shortName: newTeamShort.toUpperCase() || newTeamName.slice(0, 3).toUpperCase(),
      coach: newTeamCoach || 'Allenatore',
      primaryColor: newTeamColor,
      secondaryColor: '#FFFFFF',
      players: [
        { id: `p_${Date.now()}_1`, number: 1, name: 'Palleggiatore 1', role: 'Palleggiatore', isStarter: true },
        { id: `p_${Date.now()}_2`, number: 2, name: 'Schiacciatore 1', role: 'Schiacciatore', isStarter: true },
        { id: `p_${Date.now()}_3`, number: 3, name: 'Centrale 1', role: 'Centrale', isStarter: true },
        { id: `p_${Date.now()}_4`, number: 4, name: 'Opposto 1', role: 'Opposto', isStarter: true },
        { id: `p_${Date.now()}_5`, number: 5, name: 'Schiacciatore 2', role: 'Schiacciatore', isStarter: true },
        { id: `p_${Date.now()}_6`, number: 6, name: 'Centrale 2', role: 'Centrale', isStarter: true },
        { id: `p_${Date.now()}_7`, number: 7, name: 'Libero 1', role: 'Libero', isLibero: true, isStarter: true },
      ],
    };

    onAddTeam(newTeam);
    setSelectedTeamId(newTeam.id);
    setNewTeamName('');
    setNewTeamShort('');
    setNewTeamCoach('');
    setIsAddingTeam(false);
  };

  const handleCreatePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName || !activeTeam) return;

    const newPlayer: Player = {
      id: `p_${Date.now()}`,
      number: Number(newPlayerNumber),
      name: newPlayerName,
      role: newPlayerRole,
      isCaptain: newPlayerCaptain,
      isLibero: newPlayerRole === 'Libero',
      isStarter: false,
      heightCm: Number(newPlayerHeight),
      dominantHand: newPlayerHand,
    };

    const updatedPlayers = [...activeTeam.players, newPlayer];
    onUpdateTeam({ ...activeTeam, players: updatedPlayers });

    setNewPlayerName('');
    setNewPlayerNumber(prev => prev + 1);
    setNewPlayerCaptain(false);
    setIsAddingPlayer(false);
  };

  const handleDeletePlayer = (playerId: string) => {
    if (!activeTeam) return;
    if (activeTeam.players.length <= 6) {
      alert('Una squadra deve avere almeno 6 giocatori a referto!');
      return;
    }
    const updatedPlayers = activeTeam.players.filter(p => p.id !== playerId);
    onUpdateTeam({ ...activeTeam, players: updatedPlayers });
  };

  const toggleStarter = (playerId: string) => {
    if (!activeTeam) return;
    const updatedPlayers = activeTeam.players.map(p =>
      p.id === playerId ? { ...p, isStarter: !p.isStarter } : p
    );
    onUpdateTeam({ ...activeTeam, players: updatedPlayers });
  };

  return (
    <div className="space-y-6">
      {/* Header and Team Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <span>Gestione Squadre e Roster Atleti</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Configura i club, i ruoli dei giocatori (P, S, C, O, L), i capitani e i numeri di maglia per lo scouting.
            </p>
          </div>

          <button
            onClick={() => setIsAddingTeam(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg transition-colors shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Nuova Squadra</span>
          </button>
        </div>

        {/* Teams List Cards */}
        <div className="flex flex-wrap items-center gap-2">
          {teams.map(t => {
            const isSel = t.id === activeTeam?.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTeamId(t.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-bold transition-all ${
                  isSel
                    ? 'bg-slate-800 border-cyan-400 text-white ring-2 ring-cyan-400/40'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: t.primaryColor }}
                />
                <span>{t.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">({t.players.length} gioc.)</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Team Roster Details */}
      {activeTeam && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-white text-base shadow"
                style={{ backgroundColor: activeTeam.primaryColor }}
              >
                {activeTeam.shortName}
              </div>
              <div>
                <h4 className="text-base font-extrabold text-white">{activeTeam.name}</h4>
                <div className="text-xs text-slate-400">
                  Allenatore: <strong className="text-slate-300">{activeTeam.coach}</strong>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsAddingPlayer(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold rounded-lg transition-colors border border-slate-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Aggiungi Giocatore</span>
            </button>
          </div>

          {/* Players Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Nome e Cognome</th>
                  <th className="py-2.5 px-3">Ruolo</th>
                  <th className="py-2.5 px-3 text-center">Altezza</th>
                  <th className="py-2.5 px-3 text-center">Mano</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {activeTeam.players.map(p => (
                  <tr key={p.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-bold font-mono text-white">#{p.number}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-200">
                      <div className="flex items-center gap-2">
                        <span>{p.name}</span>
                        {p.isCaptain && (
                          <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800 px-1.5 py-0.2 rounded">
                            <Star className="w-2.5 h-2.5 fill-current" /> Cap.
                          </span>
                        )}
                        {p.isLibero && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.2 rounded">
                            Libero
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 font-medium">{p.role}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-400">{p.heightCm ? `${p.heightCm} cm` : '-'}</td>
                    <td className="py-2.5 px-3 text-center text-slate-400">{p.dominantHand || 'Destro'}</td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => toggleStarter(p.id)}
                        className={`text-[11px] px-2 py-0.5 rounded font-semibold transition-colors ${
                          p.isStarter
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {p.isStarter ? 'Titolare' : 'Riserva'}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleDeletePlayer(p.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors"
                        title="Elimina giocatore"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add Team */}
      {isAddingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <form
            onSubmit={handleCreateTeam}
            className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-xl p-5 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-cyan-400" />
              <span>Crea Nuova Squadra</span>
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nome Squadra (es. Modena Volley):
              </label>
              <input
                type="text"
                required
                value={newTeamName}
                onChange={e => setNewTeamName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Sigla (2-4 lettere):
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={newTeamShort}
                  onChange={e => setNewTeamShort(e.target.value)}
                  placeholder="MOD"
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs text-white uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Colore Sociale:
                </label>
                <input
                  type="color"
                  value={newTeamColor}
                  onChange={e => setNewTeamColor(e.target.value)}
                  className="w-full h-8 bg-slate-800 border border-slate-700 rounded p-1 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nome Allenatore (Coach):
              </label>
              <input
                type="text"
                value={newTeamCoach}
                onChange={e => setNewTeamCoach(e.target.value)}
                placeholder="es. Andrea Giani"
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddingTeam(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded transition-colors"
              >
                Crea Squadra
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Add Player */}
      {isAddingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <form
            onSubmit={handleCreatePlayer}
            className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-xl p-5 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-cyan-400" />
              <span>Aggiungi Giocatore a {activeTeam?.name}</span>
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Numero Maglia:
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={99}
                  value={newPlayerNumber}
                  onChange={e => setNewPlayerNumber(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nome e Cognome:
                </label>
                <input
                  type="text"
                  required
                  value={newPlayerName}
                  onChange={e => setNewPlayerName(e.target.value)}
                  placeholder="es. Yuri Romanò"
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Ruolo Tecnico:
                </label>
                <select
                  value={newPlayerRole}
                  onChange={e => setNewPlayerRole(e.target.value as PlayerRole)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                >
                  {ROLES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Altezza (cm):
                </label>
                <input
                  type="number"
                  min={160}
                  max={225}
                  value={newPlayerHeight}
                  onChange={e => setNewPlayerHeight(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={newPlayerCaptain}
                  onChange={e => setNewPlayerCaptain(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-600 focus:ring-0"
                />
                <span>Capitano della Squadra</span>
              </label>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Mano:</span>
                <select
                  value={newPlayerHand}
                  onChange={e => setNewPlayerHand(e.target.value as any)}
                  className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                >
                  <option value="Destro">Destro</option>
                  <option value="Mancino">Mancino</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddingPlayer(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded transition-colors"
              >
                Salva Giocatore
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
