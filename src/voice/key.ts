// Dateiname einer Audiodatei aus dem Satz – gleich im Skript und in der App.

/** Leerzeichen vereinheitlichen, damit kleine Unterschiede nicht zu neuen Dateien führen. */
export const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();

/** 64-Bit-FNV-1a über UTF-16, als 16 Hex-Zeichen. */
export function audioKey(text: string): string {
  const t = normalize(text);
  let h1 = 0x811c9dc5;
  let h2 = 0x050c5d1f;
  for (let i = 0; i < t.length; i++) {
    const c = t.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ c, 0x01000193) ^ (h1 >>> 7);
    h2 >>>= 0;
  }
  return h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0');
}
