import React, { useState } from 'react';
import { CourtZone, Player, Team } from '../types/volleyball';
import { X, ArrowLeftRight, Shield, AlertTriangle } from 'lucide-react';

interface SubstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team;
  currentSetIndex: number;
  currentScore: { home: number; away: number };
  lineup: Record<CourtZone, string>;
  defaultZone?: CourtZone;
  substitutionsCountThisSet: number;
  liberoId?: string;
  onPerformSubstitution: (
    playerOut: Player,
    playerIn: Player,
    zone: CourtZone,
    isLiberoSwap: boolean
  ) => void;
}

export const SubstitutionModal: React.FC<SubstitutionModalProps> = ({
  isOpen,
  onClose,
  team,
  currentSetIndex,
  currentScore,
  lineup,
  defaultZone = 4,
  substitutionsCountThisSet,
  liberoId,
  onPerformSubstitution,
}) => {
  const [selectedZone, setSelectedZone] = useState<CourtZone>(defaultZone);
  const [selectedBenchPlayerId, setSelectedBenchPlayerId] = useState<string>('');

  if (!isOpen) return null;

  const playerOutId = lineup[selectedZone];
  const playerOut = team.players.find(p => p.id === playerOutId);
  const libero = team.players.find(p => p.id === liberoId);

  // Bench players: all team players not currently in active lineup (and not libero if standard sub)
  const onCourtPlayerIds = Object.values(lineup);
  const benchPlayers = team.players.filter(
    p => !onCourtPlayerIds.includes(p.id) && !p.isLibero
  );

  const canSubStandard = substitutionsCountThisSet < 6;
  const isBackRow = [1, 6, 5].includes(selectedZone);

  const handleConfirmSub = () => {
    if (!playerOut || !selectedBenchPlayerId) return;
    const playerIn = team.players.find(p => p.id === selectedBenchPlayerId);
    if (!playerIn) return;

    onPerformSubstitution(playerOut, playerIn, selectedZone, false);
    onClose();
  };

  const handleLiberoSwap = () => {
    if (!playerOut || !libero) return;
    onPerformSubstitution(playerOut, libero, selectedZone, true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">
              Gestione Sostituzioni - {team.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Chiudi finestra sostituzione"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* FIVB Subs Count Info */}
          <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
            <div>
              <span className="text-xs text-slate-400">Sostituzioni nel Set {currentSetIndex + 1}:</span>
              <div className="text-sm font-bold text-white">
                {substitutionsCountThisSet} / 6 utilizzate
              </div>
            </div>
            {!canSubStandard ? (
              <span className="flex items-center gap-1 text-xs text-rose-400 bg-rose-950/60 border border-rose-800 px-2.5 py-1 rounded">
                <AlertTriangle className="w-3.5 h-3.5" />
                Limite 6 cambi raggiunto!
              </span>
            ) : (
              <span className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800 px-2 py-0.5 rounded">
                {6 - substitutionsCountThisSet} cambi disponibili
              </span>
            )}
          </div>

          {/* 1. Select Court Zone / Player Out */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              1. Seleziona Posizione e Giocatore che Esce:
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {([4, 3, 2, 5, 6, 1] as CourtZone[]).map(z => {
                const p = team.players.find(pl => pl.id === lineup[z]);
                const isSelected = selectedZone === z;
                return (
                  <button
                    key={z}
                    type="button"
                    onClick={() => setSelectedZone(z)}
                    className={`flex flex-col items-center p-2 rounded-lg border text-center transition-all ${
                      isSelected
                        ? 'bg-cyan-950 border-cyan-400 ring-2 ring-cyan-400/50'
                        : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-[10px] font-mono text-slate-400">Zona {z}</span>
                    <span className="font-extrabold text-white text-sm">
                      #{p?.number || '?'}
                    </span>
                    <span className="text-[10px] text-slate-300 truncate w-full">
                      {p?.name.split(' ').pop() || 'N/A'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Out Preview */}
          {playerOut && (
            <div className="p-3 bg-red-950/30 border border-red-900/60 rounded-lg flex items-center justify-between text-xs">
              <span className="text-red-300">
                Esce: <strong>#{playerOut.number} {playerOut.name}</strong> ({playerOut.role}) in Zona {selectedZone}
              </span>
              <span className="text-slate-400 font-mono">
                Punteggio: {currentScore.home} - {currentScore.away}
              </span>
            </div>
          )}

          {/* Libero Replacement Section (Back row only) */}
          {libero && isBackRow && (
            <div className="p-3 bg-emerald-950/30 border border-emerald-900/60 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-xs font-bold text-emerald-300">
                    Cambio Libero Temporaneo (#{libero.number} {libero.name})
                  </div>
                  <div className="text-[11px] text-emerald-400/80">
                    Non viene conteggiato nei 6 cambi ufficiali di regolamento
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLiberoSwap}
                className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors"
              >
                Entra Libero
              </button>
            </div>
          )}

          {/* 2. Select Bench Player In */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              2. Seleziona Giocatore Dalla Panchina che Entra:
            </label>
            {benchPlayers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {benchPlayers.map(p => {
                  const isSelected = selectedBenchPlayerId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedBenchPlayerId(p.id)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'bg-cyan-950 border-cyan-400 ring-2 ring-cyan-400/50'
                          : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      <span className="w-7 h-7 rounded-full bg-slate-700 font-extrabold text-xs text-white flex items-center justify-center shrink-0">
                        #{p.number}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate">{p.name}</div>
                        <div className="text-[10px] text-slate-400">{p.role} · {p.heightCm}cm</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 bg-slate-800 text-slate-400 text-xs rounded text-center">
                Nessun giocatore disponibile in panchina per questa squadra.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3 border-t border-slate-800 bg-slate-950">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            Annulla
          </button>
          <button
            type="button"
            disabled={!canSubStandard || !selectedBenchPlayerId}
            onClick={handleConfirmSub}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded shadow transition-all ${
              canSubStandard && selectedBenchPlayerId
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Conferma Sostituzione</span>
          </button>
        </div>
      </div>
    </div>
  );
};
