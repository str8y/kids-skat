import { describe, expect, it } from 'vitest';
import { stickersForGame, stickersForLessons } from './stickers';

const win = { points: [95, 25] as [number, number], winner: 0 as const, schneider: true };

describe('Sticker', () => {
  it('vergibt Sieg-, Grand- und Schneider-Sticker', () => {
    expect(stickersForGame([], { mode: 'ai', level: 'easy', result: win, trump: 'grand', matchWinner: null }))
      .toEqual(['erster-sieg', 'grand', 'schneider']);
  });

  it('vergibt Sticker nicht doppelt', () => {
    expect(stickersForGame(['erster-sieg'], { mode: 'ai', result: { ...win, schneider: false }, trump: 'h', matchWinner: null })).toEqual([]);
  });

  it('vergibt den Gegner-Sticker beim Partie-Sieg', () => {
    expect(stickersForGame([], { mode: 'ai', level: 'medium', result: win, trump: 'h', matchWinner: 0 })).toContain('eule');
  });

  it('vergibt nichts für Siege des Computers', () => {
    expect(stickersForGame([], { mode: 'ai', result: { points: [20, 100], winner: 1, schneider: true }, trump: 'h', matchWinner: 1 })).toEqual([]);
  });

  it('vergibt Lern-Sticker', () => {
    expect(stickersForLessons([], { a: 3, b: 2 }, ['a', 'b'])).toEqual(['schlau']);
    expect(stickersForLessons(['schlau'], { a: 3, b: 3 }, ['a', 'b'])).toEqual(['sterne']);
  });
});
