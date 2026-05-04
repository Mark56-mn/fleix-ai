import { upsertRecord } from '../core/memory';
import { analyzeCodebase } from './analyzer';
import { generateFix } from './generator';
import { runSandboxTest } from './sandbox';
import { validatePerformance } from './validator';

export async function runSelfEvolution(maxPerCycle = 1): Promise<void> {
  for (let i = 0; i < maxPerCycle; i++) {
    const problem = await analyzeCodebase();
    const suggestion = await generateFix(problem);
    const safe = await runSandboxTest(suggestion);
    const beneficial = await validatePerformance(problem, suggestion);
    if (safe && beneficial) {
      await upsertRecord('evolution_suggestions', { problem, suggestion, status: 'approved' });
    }
  }
}
