import { ingestTopic } from './ingest';

const failedTopics = new Set<string>();

export function getFailedTopics(): string[] {
  return [...failedTopics];
}

export async function triggerIngestionIfNeeded(topic: string, confidence: number, hits: number): Promise<void> {
  if (confidence < 0.6 || hits === 0) {
    failedTopics.add(topic);
    void ingestTopic(topic);
  }
}
