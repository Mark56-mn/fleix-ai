import { fetchDatasetRows } from '../datasets/huggingface';
import { cleanText } from '../utils/clean';
import { chunkText } from '../utils/chunk';
import { embedText } from './embed';
import { storeMemory } from './memory';

export async function ingestTopic(topic: string | string[]): Promise<void> {
  const topics = Array.isArray(topic) ? topic : [topic];
  for (const t of topics) {
    const rows = await fetchDatasetRows(t);
    for (const raw of rows) {
      const cleaned = cleanText(raw);
      const pieces = chunkText(cleaned, 300);
      for (const chunk of pieces) {
        const emb = await embedText(chunk);
        await storeMemory(chunk, emb, `huggingface:${t}`);
      }
    }
  }
}
