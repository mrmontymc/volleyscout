export type PlayerRole = 'Palleggiatore' | 'Schiacciatore' | 'Centrale' | 'Opposto' | 'Libero';

export interface Player {
  id: string;
  number: number;
  name: string;
  role: PlayerRole;
  isCaptain?: boolean;
  isLibero?: boolean;
  isStarter?: boolean;
  heightCm?: number;
  dominantHand?: 'Destro' | 'Mancino';
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  coach: string;
  players: Player[];
}

export type CourtZone = 1 | 2 | 3 | 4 | 5 | 6;

export interface TacticalScheme {
  id: string;
  code: string;
  name: string;
  category: 'attacco' | 'difesa';
  targetZone: CourtZone | 'PIPE' | 'FAST';
  tempo: '1_tempo' | '2_tempo' | '3_tempo' | 'palla_alta';
  description: string;
}

export type FundamentalType = 'battuta' | 'ricezione' | 'alzata' | 'attacco' | 'muro' | 'difesa' | 'fallo';

export type QualityCode = 
  | 'ace'           // # Battuta vincente
  | 'punto'         // # Attacco / Muro vincente
  | 'mani_fuori'    // # Attacco mani-fuori vincente
  | 'doppio_piu'    // ## Ricezione perfetta
  | 'positiva'      // + Positiva / In gioco ottimale
  | 'continua'      // / Neutra / Giocabile
  | 'negativa'      // - Ricezione / Difesa staccata
  | 'slash'         // ! Slash / palla regalata a filo rete
  | 'murato'        // / Attacco murato
  | 'errore'        // = Errore diretto
  | 'invasione';    // = Fallo a rete

export interface FundamentalAction {
  id: string;
  type: FundamentalType;
  quality: QualityCode;
  playerId: string;
  playerName: string;
  playerNumber: number;
  playerRole: PlayerRole;
  teamId: string;
  timestamp: number;
  zone?: CourtZone;
  schemeId?: string;
  schemeCode?: string;
  isPoint?: boolean;
  isError?: boolean;
  notes?: string;
}

export interface Rally {
  id: string;
  setIndex: number;
  scoreBefore: { home: number; away: number };
  scoreAfter: { home: number; away: number };
  servingTeamId: string;
  winnerTeamId: string;
  pointType: 'sideout' | 'break' | 'ace' | 'block' | 'attack' | 'opponent_error';
  homeRotation: number; // 1-6 (P1 - P6)
  awayRotation: number;
  homeLineup: Record<CourtZone, string>; // zone 1-6 -> playerId
  awayLineup: Record<CourtZone, string>;
  homeSchemeId?: string;
  awaySchemeId?: string;
  actions: FundamentalAction[];
  durationSeconds?: number;
}

export interface Substitution {
  id: string;
  setIndex: number;
  teamId: string;
  playerOutId: string;
  playerInId: string;
  playerOutName: string;
  playerInName: string;
  zone: CourtZone;
  scoreAtSub: { home: number; away: number };
  isLiberoSwap?: boolean;
  timestamp: number;
}

export interface SetScore {
  home: number;
  away: number;
  winnerTeamId?: string;
  durationMinutes?: number;
}

export interface Match {
  id: string;
  title: string;
  tournament: string;
  date: string;
  location: string;
  homeTeam: Team;
  awayTeam: Team;
  currentSetIndex: number; // 0..4
  setScores: SetScore[];
  currentScore: { home: number; away: number };
  servingTeamId: string;
  homeRotation: number; // 1 to 6 (corresponds to P1..P6)
  awayRotation: number;
  homeLineup: Record<CourtZone, string>; // zone 1-6 -> playerId
  awayLineup: Record<CourtZone, string>;
  homeLiberoId?: string;
  awayLiberoId?: string;
  homeSubstitutions: Substitution[];
  awaySubstitutions: Substitution[];
  homeTimeouts: number[]; // e.g. [1, 2] per set
  awayTimeouts: number[];
  activeSchemeId?: string;
  rallies: Rally[];
  isFinished: boolean;
  matchWinnerTeamId?: string;
}

export interface PlayerStatsSummary {
  playerId: string;
  number: number;
  name: string;
  role: PlayerRole;
  teamId: string;
  setsPlayed: number;
  totalPoints: number;
  breakPoints: number;
  plusMinus: number;
  
  // Battuta
  servesTotal: number;
  servesAces: number;
  servesErrors: number;
  servesInPlay: number;
  acePercentage: number;
  
  // Ricezione
  receptionsTotal: number;
  receptionsErrors: number;
  receptionsNegative: number;
  receptionsPositive: number;
  receptionsPerfect: number;
  receptionPositivePct: number;
  receptionPerfectPct: number;
  
  // Attacco
  attacksTotal: number;
  attacksKills: number;
  attacksErrors: number;
  attacksBlocked: number;
  attackEfficiency: number; // (Kills - Errors - Blocked) / Total
  attackKillPct: number;
  
  // Muro
  blocksTotal: number;
  blockPoints: number;
  blockTouches: number;
  
  // Difesa
  defenseTotal: number;
  defensePerfect: number;
  
  // Errori
  totalErrors: number;
}

export interface TeamRotationStats {
  rotation: number; // 1 to 6 (P1..P6)
  receptionsTotal: number;
  sideoutsWon: number;
  sideoutPct: number;
  servesTotal: number;
  breakPointsWon: number;
  breakPointPct: number;
  pointsScored: number;
  pointsConceded: number;
}

export interface ZoneAttackStats {
  zone: CourtZone | 'PIPE';
  total: number;
  kills: number;
  errors: number;
  blocked: number;
  killPct: number;
  efficiency: number;
}
