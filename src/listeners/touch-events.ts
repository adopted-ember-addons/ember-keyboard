import listenerName from '../utils/listener-name.ts';
import validModifiers from '../fixtures/modifiers-array.ts';

function validateKeys(keysString?: string) {
  const keys = keysString !== undefined ? keysString.split('+') : [];
  keys.forEach((key) => {
    if ((validModifiers as readonly string[]).indexOf(key) === -1) {
      /* eslint no-console: ["error", { allow: ["error"] }] */
      console.error(`\`${key}\` is not a valid key name`);
    }
  });
}

const formattedListener = function formattedListener(
  type: string,
  keysString?: string,
): string {
  validateKeys(keysString);
  return listenerName(type, keysString);
};

export function touchEnd(keys?: string): string {
  return formattedListener('touchEnd', keys);
}

export function touchStart(keys?: string): string {
  return formattedListener('touchstart', keys);
}
