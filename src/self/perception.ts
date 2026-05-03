import { emotionState } from '../emotion/state';
import { personalityTraits } from '../personality/traits';
import { getIdentityProfile } from '../identity/profile';

export function perceiveSelf() {
  return { identity: getIdentityProfile(), emotion: emotionState, personality: personalityTraits };
}
