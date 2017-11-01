import codeMap from 'ember-keyboard/fixtures/code-map';
import listenerName from 'ember-keyboard/utils/listener-name';
import validModifiers from 'ember-keyboard/fixtures/modifiers-array';

const keyMapValues = Object.keys(codeMap).map((key) => codeMap[key]);
const validKeys = keyMapValues.concat(validModifiers);

const validateKeys = function validateKeys(keys) {
  keys.forEach((key) => {
    if (validKeys.indexOf(key) === -1) {
      /* eslint no-console: ["error", { allow: ["error"] }] */
      console.error(`\`${key}\` is not a valid key name`);
    }
  });
};

const formattedListener = function formattedListener(type, keysString) {
  const keys = keysString !== undefined ? keysString.split('+') : [];

  validateKeys(keys);

  return listenerName(type, keys);
};

export function keyDown(keys) {
  return formattedListener('keydown', keys);
}

export function keyPress(keys) {
  return formattedListener('keypress', keys);
}

export function keyUp(keys) {
  return formattedListener('keyup', keys);
}
