import React, { useState } from 'react';
import { CourtZone, Match, Team } from '../types/volleyball';
import { Settings, RefreshCw, Upload, Download, Play, X, Trophy } from 'lucide-react';

interface MatchSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
  currentMatch: Match;
  onStartNewMatch: (
    title: string,
    tournament: string,
    location: string,
    homeTeam: Team,
    awayTeam: Team
  ) => void;
  onResetMatchToDemo: () => void;
  onImportMatch: (imported: Match) => void;
}

export const MatchSettingsModal: React.FC<MatchSettingsModalProps> = ({
  isOpen,
  onClose,
  teams,
  currentMatch,
  onStartNewMatch,
  onResetMatchToDemo,
  onImportMatch,
}) => {
  const [title, setTitle] = useState(currentMatch.title);
  const [tournament, setTournament] = useState(currentMatch.tournament);
  const [location, setLocation] = useState(currentMatch.location);
  const [homeTeamId, setHomeTeamId] = useState(currentMatch.homeTeam.id);
  const [awayTeamId, setAwayTeamId] = useState(currentMatch.awayTeam.id);

  if (!isOpen) return null;

  const handleStartMatch = (e: React.FormEvent) => {
    e.preventDefault();
    const homeTeam = teams.find(t => t.id === homeTeamId) || teams[0];
    const awayTeam = teams.find(t => t.id === awayTeamId) || teams[1] || teams[0];

    if (homeTeam.id === awayTeam.id) {
      alert('Seleziona due squadre distinte per la partita!');
      return;
    }

    onStartNewMatch(title, tournament, location, homeTeam, awayTeam);
    onClose();
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentMatch, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Match_Scout_${currentMatch.homeTeam.shortName}_vs_${currentMatch.awayTeam.shortName}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.id && parsed.homeTeam && parsed.awayTeam) {
          onImportMatch(parsed);
          onClose();
        } else {
          alert('File JSON non valido per VolleyScout.');
        }
      } catch (err) {
        alert('Errore nella lettura del file JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Configurazione Partita & Backup</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Chiudi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* New Match Form */}
          <form onSubmit={handleStartMatch} className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              1. Crea Nuova Gara Live
            </h4>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Titolo Incontro:
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs text-white"
                placeholder="es. Finale Campionato Nazionale"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Competizione:
                </label>
                <input
                  type="text"
                  value={tournament}
                  onChange={e => setTournament(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs text-white"
                  placeholder="Serie A / B / Under 19"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Palazzetto / Impianto:
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs text-white"
                  placeholder="PalaVolley"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Squadra di Casa:
                </label>
                <select
                  value={homeTeamId}
                  onChange={e => setHomeTeamId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                >
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Squadra Ospite:
                </label>
                <select
                  value={awayTeamId}
                  onChange={e => setAwayTeamId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                >
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg transition-colors shadow"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Inizia Questa Nuova Partita</span>
            </button>
          </form>

          {/* Quick Actions & Demo Reset */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              2. Carica Match Dimostrativo & Reset
            </h4>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onResetMatchToDemo();
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Ricarica Partita Dimostrativa (Perugia vs Trentino)</span>
              </button>
            </div>
          </div>

          {/* Backup Export / Import */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              3. Esportazione & Importazione File Match
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleExportJSON}
                className="flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Scarica Scout JSON</span>
              </button>

              <label className="flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Carica Scout JSON</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportFile}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
