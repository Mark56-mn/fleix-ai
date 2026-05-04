const providers = ['GEMINI_API_KEY', 'OPENAI_API_KEY', 'OPENROUTER_API_KEY', 'POE_API_KEY', 'NVIDIA_API_KEY'] as const;

type ProviderKey = typeof providers[number];

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

async function postJson(url: string, init: RequestInit): Promise<any> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText}${text ? `: ${text.slice(0, 300)}` : ''}`);
  }
  return res.json();
}

async function askGemini(prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('missing GEMINI_API_KEY');
  const model = process.env.GEMINI_MODEL ?? 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const json = await postJson(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });
  return json?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Gemini returned empty response';
}

async function askOpenAICompatible(opts: {
  apiKey: string;
  baseUrl: string;
  model: string;
  prompt: string;
  extraHeaders?: Record<string, string>;
  messages?: ChatMessage[];
}): Promise<string> {
  const url = `${opts.baseUrl.replace(/\/$/, '')}/chat/completions`;
  const messages = opts.messages ?? [{ role: 'user', content: opts.prompt }];
  const json = await postJson(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${opts.apiKey}`,
      ...(opts.extraHeaders ?? {})
    },
    body: JSON.stringify({
      model: opts.model,
      messages,
      temperature: 0.2
    })
  });

  return json?.choices?.[0]?.message?.content ?? 'Provider returned empty response';
}

async function askByProvider(key: ProviderKey, prompt: string): Promise<string> {
  switch (key) {
    case 'GEMINI_API_KEY':
      return askGemini(prompt);
    case 'OPENAI_API_KEY':
      return askOpenAICompatible({
        apiKey: process.env.OPENAI_API_KEY!,
        baseUrl: process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1',
        model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
        prompt
      });
    case 'OPENROUTER_API_KEY':
      return askOpenAICompatible({
        apiKey: process.env.OPENROUTER_API_KEY!,
        baseUrl: process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1',
        model: process.env.OPENROUTER_MODEL ?? 'openai/gpt-4o-mini',
        prompt,
        extraHeaders: {
          'HTTP-Referer': process.env.OPENROUTER_REFERER ?? 'http://localhost:3000',
          'X-Title': process.env.OPENROUTER_TITLE ?? 'fleix'
        }
      });
    case 'POE_API_KEY':
      return askOpenAICompatible({
        apiKey: process.env.POE_API_KEY!,
        baseUrl: process.env.POE_BASE_URL ?? 'https://api.poe.com/v1',
        model: process.env.POE_MODEL ?? 'gpt-4o-mini',
        prompt
      });
    case 'NVIDIA_API_KEY':
      return askOpenAICompatible({
        apiKey: process.env.NVIDIA_API_KEY!,
        baseUrl: process.env.NVIDIA_BASE_URL ?? 'https://integrate.api.nvidia.com/v1',
        model: process.env.NVIDIA_MODEL ?? 'meta/llama-3.1-70b-instruct',
        prompt
      });
  }
}

export async function askTeacher(prompt: string): Promise<string> {
  const errors: string[] = [];

  for (const key of providers) {
    if (!process.env[key]) continue;
    try {
      return await askByProvider(key, prompt);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${key}: ${message}`);
    }
  }

  if (!errors.length) {
    return 'I am uncertain and no teacher API is configured. Please add GEMINI_API_KEY or another teacher provider key.';
  }

  return `I am uncertain and all configured teacher providers failed. Details: ${errors.join(' | ')}`;
}
