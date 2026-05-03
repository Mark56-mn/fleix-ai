import { embedText } from './core/embed';
import { searchMemory, storeMemory } from './core/memory';
import { calculateConfidence } from './core/confidence';
import { triggerIngestionIfNeeded } from './core/triggers';
import { askTeacher } from './teachers/router';
import { startScheduler } from './core/scheduler';

type StreamLike = { write: (chunk: string) => void; end: () => void };

let booted = false;
export function bootSystem() {
  if (!booted) {
    startScheduler();
    booted = true;
  }
}

export async function processQuery(query: string, resStream: StreamLike): Promise<void> {
  const embedding = await embedText(query);
  let hits = await searchMemory(embedding);
  let confidence = calculateConfidence(hits);
  await triggerIngestionIfNeeded(query, confidence, hits.length);

  if (confidence < 0.6) {
    hits = await searchMemory(embedding);
    confidence = calculateConfidence(hits);
  }

  let answer = '';
  if (confidence < 0.6) {
    answer = await askTeacher(query);
  } else {
    answer = hits.map((h) => h.content).slice(0, 3).join('\n---\n');
  }

  const payload = `Confidence: ${confidence}\n\n${answer}`;
  for (const part of payload.match(/.{1,90}/g) ?? []) {
    resStream.write(part);
  }
  resStream.end();
  await storeMemory(`Q: ${query}\nA: ${payload}`, await embedText(payload), 'chat');
}

bootSystem();
