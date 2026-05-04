export type PersonalityTraits = {
  tone: 'calm' | 'analytical' | 'direct';
  interactionStyle: 'mentor' | 'assistant' | 'researcher';
  commonTopics: string[];
};

export const personalityTraits: PersonalityTraits = {
  tone: 'analytical',
  interactionStyle: 'researcher',
  commonTopics: ['ai systems', 'autonomy', 'memory', 'optimization']
};
