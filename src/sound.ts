// Soundeffekte, per Web-Audio erzeugt (keine Audiodateien).
let enabled = true;
let ctx: AudioContext | null = null;

export function setSoundEnabled(on: boolean) {
  enabled = on;
}

function ac(): AudioContext | null {
  if (!enabled) return null;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', gain = 0.18) {
  const c = ac();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  const t = c.currentTime + start;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

export const sfx = {
  card: () => {
    const c = ac();
    if (!c) return;
    const len = Math.floor(c.sampleRate * 0.06);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
    const src = c.createBufferSource();
    const f = c.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 1800;
    const g = c.createGain();
    g.gain.value = 0.5;
    src.buffer = buf;
    src.connect(f).connect(g).connect(c.destination);
    src.start();
  },
  trickWon: () => {
    tone(660, 0, 0.15, 'triangle');
    tone(880, 0.1, 0.22, 'triangle');
  },
  trickLost: () => tone(330, 0, 0.2, 'triangle', 0.12),
  wrong: () => {
    tone(196, 0, 0.18, 'square', 0.06);
    tone(165, 0.12, 0.22, 'square', 0.06);
  },
  reveal: () => tone(990, 0, 0.12, 'sine', 0.1),
  star: () => [784, 988, 1175].forEach((f, i) => tone(f, i * 0.12, 0.25, 'triangle')),
  win: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.13, 0.3, 'triangle', 0.16)),
  lose: () => [392, 349, 330].forEach((f, i) => tone(f, i * 0.18, 0.3, 'sine', 0.12))
};
