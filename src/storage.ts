// Lokale Speicherung (localStorage), robust gegen fehlenden oder kaputten Speicher.
import type { Level } from './engine/ai';

export type AnimalId = 'hase' | 'igel' | 'maus' | 'frosch' | 'katze' | 'pinguin';

export interface Profile {
  id: string;
  animal: AnimalId;
  name: string;
  stars: Record<string, number>;
  stickers: string[];
  beaten: Level[];
}

export interface Settings {
  muted: boolean;
  voice: boolean;
  hints: boolean;
  coins: boolean;
  seating: 'opposite' | 'side';
}

export interface Store {
  v: 1;
  profiles: Profile[];
  activeId: string | null;
  settings: Settings;
}

const KEY = 'junior-skat:v1';

export const defaultSettings: Settings = { muted: false, voice: true, hints: true, coins: true, seating: 'opposite' };

export function emptyStore(): Store {
  return { v: 1, profiles: [], activeId: null, settings: { ...defaultSettings } };
}

export function loadStore(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyStore();
    const data = JSON.parse(raw) as Store;
    if (data.v !== 1) return emptyStore();
    return { ...emptyStore(), ...data, settings: { ...defaultSettings, ...data.settings } };
  } catch {
    return emptyStore();
  }
}

export function saveStore(store: Store): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* Speicher nicht verfügbar – App läuft trotzdem */
  }
}

export function newProfile(animal: AnimalId, name: string): Profile {
  return { id: Math.random().toString(36).slice(2, 10), animal, name: name.trim(), stars: {}, stickers: [], beaten: [] };
}
