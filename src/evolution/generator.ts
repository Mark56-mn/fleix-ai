import { askTeacher } from '../teachers/router';

export async function generateFix(problem: string): Promise<string> {
  return askTeacher(`Generate a TypeScript patch idea for: ${problem}`);
}
