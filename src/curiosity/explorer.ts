export function generateExplorationQuestions(topic: string): string[] {
  return [
    `What is ${topic} and why does it matter?`,
    `How does ${topic} work at a systems level?`,
    `Why does ${topic} fail in edge cases?`,
    `What are practical applications of ${topic}?`,
    `How can ${topic} be improved autonomously?`
  ];
}
