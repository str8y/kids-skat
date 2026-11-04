// Computergegner: Fuchs (easy), Eule (medium), Bär (hard).
import {
  type Card,
  type GameState,
  type PlayerId,
  type Rng,
  type Suit,
  type Trump,
  SUITS,
  isTrump,
  legalCards,
  openCards,
  other,
  playCard,
  points,
  shuffle,
  strength,
  trickWinner,
  value
} from './engine';

export type Level = 'easy' | 'medium' | 'hard';

export function chooseCard(state: GameState, level: Level, rng: Rng = Math.random): Card {
  const legal = legalCards(state);
  if (legal.length === 0) throw new Error('Keine Karte spielbar');
  if (legal.length === 1) return legal[0];
  if (level === 'easy') return legal[Math.floor(rng() * legal.length)];
  if (level === 'medium') return heuristicCard(state);
  return monteCarloCard(state, rng);
}

/** Tipp für Menschen: die Wahl der Eule. */
export function hintCard(state: GameState): Card {
  return heuristicCard(state);
}

// ---------- Faustregeln (Eule) ----------

const cheapest = (cards: Card[], trump: Trump) =>
  [...cards].sort((a, b) => value(a) - value(b) || strength(a, trump) - strength(b, trump))[0];

/** Antwort als zweiter Spieler im Stich. */
function respond(led: Card, legal: Card[], trump: Trump): Card {
  const winners = legal.filter((c) => trickWinner([led, c], trump) === 1);
  if (winners.length > 0) {
    // Mit Bedienen gewinnen: gleich die wertvollste Karte mitnehmen.
    const byFollowing = winners.filter((c) => !isTrump(c, trump) || isTrump(led, trump));
    if (byFollowing.length > 0 && !isTrump(led, trump)) {
      return [...byFollowing].sort((a, b) => value(b) - value(a) || strength(b, trump) - strength(a, trump))[0];
    }
    const lowestWinner = [...winners].sort((a, b) => strength(a, trump) - strength(b, trump))[0];
    const losers = legal.filter((c) => !winners.includes(c));
    const worthIt = value(led) + value(lowestWinner) >= 4;
    if (worthIt || losers.length === 0) return lowestWinner;
    const freeLoser = losers.find((c) => value(c) === 0);
    return freeLoser ?? lowestWinner;
  }
  return cheapest(legal, trump);
}

function legalResponses(led: Card, hand: Card[], trump: Trump): Card[] {
  const group = (c: Card) => (isTrump(c, trump) ? 'trump' : c.suit);
  const follow = hand.filter((c) => group(c) === group(led));
  return follow.length > 0 ? follow : hand;
}

function heuristicCard(state: GameState): Card {
  const trump = state.trump!;
  const legal = legalCards(state);
  if (state.trick.length === 1) return respond(state.trick[0].card, legal, trump);

  // Ausspielen: die Antwort des Gegners ist bekannt, denn er kann nur offene Karten legen.
  const oppHand = openCards(state, other(state.turn));
  let best = legal[0];
  let bestScore = -Infinity;
  for (const c of legal) {
    const responses = legalResponses(c, oppHand, trump);
    const answer = respond(c, responses, trump);
    const iWin = trickWinner([c, answer], trump) === 0;
    const pts = value(c) + value(answer);
    // Trümpfe schonen und hohe Karten nicht unnötig verschenken.
    const score = (iWin ? pts : -pts) - (isTrump(c, trump) ? 1.5 + strength(c, trump) / 200 : 0);
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return best;
}

// ---------- Monte-Carlo (Bär) ----------

const SAMPLES = 24;

/** Verdeckte Karten sind für alle unbekannt: zufällig neu verteilen. */
function determinize(state: GameState, rng: Rng): GameState {
  const pool = shuffle(
    state.stacks.flat().flatMap((s) => (s.hidden ? [s.hidden] : [])),
    rng
  );
  let i = 0;
  const stacks = state.stacks.map((side) =>
    side.map((s) => (s.hidden ? { ...s, hidden: pool[i++] } : s))
  ) as GameState['stacks'];
  return { ...state, stacks };
}

function playoutDiff(state: GameState, me: PlayerId): number {
  let g = state;
  while (g.phase === 'play') g = playCard(g, heuristicCard(g));
  return points(g.won[me]) - points(g.won[other(me)]);
}

function monteCarloCard(state: GameState, rng: Rng): Card {
  const me = state.turn;
  const legal = legalCards(state);
  const worlds = Array.from({ length: SAMPLES }, () => determinize(state, rng));
  let best = legal[0];
  let bestScore = -Infinity;
  for (const c of legal) {
    let total = 0;
    for (const w of worlds) total += playoutDiff(playCard(w, c), me);
    if (total > bestScore) {
      bestScore = total;
      best = c;
    }
  }
  return best;
}

// ---------- Trumpf-Vorschlag ----------

export function suggestTrump(open: Card[]): Trump {
  const jacks = open.filter((c) => c.rank === 'B').length;
  const bonus = (c: Card) => (c.rank === 'A' ? 1 : c.rank === '10' ? 0.8 : 0);
  let best: Trump = 'c';
  let bestScore = -Infinity;
  for (const s of SUITS as Suit[]) {
    const cards = open.filter((c) => c.suit === s && c.rank !== 'B');
    const score = jacks * 2 + cards.length * 2 + cards.reduce((n, c) => n + bonus(c), 0);
    if (score > bestScore) {
      bestScore = score;
      best = s;
    }
  }
  if (jacks >= 2) {
    const aces = open.filter((c) => c.rank === 'A').length;
    const tens = open.filter((c) => c.rank === '10').length;
    if (jacks * 3 + aces * 2 + tens > bestScore) best = 'grand';
  }
  return best;
}
