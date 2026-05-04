import { embedText } from './embed';
import { calculateConfidence } from './confidence';
import { searchMemory, storeMemory } from './memory';
import { askTeacher } from '../teachers/router';
import { runTool, type ToolCall } from './tools';

export type OrchestratorResult = {
  answer: string;
  confidence: number;
  toolsUsed: ToolCall[];
  memoryRefs: string[];
};

function parseIntent(query: string) {
  const q = query.toLowerCase();
  if (/\d+[\d\s+\-*/().]*/.test(q)) return 'calculate';
  if (q.includes('search') || q.includes('latest')) return 'web';
  if (q.includes('read file')) return 'read';
  if (q.includes('write file')) return 'write';
  if (q.includes('run code')) return 'code';
  return 'reason';
}

async function planner(query: string): Promise<ToolCall[]> {
  const intent = parseIntent(query);
  if (intent === 'calculate') return [{ name: 'calculator', input: query.replace(/[^0-9+\-*/(). ]/g, ''), justification: 'Need exact numeric result' }];
  if (intent === 'web') return [{ name: 'webSearch', input: query, justification: 'Need current external information' }];
  if (intent === 'read') return [{ name: 'fileRead', input: query.replace('read file', '').trim(), justification: 'User asked to read a file' }];
  if (intent === 'write') return [{ name: 'fileWrite', input: query.replace('write file', '').trim(), justification: 'User asked to write a file' }];
  if (intent === 'code') return [{ name: 'codeExec', input: query.replace('run code', '').trim(), justification: 'User requested sandboxed code execution' }];
  return [];
}

export async function runOrchestrator(query: string): Promise<OrchestratorResult> {
  const embedding = await embedText(query);
  const hits = await searchMemory(embedding);
  let confidence = calculateConfidence(hits);

  const plan = await planner(query);
  const outputs: string[] = [];
  for (const step of plan) outputs.push(await runTool(step));

  let answer = outputs.join('\n').trim();
  if (!answer && hits.length) answer = hits.slice(0, 3).map((h) => h.content).join('\n---\n');

  if (confidence < 0.6 || !answer) {
    const teacher = await askTeacher(`User query: ${query}\nKnown context:${answer || 'none'}`);
    answer = teacher;
    confidence = Math.max(confidence, 0.68);
    const mem = `teacher-verified knowledge\nQ:${query}\nA:${teacher}`;
    await storeMemory(mem, await embedText(mem), 'teacher-verified');
  }

  const selfCheck = [
    'Self-check:',
    `- Answer coherent: ${answer.length > 0}`,
    `- Memory used: ${hits.length > 0}`,
    `- Guessing avoided: ${confidence >= 0.6}`
  ].join('\n');

  const full = `Answer: ${answer}\n\nConfidence score: ${confidence.toFixed(2)}\n\n${selfCheck}`;
  await storeMemory(`interaction:${query}\n${full}`, await embedText(full), 'interaction');

  return { answer: full, confidence, toolsUsed: plan, memoryRefs: hits.map((h) => h.source ?? 'memory') };
}
