import listenerName from 'ember-keyboard/utils/listener-name';
import validModifiers from 'ember-keyboard/fixtures/modifiers-array';

const validateKeys = function validateKeys(keys) {
  keys.forEach((key) => {
    if (validModifiers.indexOf(key) === -1) {
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

export function touchEnd(keys) {
  return formattedListener('touchEnd', keys);
}

export function touchStart(keys) {
  return formattedListener('touchstart', keys);
}
