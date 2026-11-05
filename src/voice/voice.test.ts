import { describe, expect, it } from 'vitest';
import {
  type GameState,
  type PlayerId,
  type Trump,
  card,
  chooseTrump,
  legalCards,
  newGame,
  openCards,
  playCard,
  result,
  seededRng
} from '../engine/engine';
import { chooseCard, hintCard, suggestTrump } from '../engine/ai';
import type { AnimalKind } from '../ui/Animal';
import { catalog } from './catalog';
import * as voice from './game';
import { audioKey } from './key';
import { fixed, pick } from './lines';
import * as menu from './menu';
import { OPPONENT_KINDS, PLAYER_KINDS, TRUMPS } from './words';

const known = new Set(catalog().map((e) => e.text));
const spoken: string[] = [];
const check = (parts: string[]) => {
  for (const p of parts) {
    spoken.push(p);
    expect(known.has(p), `nicht im Katalog: „${p}“`).toBe(true);
  }
};

function contexts(): voice.VoiceCtx[] {
  const out: voice.VoiceCtx[] = [];
  for (const hints of [true, false])
    for (const explain of [true, false]) {
      for (const opp of OPPONENT_KINDS) out.push({ mode: 'ai', animals: ['hase', opp], hints, explain });
      out.push({ mode: 'duo', animals: ['maus', 'pinguin'], hints, explain });
    }
  return out;
}

function playThrough(ctx: voice.VoiceCtx, seed: number, trump: Trump) {
  const rng = seededRng(seed);
  let g: GameState = newGame({ dealer: (seed % 2) as PlayerId, rng });
  check(voice.trumpAsk(ctx, g.forehand, suggestTrump(openCards(g, g.forehand))));
  g = chooseTrump(g, trump);
  while (g.phase === 'play') {
    if (g.trick.length === 0) check(voice.lead(ctx, g.turn, g.tricksPlayed > 0));
    const legal = legalCards(g);
    const illegal = openCards(g, g.turn).filter((c) => !legal.includes(c));
    for (const c of illegal) check(voice.wrongCardTapped(ctx, g, c));
    check(voice.hint(ctx, hintCard(g)));
    const c = chooseCard(g, 'easy', rng);
    const next = playCard(g, c);
    if (next.trick.length === 1) check(voice.guide(ctx, next, c));
    else check(voice.trickDone(ctx, next, seed % 2 === 0));
    g = next;
  }
  check(voice.gameOver(ctx, result(g)!));
}

describe('Satzkatalog', () => {
  it('enthält jeden Satz, den das Spiel sagen kann', () => {
    let seed = 1;
    for (const ctx of contexts())
      for (const t of TRUMPS) {
        check(voice.trumpOptionTap(ctx, t));
        check(voice.trumpChosen(ctx, t));
        if (ctx.mode === 'ai') {
          check(voice.opponentThinking(ctx));
          check(voice.opponentChoseTrump(ctx, t));
        }
        for (let i = 0; i < 4; i++) playThrough(ctx, seed++, t);
      }
  });

  it('enthält alle Spielende-Ansagen', () => {
    for (const ctx of contexts())
      for (const w of [0, 1, null] as const)
        for (const p of [61, 90, 120])
          for (const schneider of [true, false]) {
            const points: [number, number] = w === null ? [60, 60] : w === 0 ? [p, 120 - p] : [120 - p, p];
            check(voice.gameOver(ctx, { winner: w, points, schneider }));
          }
  });

  it('enthält die Menü-Sätze', () => {
    for (const k of PLAYER_KINDS) check([menu.animalTap(k), ...menu.homeHello(k === 'maus' ? 'Maus' : menu.animalTap(k))]);
    for (const k of OPPONENT_KINDS) check([menu.opponentPick(k)]);
    check([menu.profileHello(true), menu.profileHello(false), menu.stickersHave(0), menu.lessonDone(3)]);
  });

  it('hat keine kaputten Platzhalter', () => {
    for (const e of catalog()) expect(e.text).not.toMatch(/undefined|NaN|\$\{|\[object/);
    for (const p of spoken) expect(p.trim()).toBe(p);
  });

  it('hat eindeutige Schlüssel', () => {
    const keys = catalog().map((e) => e.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(audioKey('Du bist  dran.')).toBe(audioKey('Du bist dran.'));
  });
});

describe('Erklär-Modus', () => {
  const ctx = (explain: boolean): voice.VoiceCtx => ({ mode: 'ai', animals: ['hase', 'fuchs'] as [AnimalKind, AnimalKind], hints: true, explain });

  /** Fuchs (Spieler 1) spielt Herz Zehn aus; Spieler 0 hat die angegebenen offenen Karten. */
  function afterLead(mine: string[]): GameState {
    const g = chooseTrump(newGame({ dealer: 0 }), 'c');
    const stacks = g.stacks.map((side) => side.map((s) => ({ ...s }))) as GameState['stacks'];
    stacks[0].forEach((s, i) => (s.open = i < mine.length ? card(mine[i]) : null));
    stacks[1][0].open = card('h10');
    return playCard({ ...g, stacks, turn: 1 }, card('h10'));
  }

  it('erklärt Bedienen und Stechen wie Opa', () => {
    const noHeart = voice.guide(ctx(true), afterLead(['c7', 's8']), card('h10')).join(' ');
    expect(noHeart).toMatch(/kein Herz/i);
    expect(noHeart).toMatch(/Trumpf/);
    expect(noHeart).toMatch(/verliert|verlierst/);

    const higher = voice.guide(ctx(true), afterLead(['hA', 's8']), card('h10')).join(' ');
    expect(higher).toMatch(/Herz/);
    expect(higher).toMatch(/Stich/);
    expect(higher).toMatch(/10 Augen/);

    const jack = voice.guide(ctx(true), afterLead(['h7', 'hB']), card('h10')).join(' ');
    expect(jack).toMatch(/Herz Bube/);
  });

  it('ist ohne Erklär-Modus kurz', () => {
    const parts = voice.guide(ctx(false), afterLead(['hA', 's8']), card('h10'));
    expect(parts).toHaveLength(2);
  });
});

describe('Varianten', () => {
  it('wiederholt nie zweimal hintereinander denselben Satz', () => {
    const l = fixed('test.varianten', 'A', 'B', 'C');
    let last = '';
    for (let i = 0; i < 50; i++) {
      const t = pick(l, undefined, () => 0);
      expect(t).not.toBe(last);
      last = t;
    }
  });
});
