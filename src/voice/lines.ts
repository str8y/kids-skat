// Sprachbausteine: Jeder Satz hat mehrere Varianten und einen endlichen Wertebereich.
// So kann das ElevenLabs-Skript jeden möglichen Satz vorab als Audiodatei erzeugen.

type Variant<P> = (p: P) => string;

export interface Line<P> {
  id: string;
  /** Alle Werte, mit denen der Satz im Spiel vorkommen kann. */
  domain: readonly P[];
  variants: readonly Variant<P>[];
}

const registry: Line<any>[] = [];
const lastPick = new Map<string, number>();

export function line<P>(id: string, domain: readonly P[], variants: Variant<P>[]): Line<P> {
  if (registry.some((l) => l.id === id)) throw new Error(`Satz-ID doppelt: ${id}`);
  const l = { id, domain, variants };
  registry.push(l);
  return l;
}

/** Satz ohne Platzhalter, nur Varianten. */
export function fixed(id: string, ...texts: string[]): Line<void> {
  return line<void>(id, [undefined], texts.map((t) => () => t));
}

/** Zufällige Variante – aber nie zweimal hintereinander dieselbe. */
export function pick<P>(l: Line<P>, p: P, rnd: () => number = Math.random): string {
  const n = l.variants.length;
  let i = Math.floor(rnd() * n);
  const last = lastPick.get(l.id);
  if (n > 1 && i === last) i = (i + 1) % n;
  lastPick.set(l.id, i);
  return l.variants[i](p);
}

/** Jeder Text, den die registrierten Sätze erzeugen können. */
export function allLineTexts(): { id: string; text: string }[] {
  return registry.flatMap((l) => l.domain.flatMap((p) => l.variants.map((v) => ({ id: l.id, text: v(p) }))));
}

export const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
