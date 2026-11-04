import { describe, expect, it } from 'vitest';
import { type GameState, card, chooseTrump, legalCards, newGame, playCard, result, seededRng } from './engine';
import { type Level, chooseCard, suggestTrump } from './ai';

function playGame(levels: [Level, Level], seed: number): GameState {
  const rng = seededRng(seed);
  let g = newGame({ dealer: (seed % 2) as 0 | 1, rng });
  g = chooseTrump(g, suggestTrump(g.stacks[g.forehand].map((s) => s.open!)));
  while (g.phase === 'play') {
    const c = chooseCard(g, levels[g.turn], rng);
    expect(legalCards(g).map((l) => l.id)).toContain(c.id);
    g = playCard(g, c);
  }
  return g;
}

describe('Computergegner', () => {
  for (const level of ['easy', 'medium', 'hard'] as Level[]) {
    it(`spielt auf Stufe ${level} nur erlaubte Karten`, () => {
      for (let seed = 1; seed <= 3; seed++) playGame([level, level], seed);
    });
  }

  it('Stark gewinnt deutlich öfter gegen Anfänger', () => {
    let hardWins = 0;
    let easyWins = 0;
    for (let seed = 1; seed <= 30; seed++) {
      const r = result(playGame(['hard', 'easy'], seed))!;
      if (r.winner === 0) hardWins++;
      if (r.winner === 1) easyWins++;
    }
    expect(hardWins).toBeGreaterThan(easyWins * 2);
  });

  it('Mittel gewinnt öfter gegen Anfänger', () => {
    let mid = 0;
    let easy = 0;
    for (let seed = 1; seed <= 60; seed++) {
      const r = result(playGame(['medium', 'easy'], seed))!;
      if (r.winner === 0) mid++;
      if (r.winner === 1) easy++;
    }
    expect(mid).toBeGreaterThan(easy);
  });
});

describe('Trumpf-Vorschlag', () => {
  it('schlägt die Farbe vor, von der man am meisten hat', () => {
    expect(suggestTrump(['h7', 'h9', 'hK', 'hA', 'c8', 's9', 'dD', 'd7'].map(card))).toBe('h');
  });

  it('schlägt Grand vor bei vielen Buben und Assen', () => {
    expect(suggestTrump(['cB', 'sB', 'hB', 'cA', 'sA', 'h7', 's8', 'd9'].map(card))).toBe('grand');
  });
});
