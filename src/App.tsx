import React, { useState, useEffect } from 'react';
import {
  CourtZone,
  FundamentalAction,
  Match,
  Player,
  TacticalScheme,
  Team,
  Substitution
} from './types/volleyball';
import {
  INITIAL_TEAMS,
  DEFAULT_TACTICAL_SCHEMES,
  createInitialMatch
} from './data/mockData';
import {
  rotateLineupClockwise,
  getNextRotationIndex,
  isSetWon,
  getMatchStatus
} from './utils/volleyball-rules';
import { CourtView } from './components/CourtView';
import { ScoutKeypad } from './components/ScoutKeypad';
import { SubstitutionModal } from './components/SubstitutionModal';
import { RotationTacticalBoard } from './components/RotationTacticalBoard';
import { StatisticsView } from './components/StatisticsView';
import { TeamsManagement } from './components/TeamsManagement';
import { MatchSettingsModal } from './components/MatchSettingsModal';
import {
  Activity,
  BarChart3,
  Layers,
  Users,
  Settings,
  RotateCw,
  Volleyball,
  ArrowLeftRight,
  Clock,
  ShieldAlert,
  Sparkles,
  Trophy,
  History
} from 'lucide-react';

export default function App() {
  // Persistence state
  const [teams, setTeams] = useState<Team[]>(() => {
    try {
      const saved = localStorage.getItem('volleyscout_teams');
      return saved ? JSON.parse(saved) : INITIAL_TEAMS;
    } catch {
      return INITIAL_TEAMS;
    }
  });

  const [tacticalSchemes, setTacticalSchemes] = useState<TacticalScheme[]>(() => {
    try {
      const saved = localStorage.getItem('volleyscout_schemes');
      return saved ? JSON.parse(saved) : DEFAULT_TACTICAL_SCHEMES;
    } catch {
      return DEFAULT_TACTICAL_SCHEMES;
    }
  });

  const [match, setMatch] = useState<Match>(() => {
    try {
      const saved = localStorage.getItem('volleyscout_match');
      return saved ? JSON.parse(saved) : createInitialMatch();
    } catch {
      return createInitialMatch();
    }
  });

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'live' | 'stats' | 'tactics' | 'teams'>('live');

  // Live Scout States
  const [selectedPlayer, setSelectedPlayer] = useState<Player | undefined>(() => {
    return match.homeTeam.players.find(p => p.number === 9) || match.homeTeam.players[0];
  });
  const [selectedTeam, setSelectedTeam] = useState<Team>(match.homeTeam);
  const [currentRallyActions, setCurrentRallyActions] = useState<FundamentalAction[]>([]);
  const [activeSchemeId, setActiveSchemeId] = useState<string | undefined>(match.activeSchemeId);

  // Modals
  const [subModalConfig, setSubModalConfig] = useState<{
    isOpen: boolean;
    team: Team;
    zone: CourtZone;
  }>({
    isOpen: false,
    team: match.homeTeam,
    zone: 4,
  });

  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('volleyscout_teams', JSON.stringify(teams));
    } catch {}
  }, [teams]);

  useEffect(() => {
    try {
      localStorage.setItem('volleyscout_schemes', JSON.stringify(tacticalSchemes));
    } catch {}
  }, [tacticalSchemes]);

  useEffect(() => {
    try {
      localStorage.setItem('volleyscout_match', JSON.stringify(match));
    } catch {}
  }, [match]);

  // Player selection handler
  const handleSelectPlayer = (player: Player, team: Team) => {
    setSelectedPlayer(player);
    setSelectedTeam(team);
  };

  // Add individual fundamental action touch to current rally
  const handleAddAction = (action: Omit<FundamentalAction, 'id' | 'timestamp'>) => {
    const fullAction: FundamentalAction = {
      ...action,
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
    };

    const newActions = [...currentRallyActions, fullAction];
    setCurrentRallyActions(newActions);

    // If it's a point action (Ace, Attacco Vincente, Muro Punto) or direct error, offer auto-point resolution
    if (fullAction.isPoint) {
      const winner = fullAction.teamId === match.homeTeam.id ? 'home' : 'away';
      const pointType = fullAction.type === 'battuta' ? 'ace' : fullAction.type === 'muro' ? 'block' : 'attack';
      handleAwardPoint(winner, pointType, `${fullAction.playerName} (${fullAction.type})`, newActions);
    } else if (fullAction.isError) {
      // Opponent gets the point on direct error
      const winner = fullAction.teamId === match.homeTeam.id ? 'away' : 'home';
      handleAwardPoint(winner, 'opponent_error', `Errore ${fullAction.playerName} (${fullAction.type})`, newActions);
    }
  };

  // Award Point and conclude current rally
  const handleAwardPoint = (
    winner: 'home' | 'away',
    pointType: 'sideout' | 'break' | 'ace' | 'block' | 'attack' | 'opponent_error',
    reason?: string,
    providedActions?: FundamentalAction[]
  ) => {
    const actionsToCommit = providedActions || currentRallyActions;
    const winnerTeam = winner === 'home' ? match.homeTeam : match.awayTeam;
    const isSideout = match.servingTeamId !== winnerTeam.id;

    const newHomeScore = winner === 'home' ? match.currentScore.home + 1 : match.currentScore.home;
    const newAwayScore = winner === 'away' ? match.currentScore.away + 1 : match.currentScore.away;

    // Check if team must rotate:
    // In volleyball, the receiving team rotates clockwise upon winning the serve (side-out / cambiopalla)!
    let nextHomeLineup = { ...match.homeLineup };
    let nextAwayLineup = { ...match.awayLineup };
    let nextHomeRotation = match.homeRotation;
    let nextAwayRotation = match.awayRotation;

    if (isSideout) {
      if (winner === 'home') {
        nextHomeLineup = rotateLineupClockwise(match.homeLineup);
        nextHomeRotation = getNextRotationIndex(match.homeRotation);
      } else {
        nextAwayLineup = rotateLineupClockwise(match.awayLineup);
        nextAwayRotation = getNextRotationIndex(match.awayRotation);
      }
    }

    // Check Set Completion
    const setWinner = isSetWon(newHomeScore, newAwayScore, match.currentSetIndex);
    let updatedSetScores = [...match.setScores];
    let nextSetIndex = match.currentSetIndex;
    let nextCurrentScore = { home: newHomeScore, away: newAwayScore };
    let matchFinished = match.isFinished;
    let matchWinnerId = match.matchWinnerTeamId;

    if (setWinner) {
      const finishedSet = {
        home: newHomeScore,
        away: newAwayScore,
        winnerTeamId: setWinner === 'home' ? match.homeTeam.id : match.awayTeam.id,
      };
      updatedSetScores.push(finishedSet);

      const status = getMatchStatus(updatedSetScores);
      if (status.isFinished) {
        matchFinished = true;
        matchWinnerId = status.winnerTeamId === 'home' ? match.homeTeam.id : match.awayTeam.id;
      } else {
        nextSetIndex++;
        nextCurrentScore = { home: 0, away: 0 };
      }
    }

    // Create Rally Object
    const newRally = {
      id: `rally_${Date.now()}`,
      setIndex: match.currentSetIndex,
      scoreBefore: { ...match.currentScore },
      scoreAfter: { home: newHomeScore, away: newAwayScore },
      servingTeamId: match.servingTeamId,
      winnerTeamId: winnerTeam.id,
      pointType,
      homeRotation: match.homeRotation,
      awayRotation: match.awayRotation,
      homeLineup: { ...match.homeLineup },
      awayLineup: { ...match.awayLineup },
      homeSchemeId: winner === 'home' ? activeSchemeId : undefined,
      awaySchemeId: winner === 'away' ? activeSchemeId : undefined,
      actions: actionsToCommit,
    };

    setMatch(prev => ({
      ...prev,
      currentScore: nextCurrentScore,
      currentSetIndex: nextSetIndex,
      setScores: updatedSetScores,
      servingTeamId: winnerTeam.id,
      homeRotation: nextHomeRotation,
      awayRotation: nextAwayRotation,
      homeLineup: nextHomeLineup,
      awayLineup: nextAwayLineup,
      rallies: [...prev.rallies, newRally],
      isFinished: matchFinished,
      matchWinnerTeamId: matchWinnerId,
    }));

    setCurrentRallyActions([]);
  };

  // Undo last action or last complete rally
  const handleUndo = () => {
    if (currentRallyActions.length > 0) {
      setCurrentRallyActions(prev => prev.slice(0, prev.length - 1));
      return;
    }

    if (match.rallies.length === 0) return;

    // Pop the last rally
    const lastRally = match.rallies[match.rallies.length - 1];
    const remainingRallies = match.rallies.slice(0, match.rallies.length - 1);

    // If last rally triggered set completion, revert setScores
    let revertedSetScores = [...match.setScores];
    let revertedSetIndex = match.currentSetIndex;

    if (lastRally.setIndex < match.currentSetIndex) {
      revertedSetScores.pop();
      revertedSetIndex = lastRally.setIndex;
    }

    setMatch(prev => ({
      ...prev,
      currentScore: { ...lastRally.scoreBefore },
      currentSetIndex: revertedSetIndex,
      setScores: revertedSetScores,
      servingTeamId: lastRally.servingTeamId,
      homeRotation: lastRally.homeRotation,
      awayRotation: lastRally.awayRotation,
      homeLineup: { ...lastRally.homeLineup },
      awayLineup: { ...lastRally.awayLineup },
      rallies: remainingRallies,
      isFinished: false,
      matchWinnerTeamId: undefined,
    }));
  };

  // Manual team rotation
  const handleRotateHome = () => {
    setMatch(prev => ({
      ...prev,
      homeLineup: rotateLineupClockwise(prev.homeLineup),
      homeRotation: getNextRotationIndex(prev.homeRotation),
    }));
  };

  const handleRotateAway = () => {
    setMatch(prev => ({
      ...prev,
      awayLineup: rotateLineupClockwise(prev.awayLineup),
      awayRotation: getNextRotationIndex(prev.awayRotation),
    }));
  };

  // Substitution execution
  const handlePerformSubstitution = (
    playerOut: Player,
    playerIn: Player,
    zone: CourtZone,
    isLiberoSwap: boolean
  ) => {
    const isHome = subModalConfig.team.id === match.homeTeam.id;

    const newSub: Substitution = {
      id: `sub_${Date.now()}`,
      setIndex: match.currentSetIndex,
      teamId: subModalConfig.team.id,
      playerOutId: playerOut.id,
      playerInId: playerIn.id,
      playerOutName: playerOut.name,
      playerInName: playerIn.name,
      zone,
      scoreAtSub: { ...match.currentScore },
      isLiberoSwap,
      timestamp: Date.now(),
    };

    setMatch(prev => {
      if (isHome) {
        return {
          ...prev,
          homeLineup: { ...prev.homeLineup, [zone]: playerIn.id },
          homeSubstitutions: [...prev.homeSubstitutions, newSub],
        };
      } else {
        return {
          ...prev,
          awayLineup: { ...prev.awayLineup, [zone]: playerIn.id },
          awaySubstitutions: [...prev.awaySubstitutions, newSub],
        };
      }
    });
  };

  // Start new match
  const handleStartNewMatch = (
    title: string,
    tournament: string,
    location: string,
    homeTeam: Team,
    awayTeam: Team
  ) => {
    // Generate default lineups from team starters
    const homeStarters = homeTeam.players.filter(p => p.isStarter && !p.isLibero);
    const awayStarters = awayTeam.players.filter(p => p.isStarter && !p.isLibero);

    const homeLineup: Record<CourtZone, string> = {
      1: homeStarters[0]?.id || homeTeam.players[0].id,
      2: homeStarters[1]?.id || homeTeam.players[1].id,
      3: homeStarters[2]?.id || homeTeam.players[2].id,
      4: homeStarters[3]?.id || homeTeam.players[3].id,
      5: homeStarters[4]?.id || homeTeam.players[4].id,
      6: homeStarters[5]?.id || homeTeam.players[5].id,
    };

    const awayLineup: Record<CourtZone, string> = {
      1: awayStarters[0]?.id || awayTeam.players[0].id,
      2: awayStarters[1]?.id || awayTeam.players[1].id,
      3: awayStarters[2]?.id || awayTeam.players[2].id,
      4: awayStarters[3]?.id || awayTeam.players[3].id,
      5: awayStarters[4]?.id || awayTeam.players[4].id,
      6: awayStarters[5]?.id || awayTeam.players[5].id,
    };

    const homeLib = homeTeam.players.find(p => p.isLibero);
    const awayLib = awayTeam.players.find(p => p.isLibero);

    const newMatch: Match = {
      id: `match_${Date.now()}`,
      title,
      tournament,
      date: new Date().toISOString().split('T')[0],
      location,
      homeTeam,
      awayTeam,
      currentSetIndex: 0,
      setScores: [],
      currentScore: { home: 0, away: 0 },
      servingTeamId: homeTeam.id,
      homeRotation: 1,
      awayRotation: 1,
      homeLineup,
      awayLineup,
      homeLiberoId: homeLib?.id,
      awayLiberoId: awayLib?.id,
      homeSubstitutions: [],
      awaySubstitutions: [],
      homeTimeouts: [],
      awayTimeouts: [],
      rallies: [],
      isFinished: false,
    };

    setMatch(newMatch);
    setSelectedPlayer(homeTeam.players[0]);
    setSelectedTeam(homeTeam);
    setCurrentRallyActions([]);
  };

  // Reset demo
  const handleResetDemo = () => {
    const demo = createInitialMatch();
    setMatch(demo);
    setSelectedPlayer(demo.homeTeam.players.find(p => p.number === 9));
    setSelectedTeam(demo.homeTeam);
    setCurrentRallyActions([]);
  };

  // Count subs in current set for modal
  const homeSubsCurrentSet = match.homeSubstitutions.filter(
    s => s.setIndex === match.currentSetIndex && !s.isLiberoSwap
  ).length;

  const awaySubsCurrentSet = match.awaySubstitutions.filter(
    s => s.setIndex === match.currentSetIndex && !s.isLiberoSwap
  ).length;

  const currentModalSubsCount = subModalConfig.team.id === match.homeTeam.id ? homeSubsCurrentSet : awaySubsCurrentSet;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Professional Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Match Info */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow">
              <Volleyball className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black tracking-wide text-white">VolleyScout Pro</h1>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  FIPAV / Serie A Standard
                </span>
              </div>
              <div className="text-xs text-slate-400 font-medium truncate max-w-[280px] sm:max-w-md">
                {match.title} · {match.location}
              </div>
            </div>
          </div>

          {/* Live Score Banner */}
          <div className="flex items-center gap-3 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800">
            {/* Home Score */}
            <div className="flex items-center gap-2 text-right">
              <span className="font-extrabold text-sm text-white">{match.homeTeam.shortName}</span>
              <span className="text-xl font-black text-red-400 font-mono">{match.currentScore.home}</span>
            </div>

            <div className="flex flex-col items-center px-1">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                Set {match.currentSetIndex + 1}
              </span>
              <div className="text-[10px] text-slate-400 font-mono">
                {match.setScores.map(s => `${s.home}-${s.away}`).join(', ') || '0-0'}
              </div>
            </div>

            {/* Away Score */}
            <div className="flex items-center gap-2 text-left">
              <span className="text-xl font-black text-sky-400 font-mono">{match.currentScore.away}</span>
              <span className="font-extrabold text-sm text-white">{match.awayTeam.shortName}</span>
            </div>
          </div>

          {/* Settings Button */}
          <button
            onClick={() => setSettingsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
            title="Impostazioni Partita & Backup"
          >
            <Settings className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Gara</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 border-t border-slate-800/80 overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('live')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'live'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Rilevamento Live (Campo)</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'stats'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Statistiche & Box Score</span>
          </button>

          <button
            onClick={() => setActiveTab('tactics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'tactics'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Schemi Tattici & Rotazioni</span>
          </button>

          <button
            onClick={() => setActiveTab('teams')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'teams'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Squadre & Roster</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* TAB 1: LIVE MATCH SCOUTING */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            {/* Quick Action Bar for Substitutions & Timeouts */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl shadow-md">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Controllo Panchina:
                </span>
                <button
                  onClick={() =>
                    setSubModalConfig({
                      isOpen: true,
                      team: match.homeTeam,
                      zone: 4,
                    })
                  }
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-red-950/60 hover:bg-red-900/60 text-red-200 border border-red-800/80 rounded text-xs font-bold transition-colors"
                >
                  <ArrowLeftRight className="w-3 h-3 text-red-400" />
                  <span>Sostituzioni {match.homeTeam.shortName} ({homeSubsCurrentSet}/6)</span>
                </button>
                <button
                  onClick={() =>
                    setSubModalConfig({
                      isOpen: true,
                      team: match.awayTeam,
                      zone: 4,
                    })
                  }
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-sky-950/60 hover:bg-sky-900/60 text-sky-200 border border-sky-800/80 rounded text-xs font-bold transition-colors"
                >
                  <ArrowLeftRight className="w-3 h-3 text-sky-400" />
                  <span>Sostituzioni {match.awayTeam.shortName} ({awaySubsCurrentSet}/6)</span>
                </button>
              </div>

              {/* Rallies Log Count */}
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <History className="w-3.5 h-3.5 text-cyan-400" />
                <span>{match.rallies.length} Scambi Registrati</span>
              </div>
            </div>

            {/* Interactive Court Component */}
            <CourtView
              homeTeam={match.homeTeam}
              awayTeam={match.awayTeam}
              homeLineup={match.homeLineup}
              awayLineup={match.awayLineup}
              servingTeamId={match.servingTeamId}
              homeRotation={match.homeRotation}
              awayRotation={match.awayRotation}
              selectedPlayerId={selectedPlayer?.id}
              onSelectPlayer={handleSelectPlayer}
              onRotateHome={handleRotateHome}
              onRotateAway={handleRotateAway}
              onOpenSubstitution={(team, zone) =>
                setSubModalConfig({ isOpen: true, team, zone })
              }
              homeLiberoId={match.homeLiberoId}
              awayLiberoId={match.awayLiberoId}
            />

            {/* Fast Scouting Keypad */}
            <ScoutKeypad
              homeTeam={match.homeTeam}
              awayTeam={match.awayTeam}
              selectedPlayer={selectedPlayer}
              selectedTeam={selectedTeam}
              tacticalSchemes={tacticalSchemes}
              activeSchemeId={activeSchemeId}
              onSelectScheme={setActiveSchemeId}
              onAddAction={handleAddAction}
              onAwardPoint={handleAwardPoint}
              onUndoLastAction={handleUndo}
              currentRallyActions={currentRallyActions}
              canUndo={currentRallyActions.length > 0 || match.rallies.length > 0}
              onSelectPlayer={handleSelectPlayer}
              homeLineup={match.homeLineup}
              awayLineup={match.awayLineup}
              homeLiberoId={match.homeLiberoId}
              awayLiberoId={match.awayLiberoId}
            />
          </div>
        )}

        {/* TAB 2: POST-MATCH & LIVE ADVANCED STATISTICS */}
        {activeTab === 'stats' && (
          <StatisticsView match={match} tacticalSchemes={tacticalSchemes} />
        )}

        {/* TAB 3: TACTICAL SCHEMES & ROTATION BOARD */}
        {activeTab === 'tactics' && (
          <RotationTacticalBoard
            team={match.homeTeam}
            tacticalSchemes={tacticalSchemes}
            onAddScheme={(newScheme) => {
              const fullScheme: TacticalScheme = {
                ...newScheme,
                id: `scheme_${Date.now()}`,
              };
              setTacticalSchemes(prev => [...prev, fullScheme]);
            }}
          />
        )}

        {/* TAB 4: TEAMS & PLAYERS MANAGEMENT */}
        {activeTab === 'teams' && (
          <TeamsManagement
            teams={teams}
            onUpdateTeam={(updated) => {
              setTeams(prev => prev.map(t => (t.id === updated.id ? updated : t)));
              if (match.homeTeam.id === updated.id) {
                setMatch(m => ({ ...m, homeTeam: updated }));
              }
              if (match.awayTeam.id === updated.id) {
                setMatch(m => ({ ...m, awayTeam: updated }));
              }
            }}
            onAddTeam={(newTeam) => setTeams(prev => [...prev, newTeam])}
            onDeleteTeam={(teamId) => {
              if (teams.length <= 2) {
                alert('Devono rimanere almeno 2 squadre nel database!');
                return;
              }
              setTeams(prev => prev.filter(t => t.id !== teamId));
            }}
          />
        )}
      </main>

      {/* Substitution Modal */}
      <SubstitutionModal
        isOpen={subModalConfig.isOpen}
        onClose={() => setSubModalConfig(prev => ({ ...prev, isOpen: false }))}
        team={subModalConfig.team}
        currentSetIndex={match.currentSetIndex}
        currentScore={match.currentScore}
        lineup={
          subModalConfig.team.id === match.homeTeam.id
            ? match.homeLineup
            : match.awayLineup
        }
        defaultZone={subModalConfig.zone}
        substitutionsCountThisSet={currentModalSubsCount}
        liberoId={
          subModalConfig.team.id === match.homeTeam.id
            ? match.homeLiberoId
            : match.awayLiberoId
        }
        onPerformSubstitution={handlePerformSubstitution}
      />

      {/* Match Settings Modal */}
      <MatchSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        teams={teams}
        currentMatch={match}
        onStartNewMatch={handleStartNewMatch}
        onResetMatchToDemo={handleResetDemo}
        onImportMatch={(imported) => setMatch(imported)}
      />
    </div>
  );
}
