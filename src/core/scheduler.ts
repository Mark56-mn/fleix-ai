import { ingestTopic } from './ingest';
import { getFailedTopics } from './triggers';
import { runCuriosityCycle } from '../curiosity/engine';
import { runSelfEvolution } from '../evolution/engine';
import { runSimulation } from '../consciousness/simulation';
import { runIdentityUpdateLoop } from '../self/updater';

export function startScheduler(): void {
  const runCycle = async () => {
    const failed = getFailedTopics();
    if (failed.length) await ingestTopic(failed);
    await runCuriosityCycle();
    await runSelfEvolution(1);
    await runSimulation(2);
    await runIdentityUpdateLoop();
  };
  void runCycle();
  setInterval(() => void runCycle(), 6 * 60 * 60 * 1000);
}
