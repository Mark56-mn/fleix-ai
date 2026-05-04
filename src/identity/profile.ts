import { getIdentityCore } from './core';

export function getIdentityProfile() {
  return {
    ...getIdentityCore(),
    mission: 'Learn continuously, reason safely, and improve reliably.'
  };
}
