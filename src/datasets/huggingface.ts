export async function fetchDatasetRows(topic: string, rows = 25): Promise<string[]> {
  const url = new URL('https://datasets-server.huggingface.co/rows');
  url.searchParams.set('dataset', 'wikimedia/wikipedia');
  url.searchParams.set('config', '20231101.en');
  url.searchParams.set('split', 'train');
  url.searchParams.set('offset', '0');
  url.searchParams.set('length', String(rows));

  const headers: Record<string, string> = {};
  if (process.env.HUGGINGFACE_API_KEY) headers.Authorization = `Bearer ${process.env.HUGGINGFACE_API_KEY}`;

  const res = await fetch(url, { headers });
  if (!res.ok) return [`No dataset rows available for ${topic}`];
  const json = await res.json() as { rows?: Array<{ row?: Record<string, unknown> }> };

  const out: string[] = [];
  for (const item of json.rows ?? []) {
    const row = item.row ?? {};
    const txt = Object.values(row).find((v) => typeof v === 'string' && (v as string).toLowerCase().includes(topic.toLowerCase()));
    if (typeof txt === 'string') out.push(txt);
  }
  return out.length ? out : [`Topic seed: ${topic}`];
}
