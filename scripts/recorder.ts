// Aufnahme-Tool: Sätze aus dem Katalog selbst einsprechen.
//
//   npm run voice:record            startet http://localhost:5180
//   npm run voice:record -- --port 6000
//
// Die Seite (scripts/recorder.html) nimmt im Browser auf, schneidet Stille ab und schickt
// die Rohdaten hierher. Hier wird MP3 kodiert, nach public/audio/<key>.mp3 geschrieben und
// public/audio/manifest.json aktualisiert.
//
// Läuft mit `tsx watch`: Ändert sich ein Satz in src/, startet der Server neu – Seite neu laden
// genügt. Geänderte Sätze haben einen neuen Dateinamen und stehen dann unter „Fehlend“.
import { Mp3Encoder } from '@breezystack/lamejs';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { join } from 'node:path';
import { AUDIO, ROOT, entries, exists, fileOf, writeManifest } from './voice-files';

const args = process.argv.slice(2);
const portArg = args.indexOf('--port');
const PORT = Number(portArg >= 0 ? args[portArg + 1] : 5180);
const PAGE = join(ROOT, 'scripts', 'recorder.html');
const byKey = new Map(entries.map((e) => [e.key, e]));

function encodeMp3(pcm: Int16Array, sampleRate: number): Buffer {
  const enc = new Mp3Encoder(1, sampleRate, 128);
  const chunks: Buffer[] = [];
  const BLOCK = 1152;
  for (let i = 0; i < pcm.length; i += BLOCK) {
    const out = enc.encodeBuffer(pcm.subarray(i, i + BLOCK));
    if (out.length) chunks.push(Buffer.from(out.buffer, out.byteOffset, out.length));
  }
  const end = enc.flush();
  if (end.length) chunks.push(Buffer.from(end.buffer, end.byteOffset, end.length));
  return Buffer.concat(chunks);
}

function readBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const parts: Buffer[] = [];
    req.on('data', (c: Buffer) => parts.push(c));
    req.on('end', () => resolve(Buffer.concat(parts)));
    req.on('error', reject);
  });
}

function send(res: ServerResponse, status: number, body: string | Buffer, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store' });
  res.end(body);
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
    const path = url.pathname;

    if (req.method === 'GET' && path === '/') {
      return send(res, 200, readFileSync(PAGE), 'text/html; charset=utf-8');
    }
    if (req.method === 'GET' && path === '/api/catalog') {
      const list = entries.map((e) => ({ ...e, done: exists(e) }));
      return send(res, 200, JSON.stringify(list), 'application/json');
    }

    // /api/audio/<key> und /audio/<key>.mp3 – Schlüssel muss im Katalog stehen.
    const m = path.match(/^\/(?:api\/)?audio\/([0-9a-f]{16})(?:\.mp3)?$/);
    const entry = m ? byKey.get(m[1]) : undefined;
    if (m && !entry) return send(res, 404, 'Unbekannter Schlüssel');
    if (entry) {
      const file = join(AUDIO, fileOf(entry));
      if (req.method === 'GET') {
        if (!existsSync(file)) return send(res, 404, 'Keine Datei');
        return send(res, 200, readFileSync(file), 'audio/mpeg');
      }
      if (req.method === 'PUT') {
        const rate = Number(url.searchParams.get('rate'));
        if (![16000, 22050, 24000, 32000, 44100, 48000].includes(rate)) return send(res, 400, `Abtastrate ${rate} geht nicht`);
        const body = await readBody(req);
        const pcm = new Int16Array(body.buffer, body.byteOffset, Math.floor(body.length / 2));
        if (pcm.length < rate * 0.1) return send(res, 400, 'Aufnahme zu kurz');
        writeFileSync(file, encodeMp3(pcm, rate));
        const n = writeManifest();
        console.log(`  ✓ ${fileOf(entry)}  ${entry.text}   (${n}/${entries.length})`);
        return send(res, 200, JSON.stringify({ ok: true, count: n }), 'application/json');
      }
      if (req.method === 'DELETE') {
        if (existsSync(file)) unlinkSync(file);
        const n = writeManifest();
        console.log(`  ✗ ${fileOf(entry)} gelöscht`);
        return send(res, 200, JSON.stringify({ ok: true, count: n }), 'application/json');
      }
    }
    send(res, 404, 'Nicht gefunden');
  } catch (err) {
    console.error(err);
    send(res, 500, String((err as Error).message));
  }
});

server.listen(PORT, '127.0.0.1', () => {
  const done = entries.filter(exists).length;
  console.log(`Aufnahme-Tool: http://localhost:${PORT}`);
  console.log(`Katalog: ${entries.length} Sätze, ${done} schon vorhanden.`);
});
