import React, { useState } from 'react';
import { CourtZone, Player, TacticalScheme, Team } from '../types/volleyball';
import {
  RotateCw,
  Plus,
  Compass,
  Layers,
  Sparkles,
  Info,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface RotationTacticalBoardProps {
  team: Team;
  tacticalSchemes: TacticalScheme[];
  onAddScheme: (scheme: Omit<TacticalScheme, 'id'>) => void;
  onUpdateTeamLineup?: (lineup: Record<CourtZone, string>) => void;
}

// Tactical explanations for each rotation P1-P6 for volleyball coaching
const ROTATION_TACTICAL_NOTES: Record<number, { title: string; setterPos: string; attackOptions: string; tip: string }> = {
  1: {
    title: 'Rotazione P1 (Palleggiatore in Zona 1 - Seconda linea)',
    setterPos: 'Il palleggiatore parte in Z1 per servire o difendere a destra. Tre attaccanti di prima linea disponibili (P4, P3, P2).',
    attackOptions: 'Banda in P4, Centrale in P3 per primo tempo, Opposto in P2 per attacco da prima linea.',
    tip: 'Rotazione molto offensiva con tutti e 3 gli attaccanti di prima linea in rete!'
  },
  2: {
    title: 'Rotazione P2 (Palleggiatore in Zona 2 - Prima linea)',
    setterPos: 'Il palleggiatore è a muro/rete in zona 2. Solo due attaccanti in prima linea (P4 banda, P3 centrale).',
    attackOptions: 'Posto 4 banda aperta, 1° tempo al centro, e palla all\'Opposto che attacca dalla seconda linea (Posto 1) o Pipe in P6.',
    tip: 'Fondamentale l\'attacco da seconda linea dell\'Opposto per sopperire alla mancanza del 3° attaccante di rete.'
  },
  3: {
    title: 'Rotazione P3 (Palleggiatore in Zona 3 - Centro rete)',
    setterPos: 'Palleggiatore a centro rete. Schiacciatore in P4, Opposto in P2 a rete.',
    attackOptions: 'Banda in 4 veloce o spinta, Opposto in 2, Pipe al centro dal fondo.',
    tip: 'Facilità estrema di alzata per il palleggiatore già posizionato a centro rete.'
  },
  4: {
    title: 'Rotazione P4 (Palleggiatore in Zona 4 - Sinistra rete)',
    setterPos: 'Palleggiatore parte a sinistra e penetra al centro per alzare.',
    attackOptions: 'Centrale a rete in P3 (primo tempo o fast), Opposto in P2, Pipe in P6.',
    tip: 'Attenzione all\'inversione con lo schiacciatore di banda per evitare fallo di posizione.'
  },
  5: {
    title: 'Rotazione P5 (Palleggiatore in Zona 5 - Sinistra seconda linea)',
    setterPos: 'Palleggiatore penetra dalla zona 5 dietro lo schiacciatore di banda.',
    attackOptions: '3 attaccanti di rete (P4, P3, P2) pronti a colpire. Grande varietà con Fast e Pipe.',
    tip: 'Penetrazione lunga: la ricezione deve essere alta e precisa su zona 2/3.'
  },
  6: {
    title: 'Rotazione P6 (Palleggiatore in Zona 6 - Centro seconda linea)',
    setterPos: 'Palleggiatore penetra dal centro fondo campo per distribuire il gioco.',
    attackOptions: 'Schiacciatore in 4, Centrale in 3 (1 o 7), Opposto in 2.',
    tip: 'Penetrazione centrale pulita e veloce. Ottima per combinazioni 1° tempo e sovrapposizioni.'
  }
};

export const RotationTacticalBoard: React.FC<RotationTacticalBoardProps> = ({
  team,
  tacticalSchemes,
  onAddScheme,
}) => {
  const [activeRotation, setActiveRotation] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<'attacco' | 'difesa'>('attacco');
  const [newTargetZone, setNewTargetZone] = useState<CourtZone | 'PIPE' | 'FAST'>(3);
  const [newTempo, setNewTempo] = useState<'1_tempo' | '2_tempo' | '3_tempo' | 'palla_alta'>('1_tempo');
  const [newDescription, setNewDescription] = useState('');

  const currentNotes = ROTATION_TACTICAL_NOTES[activeRotation] || ROTATION_TACTICAL_NOTES[1];

  const handleCreateScheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName) return;

    onAddScheme({
      code: newCode.toUpperCase(),
      name: newName,
      category: newCategory,
      targetZone: newTargetZone,
      tempo: newTempo,
      description: newDescription,
    });

    setNewCode('');
    setNewName('');
    setNewDescription('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Rotation Selector & Tactical Analysis */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-cyan-400" />
              <span>Studio Rotazioni Tattiche (P1 - P6)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Posizionamento dei 6 giocatori sul campo e compiti tattici per ciascuna rotazione di squadra.
            </p>
          </div>

          {/* Rotation switcher buttons */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {[1, 2, 3, 4, 5, 6].map(rot => (
              <button
                key={rot}
                onClick={() => setActiveRotation(rot)}
                className={`px-3 py-1.5 text-xs font-extrabold rounded transition-all ${
                  activeRotation === rot
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                P{rot}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Rotation Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
          <div className="space-y-2">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              Dettagli Rotazione
            </span>
            <h4 className="text-sm font-extrabold text-white">{currentNotes.title}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {currentNotes.setterPos}
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Opzioni d'Attacco
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {currentNotes.attackOptions}
            </p>
          </div>

          <div className="space-y-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Consiglio Tattico per lo Scout / Coach
            </span>
            <p className="text-xs text-slate-300 italic leading-relaxed">
              "{currentNotes.tip}"
            </p>
          </div>
        </div>
      </div>

      {/* Tactical Schemes Library */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <span>Libreria Schemi di Gioco e Chiamate Alzata</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Codici e convenzioni di attacco utilizzate per tracciare l'efficacia del palleggiatore e dei centrali/schiacciatori.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Nuovo Schema</span>
          </button>
        </div>

        {/* Schemes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {tacticalSchemes.map(s => (
            <div
              key={s.id}
              className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Cod. {s.code}
                  </span>
                  <span className="text-[11px] text-cyan-400 font-mono">
                    Zona: {s.targetZone}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{s.name}</h4>
                <p className="text-xs text-slate-400 line-clamp-2">{s.description}</p>
              </div>

              <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400">
                <span className="capitalize">Tempo: {s.tempo.replace('_', ' ')}</span>
                <span className="capitalize">{s.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Add Scheme */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <form
            onSubmit={handleCreateScheme}
            className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-xl p-5 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" />
              <span>Aggiungi Nuovo Schema Tattico</span>
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Codice Breve (es. "7", "C", "SLIDE", "FAST"):
              </label>
              <input
                type="text"
                required
                value={newCode}
                onChange={e => setNewCode(e.target.value)}
                placeholder="es. 7"
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs text-white uppercase font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nome Esteso Schema:
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="es. Veloce dietro per il centrale"
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Zona Obiettivo:
                </label>
                <select
                  value={newTargetZone}
                  onChange={e => setNewTargetZone(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                >
                  <option value={3}>Posto 3 (Centro)</option>
                  <option value={4}>Posto 4 (Banda Sx)</option>
                  <option value={2}>Posto 2 (Banda Dx / Opposto)</option>
                  <option value="PIPE">Pipe (Posto 6 2a Linea)</option>
                  <option value="FAST">Fast a un piede</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Tempo di Alzata:
                </label>
                <select
                  value={newTempo}
                  onChange={e => setNewTempo(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="1_tempo">1° Tempo (Anticipo)</option>
                  <option value="2_tempo">2° Tempo (Tesa/Mezza)</option>
                  <option value="3_tempo">3° Tempo</option>
                  <option value="palla_alta">Palla Alta Ricostruzione</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Descrizione & Istruzioni Tattiche:
              </label>
              <textarea
                rows={2}
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                placeholder="Spiega quando chiamare questo schema..."
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded transition-colors"
              >
                Salva Schema
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
