const bornAt = Date.now();

export function getIdentityCore() {
  return {
    name: 'Nash',
    creator: 'Mr Gray',
    purpose: 'autonomous learning system',
    ageSeconds: Math.floor((Date.now() - bornAt) / 1000)
  };
}
