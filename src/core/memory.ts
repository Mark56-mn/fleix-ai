import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL ?? '', process.env.SUPABASE_SERVICE_KEY ?? '');

export type MemoryHit = { id?: string; content: string; similarity?: number; source?: string };

export async function searchMemory(embedding: number[], threshold = 0.5, matchCount = 6): Promise<MemoryHit[]> {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) return [];
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: matchCount
  });
  if (error || !data) return [];
  return data as MemoryHit[];
}

export async function storeMemory(content: string, embedding: number[], source: string): Promise<void> {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) return;
  await supabase.from('documents').insert({ content, embedding, source });
}

export async function upsertRecord(table: string, values: Record<string, unknown>) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) return;
  await supabase.from(table).upsert(values);
}

export async function selectRecords(table: string, query: Record<string, unknown> = {}, limit = 10) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) return [];
  let q = supabase.from(table).select('*').limit(limit);
  for (const [key, val] of Object.entries(query)) q = q.eq(key, val);
  const { data } = await q;
  return data ?? [];
}
