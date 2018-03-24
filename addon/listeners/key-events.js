import listenerName from 'ember-keyboard/utils/listener-name';
import validKeys from 'ember-keyboard/fixtures/valid-keys';

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
