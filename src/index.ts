import { startScheduler } from './core/scheduler';
import { runOrchestrator } from './core/orchestrator';
import { rememberInteraction } from './personality/memory';

type StreamLike = { write: (chunk: string) => void; end: () => void };

let booted = false;
export function bootSystem() {
  if (!booted) {
    startScheduler();
    booted = true;
  }
}

export async function processQuery(query: string, resStream: StreamLike): Promise<void> {
  const result = await runOrchestrator(query);
  rememberInteraction(`Q:${query}\nConfidence:${result.confidence.toFixed(2)}`);
  for (const part of result.answer.match(/.{1,120}/gs) ?? []) resStream.write(part);
  resStream.end();
}

bootSystem();
