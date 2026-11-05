// Grammatik-Hilfen: Artikel für Tiere und Karten, Wörter für Farben und Trumpf.
import type { Card, Rank, Suit, Trump } from '../engine/engine';
import type { AnimalKind } from '../ui/Animal';
import { RANK_NAME, SUIT_NAME, cardName } from '../ui/names';

export const OPPONENT_KINDS: readonly AnimalKind[] = ['fuchs', 'eule', 'baer'];
export const PLAYER_KINDS: readonly AnimalKind[] = ['hase', 'igel', 'maus', 'frosch', 'katze', 'pinguin'];

const ANIMAL: Record<AnimalKind, { name: string; nom: string; dat: string; acc: string }> = {
  fuchs: { name: 'Fuchs', nom: 'der Fuchs', dat: 'dem Fuchs', acc: 'den Fuchs' },
  eule: { name: 'Eule', nom: 'die Eule', dat: 'der Eule', acc: 'die Eule' },
  baer: { name: 'Bär', nom: 'der Bär', dat: 'dem Bären', acc: 'den Bären' },
  hase: { name: 'Hase', nom: 'der Hase', dat: 'dem Hasen', acc: 'den Hasen' },
  igel: { name: 'Igel', nom: 'der Igel', dat: 'dem Igel', acc: 'den Igel' },
  maus: { name: 'Maus', nom: 'die Maus', dat: 'der Maus', acc: 'die Maus' },
  frosch: { name: 'Frosch', nom: 'der Frosch', dat: 'dem Frosch', acc: 'den Frosch' },
  katze: { name: 'Katze', nom: 'die Katze', dat: 'der Katze', acc: 'die Katze' },
  pinguin: { name: 'Pinguin', nom: 'der Pinguin', dat: 'dem Pinguin', acc: 'den Pinguin' }
};

export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Anrede, z. B. „Hase“ */
export const call = (k: AnimalKind) => ANIMAL[k].name;
/** „der Fuchs“ */
export const nom = (k: AnimalKind) => ANIMAL[k].nom;
/** „dem Fuchs“ */
export const dat = (k: AnimalKind) => ANIMAL[k].dat;
/** „den Fuchs“ */
export const acc = (k: AnimalKind) => ANIMAL[k].acc;

const NOM_ARTICLE: Record<Rank, string> = { '7': 'die', '8': 'die', '9': 'die', '10': 'die', B: 'der', D: 'die', K: 'der', A: 'das' };
const ACC_ARTICLE: Record<Rank, string> = { '7': 'die', '8': 'die', '9': 'die', '10': 'die', B: 'den', D: 'die', K: 'den', A: 'das' };

/** „die Herz Zehn“, „der Kreuz Bube“ */
export const cardNom = (c: Card) => `${NOM_ARTICLE[c.rank]} ${cardName(c)}`;
/** „die Herz Zehn“, „den Kreuz Buben“ */
export const cardAcc = (c: Card) =>
  `${ACC_ARTICLE[c.rank]} ${SUIT_NAME[c.suit]} ${c.rank === 'B' ? 'Buben' : RANK_NAME[c.rank]}`;

const DAT_ARTICLE: Record<Rank, string> = { '7': 'der', '8': 'der', '9': 'der', '10': 'der', B: 'dem', D: 'der', K: 'dem', A: 'dem' };
/** „der Herz Zehn“, „dem Kreuz Buben“ (nach „mit“) */
export const cardDat = (c: Card) =>
  `${DAT_ARTICLE[c.rank]} ${SUIT_NAME[c.suit]} ${c.rank === 'B' ? 'Buben' : RANK_NAME[c.rank]}`;

/** Was beim Bedienen zählt: eine Farbe oder Trumpf. */
export type Group = Suit | 'trump';
export const GROUPS: readonly Group[] = ['c', 's', 'h', 'd', 'trump'];

interface GroupWords {
  /** „Herz“, „Trumpf“ */
  name: string;
  /** „ein Herz“, „einen Trumpf“ */
  one: string;
  /** „kein Herz“, „keinen Trumpf“ */
  none: string;
  /** „einer höheren Herz-Karte“, „einem höheren Trumpf“ (nach „mit“) */
  higher: string;
  /** „Herz-Karten“, „Trümpfe“ */
  plural: string;
  /** „Herz-Karten“, „Trümpfen“ (nach „von deinen“) */
  pluralDat: string;
}

export function group(g: Group): GroupWords {
  if (g === 'trump')
    return { name: 'Trumpf', one: 'einen Trumpf', none: 'keinen Trumpf', higher: 'einem höheren Trumpf', plural: 'Trümpfe', pluralDat: 'Trümpfen' };
  const n = SUIT_NAME[g];
  return { name: n, one: `ein ${n}`, none: `kein ${n}`, higher: `einer höheren ${n}-Karte`, plural: `${n}-Karten`, pluralDat: `${n}-Karten` };
}

export const TRUMPS: readonly Trump[] = ['c', 's', 'h', 'd', 'grand'];
