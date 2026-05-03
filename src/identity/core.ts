const bornAt = Date.now();

export function getIdentityCore() {
  return {
    name: 'fleix',
    creator: 'Mr Gray',
    purpose: 'autonomous learning system',
    ageSeconds: Math.floor((Date.now() - bornAt) / 1000)
  };
}
