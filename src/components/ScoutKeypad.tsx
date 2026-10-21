import React, { useState } from 'react';
import {
  CourtZone,
  FundamentalAction,
  FundamentalType,
  Player,
  QualityCode,
  TacticalScheme,
  Team
} from '../types/volleyball';
import {
  Zap,
  Undo2,
  CheckCircle2,
  Activity,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface ScoutKeypadProps {
  homeTeam: Team;
  awayTeam: Team;
  selectedPlayer?: Player;
  selectedTeam?: Team;
  tacticalSchemes: TacticalScheme[];
  activeSchemeId?: string;
  onSelectScheme: (schemeId: string) => void;
  onAddAction: (action: Omit<FundamentalAction, 'id' | 'timestamp'>) => void;
  onAwardPoint: (winner: 'home' | 'away', pointType: 'sideout' | 'break' | 'ace' | 'block' | 'attack' | 'opponent_error', reason?: string) => void;
  onUndoLastAction: () => void;
  currentRallyActions: FundamentalAction[];
  canUndo: boolean;
  onSelectPlayer: (player: Player, team: Team) => void;
  homeLineup: Record<CourtZone, string>;
  awayLineup: Record<CourtZone, string>;
  homeLiberoId?: string;
  awayLiberoId?: string;
}

interface FundamentalOption {
  type: FundamentalType;
  label: string;
  qualities: {
    code: QualityCode;
    symbol: string;
    label: string;
    color: string;
    isPoint?: boolean;
    isError?: boolean;
  }[];
}

const FUNDAMENTALS_CONFIG: FundamentalOption[] = [
  {
    type: 'battuta',
    label: 'Battuta',
    qualities: [
      { code: 'ace', symbol: '#', label: 'Ace (Punto)', color: 'bg-emerald-600 hover:bg-emerald-500 text-white', isPoint: true },
      { code: 'positiva', symbol: '+', label: 'Positiva (Stacca ricez.)', color: 'bg-teal-700 hover:bg-teal-600 text-white' },
      { code: 'continua', symbol: '/', label: 'In gioco (Neutra)', color: 'bg-slate-700 hover:bg-slate-600 text-slate-100' },
      { code: 'errore', symbol: '=', label: 'Errore Rete/Fuori', color: 'bg-rose-700 hover:bg-rose-600 text-white', isError: true },
    ]
  },
  {
    type: 'ricezione',
    label: 'Ricezione',
    qualities: [
      { code: 'doppio_piu', symbol: '##', label: 'Perfetta (#)', color: 'bg-emerald-700 hover:bg-emerald-600 text-white' },
      { code: 'positiva', symbol: '+', label: 'Positiva (+)', color: 'bg-teal-700 hover:bg-teal-600 text-white' },
      { code: 'negativa', symbol: '-', label: 'Negativa (-)', color: 'bg-amber-700 hover:bg-amber-600 text-white' },
      { code: 'slash', symbol: '!', label: 'Slash a filo (!)', color: 'bg-orange-700 hover:bg-orange-600 text-white' },
      { code: 'errore', symbol: '=', label: 'Ace subito / Errore', color: 'bg-rose-700 hover:bg-rose-600 text-white', isError: true },
    ]
  },
  {
    type: 'alzata',
    label: 'Alzata',
    qualities: [
      { code: 'doppio_piu', symbol: '#', label: 'Perfetta (#)', color: 'bg-emerald-700 hover:bg-emerald-600 text-white' },
      { code: 'positiva', symbol: '+', label: 'Positiva (+)', color: 'bg-teal-700 hover:bg-teal-600 text-white' },
      { code: 'negativa', symbol: '-', label: 'Imprecisa (-)', color: 'bg-amber-700 hover:bg-amber-600 text-white' },
      { code: 'errore', symbol: '=', label: 'Doppio tocco / Errore', color: 'bg-rose-700 hover:bg-rose-600 text-white', isError: true },
    ]
  },
  {
    type: 'attacco',
    label: 'Attacco',
    qualities: [
      { code: 'punto', symbol: '#', label: 'Punto Diretto (#)', color: 'bg-emerald-600 hover:bg-emerald-500 text-white', isPoint: true },
      { code: 'mani_fuori', symbol: '#', label: 'Mani Fuori (#)', color: 'bg-emerald-600 hover:bg-emerald-500 text-white', isPoint: true },
      { code: 'positiva', symbol: '!', label: 'Positivo / Ricostruz.', color: 'bg-teal-700 hover:bg-teal-600 text-white' },
      { code: 'negativa', symbol: '-', label: 'Difeso (-)', color: 'bg-slate-700 hover:bg-slate-600 text-slate-100' },
      { code: 'murato', symbol: '/', label: 'Murato Subito (/)', color: 'bg-purple-700 hover:bg-purple-600 text-white', isError: true },
      { code: 'errore', symbol: '=', label: 'Errore Rete/Fuori', color: 'bg-rose-700 hover:bg-rose-600 text-white', isError: true },
    ]
  },
  {
    type: 'muro',
    label: 'Muro',
    qualities: [
      { code: 'punto', symbol: '#', label: 'Muro Punto (#)', color: 'bg-emerald-600 hover:bg-emerald-500 text-white', isPoint: true },
      { code: 'positiva', symbol: '+', label: 'Tocco Muro (+)', color: 'bg-teal-700 hover:bg-teal-600 text-white' },
      { code: 'invasione', symbol: '=', label: 'Invasione a rete', color: 'bg-rose-700 hover:bg-rose-600 text-white', isError: true },
    ]
  },
  {
    type: 'difesa',
    label: 'Difesa',
    qualities: [
      { code: 'doppio_piu', symbol: '#', label: 'Perfetta (#)', color: 'bg-emerald-700 hover:bg-emerald-600 text-white' },
      { code: 'positiva', symbol: '+', label: 'In gioco (+)', color: 'bg-teal-700 hover:bg-teal-600 text-white' },
      { code: 'errore', symbol: '=', label: 'Errore Difesa', color: 'bg-rose-700 hover:bg-rose-600 text-white', isError: true },
    ]
  },
  {
    type: 'fallo',
    label: 'Fallo',
    qualities: [
      { code: 'invasione', symbol: '=', label: 'Invasione', color: 'bg-rose-700 hover:bg-rose-600 text-white', isError: true },
      { code: 'errore', symbol: '=', label: '4 Tocchi / Doppio', color: 'bg-rose-700 hover:bg-rose-600 text-white', isError: true },
    ]
  }
];

export const ScoutKeypad: React.FC<ScoutKeypadProps> = ({
  homeTeam,
  awayTeam,
  selectedPlayer,
  selectedTeam,
  tacticalSchemes,
  activeSchemeId,
  onSelectScheme,
  onAddAction,
  onAwardPoint,
  onUndoLastAction,
  currentRallyActions,
  canUndo,
  onSelectPlayer,
  homeLineup,
  awayLineup,
  homeLiberoId,
  awayLiberoId
}) => {
  const [selectedFundamental, setSelectedFundamental] = useState<FundamentalType>('attacco');
  const [selectedZone, setSelectedZone] = useState<CourtZone | undefined>(4);

  const activeFundConfig = FUNDAMENTALS_CONFIG.find(f => f.type === selectedFundamental) || FUNDAMENTALS_CONFIG[0];

  const handleQualityClick = (q: typeof activeFundConfig.qualities[0]) => {
    if (!selectedPlayer || !selectedTeam) {
      alert('Seleziona prima un giocatore in campo o dal roster!');
      return;
    }

    const currentScheme = tacticalSchemes.find(s => s.id === activeSchemeId);

    onAddAction({
      type: selectedFundamental,
      quality: q.code,
      playerId: selectedPlayer.id,
      playerName: selectedPlayer.name,
      playerNumber: selectedPlayer.number,
      playerRole: selectedPlayer.role,
      teamId: selectedTeam.id,
      zone: selectedZone,
      schemeId: currentScheme?.id,
      schemeCode: currentScheme?.code,
      isPoint: q.isPoint,
      isError: q.isError,
    });
  };

  // Quick player buttons on court for fast selection
  const homeOnCourtPlayers = Object.values(homeLineup)
    .map(id => homeTeam.players.find(p => p.id === id))
    .filter(Boolean) as Player[];

  const awayOnCourtPlayers = Object.values(awayLineup)
    .map(id => awayTeam.players.find(p => p.id === id))
    .filter(Boolean) as Player[];

  const homeLibero = homeTeam.players.find(p => p.id === homeLiberoId);
  const awayLibero = awayTeam.players.find(p => p.id === awayLiberoId);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col gap-4">
      {/* Top Bar: Active Player & Tactical Scheme Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        {/* Selected Player Info */}
        <div className="flex items-center gap-3">
          <div className="text-xs uppercase font-mono text-slate-400">Giocatore Attivo:</div>
          {selectedPlayer && selectedTeam ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-lg border border-slate-700">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: selectedTeam.primaryColor }}
              />
              <span className="font-bold text-white text-sm">
                #{selectedPlayer.number} {selectedPlayer.name}
              </span>
              <span className="text-xs text-cyan-400 font-mono">({selectedPlayer.role})</span>
            </div>
          ) : (
            <span className="text-amber-400 text-xs italic bg-amber-950/40 px-2 py-1 rounded border border-amber-800/60">
              Clicca un giocatore sul campo per iniziare lo scout
            </span>
          )}
        </div>

        {/* Tactical Play Call Scheme */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">Schema / Chiamata:</span>
          <select
            value={activeSchemeId || ''}
            onChange={(e) => onSelectScheme(e.target.value)}
            className="text-xs bg-slate-800 border border-slate-700 text-slate-200 rounded px-2.5 py-1.5 focus:outline-hidden focus:border-cyan-500 font-medium"
            aria-label="Seleziona schema tattico"
          >
            <option value="">Nessuno schema specifico</option>
            {tacticalSchemes.map(s => (
              <option key={s.id} value={s.id}>
                [{s.code}] {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Undo Action Button */}
        <button
          onClick={onUndoLastAction}
          disabled={!canUndo}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
            canUndo
              ? 'bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/60 cursor-pointer'
              : 'bg-slate-800/40 text-slate-600 border border-slate-800 cursor-not-allowed'
          }`}
          title="Annulla l'ultima azione registrata"
          aria-label="Annulla ultima azione"
        >
          <Undo2 className="w-3.5 h-3.5" />
          <span>Annulla tocco</span>
        </button>
      </div>

      {/* Quick Player Bar: Fast switch between 6 on-court players of both teams */}
      <div className="flex flex-col gap-1.5 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-medium">
          <span>Cambio Rapido Giocatore:</span>
          <span className="text-slate-500 font-mono text-[10px]">Titolari in campo + Libero</span>
        </div>

        {/* Home Players */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-red-400 w-12">{homeTeam.shortName}:</span>
          {homeOnCourtPlayers.map(p => {
            const isSel = selectedPlayer?.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPlayer(p, homeTeam)}
                className={`px-2 py-1 text-xs font-bold rounded transition-all ${
                  isSel
                    ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                #{p.number} {p.name.split(' ').pop()}
              </button>
            );
          })}
          {homeLibero && (
            <button
              onClick={() => onSelectPlayer(homeLibero, homeTeam)}
              className={`px-2 py-1 text-xs font-bold rounded border ${
                selectedPlayer?.id === homeLibero.id
                  ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-300'
                  : 'bg-emerald-950/60 text-emerald-300 border-emerald-800 hover:bg-emerald-900/60'
              }`}
            >
              #{homeLibero.number} Libero
            </button>
          )}
        </div>

        {/* Away Players */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/80">
          <span className="text-xs font-bold text-sky-400 w-12">{awayTeam.shortName}:</span>
          {awayOnCourtPlayers.map(p => {
            const isSel = selectedPlayer?.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPlayer(p, awayTeam)}
                className={`px-2 py-1 text-xs font-bold rounded transition-all ${
                  isSel
                    ? 'bg-sky-600 text-white shadow-sm ring-2 ring-sky-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                #{p.number} {p.name.split(' ').pop()}
              </button>
            );
          })}
          {awayLibero && (
            <button
              onClick={() => onSelectPlayer(awayLibero, awayTeam)}
              className={`px-2 py-1 text-xs font-bold rounded border ${
                selectedPlayer?.id === awayLibero.id
                  ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-300'
                  : 'bg-emerald-950/60 text-emerald-300 border-emerald-800 hover:bg-emerald-900/60'
              }`}
            >
              #{awayLibero.number} Libero
            </button>
          )}
        </div>
      </div>

      {/* Fundamentals Selection Bar */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          1. Seleziona Fondamentale
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
          {FUNDAMENTALS_CONFIG.map(f => {
            const isActive = selectedFundamental === f.type;
            return (
              <button
                key={f.type}
                onClick={() => setSelectedFundamental(f.type)}
                className={`py-2 px-1 text-center font-bold text-xs rounded-lg transition-all ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-md ring-2 ring-cyan-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quality Code Buttons for Active Fundamental */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            2. Valutazione / Esito ({activeFundConfig.label})
          </label>
          <span className="text-[11px] text-slate-500 font-mono">Standard DataVolley / FIPAV</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {activeFundConfig.qualities.map(q => (
            <button
              key={q.code + q.symbol}
              onClick={() => handleQualityClick(q)}
              className={`flex items-center justify-between p-3 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 ${q.color}`}
            >
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-sm px-1.5 py-0.5 bg-black/25 rounded">
                  {q.symbol}
                </span>
                <span>{q.label}</span>
              </div>
              {q.isPoint && <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />}
              {q.isError && <AlertCircle className="w-3.5 h-3.5 text-rose-200" />}
            </button>
          ))}
        </div>
      </div>

      {/* Target Zone Selector */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
        <span className="text-xs font-semibold text-slate-400">Zona Bersaglio:</span>
        <div className="flex items-center gap-1">
          {([1, 2, 3, 4, 5, 6] as CourtZone[]).map(z => (
            <button
              key={z}
              onClick={() => setSelectedZone(z)}
              className={`w-7 h-7 text-xs font-bold rounded flex items-center justify-center transition-colors ${
                selectedZone === z
                  ? 'bg-amber-500 text-slate-900 ring-2 ring-amber-300'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Z{z}
            </button>
          ))}
        </div>
      </div>

      {/* Current Rally Action Sequence Feed */}
      <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sequenza Tocchi Azione Corrente ({currentRallyActions.length})</span>
          </div>
          {currentRallyActions.length === 0 && (
            <span className="text-[11px] text-slate-500">In attesa del servizio...</span>
          )}
        </div>

        {currentRallyActions.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {currentRallyActions.map((act, idx) => (
              <div
                key={act.id || idx}
                className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded text-xs text-slate-200"
              >
                <span className="font-bold text-cyan-400">#{act.playerNumber}</span>
                <span className="capitalize">{act.type}</span>
                <span className="font-mono text-amber-400 bg-slate-800 px-1 rounded text-[11px]">
                  {act.quality}
                </span>
                {idx < currentRallyActions.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-slate-600 ml-1" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-500 py-1 italic">
            Nessun tocco registrato per questo scambio. Usa la tastiera o i pulsanti per tracciare battuta, ricezione, attacco...
          </div>
        )}
      </div>

      {/* Direct Point Attribution Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
        {/* Award Point to Home */}
        <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-red-950/30 border border-red-900/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-300">
              Assegna Punto: {homeTeam.name}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => onAwardPoint('home', 'attack', 'Attacco Vincente')}
              className="py-1.5 px-2 bg-red-700 hover:bg-red-600 text-white text-xs font-bold rounded shadow transition-colors"
            >
              +1 Attacco
            </button>
            <button
              onClick={() => onAwardPoint('home', 'block', 'Muro Vincente')}
              className="py-1.5 px-2 bg-red-800 hover:bg-red-700 text-white text-xs font-bold rounded shadow transition-colors"
            >
              +1 Muro
            </button>
            <button
              onClick={() => onAwardPoint('home', 'ace', 'Ace Battuta')}
              className="py-1.5 px-2 bg-red-900 hover:bg-red-800 text-white text-xs font-bold rounded shadow transition-colors"
            >
              +1 Ace
            </button>
            <button
              onClick={() => onAwardPoint('home', 'opponent_error', 'Errore Avversario')}
              className="col-span-3 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded transition-colors"
            >
              +1 Errore Ospiti (Rete/Fuori/Fallo)
            </button>
          </div>
        </div>

        {/* Award Point to Away */}
        <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-sky-950/30 border border-sky-900/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-300">
              Assegna Punto: {awayTeam.name}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => onAwardPoint('away', 'attack', 'Attacco Vincente')}
              className="py-1.5 px-2 bg-sky-700 hover:bg-sky-600 text-white text-xs font-bold rounded shadow transition-colors"
            >
              +1 Attacco
            </button>
            <button
              onClick={() => onAwardPoint('away', 'block', 'Muro Vincente')}
              className="py-1.5 px-2 bg-sky-800 hover:bg-sky-700 text-white text-xs font-bold rounded shadow transition-colors"
            >
              +1 Muro
            </button>
            <button
              onClick={() => onAwardPoint('away', 'ace', 'Ace Battuta')}
              className="py-1.5 px-2 bg-sky-900 hover:bg-sky-800 text-white text-xs font-bold rounded shadow transition-colors"
            >
              +1 Ace
            </button>
            <button
              onClick={() => onAwardPoint('away', 'opponent_error', 'Errore Avversario')}
              className="col-span-3 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded transition-colors"
            >
              +1 Errore Casa (Rete/Fuori/Fallo)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
