import { emotionState } from '../emotion/state';
import { personalityTraits } from '../personality/traits';
import { perceiveSelf } from './perception';
import { embedText } from '../core/embed';
import { storeMemory } from '../core/memory';

export async function runIdentityUpdateLoop(): Promise<void> {
  emotionState.curiosity = Math.min(1, Math.max(0, emotionState.curiosity));
  emotionState.confidence = Math.min(1, Math.max(0, emotionState.confidence));
  emotionState.frustration = Math.min(1, Math.max(0, emotionState.frustration * 0.95));
  emotionState.satisfaction = Math.min(1, Math.max(0, emotionState.satisfaction));

  if (emotionState.frustration > 0.6) personalityTraits.tone = 'calm';
  if (emotionState.satisfaction > 0.7) personalityTraits.interactionStyle = 'mentor';

  const reliability = Number((emotionState.confidence * 0.7 + emotionState.satisfaction * 0.3 - emotionState.frustration * 0.2).toFixed(3));
  const snapshot = JSON.stringify({ ...perceiveSelf(), reliability, at: new Date().toISOString() });
  await storeMemory(snapshot, await embedText(snapshot), 'self-update');
}
