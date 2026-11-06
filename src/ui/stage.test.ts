import { describe, expect, it } from 'vitest';
import { H, W, stageSize } from './stage';

describe('stageSize', () => {
  it('passt die Designgröße auf dem Ziel-Tablet genau ein', () => {
    expect(stageSize(1180, 820)).toEqual({ scale: 1, width: W, height: H });
  });

  it('nutzt auf dem iPhone quer die volle Breite statt Ränder zu lassen', () => {
    const s = stageSize(734, 393); // iPhone 15 quer ohne Notch-Ränder
    expect(s.height).toBe(H);
    expect(s.width * s.scale).toBeCloseTo(734, 0);
  });

  it('wird auf iPad 4:3 höher statt oben und unten Ränder zu lassen', () => {
    const s = stageSize(1024, 768);
    expect(s.width).toBe(W);
    expect(s.height * s.scale).toBeCloseTo(768, 0);
  });

  it('wächst auf extrem breiten Displays nur bis zur Obergrenze', () => {
    const s = stageSize(3440, 1000);
    expect(s.width).toBe(1820);
    expect(s.width * s.scale).toBeLessThan(3440);
  });
});
