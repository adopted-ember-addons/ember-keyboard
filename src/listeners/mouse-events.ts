import listenerName from '../utils/listener-name.ts';
import validMouseButtons from '../fixtures/mouse-buttons-array.ts';
import validModifiers from '../fixtures/modifiers-array.ts';

const validKeys: readonly string[] = [...validMouseButtons, ...validModifiers];

const validateKeys = function validateKeys(keys: string[]) {
  keys.forEach((key) => {
    if (validKeys.indexOf(key) === -1) {
      /* eslint no-console: ["error", { allow: ["error"] }] */
      console.error(`\`${key}\` is not a valid key name`);
    }
  });
};

const formattedListener = function formattedListener(
  type: string,
  keysString?: string,
): string {
  const keys = keysString !== undefined ? keysString.split('+') : [];

  validateKeys(keys);

  return listenerName(type, keys);
};

export function click(keys?: string): string {
  return formattedListener('click', keys);
}

export function mouseDown(keys?: string): string {
  return formattedListener('mousedown', keys);
}

export function mouseUp(keys?: string): string {
  return formattedListener('mouseup', keys);
}
