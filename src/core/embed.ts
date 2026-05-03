let extractor: any;

export async function embedText(text: string): Promise<number[]> {
  try {
    if (!extractor) {
      const { pipeline } = await import('@xenova/transformers');
      extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    const result = await extractor(text, { pooling: 'mean', normalize: true });
    return Array.from(result.data as Float32Array);
  } catch {
    const arr = new Array(384).fill(0);
    for (let i = 0; i < text.length; i++) arr[i % arr.length] += text.charCodeAt(i) / 65535;
    return arr.map((v) => Number((v % 1).toFixed(6)));
  }
}
