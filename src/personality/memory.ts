const interactions: string[] = [];

export function rememberInteraction(entry: string) {
  interactions.push(entry);
  if (interactions.length > 100) interactions.shift();
}

export function getRecentInteractions(limit = 20): string[] {
  return interactions.slice(-limit);
}
