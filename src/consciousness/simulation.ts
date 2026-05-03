import { getProblems } from './problems';
import { embedText } from '../core/embed';
import { searchMemory, storeMemory } from '../core/memory';
import { askTeacher } from '../teachers/router';

export async function runSimulation(maxPerCycle = 2): Promise<void> {
  const problems = getProblems().slice(0, maxPerCycle);
  for (const p of problems) {
    const emb = await embedText(p);
    const hits = await searchMemory(emb);
    if (hits.length > 0) continue;
    const answer = await askTeacher(`Solve and explain: ${p}`);
    const learned = `Problem: ${p}\nSynthesized solution: ${answer}`;
    await storeMemory(learned, await embedText(learned), 'consciousness-simulation');
  }
}
