// Erzeugt die Sprachausgabe der App mit ElevenLabs.
//
//   npm run voice:list                     Katalog anzeigen, docs/sprachkatalog.md schreiben
//   npm run voice:generate                 fehlende Audiodateien erzeugen
//   npm run voice:generate -- --limit 20   nur 20 Dateien (zum Ausprobieren)
//   npm run voice:generate -- --only end.  nur Sätze, deren ID so beginnt
//   npm run voice:generate -- --force      auch vorhandene Dateien neu erzeugen
//   npm run voice:manifest                 nur manifest.json neu schreiben (z. B. nach Handarbeit)
//   npm run voice:generate -- --prune      Dateien löschen, die nicht mehr im Katalog sind
//
// Umgebungsvariablen:
//   ELEVENLABS_API_KEY    (Pflicht zum Erzeugen)
//   ELEVENLABS_VOICE_ID   (Pflicht zum Erzeugen; Stimme aus der ElevenLabs-Bibliothek)
//   ELEVENLABS_MODEL      (Standard: eleven_multilingual_v2)
//   ELEVENLABS_SPEED      (Standard: 0.95)
//   ELEVENLABS_STABILITY  (Standard: 0.5)
//   ELEVENLABS_SIMILARITY (Standard: 0.75)
//   ELEVENLABS_STYLE      (Standard: 0.2)
//   ELEVENLABS_LANGUAGE   (optional, z. B. „de“ – nur bei Modellen, die das unterstützen)
//
// Dateien landen in public/audio/<key>.mp3; die App findet sie über public/audio/manifest.json.
// Eigene Aufnahmen gehen auch: Datei unter dem Namen aus docs/sprachkatalog.md ablegen
// und `npm run voice:manifest` ausführen.
import { existsSync, mkdirSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type CatalogEntry, catalog } from '../src/voice/catalog';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const AUDIO = join(ROOT, 'public', 'audio');
const LIST = join(ROOT, 'docs', 'sprachkatalog.md');
const EXT = '.mp3';

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const opt = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

const entries = catalog();
const fileOf = (e: CatalogEntry) => e.key + EXT;
const exists = (e: CatalogEntry) => existsSync(join(AUDIO, fileOf(e)));

function writeList() {
  const groups = new Map<string, CatalogEntry[]>();
  for (const e of entries) groups.set(e.id, [...(groups.get(e.id) ?? []), e]);
  const chars = entries.reduce((n, e) => n + e.text.length, 0);
  const out = [
    '# Sprachkatalog',
    '',
    'Automatisch erzeugt von `npm run voice:list` aus `src/voice/` – nicht von Hand bearbeiten.',
    'Sätze ändern: in `src/voice/game.ts`, `src/voice/menu.ts`, `src/ui/lessons.ts`, `src/ui/rules.ts` oder `src/stickers.ts`.',
    '',
    `**${entries.length} Sätze, ${chars.toLocaleString('de-DE')} Zeichen.** Dateiname = Schlüssel + \`${EXT}\` in \`public/audio/\`.`,
    '`*.explain` = nur im Erklär-Modus.',
    ''
  ];
  for (const [id, list] of groups) {
    out.push(`## ${id}`, '', '| Datei | Satz |', '|---|---|');
    for (const e of list) out.push(`| \`${fileOf(e)}\` | ${e.text.replace(/\|/g, '\\|')} |`);
    out.push('');
  }
  writeFileSync(LIST, out.join('\n'));
}

function writeManifest() {
  const files: Record<string, string> = {};
  for (const e of entries) if (exists(e)) files[e.key] = fileOf(e);
  mkdirSync(AUDIO, { recursive: true });
  writeFileSync(join(AUDIO, 'manifest.json'), JSON.stringify({ files }, null, 0) + '\n');
  return Object.keys(files).length;
}

function stats() {
  const missing = entries.filter((e) => !exists(e));
  const chars = (l: CatalogEntry[]) => l.reduce((n, e) => n + e.text.length, 0).toLocaleString('de-DE');
  console.log(`Katalog: ${entries.length} Sätze (${chars(entries)} Zeichen)`);
  console.log(`Vorhanden: ${entries.length - missing.length}, fehlen: ${missing.length} (${chars(missing)} Zeichen)`);
}

async function tts(text: string): Promise<Buffer> {
  const key = process.env.ELEVENLABS_API_KEY!;
  const voice = process.env.ELEVENLABS_VOICE_ID!;
  const num = (name: string, def: number) => Number(process.env[name] ?? def);
  const body: Record<string, unknown> = {
    text,
    model_id: process.env.ELEVENLABS_MODEL ?? 'eleven_multilingual_v2',
    voice_settings: {
      stability: num('ELEVENLABS_STABILITY', 0.5),
      similarity_boost: num('ELEVENLABS_SIMILARITY', 0.75),
      style: num('ELEVENLABS_STYLE', 0.2),
      use_speaker_boost: true,
      speed: num('ELEVENLABS_SPEED', 0.95)
    }
  };
  if (process.env.ELEVENLABS_LANGUAGE) body.language_code = process.env.ELEVENLABS_LANGUAGE;

  for (let attempt = 0; ; attempt++) {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}?output_format=mp3_44100_128`,
      { method: 'POST', headers: { 'xi-api-key': key, 'content-type': 'application/json', accept: 'audio/mpeg' }, body: JSON.stringify(body) }
    );
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    const retry = res.status === 429 || res.status >= 500;
    const msg = await res.text();
    if (!retry || attempt >= 5) throw new Error(`ElevenLabs ${res.status}: ${msg.slice(0, 300)}`);
    const wait = 2000 * 2 ** attempt;
    console.warn(`  ${res.status} – neuer Versuch in ${wait / 1000}s`);
    await new Promise((r) => setTimeout(r, wait));
  }
}

async function generate() {
  if (!process.env.ELEVENLABS_API_KEY || !process.env.ELEVENLABS_VOICE_ID) {
    console.error('Bitte ELEVENLABS_API_KEY und ELEVENLABS_VOICE_ID setzen.');
    process.exit(1);
  }
  mkdirSync(AUDIO, { recursive: true });
  const only = opt('only');
  const limit = Number(opt('limit') ?? Infinity);
  const todo = entries
    .filter((e) => !only || e.id.startsWith(only))
    .filter((e) => flag('force') || !exists(e))
    .slice(0, limit);
  const chars = todo.reduce((n, e) => n + e.text.length, 0);
  console.log(`Erzeuge ${todo.length} Dateien (${chars.toLocaleString('de-DE')} Zeichen) …`);

  let done = 0;
  let failed = 0;
  const queue = [...todo];
  const worker = async () => {
    for (let e = queue.shift(); e; e = queue.shift()) {
      try {
        writeFileSync(join(AUDIO, fileOf(e)), await tts(e.text));
        done++;
        console.log(`  [${done}/${todo.length}] ${e.text}`);
      } catch (err) {
        failed++;
        const cause = (err as Error & { cause?: Error }).cause;
        console.error(`  FEHLER bei „${e.text}“: ${(err as Error).message}${cause ? ` (${cause.message})` : ''}`);
        if (/\b(401|402|403)\b/.test((err as Error).message)) queue.length = 0; // Schlüssel/Guthaben – abbrechen
      }
    }
  };
  await Promise.all(Array.from({ length: Number(opt('parallel') ?? 3) }, worker));
  console.log(`Fertig: ${done} erzeugt, ${failed} fehlgeschlagen.`);
}

function prune() {
  if (!existsSync(AUDIO)) return;
  const keep = new Set(entries.map(fileOf));
  const old = readdirSync(AUDIO).filter((f) => f.endsWith(EXT) && !keep.has(f));
  old.forEach((f) => unlinkSync(join(AUDIO, f)));
  if (old.length) console.log(`${old.length} veraltete Dateien gelöscht.`);
}

const cmd = args[0]?.startsWith('--') || !args[0] ? 'generate' : args[0];
if (cmd === 'list') {
  writeList();
  stats();
  console.log(`Liste geschrieben: ${LIST}`);
} else if (cmd === 'manifest') {
  console.log(`manifest.json: ${writeManifest()} Dateien.`);
} else {
  await generate();
  if (flag('prune')) prune();
  console.log(`manifest.json: ${writeManifest()} Dateien.`);
  stats();
}
