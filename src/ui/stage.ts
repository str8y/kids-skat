// Bühnengröße: feste Designhöhe/-breite, die auf das Display skaliert wird.
/** Designgröße der Bühne (Tablet quer). Kleinere Seite wird immer genau eingepasst. */
export const W = 1180;
export const H = 820;
/** Auf breiteren bzw. höheren Displays wächst die Bühne bis hierhin mit, statt Ränder zu lassen
 *  (iPhone quer ≈ 2,2 : 1, iPad 4:3 ≈ 1,33 : 1). */
const W_MAX = 1820;
const H_MAX = 900;

export function stageSize(vw: number, vh: number) {
  const scale = Math.min(vw / W, vh / H);
  return {
    scale,
    width: Math.round(Math.min(W_MAX, Math.max(W, vw / scale))),
    height: Math.round(Math.min(H_MAX, Math.max(H, vh / scale))),
  };
}
