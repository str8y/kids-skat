// Offiziersskat-Engine (Junior-Variante). Reines TypeScript, unveränderliche Zustände.

export type Suit = 'c' | 's' | 'h' | 'd'; // Kreuz, Pik, Herz, Karo
export type Rank = '7' | '8' | '9' | '10' | 'B' | 'D' | 'K' | 'A';
export type Trump = Suit | 'grand';
export type PlayerId = 0 | 1;

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
}

export interface Stack {
  open: Card | null;
  hidden: Card | null;
}

export interface Play {
  player: PlayerId;
  card: Card;
}

export interface GameState {
  phase: 'chooseTrump' | 'play' | 'done';
  dealer: PlayerId;
  /** Vorhand: sagt Trumpf an und spielt zum ersten Stich aus. */
  forehand: PlayerId;
  trump: Trump | null;
  stacks: [Stack[], Stack[]];
  turn: PlayerId;
  trick: Play[];
  lastTrick: { plays: Play[]; winner: PlayerId } | null;
  won: [Card[], Card[]];
  tricksPlayed: number;
}

export interface GameResult {
  points: [number, number];
  /** null = unentschieden (60:60) */
  winner: PlayerId | null;
  schneider: boolean;
}

export type Rng = () => number;

export const SUITS: Suit[] = ['c', 's', 'h', 'd'];
export const RANKS: Rank[] = ['7', '8', '9', '10', 'B', 'D', 'K', 'A'];

const VALUES: Record<Rank, number> = { A: 11, '10': 10, K: 4, D: 3, B: 2, '9': 0, '8': 0, '7': 0 };
/** Rangfolge innerhalb einer Farbe (ohne Buben), höher = stärker. */
const SUIT_ORDER: Rank[] = ['7', '8', '9', 'D', 'K', '10', 'A'];
/** Bubenreihenfolge, höher = stärker. */
const JACK_ORDER: Suit[] = ['d', 'h', 's', 'c'];

export function card(id: string): Card {
  const suit = id[0] as Suit;
  const rank = id.slice(1) as Rank;
  if (!SUITS.includes(suit) || !RANKS.includes(rank)) throw new Error(`Unbekannte Karte: ${id}`);
  return { id, suit, rank };
}

export function fullDeck(): Card[] {
  return SUITS.flatMap((s) => RANKS.map((r) => card(s + r)));
}

export function value(c: Card): number {
  return VALUES[c.rank];
}

export function points(cards: Card[]): number {
  return cards.reduce((sum, c) => sum + value(c), 0);
}

export function seededRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: T[], rng: Rng): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const other = (p: PlayerId): PlayerId => (p === 0 ? 1 : 0);

export function isTrump(c: Card, trump: Trump): boolean {
  return c.rank === 'B' || (trump !== 'grand' && c.suit === trump);
}

/** Die „Farbe“, zu der eine Karte beim Bedienen zählt: Trumpf oder ihre Farbe. */
export function followSuit(c: Card, trump: Trump): Suit | 'trump' {
  return isTrump(c, trump) ? 'trump' : c.suit;
}

/** Stärke innerhalb ihrer Bedien-Gruppe; Trümpfe immer über 100. */
export function strength(c: Card, trump: Trump): number {
  if (c.rank === 'B') return 200 + JACK_ORDER.indexOf(c.suit);
  const base = SUIT_ORDER.indexOf(c.rank);
  return isTrump(c, trump) ? 100 + base : base;
}

/** Index der Karte, die den Stich gewinnt (0 = ausgespielte Karte). */
export function trickWinner(cards: Card[], trump: Trump): number {
  const led = followSuit(cards[0], trump);
  let best = 0;
  for (let i = 1; i < cards.length; i++) {
    const c = cards[i];
    const b = cards[best];
    const cGroup = followSuit(c, trump);
    const bGroup = followSuit(b, trump);
    if (cGroup === 'trump' && bGroup !== 'trump') best = i;
    else if (cGroup === bGroup && (cGroup === 'trump' || cGroup === led) && strength(c, trump) > strength(b, trump)) best = i;
  }
  return best;
}

export interface NewGameOptions {
  dealer: PlayerId;
  rng?: Rng;
  /** Feste Kartenreihenfolge (für Tests/Lektionen). Reihenfolge: verdeckt P0, verdeckt P1, offen P0, offen P1. */
  deck?: Card[];
}

export function newGame({ dealer, rng = Math.random, deck }: NewGameOptions): GameState {
  const cards = deck ?? shuffle(fullDeck(), rng);
  if (cards.length !== 32) throw new Error('Ein Skatblatt hat 32 Karten');
  const stacks: [Stack[], Stack[]] = [[], []];
  for (let i = 0; i < 8; i++) {
    stacks[0].push({ hidden: cards[i], open: cards[16 + i] });
    stacks[1].push({ hidden: cards[8 + i], open: cards[24 + i] });
  }
  const forehand = other(dealer);
  return {
    phase: 'chooseTrump',
    dealer,
    forehand,
    trump: null,
    stacks,
    turn: forehand,
    trick: [],
    lastTrick: null,
    won: [[], []],
    tricksPlayed: 0
  };
}

export function chooseTrump(state: GameState, trump: Trump): GameState {
  if (state.phase !== 'chooseTrump') throw new Error('Trumpf wurde schon gewählt');
  return { ...state, trump, phase: 'play', turn: state.forehand };
}

/** Offene (oben liegende) Karten eines Spielers. */
export function openCards(state: GameState, player: PlayerId): Card[] {
  return state.stacks[player].flatMap((s) => (s.open ? [s.open] : []));
}

/** Karten, die der Spieler am Zug legen darf. */
export function legalCards(state: GameState): Card[] {
  if (state.phase !== 'play' || !state.trump) return [];
  const mine = openCards(state, state.turn);
  if (state.trick.length === 0) return mine;
  const trump = state.trump;
  const led = followSuit(state.trick[0].card, trump);
  const following = mine.filter((c) => followSuit(c, trump) === led);
  return following.length > 0 ? following : mine;
}

export function playCard(state: GameState, c: Card): GameState {
  if (state.phase !== 'play' || !state.trump) throw new Error('Gerade wird nicht gespielt');
  if (!legalCards(state).some((l) => l.id === c.id)) throw new Error(`Karte ${c.id} ist nicht erlaubt`);
  const player = state.turn;
  const stacks: [Stack[], Stack[]] = [state.stacks[0].map((s) => ({ ...s })), state.stacks[1].map((s) => ({ ...s }))];
  const stack = stacks[player].find((s) => s.open?.id === c.id)!;
  stack.open = null;
  const trick = [...state.trick, { player, card: c }];

  if (trick.length < 2) {
    return { ...state, stacks, trick, turn: other(player) };
  }

  const winner = trick[trickWinner(trick.map((p) => p.card), state.trump)].player;
  const won: [Card[], Card[]] = [[...state.won[0]], [...state.won[1]]];
  won[winner].push(...trick.map((p) => p.card));
  // Freigelegte verdeckte Karten werden nach dem Stich aufgedeckt.
  for (const side of stacks) {
    for (const s of side) {
      if (!s.open && s.hidden) {
        s.open = s.hidden;
        s.hidden = null;
      }
    }
  }
  const tricksPlayed = state.tricksPlayed + 1;
  return {
    ...state,
    stacks,
    trick: [],
    lastTrick: { plays: trick, winner },
    won,
    turn: winner,
    tricksPlayed,
    phase: tricksPlayed === 16 ? 'done' : 'play'
  };
}

export function result(state: GameState): GameResult | null {
  if (state.phase !== 'done') return null;
  const p: [number, number] = [points(state.won[0]), points(state.won[1])];
  const winner: PlayerId | null = p[0] > 60 ? 0 : p[1] > 60 ? 1 : null;
  return { points: p, winner, schneider: winner !== null && Math.min(p[0], p[1]) <= 30 };
}
