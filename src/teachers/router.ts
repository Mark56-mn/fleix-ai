const providers = ['GEMINI_API_KEY', 'OPENAI_API_KEY', 'OPENROUTER_API_KEY', 'POE_API_KEY', 'NVIDIA_API_KEY'] as const;

async function askMock(provider: string, prompt: string): Promise<string> {
  return `[${provider}] Explanation for: ${prompt}`;
}

export async function askTeacher(prompt: string): Promise<string> {
  for (const key of providers) {
    if (process.env[key]) return askMock(key.replace('_API_KEY', ''), prompt);
  }
  return 'No teacher API configured. I need more data before answering with high confidence.';
}
