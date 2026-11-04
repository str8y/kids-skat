// Sticker (Erfolge). Vergabe ist reine Logik und getestet.
import type { Trump, GameResult } from './engine/engine';
import type { Level } from './engine/ai';

export interface StickerDef {
  id: string;
  title: string;
  say: string;
  symbol: string;
  color: string;
}

export const STICKERS: StickerDef[] = [
  { id: 'erster-sieg', title: 'Erster Sieg', say: 'Du hast dein erstes Spiel gewonnen!', symbol: '★', color: '#F2B630' },
  { id: 'erste-partie', title: 'Erste Partie', say: 'Du hast deine erste Partie gewonnen!', symbol: 'trophy', color: '#D9822B' },
  { id: 'grand', title: 'Grand-Held', say: 'Du hast einen Grand gewonnen!', symbol: 'B', color: '#3D6FB5' },
  { id: 'schneider', title: 'Schneider', say: 'Du hast Schneider gewonnen!', symbol: '✂', color: '#8E7CC3' },
  { id: 'fuchs', title: 'Fuchs besiegt', say: 'Du hast den Fuchs in einer Partie besiegt!', symbol: 'fuchs', color: '#E06B33' },
  { id: 'eule', title: 'Eule besiegt', say: 'Du hast die Eule in einer Partie besiegt!', symbol: 'eule', color: '#8E7CC3' },
  { id: 'baer', title: 'Bär besiegt', say: 'Du hast den Bären in einer Partie besiegt!', symbol: 'baer', color: '#8B5A33' },
  { id: 'zu-zweit', title: 'Zu zweit', say: 'Ihr habt eine Partie zu zweit gespielt!', symbol: '♥', color: '#D2432F' },
  { id: 'schlau', title: 'Skat-Schlau', say: 'Du hast alle Lektionen geschafft!', symbol: '●', color: '#2F5D3A' },
  { id: 'sterne', title: 'Sterne-Sammler', say: 'Du hast überall drei Sterne!', symbol: '✦', color: '#F2B630' }
];

const LEVEL_STICKER: Record<Level, string> = { easy: 'fuchs', medium: 'eule', hard: 'baer' };

export interface GameEvent {
  mode: 'ai' | 'duo';
  level?: Level;
  result: GameResult;
  trump: Trump;
  /** Partie gerade beendet: Sieger (0 = Profil-Spieler) */
  matchWinner: 0 | 1 | null;
}

/** Neue Sticker nach einem Spiel (nur Sicht von Spieler 0 = Profil). */
export function stickersForGame(have: string[], e: GameEvent): string[] {
  const out: string[] = [];
  const add = (id: string) => {
    if (!have.includes(id) && !out.includes(id)) out.push(id);
  };
  if (e.mode === 'duo') {
    if (e.matchWinner !== null) add('zu-zweit');
    return out;
  }
  if (e.result.winner === 0) {
    add('erster-sieg');
    if (e.trump === 'grand') add('grand');
    if (e.result.schneider) add('schneider');
  }
  if (e.matchWinner === 0) {
    add('erste-partie');
    add(LEVEL_STICKER[e.level ?? 'easy']);
  }
  return out;
}

export function stickersForLessons(have: string[], stars: Record<string, number>, lessonIds: string[]): string[] {
  const out: string[] = [];
  if (!have.includes('schlau') && lessonIds.every((id) => (stars[id] ?? 0) > 0)) out.push('schlau');
  if (!have.includes('sterne') && lessonIds.every((id) => (stars[id] ?? 0) === 3)) out.push('sterne');
  return out;
}
