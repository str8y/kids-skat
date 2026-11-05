// Der komplette Satzkatalog: alles, was die App vorlesen kann.
// Grundlage für das ElevenLabs-Skript (scripts/elevenlabs.ts).
import { STICKERS } from '../stickers';
import { LESSONS } from '../ui/lessons';
import { RULES } from '../ui/rules';
import { audioKey, normalize } from './key';
import { allLineTexts } from './lines';
import './game';
import './menu';

export interface CatalogEntry {
  /** Herkunft, z. B. „follow.must“ oder „lesson:stich“ */
  id: string;
  text: string;
  key: string;
}

export function catalog(): CatalogEntry[] {
  const raw: { id: string; text: string }[] = [...allLineTexts()];
  for (const l of LESSONS) {
    raw.push({ id: `lesson:${l.id}`, text: l.title });
    for (const s of l.steps) {
      raw.push({ id: `lesson:${l.id}`, text: s.say });
      if (s.kind === 'task') raw.push({ id: `lesson:${l.id}`, text: s.praise }, { id: `lesson:${l.id}`, text: s.retry });
    }
  }
  for (const r of RULES) raw.push({ id: 'rules', text: r.text });
  for (const s of STICKERS) raw.push({ id: 'sticker', text: s.say });

  const seen = new Map<string, CatalogEntry>();
  for (const { id, text } of raw) {
    const t = normalize(text);
    const key = audioKey(t);
    const prev = seen.get(key);
    if (prev && prev.text !== t) throw new Error(`Hash-Kollision: "${prev.text}" / "${t}"`);
    if (!prev) seen.set(key, { id, text: t, key });
  }
  return [...seen.values()];
}
