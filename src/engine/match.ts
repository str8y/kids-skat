import { type GameResult, type PlayerId, other } from './engine';

export const TROPHIES_TO_WIN = 3;

export interface Match {
  trophies: [number, number];
  dealer: PlayerId;
  games: GameResult[];
  winner: PlayerId | null;
}

export function newMatch(firstDealer: PlayerId): Match {
  return { trophies: [0, 0], dealer: firstDealer, games: [], winner: null };
}

export function recordGame(match: Match, r: GameResult): Match {
  if (match.winner !== null) throw new Error('Die Partie ist schon vorbei');
  const trophies: [number, number] = [...match.trophies];
  if (r.winner !== null) trophies[r.winner]++;
  const winner = trophies[0] >= TROPHIES_TO_WIN ? 0 : trophies[1] >= TROPHIES_TO_WIN ? 1 : null;
  return { trophies, dealer: other(match.dealer), games: [...match.games, r], winner };
}
