import React, { useState } from 'react';
import { Match, Player, Team, TacticalScheme } from '../types/volleyball';
import {
  computePlayerStats,
  computeRotationStats,
  computeZoneAttackStats,
  computeSchemeStats,
  getMatchStatus
} from '../utils/volleyball-rules';
import {
  BarChart3,
  Download,
  Printer,
  TrendingUp,
  FileSpreadsheet,
  Award,
  Layers,
  Percent,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Zap,
  Target
} from 'lucide-react';

interface StatisticsViewProps {
  match: Match;
  tacticalSchemes: TacticalScheme[];
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({ match, tacticalSchemes }) => {
  const [activeTab, setActiveTab] = useState<'boxscore' | 'rotations' | 'zones' | 'schemes' | 'comparison'>('boxscore');
  const [selectedTeamTab, setSelectedTeamTab] = useState<'home' | 'away'>('home');

  const { homeSetsWon, awaySetsWon, isFinished, winnerTeamId } = getMatchStatus(match.setScores);
  const totalSetsPlayed = match.setScores.length + (match.isFinished ? 0 : 1);

  // Compute stats for both teams
  const homePlayerStats = match.homeTeam.players.map(p =>
    computePlayerStats(p, match.homeTeam.id, match.rallies, totalSetsPlayed)
  );

  const awayPlayerStats = match.awayTeam.players.map(p =>
    computePlayerStats(p, match.awayTeam.id, match.rallies, totalSetsPlayed)
  );

  const homeRotationStats = computeRotationStats(match.homeTeam.id, true, match.rallies);
  const awayRotationStats = computeRotationStats(match.awayTeam.id, false, match.rallies);

  const homeZoneStats = computeZoneAttackStats(match.homeTeam.id, match.rallies);
  const awayZoneStats = computeZoneAttackStats(match.awayTeam.id, match.rallies);

  const homeSchemeStats = computeSchemeStats(match.homeTeam.id, tacticalSchemes, match.rallies);

  // Top scorer calculation
  const allPlayerStats = [...homePlayerStats, ...awayPlayerStats];
  const mvpCandidate = allPlayerStats.reduce((prev, curr) =>
    curr.totalPoints > (prev?.totalPoints || 0) ? curr : prev, allPlayerStats[0]
  );

  // Team totals
  const computeTeamTotals = (stats: typeof homePlayerStats) => {
    return stats.reduce(
      (acc, s) => {
        acc.points += s.totalPoints;
        acc.breakPoints += s.breakPoints;
        acc.servesTotal += s.servesTotal;
        acc.servesAces += s.servesAces;
        acc.servesErrors += s.servesErrors;
        acc.receptionsTotal += s.receptionsTotal;
        acc.receptionsErrors += s.receptionsErrors;
        acc.receptionsPositive += s.receptionsPositive;
        acc.receptionsPerfect += s.receptionsPerfect;
        acc.attacksTotal += s.attacksTotal;
        acc.attacksKills += s.attacksKills;
        acc.attacksErrors += s.attacksErrors;
        acc.attacksBlocked += s.attacksBlocked;
        acc.blockPoints += s.blockPoints;
        acc.totalErrors += s.totalErrors;
        return acc;
      },
      {
        points: 0,
        breakPoints: 0,
        servesTotal: 0,
        servesAces: 0,
        servesErrors: 0,
        receptionsTotal: 0,
        receptionsErrors: 0,
        receptionsPositive: 0,
        receptionsPerfect: 0,
        attacksTotal: 0,
        attacksKills: 0,
        attacksErrors: 0,
        attacksBlocked: 0,
        blockPoints: 0,
        totalErrors: 0,
      }
    );
  };

  const homeTotals = computeTeamTotals(homePlayerStats);
  const awayTotals = computeTeamTotals(awayPlayerStats);

  // CSV Export Function
  const exportToCSV = () => {
    const activeStats = selectedTeamTab === 'home' ? homePlayerStats : awayPlayerStats;
    const teamName = selectedTeamTab === 'home' ? match.homeTeam.name : match.awayTeam.name;

    const headers = [
      'Numero',
      'Giocatore',
      'Ruolo',
      'Punti',
      'Break Point',
      '+/-',
      'Battute Tot',
      'Ace',
      'Err Battuta',
      'Ricez Tot',
      'Err Ricez',
      '% Positiva',
      '% Perfetta',
      'Attacchi Tot',
      'Punti Attacco',
      'Err Attacco',
      'Murati Subiti',
      '% Vincente Attacco',
      'Efficienza %',
      'Muri Vincenti',
    ];

    const rows = activeStats.map(s => [
      s.number,
      `"${s.name}"`,
      s.role,
      s.totalPoints,
      s.breakPoints,
      s.plusMinus,
      s.servesTotal,
      s.servesAces,
      s.servesErrors,
      s.receptionsTotal,
      s.receptionsErrors,
      `${s.receptionPositivePct}%`,
      `${s.receptionPerfectPct}%`,
      s.attacksTotal,
      s.attacksKills,
      s.attacksErrors,
      s.attacksBlocked,
      `${s.attackKillPct}%`,
      `${s.attackEfficiency}%`,
      s.blockPoints,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VolleyScout_${teamName.replace(/\s+/g, '_')}_Stats.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Match Header Scoreboard Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs font-mono uppercase text-cyan-400 font-semibold tracking-wider">
              {match.tournament} · {match.location}
            </span>
            <h2 className="text-lg font-extrabold text-white">{match.title}</h2>
            <div className="text-xs text-slate-400 mt-0.5">Data: {match.date}</div>
          </div>

          {/* Export & Print Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Esporta CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>Stampa / PDF</span>
            </button>
          </div>
        </div>

        {/* Set Scores Breakdown Table */}
        <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-950 p-4 rounded-xl border border-slate-800">
          {/* Home Team Result */}
          <div className="flex items-center gap-3">
            <span
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: match.homeTeam.primaryColor }}
            />
            <div>
              <div className="font-extrabold text-white text-base">{match.homeTeam.name}</div>
              <div className="text-xs text-slate-400">All: {match.homeTeam.coach}</div>
            </div>
            <div className="ml-4 text-3xl font-black text-white">{homeSetsWon}</div>
          </div>

          {/* Set Scores List */}
          <div className="flex items-center gap-2">
            {match.setScores.map((set, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800"
              >
                <span className="text-[10px] uppercase font-mono text-slate-400">Set {idx + 1}</span>
                <span className="text-sm font-bold text-white font-mono">
                  {set.home} - {set.away}
                </span>
              </div>
            ))}
            {!isFinished && (
              <div className="flex flex-col items-center bg-cyan-950/60 px-3 py-1.5 rounded-lg border border-cyan-800 animate-pulse">
                <span className="text-[10px] uppercase font-mono text-cyan-400">
                  Set {match.currentSetIndex + 1} (Live)
                </span>
                <span className="text-sm font-bold text-cyan-200 font-mono">
                  {match.currentScore.home} - {match.currentScore.away}
                </span>
              </div>
            )}
          </div>

          {/* Away Team Result */}
          <div className="flex items-center gap-3">
            <div className="mr-4 text-3xl font-black text-white">{awaySetsWon}</div>
            <div className="text-right">
              <div className="font-extrabold text-white text-base">{match.awayTeam.name}</div>
              <div className="text-xs text-slate-400">All: {match.awayTeam.coach}</div>
            </div>
            <span
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: match.awayTeam.primaryColor }}
            />
          </div>
        </div>

        {/* MVP Banner */}
        {mvpCandidate && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-amber-950/30 border border-amber-800/50 rounded-lg text-xs text-amber-300">
            <Award className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Top Scorer del Match:</strong> #{mvpCandidate.number} {mvpCandidate.name} ({mvpCandidate.role}) con{' '}
              <strong>{mvpCandidate.totalPoints} punti totali</strong> ({mvpCandidate.attacksKills} attacchi, {mvpCandidate.servesAces} ace, {mvpCandidate.blockPoints} muri)
            </span>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('boxscore')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'boxscore'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Box Score Ufficiale</span>
        </button>

        <button
          onClick={() => setActiveTab('rotations')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'rotations'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Analisi Rotazioni (P1 - P6)</span>
        </button>

        <button
          onClick={() => setActiveTab('zones')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'zones'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Zone d'Attacco & Mappa</span>
        </button>

        <button
          onClick={() => setActiveTab('schemes')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'schemes'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Efficacia Schemi Tattici</span>
        </button>

        <button
          onClick={() => setActiveTab('comparison')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'comparison'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>Confronto Squadre</span>
        </button>
      </div>

      {/* Tab 1: Box Score Ufficiale */}
      {activeTab === 'boxscore' && (
        <div className="space-y-4">
          {/* Team Switcher for Box Score */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Visualizza statistiche di:</span>
            <button
              onClick={() => setSelectedTeamTab('home')}
              className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
                selectedTeamTab === 'home'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {match.homeTeam.name}
            </button>
            <button
              onClick={() => setSelectedTeamTab('away')}
              className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
                selectedTeamTab === 'away'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {match.awayTeam.name}
            </button>
          </div>

          {/* Table Container */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto shadow-xl">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Giocatore</th>
                  <th className="py-2.5 px-3">Ruolo</th>
                  <th className="py-2.5 px-2 text-center bg-slate-900 text-cyan-300">Punti</th>
                  <th className="py-2.5 px-2 text-center">BP</th>
                  <th className="py-2.5 px-2 text-center">+/-</th>
                  
                  {/* Battuta */}
                  <th className="py-2.5 px-2 text-center border-l border-slate-800 text-amber-300">Bat. Tot</th>
                  <th className="py-2.5 px-2 text-center text-amber-300">Err</th>
                  <th className="py-2.5 px-2 text-center text-amber-300">Ace</th>
                  
                  {/* Ricezione */}
                  <th className="py-2.5 px-2 text-center border-l border-slate-800 text-emerald-300">Ric. Tot</th>
                  <th className="py-2.5 px-2 text-center text-emerald-300">Err</th>
                  <th className="py-2.5 px-2 text-center text-emerald-300">Pos %</th>
                  <th className="py-2.5 px-2 text-center text-emerald-300">Prf %</th>
                  
                  {/* Attacco */}
                  <th className="py-2.5 px-2 text-center border-l border-slate-800 text-purple-300">Att. Tot</th>
                  <th className="py-2.5 px-2 text-center text-purple-300">Err</th>
                  <th className="py-2.5 px-2 text-center text-purple-300">Mur</th>
                  <th className="py-2.5 px-2 text-center text-purple-300 font-bold">Pti</th>
                  <th className="py-2.5 px-2 text-center text-purple-300">Eff %</th>
                  
                  {/* Muro */}
                  <th className="py-2.5 px-2 text-center border-l border-slate-800 text-sky-300">Muri</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {(selectedTeamTab === 'home' ? homePlayerStats : awayPlayerStats).map(p => (
                  <tr key={p.playerId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2 px-3 font-bold text-white">#{p.number}</td>
                    <td className="py-2 px-3 font-sans font-medium text-slate-200">{p.name}</td>
                    <td className="py-2 px-3 font-sans text-slate-400">{p.role}</td>
                    
                    <td className="py-2 px-2 text-center font-bold text-cyan-300 bg-slate-950/40">
                      {p.totalPoints}
                    </td>
                    <td className="py-2 px-2 text-center text-slate-300">{p.breakPoints}</td>
                    <td className={`py-2 px-2 text-center font-bold ${p.plusMinus > 0 ? 'text-emerald-400' : p.plusMinus < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                      {p.plusMinus > 0 ? `+${p.plusMinus}` : p.plusMinus}
                    </td>

                    {/* Battuta */}
                    <td className="py-2 px-2 text-center border-l border-slate-800 text-slate-300">{p.servesTotal}</td>
                    <td className="py-2 px-2 text-center text-rose-400">{p.servesErrors}</td>
                    <td className="py-2 px-2 text-center font-bold text-amber-400">{p.servesAces}</td>

                    {/* Ricezione */}
                    <td className="py-2 px-2 text-center border-l border-slate-800 text-slate-300">{p.receptionsTotal}</td>
                    <td className="py-2 px-2 text-center text-rose-400">{p.receptionsErrors}</td>
                    <td className="py-2 px-2 text-center text-emerald-400">{p.receptionPositivePct}%</td>
                    <td className="py-2 px-2 text-center text-teal-300 font-bold">{p.receptionPerfectPct}%</td>

                    {/* Attacco */}
                    <td className="py-2 px-2 text-center border-l border-slate-800 text-slate-300">{p.attacksTotal}</td>
                    <td className="py-2 px-2 text-center text-rose-400">{p.attacksErrors}</td>
                    <td className="py-2 px-2 text-center text-purple-400">{p.attacksBlocked}</td>
                    <td className="py-2 px-2 text-center font-bold text-white">{p.attacksKills}</td>
                    <td className={`py-2 px-2 text-center font-bold ${p.attackEfficiency > 30 ? 'text-emerald-400' : p.attackEfficiency < 10 ? 'text-rose-400' : 'text-amber-400'}`}>
                      {p.attackEfficiency}%
                    </td>

                    {/* Muro */}
                    <td className="py-2 px-2 text-center border-l border-slate-800 font-bold text-sky-400">
                      {p.blockPoints}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-950 font-bold text-white border-t-2 border-slate-700 font-mono">
                {(() => {
                  const t = selectedTeamTab === 'home' ? homeTotals : awayTotals;
                  const eff = t.attacksTotal > 0 ? Math.round(((t.attacksKills - t.attacksErrors - t.attacksBlocked) / t.attacksTotal) * 1000) / 10 : 0;
                  const posPct = t.receptionsTotal > 0 ? Math.round((t.receptionsPositive / t.receptionsTotal) * 1000) / 10 : 0;
                  const prfPct = t.receptionsTotal > 0 ? Math.round((t.receptionsPerfect / t.receptionsTotal) * 1000) / 10 : 0;

                  return (
                    <tr>
                      <td colSpan={3} className="py-2.5 px-3 uppercase tracking-wider font-sans">
                        Totali di Squadra
                      </td>
                      <td className="py-2.5 px-2 text-center text-cyan-300">{t.points}</td>
                      <td className="py-2.5 px-2 text-center">{t.breakPoints}</td>
                      <td className="py-2.5 px-2 text-center">-</td>
                      <td className="py-2.5 px-2 text-center border-l border-slate-800">{t.servesTotal}</td>
                      <td className="py-2.5 px-2 text-center text-rose-400">{t.servesErrors}</td>
                      <td className="py-2.5 px-2 text-center text-amber-400">{t.servesAces}</td>
                      <td className="py-2.5 px-2 text-center border-l border-slate-800">{t.receptionsTotal}</td>
                      <td className="py-2.5 px-2 text-center text-rose-400">{t.receptionsErrors}</td>
                      <td className="py-2.5 px-2 text-center text-emerald-400">{posPct}%</td>
                      <td className="py-2.5 px-2 text-center text-teal-300">{prfPct}%</td>
                      <td className="py-2.5 px-2 text-center border-l border-slate-800">{t.attacksTotal}</td>
                      <td className="py-2.5 px-2 text-center text-rose-400">{t.attacksErrors}</td>
                      <td className="py-2.5 px-2 text-center text-purple-400">{t.attacksBlocked}</td>
                      <td className="py-2.5 px-2 text-center">{t.attacksKills}</td>
                      <td className="py-2.5 px-2 text-center text-amber-300">{eff}%</td>
                      <td className="py-2.5 px-2 text-center border-l border-slate-800 text-sky-400">{t.blockPoints}</td>
                    </tr>
                  );
                })()}
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Analisi Rotazioni (P1 - P6) */}
      {activeTab === 'rotations' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-base font-bold text-white mb-1">
              Efficienza Cambiopalla (Side-out) e Fase Break per Rotazione
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Indica con quale frequenza la squadra conquista il punto quando riceve (Side-out %) e quando batte (Break Point %) in ciascuna rotazione da P1 a P6.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Home Team Rotations */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="font-bold text-sm text-red-400 mb-3">{match.homeTeam.name}</h4>
                <div className="space-y-3">
                  {homeRotationStats.map(r => (
                    <div key={r.rotation} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white font-mono">Rotazione P{r.rotation}</span>
                        <div className="flex items-center gap-3 text-[11px] font-mono">
                          <span className="text-emerald-400">
                            Side-out: <strong>{r.sideoutPct}%</strong> ({r.sideoutsWon}/{r.receptionsTotal})
                          </span>
                          <span className="text-amber-400">
                            Break: <strong>{r.breakPointPct}%</strong> ({r.breakPointsWon}/{r.servesTotal})
                          </span>
                        </div>
                      </div>
                      {/* Bar graph */}
                      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
                        <div
                          className="bg-emerald-500 h-full transition-all"
                          style={{ width: `${Math.min(r.sideoutPct, 100)}%` }}
                          title={`Sideout: ${r.sideoutPct}%`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Away Team Rotations */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="font-bold text-sm text-sky-400 mb-3">{match.awayTeam.name}</h4>
                <div className="space-y-3">
                  {awayRotationStats.map(r => (
                    <div key={r.rotation} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white font-mono">Rotazione P{r.rotation}</span>
                        <div className="flex items-center gap-3 text-[11px] font-mono">
                          <span className="text-emerald-400">
                            Side-out: <strong>{r.sideoutPct}%</strong> ({r.sideoutsWon}/{r.receptionsTotal})
                          </span>
                          <span className="text-amber-400">
                            Break: <strong>{r.breakPointPct}%</strong> ({r.breakPointsWon}/{r.servesTotal})
                          </span>
                        </div>
                      </div>
                      {/* Bar graph */}
                      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
                        <div
                          className="bg-sky-500 h-full transition-all"
                          style={{ width: `${Math.min(r.sideoutPct, 100)}%` }}
                          title={`Sideout: ${r.sideoutPct}%`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Zone d'Attacco */}
      {activeTab === 'zones' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-base font-bold text-white">
            Distribuzione ed Efficienza Attacco per Zona
          </h3>
          <p className="text-xs text-slate-400">
            Prestazioni offensive suddivise per corsia: Banda Sinistra (Posto 4), Centro (Posto 3), Banda Destra/Opposto (Posto 2), Seconda Linea (Pipe).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {homeZoneStats.map(z => (
              <div key={z.zone} className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-cyan-400 font-mono">
                    {z.zone === 'PIPE' ? 'Zona Pipe (Posto 6)' : `Posto ${z.zone}`}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Totali: {z.total}
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Punti Vincenti:</span>
                    <strong className="text-emerald-400">{z.kills} ({z.killPct}%)</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Errori / Murati:</span>
                    <span className="text-rose-400">{z.errors} / {z.blocked}</span>
                  </div>
                  <div className="flex justify-between text-slate-200 font-bold pt-1 border-t border-slate-800">
                    <span>Efficienza:</span>
                    <span className={z.efficiency > 30 ? 'text-emerald-400' : 'text-amber-400'}>
                      {z.efficiency}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Efficacia Schemi Tattici */}
      {activeTab === 'schemes' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-base font-bold text-white">
            Rendimento Schemi Tattici Chiamati dal Palleggiatore
          </h3>
          <p className="text-xs text-slate-400">
            Analisi del tasso di conversione a punto delle chiamate d'attacco durante la gara.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {homeSchemeStats.map(sc => (
              <div key={sc.scheme.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    Cod. {sc.scheme.code}
                  </span>
                  <span className="text-xs font-bold text-cyan-400 font-mono">
                    {sc.successPct}% Vittoria
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{sc.scheme.name}</h4>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                  <span>Chiamato: {sc.calls} volte</span>
                  <span className="text-emerald-400 font-bold">{sc.pointsWon} Punti realizzati</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Confronto Squadre Head-to-Head */}
      {activeTab === 'comparison' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-base font-bold text-white mb-2">
            Confronto Statistico Testa a Testa (Head-to-Head)
          </h3>

          <div className="space-y-4 bg-slate-950 p-5 rounded-xl border border-slate-800">
            {[
              {
                label: 'Punti Totali Realizzati',
                valHome: homeTotals.points,
                valAway: awayTotals.points,
              },
              {
                label: 'Ace in Battuta',
                valHome: homeTotals.servesAces,
                valAway: awayTotals.servesAces,
              },
              {
                label: 'Muri Vincenti',
                valHome: homeTotals.blockPoints,
                valAway: awayTotals.blockPoints,
              },
              {
                label: 'Attacchi Vincenti',
                valHome: homeTotals.attacksKills,
                valAway: awayTotals.attacksKills,
              },
              {
                label: 'Ricezione Positiva %',
                valHome: `${homeTotals.receptionsTotal > 0 ? Math.round((homeTotals.receptionsPositive / homeTotals.receptionsTotal) * 100) : 0}%`,
                valAway: `${awayTotals.receptionsTotal > 0 ? Math.round((awayTotals.receptionsPositive / awayTotals.receptionsTotal) * 100) : 0}%`,
              },
              {
                label: 'Errori Totali Concessi',
                valHome: homeTotals.totalErrors,
                valAway: awayTotals.totalErrors,
                inverse: true, // lower is better
              },
            ].map((metric, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800/80 text-xs">
                <span className="font-bold text-red-400 w-16 text-left font-mono">
                  {metric.valHome}
                </span>
                <span className="text-slate-300 font-medium text-center flex-1">
                  {metric.label}
                </span>
                <span className="font-bold text-sky-400 w-16 text-right font-mono">
                  {metric.valAway}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
