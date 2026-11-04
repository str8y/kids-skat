import { describe, expect, it } from 'vitest';
import { newMatch, recordGame } from './match';

describe('Partie', () => {
  it('beginnt ohne Pokale', () => {
    const m = newMatch(0);
    expect(m.trophies).toEqual([0, 0]);
    expect(m.dealer).toBe(0);
    expect(m.winner).toBeNull();
  });

  it('gibt dem Sieger einen Pokal und wechselt den Geber', () => {
    const m = recordGame(newMatch(0), { points: [70, 50], winner: 0, schneider: false });
    expect(m.trophies).toEqual([1, 0]);
    expect(m.dealer).toBe(1);
  });

  it('vergibt bei 60:60 keinen Pokal', () => {
    const m = recordGame(newMatch(0), { points: [60, 60], winner: null, schneider: false });
    expect(m.trophies).toEqual([0, 0]);
    expect(m.dealer).toBe(1);
  });

  it('endet, sobald jemand 3 Pokale hat', () => {
    let m = newMatch(0);
    const win1 = { points: [40, 80] as [number, number], winner: 1 as const, schneider: false };
    m = recordGame(m, win1);
    m = recordGame(m, win1);
    expect(m.winner).toBeNull();
    m = recordGame(m, win1);
    expect(m.winner).toBe(1);
    expect(() => recordGame(m, win1)).toThrow();
  });
});
