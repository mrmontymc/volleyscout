import { CourtZone, Match, Player, TacticalScheme, Team } from '../types/volleyball';

export const DEFAULT_TACTICAL_SCHEMES: TacticalScheme[] = [
  {
    id: 'scheme_1',
    code: '1',
    name: 'Primo Tempo Centro (1)',
    category: 'attacco',
    targetZone: 3,
    tempo: '1_tempo',
    description: 'Attacco fulmineo del centrale vicino al palleggiatore in posto 3'
  },
  {
    id: 'scheme_7',
    code: '7',
    name: 'Sette Dietro (7)',
    category: 'attacco',
    targetZone: 3,
    tempo: '1_tempo',
    description: 'Primo tempo teso alle spalle del palleggiatore tra posto 3 e 2'
  },
  {
    id: 'scheme_c',
    code: 'C',
    name: 'Mezza al Centro (C)',
    category: 'attacco',
    targetZone: 3,
    tempo: '2_tempo',
    description: 'Palla flottante a mezza altezza per attacco d\'anticipo'
  },
  {
    id: 'scheme_fast',
    code: 'FAST',
    name: 'Fast a un piede',
    category: 'attacco',
    targetZone: 'FAST',
    tempo: '1_tempo',
    description: 'Centrale/Banda in rincorsa verso l\'antenna di posto 2 con stacco monofolico'
  },
  {
    id: 'scheme_pipe',
    code: 'PIPE',
    name: 'Pipe Posto 6 (P)',
    category: 'attacco',
    targetZone: 'PIPE',
    tempo: '2_tempo',
    description: 'Attacco teso dalla seconda linea in zona 6 dietro al centrale'
  },
  {
    id: 'scheme_super',
    code: 'SUPER',
    name: 'Super in Posto 4',
    category: 'attacco',
    targetZone: 4,
    tempo: '1_tempo',
    description: 'Palla rapidissima e radente all\'asta per lo schiacciatore di banda'
  },
  {
    id: 'scheme_mezza2',
    code: 'MEZZA2',
    name: 'Mezza in Posto 2',
    category: 'attacco',
    targetZone: 2,
    tempo: '2_tempo',
    description: 'Alzata dietro per l\'opposto su palla d\'anticipo'
  },
  {
    id: 'scheme_alta',
    code: 'ALTA',
    name: 'Palla Alta Ricostruzione',
    category: 'attacco',
    targetZone: 4,
    tempo: 'palla_alta',
    description: 'Palla alta di sicurezza all\'antenna su ricezione staccata'
  }
];

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'team_perugia',
    name: 'Sir Safety Perugia',
    shortName: 'PG',
    primaryColor: '#DC2626', // Red
    secondaryColor: '#1E293B',
    coach: 'Angelo Lorenzetti',
    players: [
      { id: 'p_pg_6', number: 6, name: 'Simone Giannelli', role: 'Palleggiatore', isCaptain: true, isStarter: true, heightCm: 199, dominantHand: 'Destro' },
      { id: 'p_pg_9', number: 9, name: 'Wilfredo Leon', role: 'Schiacciatore', isStarter: true, heightCm: 202, dominantHand: 'Destro' },
      { id: 'p_pg_16', number: 16, name: 'Kamil Semeniuk', role: 'Schiacciatore', isStarter: true, heightCm: 194, dominantHand: 'Destro' },
      { id: 'p_pg_19', number: 19, name: 'Roberto Russo', role: 'Centrale', isStarter: true, heightCm: 205, dominantHand: 'Destro' },
      { id: 'p_pg_11', number: 11, name: 'Sebastian Solé', role: 'Centrale', isStarter: true, heightCm: 200, dominantHand: 'Destro' },
      { id: 'p_pg_8', number: 8, name: 'Jesus Herrera', role: 'Opposto', isStarter: true, heightCm: 196, dominantHand: 'Mancino' },
      { id: 'p_pg_13', number: 13, name: 'Massimo Colaci', role: 'Libero', isLibero: true, isStarter: true, heightCm: 180, dominantHand: 'Destro' },
      { id: 'p_pg_17', number: 17, name: 'Oleh Plotnytskyi', role: 'Schiacciatore', isStarter: false, heightCm: 195, dominantHand: 'Mancino' },
      { id: 'p_pg_12', number: 12, name: 'Flavio Resende', role: 'Centrale', isStarter: false, heightCm: 200, dominantHand: 'Destro' },
      { id: 'p_pg_7', number: 7, name: 'Tim Held', role: 'Schiacciatore', isStarter: false, heightCm: 195, dominantHand: 'Destro' },
    ]
  },
  {
    id: 'team_trentino',
    name: 'Itas Trentino',
    shortName: 'TN',
    primaryColor: '#0284C7', // Blue
    secondaryColor: '#EAB308', // Yellow
    coach: 'Fabio Soli',
    players: [
      { id: 'p_tn_6', number: 6, name: 'Riccardo Sbertoli', role: 'Palleggiatore', isStarter: true, heightCm: 188, dominantHand: 'Destro' },
      { id: 'p_tn_5', number: 5, name: 'Alessandro Michieletto', role: 'Schiacciatore', isCaptain: true, isStarter: true, heightCm: 211, dominantHand: 'Mancino' },
      { id: 'p_tn_15', number: 15, name: 'Daniele Lavia', role: 'Schiacciatore', isStarter: true, heightCm: 198, dominantHand: 'Destro' },
      { id: 'p_tn_18', number: 18, name: 'Marko Podrascanin', role: 'Centrale', isStarter: true, heightCm: 204, dominantHand: 'Destro' },
      { id: 'p_tn_8', number: 8, name: 'Jan Kozamernik', role: 'Centrale', isStarter: true, heightCm: 204, dominantHand: 'Destro' },
      { id: 'p_tn_11', number: 11, name: 'Kamil Rychlicki', role: 'Opposto', isStarter: true, heightCm: 204, dominantHand: 'Destro' },
      { id: 'p_tn_13', number: 13, name: 'Gabriele Laurenzano', role: 'Libero', isLibero: true, isStarter: true, heightCm: 176, dominantHand: 'Destro' },
      { id: 'p_tn_4', number: 4, name: 'Oreste Cavuto', role: 'Schiacciatore', isStarter: false, heightCm: 196, dominantHand: 'Destro' },
      { id: 'p_tn_3', number: 3, name: 'Alessandro Acquarone', role: 'Palleggiatore', isStarter: false, heightCm: 184, dominantHand: 'Destro' },
      { id: 'p_tn_10', number: 10, name: 'Martin Berger', role: 'Centrale', isStarter: false, heightCm: 205, dominantHand: 'Destro' },
    ]
  },
  {
    id: 'team_civitanova',
    name: 'Cucine Lube Civitanova',
    shortName: 'LUBE',
    primaryColor: '#B91C1C',
    secondaryColor: '#FFFFFF',
    coach: 'Giampaolo Medei',
    players: [
      { id: 'p_lube_15', number: 15, name: 'Luciano De Cecco', role: 'Palleggiatore', isCaptain: true, isStarter: true, heightCm: 194, dominantHand: 'Destro' },
      { id: 'p_lube_17', number: 17, name: 'Marlon Yant', role: 'Schiacciatore', isStarter: true, heightCm: 204, dominantHand: 'Destro' },
      { id: 'p_lube_11', number: 11, name: 'Aleksandar Nikolov', role: 'Schiacciatore', isStarter: true, heightCm: 206, dominantHand: 'Destro' },
      { id: 'p_lube_1', number: 1, name: 'Barthélémy Chinenyeze', role: 'Centrale', isStarter: true, heightCm: 201, dominantHand: 'Destro' },
      { id: 'p_lube_13', number: 13, name: 'Simone Anzani', role: 'Centrale', isStarter: true, heightCm: 204, dominantHand: 'Destro' },
      { id: 'p_lube_10', number: 10, name: 'Adis Lagumdzija', role: 'Opposto', isStarter: true, heightCm: 211, dominantHand: 'Destro' },
      { id: 'p_lube_7', number: 7, name: 'Fabio Balaso', role: 'Libero', isLibero: true, isStarter: true, heightCm: 178, dominantHand: 'Destro' },
    ]
  }
];

export function createInitialMatch(): Match {
  const homeTeam = INITIAL_TEAMS[0]; // Perugia
  const awayTeam = INITIAL_TEAMS[1]; // Trentino

  // Standard starting rotation setup:
  // Zone 1: Setter (Palleggiatore)
  // Zone 2: Opposite (Opposto)
  // Zone 3: Middle Blocker 1 (Centrale)
  // Zone 4: Outside Hitter 1 (Schiacciatore)
  // Zone 5: Outside Hitter 2 (Schiacciatore)
  // Zone 6: Middle Blocker 2 / Libero (Centrale)
  const homeLineup: Record<CourtZone, string> = {
    1: 'p_pg_6',  // Giannelli (P)
    2: 'p_pg_8',  // Herrera (O)
    3: 'p_pg_19', // Russo (C)
    4: 'p_pg_9',  // Leon (S)
    5: 'p_pg_16', // Semeniuk (S)
    6: 'p_pg_11', // Solé (C)
  };

  const awayLineup: Record<CourtZone, string> = {
    1: 'p_tn_6',  // Sbertoli (P)
    2: 'p_tn_11', // Rychlicki (O)
    3: 'p_tn_18', // Podrascanin (C)
    4: 'p_tn_5',  // Michieletto (S)
    5: 'p_tn_15', // Lavia (S)
    6: 'p_tn_8',  // Kozamernik (C)
  };

  // Seed sample rallies for realistic statistics visualization right out of the box
  const rallies = generateSampleRallies(homeTeam, awayTeam, homeLineup, awayLineup);

  return {
    id: 'match_superlega_final',
    title: 'SuperLega Credem Banca - Gara 5 Playoff',
    tournament: 'SuperLega FIPAV',
    date: '2026-10-21',
    location: 'PalaBarton, Perugia',
    homeTeam,
    awayTeam,
    currentSetIndex: 2, // Set 3 in corso
    setScores: [
      { home: 25, away: 23, winnerTeamId: homeTeam.id, durationMinutes: 28 },
      { home: 22, away: 25, winnerTeamId: awayTeam.id, durationMinutes: 31 },
    ],
    currentScore: { home: 18, away: 16 },
    servingTeamId: homeTeam.id,
    homeRotation: 2, // P2
    awayRotation: 4, // P4
    homeLineup,
    awayLineup,
    homeLiberoId: 'p_pg_13',
    awayLiberoId: 'p_tn_13',
    homeSubstitutions: [
      {
        id: 'sub_1',
        setIndex: 1,
        teamId: homeTeam.id,
        playerOutId: 'p_pg_16',
        playerInId: 'p_pg_17',
        playerOutName: 'Kamil Semeniuk',
        playerInName: 'Oleh Plotnytskyi',
        zone: 5,
        scoreAtSub: { home: 14, away: 17 },
        timestamp: Date.now() - 3600000,
      }
    ],
    awaySubstitutions: [],
    homeTimeouts: [1],
    awayTimeouts: [1],
    activeSchemeId: 'scheme_super',
    rallies,
    isFinished: false,
  };
}

function generateSampleRallies(
  homeTeam: Team,
  awayTeam: Team,
  homeLineup: Record<CourtZone, string>,
  awayLineup: Record<CourtZone, string>
) {
  const rallies: any[] = [];
  const homePlayers = homeTeam.players;
  const awayPlayers = awayTeam.players;

  const giannelli = homePlayers.find(p => p.number === 6)!;
  const leon = homePlayers.find(p => p.number === 9)!;
  const semeniuk = homePlayers.find(p => p.number === 16)!;
  const russo = homePlayers.find(p => p.number === 19)!;
  const herrera = homePlayers.find(p => p.number === 8)!;
  const colaci = homePlayers.find(p => p.number === 13)!;

  const sbertoli = awayPlayers.find(p => p.number === 6)!;
  const michieletto = awayPlayers.find(p => p.number === 5)!;
  const lavia = awayPlayers.find(p => p.number === 15)!;
  const podrascanin = awayPlayers.find(p => p.number === 18)!;
  const rychlicki = awayPlayers.find(p => p.number === 11)!;
  const laurenzano = awayPlayers.find(p => p.number === 13)!;

  // Let's create realistic rallies spread across sets and rotations
  // 1. Ace Leon
  rallies.push({
    id: 'r_1',
    setIndex: 0,
    scoreBefore: { home: 0, away: 0 },
    scoreAfter: { home: 1, away: 0 },
    servingTeamId: homeTeam.id,
    winnerTeamId: homeTeam.id,
    pointType: 'ace',
    homeRotation: 1,
    awayRotation: 1,
    homeLineup,
    awayLineup,
    actions: [
      {
        id: 'act_1_1',
        type: 'battuta',
        quality: 'ace',
        playerId: leon.id,
        playerName: leon.name,
        playerNumber: leon.number,
        playerRole: leon.role,
        teamId: homeTeam.id,
        timestamp: Date.now() - 7200000,
        zone: 5,
        isPoint: true,
      },
      {
        id: 'act_1_2',
        type: 'ricezione',
        quality: 'errore',
        playerId: laurenzano.id,
        playerName: laurenzano.name,
        playerNumber: laurenzano.number,
        playerRole: laurenzano.role,
        teamId: awayTeam.id,
        timestamp: Date.now() - 7200000,
        zone: 5,
        isError: true,
      }
    ]
  });

  // 2. Side-out Michieletto attack
  rallies.push({
    id: 'r_2',
    setIndex: 0,
    scoreBefore: { home: 1, away: 0 },
    scoreAfter: { home: 1, away: 1 },
    servingTeamId: homeTeam.id,
    winnerTeamId: awayTeam.id,
    pointType: 'sideout',
    homeRotation: 1,
    awayRotation: 1,
    homeLineup,
    awayLineup,
    actions: [
      {
        id: 'act_2_1',
        type: 'battuta',
        quality: 'continua',
        playerId: leon.id,
        playerName: leon.name,
        playerNumber: leon.number,
        playerRole: leon.role,
        teamId: homeTeam.id,
        timestamp: Date.now() - 7100000,
      },
      {
        id: 'act_2_2',
        type: 'ricezione',
        quality: 'doppio_piu',
        playerId: lavia.id,
        playerName: lavia.name,
        playerNumber: lavia.number,
        playerRole: lavia.role,
        teamId: awayTeam.id,
        timestamp: Date.now() - 7100000,
      },
      {
        id: 'act_2_3',
        type: 'attacco',
        quality: 'punto',
        playerId: michieletto.id,
        playerName: michieletto.name,
        playerNumber: michieletto.number,
        playerRole: michieletto.role,
        teamId: awayTeam.id,
        zone: 4,
        schemeCode: 'SUPER',
        timestamp: Date.now() - 7100000,
        isPoint: true,
      }
    ]
  });

  // 3. Russo Kill Block
  rallies.push({
    id: 'r_3',
    setIndex: 0,
    scoreBefore: { home: 1, away: 1 },
    scoreAfter: { home: 2, away: 1 },
    servingTeamId: awayTeam.id,
    winnerTeamId: homeTeam.id,
    pointType: 'sideout',
    homeRotation: 2,
    awayRotation: 1,
    homeLineup,
    awayLineup,
    actions: [
      {
        id: 'act_3_1',
        type: 'battuta',
        quality: 'continua',
        playerId: sbertoli.id,
        playerName: sbertoli.name,
        playerNumber: sbertoli.number,
        playerRole: sbertoli.role,
        teamId: awayTeam.id,
        timestamp: Date.now() - 7000000,
      },
      {
        id: 'act_3_2',
        type: 'attacco',
        quality: 'murato',
        playerId: rychlicki.id,
        playerName: rychlicki.name,
        playerNumber: rychlicki.number,
        playerRole: rychlicki.role,
        teamId: awayTeam.id,
        timestamp: Date.now() - 7000000,
        zone: 2,
      },
      {
        id: 'act_3_3',
        type: 'muro',
        quality: 'punto',
        playerId: russo.id,
        playerName: russo.name,
        playerNumber: russo.number,
        playerRole: russo.role,
        teamId: homeTeam.id,
        timestamp: Date.now() - 7000000,
        zone: 3,
        isPoint: true,
      }
    ]
  });

  // 4. Semeniuk Pipe
  rallies.push({
    id: 'r_4',
    setIndex: 0,
    scoreBefore: { home: 2, away: 1 },
    scoreAfter: { home: 3, away: 1 },
    servingTeamId: homeTeam.id,
    winnerTeamId: homeTeam.id,
    pointType: 'break',
    homeRotation: 2,
    awayRotation: 2,
    homeLineup,
    awayLineup,
    homeSchemeId: 'scheme_pipe',
    actions: [
      {
        id: 'act_4_1',
        type: 'battuta',
        quality: 'positiva',
        playerId: giannelli.id,
        playerName: giannelli.name,
        playerNumber: giannelli.number,
        playerRole: giannelli.role,
        teamId: homeTeam.id,
        timestamp: Date.now() - 6900000,
      },
      {
        id: 'act_4_2',
        type: 'attacco',
        quality: 'punto',
        playerId: semeniuk.id,
        playerName: semeniuk.name,
        playerNumber: semeniuk.number,
        playerRole: semeniuk.role,
        teamId: homeTeam.id,
        zone: 6,
        schemeCode: 'PIPE',
        timestamp: Date.now() - 6900000,
        isPoint: true,
      }
    ]
  });

  // 5. Herrera Opposto Attack Kill
  rallies.push({
    id: 'r_5',
    setIndex: 0,
    scoreBefore: { home: 3, away: 1 },
    scoreAfter: { home: 4, away: 1 },
    servingTeamId: homeTeam.id,
    winnerTeamId: homeTeam.id,
    pointType: 'break',
    homeRotation: 2,
    awayRotation: 2,
    homeLineup,
    awayLineup,
    actions: [
      {
        id: 'act_5_1',
        type: 'attacco',
        quality: 'punto',
        playerId: herrera.id,
        playerName: herrera.name,
        playerNumber: herrera.number,
        playerRole: herrera.role,
        teamId: homeTeam.id,
        zone: 2,
        schemeCode: 'MEZZA2',
        timestamp: Date.now() - 6800000,
        isPoint: true,
      }
    ]
  });

  // Additional rallies for diverse rotations P1..P6 and set 1, 2, 3
  const extraScenarios = [
    { pHome: leon, pAway: michieletto, type: 'attacco', qual: 'punto', zone: 4, scheme: 'SUPER', set: 0, rotH: 3, rotA: 2, win: 'home' },
    { pHome: russo, pAway: podrascanin, type: 'attacco', qual: 'punto', zone: 3, scheme: '1', set: 0, rotH: 4, rotA: 3, win: 'home' },
    { pHome: leon, pAway: lavia, type: 'ricezione', qual: 'doppio_piu', zone: 5, scheme: '', set: 0, rotH: 4, rotA: 3, win: 'away' },
    { pHome: giannelli, pAway: rychlicki, type: 'muro', qual: 'punto', zone: 2, scheme: '', set: 0, rotH: 5, rotA: 4, win: 'home' },
    { pHome: herrera, pAway: michieletto, type: 'attacco', qual: 'errore', zone: 2, scheme: 'MEZZA2', set: 1, rotH: 1, rotA: 5, win: 'away' },
    { pHome: leon, pAway: lavia, type: 'attacco', qual: 'punto', zone: 4, scheme: 'SUPER', set: 1, rotH: 2, rotA: 6, win: 'away' },
    { pHome: semeniuk, pAway: michieletto, type: 'battuta', qual: 'ace', zone: 1, scheme: '', set: 1, rotH: 3, rotA: 1, win: 'home' },
    { pHome: russo, pAway: podrascanin, type: 'attacco', qual: 'punto', zone: 3, scheme: '7', set: 2, rotH: 1, rotA: 4, win: 'home' },
    { pHome: leon, pAway: michieletto, type: 'attacco', qual: 'mani_fuori', zone: 4, scheme: 'SUPER', set: 2, rotH: 2, rotA: 4, win: 'home' },
    { pHome: semeniuk, pAway: rychlicki, type: 'attacco', qual: 'punto', zone: 6, scheme: 'PIPE', set: 2, rotH: 2, rotA: 4, win: 'home' },
  ];

  extraScenarios.forEach((sc, i) => {
    rallies.push({
      id: `r_extra_${i}`,
      setIndex: sc.set,
      scoreBefore: { home: 10 + i, away: 10 + Math.floor(i * 0.8) },
      scoreAfter: { home: sc.win === 'home' ? 11 + i : 10 + i, away: sc.win === 'away' ? 11 + Math.floor(i * 0.8) : 10 + Math.floor(i * 0.8) },
      servingTeamId: sc.win === 'home' ? homeTeam.id : awayTeam.id,
      winnerTeamId: sc.win === 'home' ? homeTeam.id : awayTeam.id,
      pointType: sc.win === 'home' ? 'attack' : 'sideout',
      homeRotation: sc.rotH,
      awayRotation: sc.rotA,
      homeLineup,
      awayLineup,
      actions: [
        {
          id: `act_ex_${i}_1`,
          type: sc.type,
          quality: sc.qual,
          playerId: sc.win === 'home' ? sc.pHome.id : sc.pAway.id,
          playerName: sc.win === 'home' ? sc.pHome.name : sc.pAway.name,
          playerNumber: sc.win === 'home' ? sc.pHome.number : sc.pAway.number,
          playerRole: sc.win === 'home' ? sc.pHome.role : sc.pAway.role,
          teamId: sc.win === 'home' ? homeTeam.id : awayTeam.id,
          zone: sc.zone,
          schemeCode: sc.scheme,
          timestamp: Date.now() - (5000000 - i * 100000),
          isPoint: true,
        }
      ]
    });
  });

  return rallies;
}
