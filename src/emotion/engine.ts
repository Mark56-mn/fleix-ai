import { emotionState } from './state';

const clamp = (n: number) => Math.max(0, Math.min(1, n));

export function adjustEmotion(delta: Partial<typeof emotionState>) {
  for (const [k, v] of Object.entries(delta)) {
    const key = k as keyof typeof emotionState;
    emotionState[key] = clamp(emotionState[key] + (v ?? 0));
  }
  return emotionState;
}
