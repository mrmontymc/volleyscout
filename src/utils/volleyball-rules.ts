import {
  CourtZone,
  Match,
  Player,
  PlayerStatsSummary,
  Rally,
  SetScore,
  TacticalScheme,
  TeamRotationStats,
  ZoneAttackStats
} from '../types/volleyball';

/**
 * Standard volleyball clockwise rotation:
 * Zone 1 moves to Zone 6
 * Zone 6 moves to Zone 5
 * Zone 5 moves to Zone 4
 * Zone 4 moves to Zone 3
 * Zone 3 moves to Zone 2
 * Zone 2 moves to Zone 1
 */
export function rotateLineupClockwise(lineup: Record<CourtZone, string>): Record<CourtZone, string> {
  return {
    1: lineup[2],
    6: lineup[1],
    5: lineup[6],
    4: lineup[5],
    3: lineup[4],
    2: lineup[3],
  };
}

/**
 * Counter-clockwise rotation (e.g. for undoing an erroneous rotation)
 */
export function rotateLineupCounterClockwise(lineup: Record<CourtZone, string>): Record<CourtZone, string> {
  return {
    2: lineup[1],
    3: lineup[2],
    4: lineup[3],
    5: lineup[4],
    6: lineup[5],
    1: lineup[6],
  };
}

/**
 * Calculates next rotation label index (1 to 6)
 * When rotating clockwise, the rotation cycle is 1 -> 6 -> 5 -> 4 -> 3 -> 2 -> 1
 */
export function getNextRotationIndex(currentRot: number): number {
  const map: Record<number, number> = { 1: 6, 6: 5, 5: 4, 4: 3, 3: 2, 2: 1 };
  return map[currentRot] || 1;
}

export function getPreviousRotationIndex(currentRot: number): number {
  const map: Record<number, number> = { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 1 };
  return map[currentRot] || 1;
}

/**
 * Checks if a volleyball set is won according to FIVB rules:
 * Sets 1-4: first to 25 with minimum 2 points lead.
 * Set 5 (Tie-break): first to 15 with minimum 2 points lead.
 */
export function isSetWon(homeScore: number, awayScore: number, setIndex: number): 'home' | 'away' | null {
  const targetScore = setIndex === 4 ? 15 : 25;
  const maxScore = Math.max(homeScore, awayScore);
  const diff = Math.abs(homeScore - awayScore);

  if (maxScore >= targetScore && diff >= 2) {
    return homeScore > awayScore ? 'home' : 'away';
  }
  return null;
}

/**
 * Checks if a match is finished (best of 5 sets: first to 3 sets won)
 */
export function getMatchStatus(setScores: SetScore[]): {
  isFinished: boolean;
  homeSetsWon: number;
  awaySetsWon: number;
  winnerTeamId?: 'home' | 'away';
} {
  let homeSetsWon = 0;
  let awaySetsWon = 0;

  for (const s of setScores) {
    if (s.home > s.away && (s.home >= 25 || (setScores.indexOf(s) === 4 && s.home >= 15)) && s.home - s.away >= 2) {
      homeSetsWon++;
    } else if (s.away > s.home && (s.away >= 25 || (setScores.indexOf(s) === 4 && s.away >= 15)) && s.away - s.home >= 2) {
      awaySetsWon++;
    }
  }

  const isFinished = homeSetsWon >= 3 || awaySetsWon >= 3;
  return {
    isFinished,
    homeSetsWon,
    awaySetsWon,
    winnerTeamId: isFinished ? (homeSetsWon >= 3 ? 'home' : 'away') : undefined,
  };
}

/**
 * Calculates attack efficiency formula:
 * (Punti - Errori Diretti - Murati Subiti) / Totale Attacchi * 100
 */
export function calculateAttackEfficiency(kills: number, errors: number, blocked: number, total: number): number {
  if (total <= 0) return 0;
  const eff = ((kills - errors - blocked) / total) * 100;
  return Math.round(eff * 10) / 10;
}

/**
 * Calculates comprehensive player statistics from all rallies
 */
export function computePlayerStats(player: Player, teamId: string, rallies: Rally[], totalSets: number): PlayerStatsSummary {
  const stats: PlayerStatsSummary = {
    playerId: player.id,
    number: player.number,
    name: player.name,
    role: player.role,
    teamId,
    setsPlayed: totalSets || 1,
    totalPoints: 0,
    breakPoints: 0,
    plusMinus: 0,
    servesTotal: 0,
    servesAces: 0,
    servesErrors: 0,
    servesInPlay: 0,
    acePercentage: 0,
    receptionsTotal: 0,
    receptionsErrors: 0,
    receptionsNegative: 0,
    receptionsPositive: 0,
    receptionsPerfect: 0,
    receptionPositivePct: 0,
    receptionPerfectPct: 0,
    attacksTotal: 0,
    attacksKills: 0,
    attacksErrors: 0,
    attacksBlocked: 0,
    attackEfficiency: 0,
    attackKillPct: 0,
    blocksTotal: 0,
    blockPoints: 0,
    blockTouches: 0,
    defenseTotal: 0,
    defensePerfect: 0,
    totalErrors: 0,
  };

  for (const rally of rallies) {
    const isServingTeam = rally.servingTeamId === teamId;
    const isWinnerTeam = rally.winnerTeamId === teamId;
    const isBreakPoint = isServingTeam && isWinnerTeam;

    for (const action of rally.actions) {
      if (action.playerId !== player.id) continue;

      switch (action.type) {
        case 'battuta': {
          stats.servesTotal++;
          if (action.quality === 'ace') {
            stats.servesAces++;
            stats.totalPoints++;
            stats.plusMinus++;
            if (isBreakPoint) stats.breakPoints++;
          } else if (action.quality === 'errore') {
            stats.servesErrors++;
            stats.totalErrors++;
            stats.plusMinus--;
          } else {
            stats.servesInPlay++;
          }
          break;
        }

        case 'ricezione': {
          stats.receptionsTotal++;
          if (action.quality === 'doppio_piu') {
            stats.receptionsPerfect++;
            stats.receptionsPositive++;
          } else if (action.quality === 'positiva') {
            stats.receptionsPositive++;
          } else if (action.quality === 'negativa' || action.quality === 'slash') {
            stats.receptionsNegative++;
          } else if (action.quality === 'errore') {
            stats.receptionsErrors++;
            stats.totalErrors++;
            stats.plusMinus--;
          }
          break;
        }

        case 'attacco': {
          stats.attacksTotal++;
          if (action.quality === 'punto' || action.quality === 'mani_fuori') {
            stats.attacksKills++;
            stats.totalPoints++;
            stats.plusMinus++;
            if (isBreakPoint) stats.breakPoints++;
          } else if (action.quality === 'errore') {
            stats.attacksErrors++;
            stats.totalErrors++;
            stats.plusMinus--;
          } else if (action.quality === 'murato') {
            stats.attacksBlocked++;
            stats.plusMinus--;
          }
          break;
        }

        case 'muro': {
          stats.blocksTotal++;
          if (action.quality === 'punto') {
            stats.blockPoints++;
            stats.totalPoints++;
            stats.plusMinus++;
            if (isBreakPoint) stats.breakPoints++;
          } else if (action.quality === 'invasione' || action.quality === 'errore') {
            stats.totalErrors++;
            stats.plusMinus--;
          } else if (action.quality === 'positiva' || action.quality === 'continua') {
            stats.blockTouches++;
          }
          break;
        }

        case 'difesa': {
          stats.defenseTotal++;
          if (action.quality === 'doppio_piu' || action.quality === 'positiva' || action.quality === 'punto') {
            stats.defensePerfect++;
          }
          break;
        }

        case 'fallo': {
          stats.totalErrors++;
          stats.plusMinus--;
          break;
        }
      }
    }
  }

  // Calculate percentages
  if (stats.servesTotal > 0) {
    stats.acePercentage = Math.round((stats.servesAces / stats.servesTotal) * 1000) / 10;
  }
  if (stats.receptionsTotal > 0) {
    stats.receptionPositivePct = Math.round((stats.receptionsPositive / stats.receptionsTotal) * 1000) / 10;
    stats.receptionPerfectPct = Math.round((stats.receptionsPerfect / stats.receptionsTotal) * 1000) / 10;
  }
  if (stats.attacksTotal > 0) {
    stats.attackKillPct = Math.round((stats.attacksKills / stats.attacksTotal) * 1000) / 10;
    stats.attackEfficiency = calculateAttackEfficiency(
      stats.attacksKills,
      stats.attacksErrors,
      stats.attacksBlocked,
      stats.attacksTotal
    );
  }

  return stats;
}

/**
 * Calculates Side-out and Break point efficiency by rotation (P1 to P6)
 */
export function computeRotationStats(teamId: string, isHome: boolean, rallies: Rally[]): TeamRotationStats[] {
  const rotationData: Record<number, {
    receptions: number;
    sideoutsWon: number;
    serves: number;
    breakPointsWon: number;
    scored: number;
    conceded: number;
  }> = {
    1: { receptions: 0, sideoutsWon: 0, serves: 0, breakPointsWon: 0, scored: 0, conceded: 0 },
    2: { receptions: 0, sideoutsWon: 0, serves: 0, breakPointsWon: 0, scored: 0, conceded: 0 },
    3: { receptions: 0, sideoutsWon: 0, serves: 0, breakPointsWon: 0, scored: 0, conceded: 0 },
    4: { receptions: 0, sideoutsWon: 0, serves: 0, breakPointsWon: 0, scored: 0, conceded: 0 },
    5: { receptions: 0, sideoutsWon: 0, serves: 0, breakPointsWon: 0, scored: 0, conceded: 0 },
    6: { receptions: 0, sideoutsWon: 0, serves: 0, breakPointsWon: 0, scored: 0, conceded: 0 },
  };

  for (const r of rallies) {
    const rot = isHome ? r.homeRotation : r.awayRotation;
    const validRot = (rot >= 1 && rot <= 6) ? rot : 1;
    const isServing = r.servingTeamId === teamId;
    const wonRally = r.winnerTeamId === teamId;

    if (isServing) {
      rotationData[validRot].serves++;
      if (wonRally) {
        rotationData[validRot].breakPointsWon++;
        rotationData[validRot].scored++;
      } else {
        rotationData[validRot].conceded++;
      }
    } else {
      // Receiving
      rotationData[validRot].receptions++;
      if (wonRally) {
        rotationData[validRot].sideoutsWon++;
        rotationData[validRot].scored++;
      } else {
        rotationData[validRot].conceded++;
      }
    }
  }

  return [1, 2, 3, 4, 5, 6].map(rot => {
    const d = rotationData[rot];
    return {
      rotation: rot,
      receptionsTotal: d.receptions,
      sideoutsWon: d.sideoutsWon,
      sideoutPct: d.receptions > 0 ? Math.round((d.sideoutsWon / d.receptions) * 1000) / 10 : 0,
      servesTotal: d.serves,
      breakPointsWon: d.breakPointsWon,
      breakPointPct: d.serves > 0 ? Math.round((d.breakPointsWon / d.serves) * 1000) / 10 : 0,
      pointsScored: d.scored,
      pointsConceded: d.conceded,
    };
  });
}

/**
 * Calculates attack distribution and efficiency by court zone (Pos 4, 3, 2, Pipe)
 */
export function computeZoneAttackStats(teamId: string, rallies: Rally[]): ZoneAttackStats[] {
  const zones: Array<CourtZone | 'PIPE'> = [4, 3, 2, 'PIPE'];
  const data: Record<string, { total: number; kills: number; errors: number; blocked: number }> = {
    '4': { total: 0, kills: 0, errors: 0, blocked: 0 },
    '3': { total: 0, kills: 0, errors: 0, blocked: 0 },
    '2': { total: 0, kills: 0, errors: 0, blocked: 0 },
    'PIPE': { total: 0, kills: 0, errors: 0, blocked: 0 },
  };

  for (const r of rallies) {
    for (const action of r.actions) {
      if (action.teamId !== teamId || action.type !== 'attacco') continue;

      let key = '4';
      if (action.schemeCode === 'PIPE' || action.zone === 6) {
        key = 'PIPE';
      } else if (action.zone === 3 || action.schemeCode === '1' || action.schemeCode === '7') {
        key = '3';
      } else if (action.zone === 2 || action.schemeCode === 'FAST' || action.schemeCode === '2') {
        key = '2';
      } else if (action.zone === 4 || action.schemeCode === 'SUPER' || action.schemeCode === '4') {
        key = '4';
      }

      data[key].total++;
      if (action.quality === 'punto' || action.quality === 'mani_fuori') {
        data[key].kills++;
      } else if (action.quality === 'errore') {
        data[key].errors++;
      } else if (action.quality === 'murato') {
        data[key].blocked++;
      }
    }
  }

  return zones.map(z => {
    const d = data[String(z)];
    return {
      zone: z,
      total: d.total,
      kills: d.kills,
      errors: d.errors,
      blocked: d.blocked,
      killPct: d.total > 0 ? Math.round((d.kills / d.total) * 1000) / 10 : 0,
      efficiency: calculateAttackEfficiency(d.kills, d.errors, d.blocked, d.total),
    };
  });
}

/**
 * Calculates Tactical Scheme Effectiveness
 */
export function computeSchemeStats(teamId: string, schemes: TacticalScheme[], rallies: Rally[]) {
  return schemes.map(scheme => {
    let calls = 0;
    let pointsWon = 0;
    let errors = 0;

    for (const r of rallies) {
      const matchScheme = (r.homeSchemeId === scheme.id || r.awaySchemeId === scheme.id) ||
        r.actions.some(a => a.teamId === teamId && a.schemeId === scheme.id);
      
      if (matchScheme) {
        calls++;
        if (r.winnerTeamId === teamId) {
          pointsWon++;
        }
        if (r.actions.some(a => a.teamId === teamId && (a.quality === 'errore' || a.quality === 'murato'))) {
          errors++;
        }
      }
    }

    return {
      scheme,
      calls,
      pointsWon,
      errors,
      successPct: calls > 0 ? Math.round((pointsWon / calls) * 1000) / 10 : 0,
    };
  });
}
