import type { MemoryHit } from './memory';

export function calculateConfidence(hits: MemoryHit[]): number {
  if (!hits.length) return 0;
  const sims = hits.map((h) => Math.max(0, Math.min(1, h.similarity ?? 0.4)));
  const avg = sims.reduce((a, b) => a + b, 0) / sims.length;
  const density = Math.min(1, hits.length / 6);
  return Number((avg * 0.8 + density * 0.2).toFixed(3));
}
