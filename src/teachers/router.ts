const providers = ['GEMINI_API_KEY', 'OPENAI_API_KEY', 'OPENROUTER_API_KEY', 'POE_API_KEY', 'NVIDIA_API_KEY'] as const;

async function askGemini(prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('no key');
  const model = process.env.GEMINI_MODEL ?? 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });
  if (!res.ok) throw new Error('gemini failed');
  const json = await res.json() as any;
  return json?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Gemini returned empty response';
}

export async function askTeacher(prompt: string): Promise<string> {
  for (const key of providers) {
    if (!process.env[key]) continue;
    if (key === 'GEMINI_API_KEY') {
      try { return await askGemini(prompt); } catch { }
    }
    return `[${key.replace('_API_KEY', '')}] fallback explanation: ${prompt}`;
  }
  return 'I am uncertain and no teacher API is configured. Please add GEMINI_API_KEY for verified fallback.';
}
