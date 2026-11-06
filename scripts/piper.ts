// Erzeugt die Sprachausgabe der App kostenlos und offline mit Piper (https://github.com/rhasspy/piper).
//
//   npm run voice:piper                     fehlende Audiodateien erzeugen
//   npm run voice:piper -- --force          alle Dateien neu erzeugen (überschreibt auch Aufnahmen!)
//   npm run voice:piper -- --limit 20       nur 20 Dateien (zum Ausprobieren)
//   npm run voice:piper -- --only end.      nur Sätze, deren ID so beginnt
//
// Einmalig einrichten:
//   pip install piper-tts        (außerdem muss ffmpeg installiert sein)
//   Stimme laden, z. B. de_DE-thorsten-high (.onnx und .onnx.json) von
//   https://huggingface.co/rhasspy/piper-voices/tree/main/de/de_DE nach .piper/
//
// Umgebungsvariablen:
//   PIPER_MODEL    (Standard: .piper/de_DE-thorsten-high.onnx)
//   PIPER_SPEED    Sprechdauer, >1 = langsamer (Standard: 1.05)
//   PIPER_BITRATE  (Standard: 56k, Mono)
//   PIPER_PYTHON   (Standard: python3)
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { AUDIO, ROOT, entries, exists, fileOf, writeManifest } from './voice-files';

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const opt = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

const model = process.env.PIPER_MODEL ?? join(ROOT, '.piper', 'de_DE-thorsten-high.onnx');
if (!existsSync(model)) {
  console.error(`Stimme nicht gefunden: ${model}\nSiehe Kopf von scripts/piper.ts.`);
  process.exit(1);
}

const only = opt('only');
const todo = entries
  .filter((e) => !only || e.id.startsWith(only))
  .filter((e) => flag('force') || !exists(e))
  .slice(0, Number(opt('limit') ?? Infinity));

mkdirSync(AUDIO, { recursive: true });
console.log(`Erzeuge ${todo.length} Dateien mit ${model} …`);
const res = spawnSync(
  process.env.PIPER_PYTHON ?? 'python3',
  [join(ROOT, 'scripts', 'piper_synth.py'), model, process.env.PIPER_SPEED ?? '1.05', process.env.PIPER_BITRATE ?? '56k'],
  { input: JSON.stringify(todo.map((e) => ({ text: e.text, out: join(AUDIO, fileOf(e)) }))), stdio: ['pipe', 'inherit', 'inherit'] }
);
if (res.status !== 0) process.exit(res.status ?? 1);
console.log(`manifest.json: ${writeManifest()} Dateien.`);
