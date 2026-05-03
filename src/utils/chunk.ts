export function chunkText(input: string, size = 300): string[] {
  if (!input) return [];
  const chunks: string[] = [];
  for (let i = 0; i < input.length; i += size) {
    chunks.push(input.slice(i, i + size));
  }
  return chunks;
}
