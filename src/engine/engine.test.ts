import { describe, expect, it } from 'vitest';
import {
  type Card,
  type GameState,
  card,
  chooseTrump,
  fullDeck,
  legalCards,
  newGame,
  playCard,
  points,
  result,
  seededRng,
  trickWinner
} from './engine';

const ids = (cs: Card[]) => cs.map((c) => c.id).sort();

/** Build a deck so that the deal produces the given stacks.
 *  Deal order: hidden cards P0 (8), hidden P1 (8), open P0 (8), open P1 (8). */
function deckFor(p0Hidden: string[], p1Hidden: string[], p0Open: string[], p1Open: string[]): Card[] {
  return [...p0Hidden, ...p1Hidden, ...p0Open, ...p1Open].map(card);
}

const standardDeck = () =>
  deckFor(
    ['c7', 'c8', 'c9', 'cD', 'cK', 'c10', 'cA', 'cB'],
    ['s7', 's8', 's9', 'sD', 'sK', 's10', 'sA', 'sB'],
    ['h7', 'h8', 'h9', 'hD', 'hK', 'h10', 'hA', 'hB'],
    ['d7', 'd8', 'd9', 'dD', 'dK', 'd10', 'dA', 'dB']
  );

describe('Geben', () => {
  it('gibt jedem Spieler 8 Stapel mit je einer offenen und einer verdeckten Karte', () => {
    const g = newGame({ dealer: 0, rng: seededRng(1) });
    for (const p of [0, 1] as const) {
      expect(g.stacks[p]).toHaveLength(8);
      for (const s of g.stacks[p]) {
        expect(s.open).not.toBeNull();
        expect(s.hidden).not.toBeNull();
      }
    }
    const all = g.stacks.flat().flatMap((s) => [s.open!, s.hidden!]);
    expect(new Set(all.map((c) => c.id)).size).toBe(32);
  });

  it('lässt die Vorhand (wer nicht gegeben hat) den Trumpf wählen', () => {
    const g = newGame({ dealer: 0, rng: seededRng(1) });
    expect(g.phase).toBe('chooseTrump');
    expect(g.turn).toBe(1);
  });

  it('hat insgesamt 120 Augen im Spiel', () => {
    expect(points(fullDeck())).toBe(120);
  });
});

describe('Trumpf und Ausspielen', () => {
  it('startet nach der Trumpfwahl das Spiel, die Vorhand spielt aus', () => {
    const g = chooseTrump(newGame({ dealer: 1, deck: standardDeck() }), 'h');
    expect(g.phase).toBe('play');
    expect(g.trump).toBe('h');
    expect(g.turn).toBe(0);
    expect(ids(legalCards(g))).toEqual(ids(['h7', 'h8', 'h9', 'hD', 'hK', 'h10', 'hA', 'hB'].map(card)));
  });

  it('erlaubt nur offene Karten', () => {
    const g = chooseTrump(newGame({ dealer: 1, deck: standardDeck() }), 'h');
    expect(() => playCard(g, card('c7'))).toThrow();
  });
});

describe('Bedienpflicht', () => {
  it('verlangt, die ausgespielte Farbe zu bedienen', () => {
    const deck = deckFor(
      ['c7', 'c8', 'c9', 'cD', 'cK', 'c10', 'cA', 'cB'],
      ['s7', 's8', 's9', 'sD', 'sK', 's10', 'sA', 'sB'],
      ['h7', 'h8', 'h9', 'hD', 'd7', 'd8', 'd9', 'dD'],
      ['hK', 'h10', 'hA', 'hB', 'dK', 'd10', 'dA', 'dB']
    );
    let g = chooseTrump(newGame({ dealer: 1, deck }), 'c');
    g = playCard(g, card('d7'));
    expect(ids(legalCards(g))).toEqual(ids(['dK', 'd10', 'dA'].map(card)));
  });

  it('zählt Buben zum Trumpf, nicht zu ihrer Farbe', () => {
    const deck = deckFor(
      ['c7', 'c8', 'c9', 'cD', 'cK', 'c10', 'cA', 'cB'],
      ['s7', 's8', 's9', 'sD', 'sK', 's10', 'sA', 'sB'],
      ['h7', 'h8', 'h9', 'hD', 'd7', 'd8', 'd9', 'dD'],
      ['hK', 'h10', 'hA', 'hB', 'dK', 'd10', 'dA', 'dB']
    );
    let g = chooseTrump(newGame({ dealer: 1, deck }), 'c');
    g = playCard(g, card('h7'));
    // hB ist Trumpf und bedient Herz nicht
    expect(ids(legalCards(g))).toEqual(ids(['hK', 'h10', 'hA'].map(card)));
  });

  it('verlangt Trumpf (inkl. Buben), wenn Trumpf ausgespielt wird', () => {
    const deck = deckFor(
      ['c7', 'c8', 'c9', 'cD', 'cK', 'c10', 'cA', 'cB'],
      ['s7', 's8', 's9', 'sD', 'sK', 's10', 'sA', 'sB'],
      ['h7', 'h8', 'h9', 'hD', 'd7', 'd8', 'd9', 'dD'],
      ['hK', 'h10', 'hA', 'hB', 'dK', 'd10', 'dA', 'dB']
    );
    let g = chooseTrump(newGame({ dealer: 1, deck }), 'h');
    g = playCard(g, card('h7'));
    expect(ids(legalCards(g))).toEqual(ids(['hK', 'h10', 'hA', 'hB', 'dB'].map(card)));
  });

  it('erlaubt jede Karte, wenn man nicht bedienen kann', () => {
    let g = chooseTrump(newGame({ dealer: 1, deck: standardDeck() }), 's');
    g = playCard(g, card('h7'));
    expect(legalCards(g)).toHaveLength(8);
  });
});

describe('Stich', () => {
  it('gewinnt die höchste Karte der ausgespielten Farbe', () => {
    expect(trickWinner([card('h10'), card('hA')], 'c')).toBe(1);
    expect(trickWinner([card('hK'), card('h10')], 'c')).toBe(1);
    expect(trickWinner([card('h9'), card('hD')], 'c')).toBe(1);
    expect(trickWinner([card('hA'), card('dA')], 'c')).toBe(0);
  });

  it('wird von Trumpf gestochen', () => {
    expect(trickWinner([card('hA'), card('c7')], 'c')).toBe(1);
  });

  it('kennt die Reihenfolge der Buben', () => {
    expect(trickWinner([card('dB'), card('hB')], 'c')).toBe(1);
    expect(trickWinner([card('sB'), card('hB')], 'c')).toBe(0);
    expect(trickWinner([card('cA'), card('dB')], 'c')).toBe(1);
  });

  it('hat im Grand nur Buben als Trumpf', () => {
    expect(trickWinner([card('hA'), card('dB')], 'grand')).toBe(1);
    expect(trickWinner([card('hA'), card('c7')], 'grand')).toBe(0);
  });

  it('gibt dem Stichgewinner die Karten, lässt ihn ausspielen und deckt freigelegte Karten auf', () => {
    let g = chooseTrump(newGame({ dealer: 1, deck: standardDeck() }), 's');
    g = playCard(g, card('h7')); // P0, Stapel 0 (darunter c7)
    expect(g.trick).toHaveLength(1);
    g = playCard(g, card('dA')); // P1, Stapel 6 (darunter sA) — kein Trumpf, Herz gewinnt
    expect(g.trick).toHaveLength(0);
    expect(g.turn).toBe(0);
    expect(points(g.won[0])).toBe(11);
    expect(g.stacks[0][0].open?.id).toBe('c7');
    expect(g.stacks[0][0].hidden).toBeNull();
    expect(g.stacks[1][6].open?.id).toBe('sA');
    expect(g.lastTrick?.winner).toBe(0);
  });
});

describe('Spielende', () => {
  function playOut(g: GameState): GameState {
    while (g.phase === 'play') g = playCard(g, legalCards(g)[0]);
    return g;
  }

  it('endet nach 16 Stichen mit insgesamt 120 Augen', () => {
    const g = playOut(chooseTrump(newGame({ dealer: 0, rng: seededRng(7) }), 'grand'));
    expect(g.phase).toBe('done');
    const r = result(g)!;
    expect(r.points[0] + r.points[1]).toBe(120);
  });

  it('kürt den Spieler mit mehr als 60 Augen zum Sieger und erkennt Schneider', () => {
    // P0 hat alle Trümpfe (Herz + Buben) offen, P1 nur Fehlkarten.
    const deck = deckFor(
      ['c7', 'c8', 'c9', 'cD', 'cK', 'c10', 'cA', 'cB'],
      ['s7', 's8', 's9', 'sD', 'sK', 's10', 'sA', 'sB'],
      ['h7', 'h8', 'h9', 'hD', 'hK', 'h10', 'hA', 'hB'],
      ['d7', 'd8', 'd9', 'dD', 'dK', 'd10', 'dA', 'dB']
    );
    const g = playOut(chooseTrump(newGame({ dealer: 1, deck }), 'h'));
    const r = result(g)!;
    expect(r.winner).toBe(r.points[0] > 60 ? 0 : 1);
    expect(r.schneider).toBe(Math.min(r.points[0], r.points[1]) <= 30);
  });

  it('liefert kein Ergebnis, solange gespielt wird', () => {
    expect(result(newGame({ dealer: 0, rng: seededRng(3) }))).toBeNull();
  });
});
