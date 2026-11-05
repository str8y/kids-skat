// Vorlesen: zuerst fertige Audiodateien (ElevenLabs, siehe scripts/elevenlabs.ts),
// sonst die Sprachausgabe des Browsers.
//
// Eine Ansage ist ein Text oder eine Liste von Bausteinen (Sätzen). Jeder Baustein,
// zu dem es in public/audio/manifest.json eine Datei gibt, wird als Audio abgespielt;
// alle anderen liest die Browserstimme.
import { audioKey } from './voice/key';

let enabled = true;
let voice: SpeechSynthesisVoice | null = null;
const hasTts = typeof speechSynthesis !== 'undefined';

function pickVoice() {
  if (!hasTts) return;
  const voices = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('de'));
  voice = voices.find((v) => /google|anna|petra|helena|katja/i.test(v.name)) ?? voices[0] ?? null;
}

if (hasTts) {
  pickVoice();
  speechSynthesis.addEventListener?.('voiceschanged', pickVoice);
}

// ---------- Audiodateien ----------

const AUDIO_DIR = `${import.meta.env.BASE_URL}audio/`;
let files: Record<string, string> = {};
const player: HTMLAudioElement | null = typeof Audio !== 'undefined' ? new Audio() : null;

if (player && typeof fetch !== 'undefined') {
  fetch(`${AUDIO_DIR}manifest.json`)
    .then((r) => (r.ok ? r.json() : null))
    .then((m: { files?: Record<string, string> } | null) => {
      files = m?.files ?? {};
    })
    .catch(() => {
      /* keine Audiodateien – Browserstimme */
    });
}

const fileFor = (text: string) => files[audioKey(text)];

/** Zählt hoch bei jeder neuen Ansage; ältere Ansagen brechen dann ab. */
let generation = 0;
/** Beendet den gerade laufenden Baustein (Audio oder Browserstimme). */
let abort: (() => void) | null = null;

function playFile(file: string, gen: number): Promise<boolean> {
  return new Promise((resolve) => {
    if (!player || gen !== generation) return resolve(false);
    const stop = () => done(false);
    const done = (ok: boolean) => {
      player.onended = player.onerror = null;
      if (abort === stop) abort = null;
      resolve(ok && gen === generation);
    };
    abort = stop;
    player.onended = () => done(true);
    player.onerror = () => done(false);
    player.src = AUDIO_DIR + file;
    player.play().catch(() => done(false));
  });
}

function tts(text: string, gen: number): Promise<void> {
  return new Promise((resolve) => {
    if (!hasTts || gen !== generation) return resolve();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'de-DE';
    if (voice) u.voice = voice;
    u.rate = 0.95;
    u.pitch = 1.05;
    // Manche Browser melden das Ende nicht zuverlässig.
    const finish = () => {
      clearTimeout(timer);
      if (abort === finish) abort = null;
      resolve();
    };
    const timer = setTimeout(finish, 3000 + text.length * 150);
    abort = finish;
    u.onend = u.onerror = finish;
    speechSynthesis.speak(u);
  });
}

async function run(parts: string[], gen: number) {
  let i = 0;
  while (i < parts.length && gen === generation) {
    const file = fileFor(parts[i]);
    if (file && (await playFile(file, gen))) {
      i++;
      continue;
    }
    if (gen !== generation) return;
    // Bausteine ohne Datei am Stück vorlesen, damit es flüssig klingt.
    let j = i + 1;
    while (j < parts.length && !fileFor(parts[j])) j++;
    await tts(parts.slice(i, j).join(' '), gen);
    i = j;
  }
}

export function setSpeechEnabled(on: boolean) {
  enabled = on;
  if (!on) stopSpeaking();
}

let current: Promise<void> = Promise.resolve();

export function say(text: string | string[]) {
  stopSpeaking();
  const parts = (Array.isArray(text) ? text : [text]).filter(Boolean);
  if (!enabled || parts.length === 0) return;
  current = run(parts, generation);
}

/** Wird erfüllt, sobald die aktuelle Ansage zu Ende ist (oder abgebrochen wurde). */
export function speechIdle(): Promise<void> {
  return current;
}

export function stopSpeaking() {
  generation++;
  abort?.();
  player?.pause();
  if (hasTts) speechSynthesis.cancel();
}
