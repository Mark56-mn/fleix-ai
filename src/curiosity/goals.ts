import { selectRecords, upsertRecord } from '../core/memory';

export type Goal = { id?: string; topic: string; priority: number; confidence: number; status?: string };

export async function addLearningGoal(topic: string, priority = 0.5) {
  await upsertRecord('learning_goals', { topic, priority, confidence: 0, status: 'open' });
}

export async function getLowConfidenceGoals(limit = 5): Promise<Goal[]> {
  const rows = await selectRecords('learning_goals', { status: 'open' }, limit);
  return (rows as Goal[]).sort((a, b) => a.confidence - b.confidence || b.priority - a.priority);
}
