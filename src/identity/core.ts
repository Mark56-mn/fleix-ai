const bornAt = Date.now();

export function getIdentityCore() {
  return {
    name: 'fleix'
    purpose: 'autonomous learning system',
    ageSeconds: Math.floor((Date.now() - bornAt) / 1000)
  };
}
