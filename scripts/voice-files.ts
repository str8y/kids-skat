// Gemeinsame Dateilogik für die Sprachausgabe (ElevenLabs-Skript und Aufnahme-Tool).
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type CatalogEntry, catalog } from '../src/voice/catalog';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const AUDIO = join(ROOT, 'public', 'audio');
export const EXT = '.mp3';

export const entries = catalog();
export const fileOf = (e: CatalogEntry) => e.key + EXT;
export const exists = (e: CatalogEntry) => existsSync(join(AUDIO, fileOf(e)));

/** Schreibt public/audio/manifest.json mit allen vorhandenen Dateien; gibt die Anzahl zurück. */
export function writeManifest() {
  const files: Record<string, string> = {};
  for (const e of entries) if (exists(e)) files[e.key] = fileOf(e);
  mkdirSync(AUDIO, { recursive: true });
  writeFileSync(join(AUDIO, 'manifest.json'), JSON.stringify({ files }, null, 0) + '\n');
  return Object.keys(files).length;
}
