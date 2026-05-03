import { ingestTopic } from '../core/ingest';
import { getLowConfidenceGoals } from './goals';
import { generateExplorationQuestions } from './explorer';

export async function runCuriosityCycle(): Promise<void> {
  const goals = await getLowConfidenceGoals(3);
  for (const g of goals) {
    const questions = generateExplorationQuestions(g.topic);
    await ingestTopic([g.topic, ...questions]);
  }
}
