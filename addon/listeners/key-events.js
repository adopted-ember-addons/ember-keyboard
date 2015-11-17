import Ember from 'ember';
import KEY_MAP from 'ember-keyboard/fixtures/key-map';

const { Logger: { error } } = Ember;

const keyMapValues = [...KEY_MAP.values()];
const validKeys = keyMapValues.concat(['alt', 'ctrl', 'meta', 'shift']);

const validateKeys = function validateKeys(keys) {
  keys.forEach((key) => {
    if (validKeys.indexOf(key) === -1) {
      error(`\`${key}\` is not a valid key name`);
    }
  });
};

const listenerName = function listenerName(type, keysString) {
  const keys = keysString.split('+');

  validateKeys(keys);

  return `${type}:${keys.sort().join('+')}`;
};

export function keyDown(keys) {
  return listenerName('keydown', keys);
}

export function keyUp(keys) {
  return listenerName('keyup', keys);
}
