import test from 'node:test';
import assert from 'node:assert/strict';
import {
  rotateLineupClockwise,
  rotateLineupCounterClockwise,
  getNextRotationIndex,
  isSetWon,
  calculateAttackEfficiency,
  getMatchStatus
} from './volleyball-rules';
import { CourtZone, SetScore } from '../types/volleyball';

test('volleyball clockwise rotation shifts positions accurately', () => {
  const initialLineup: Record<CourtZone, string> = {
    1: 'Player_1',
    2: 'Player_2',
    3: 'Player_3',
    4: 'Player_4',
    5: 'Player_5',
    6: 'Player_6',
  };

  const rotated = rotateLineupClockwise(initialLineup);

  // In clockwise rotation:
  // Pos 2 moves to 1
  assert.equal(rotated[1], 'Player_2');
  // Pos 1 moves to 6
  assert.equal(rotated[6], 'Player_1');
  // Pos 6 moves to 5
  assert.equal(rotated[5], 'Player_6');
  // Pos 5 moves to 4
  assert.equal(rotated[4], 'Player_5');
  // Pos 4 moves to 3
  assert.equal(rotated[3], 'Player_4');
  // Pos 3 moves to 2
  assert.equal(rotated[2], 'Player_3');

  // Rotate back counter-clockwise restores original
  const restored = rotateLineupCounterClockwise(rotated);
  assert.deepEqual(restored, initialLineup);
});

test('rotation sequence cycles 1 -> 6 -> 5 -> 4 -> 3 -> 2 -> 1', () => {
  let rot = 1;
  const cycle = [1];
  for (let i = 0; i < 6; i++) {
    rot = getNextRotationIndex(rot);
    cycle.push(rot);
  }
  assert.deepEqual(cycle, [1, 6, 5, 4, 3, 2, 1]);
});

test('FIVB set winning rules', () => {
  // Set 1-4 not won yet
  assert.equal(isSetWon(24, 24, 0), null);
  assert.equal(isSetWon(24, 25, 0), null); // only 1 pt lead
  assert.equal(isSetWon(23, 25, 0), 'away');
  assert.equal(isSetWon(25, 20, 0), 'home');
  // Advantage past 25
  assert.equal(isSetWon(27, 26, 1), null);
  assert.equal(isSetWon(28, 26, 1), 'home');

  // Set 5 (Tie-break to 15)
  assert.equal(isSetWon(14, 14, 4), null);
  assert.equal(isSetWon(15, 13, 4), 'home');
  assert.equal(isSetWon(14, 16, 4), 'away');
});

test('attack efficiency formula calculates properly', () => {
  // 10 kills, 2 errors, 1 blocked out of 20 attacks -> (10 - 2 - 1)/20 = 7/20 = 35%
  const eff = calculateAttackEfficiency(10, 2, 1, 20);
  assert.equal(eff, 35);

  // 0 attacks -> 0%
  assert.equal(calculateAttackEfficiency(0, 0, 0, 0), 0);

  // Negative efficiency
  // 2 kills, 5 errors, 2 blocked out of 10 attacks -> (2 - 5 - 2)/10 = -5/10 = -50%
  assert.equal(calculateAttackEfficiency(2, 5, 2, 10), -50);
});

test('match winner detection for best of 5 sets', () => {
  const partialScores: SetScore[] = [
    { home: 25, away: 22 },
    { home: 22, away: 25 },
  ];
  const partialStatus = getMatchStatus(partialScores);
  assert.equal(partialStatus.isFinished, false);
  assert.equal(partialStatus.homeSetsWon, 1);
  assert.equal(partialStatus.awaySetsWon, 1);

  const completedScores: SetScore[] = [
    { home: 25, away: 20 },
    { home: 25, away: 22 },
    { home: 21, away: 25 },
    { home: 25, away: 18 },
  ];
  const finishedStatus = getMatchStatus(completedScores);
  assert.equal(finishedStatus.isFinished, true);
  assert.equal(finishedStatus.homeSetsWon, 3);
  assert.equal(finishedStatus.awaySetsWon, 1);
  assert.equal(finishedStatus.winnerTeamId, 'home');
});
