import type { Card, Rank, Suit, Trump } from '../engine/engine';

export const SUIT_NAME: Record<Suit, string> = { c: 'Kreuz', s: 'Pik', h: 'Herz', d: 'Karo' };
export const SUIT_SYMBOL: Record<Suit, string> = { c: '♣', s: '♠', h: '♥', d: '♦' };
export const RANK_NAME: Record<Rank, string> = {
  '7': 'Sieben', '8': 'Acht', '9': 'Neun', '10': 'Zehn', B: 'Bube', D: 'Dame', K: 'König', A: 'Ass'
};
export const isRed = (s: Suit) => s === 'h' || s === 'd';
export const cardName = (c: Card) => `${SUIT_NAME[c.suit]} ${RANK_NAME[c.rank]}`;
export const trumpName = (t: Trump) => (t === 'grand' ? 'Grand – nur Buben sind Trumpf' : `${SUIT_NAME[t]} ist Trumpf`);
