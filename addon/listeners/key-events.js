import Ember from 'ember';
import KEY_MAP from 'ember-keyboard/fixtures/key-map';
import listenerName from 'ember-keyboard/utils/listener-name';

const keyMapValues = Object.keys(KEY_MAP).map((key) => KEY_MAP[key]);
const validKeys = keyMapValues.concat(['alt', 'ctrl', 'meta', 'shift']);

const validateKeys = function validateKeys(keys) {
  keys.forEach((key) => {
    if (validKeys.indexOf(key) === -1) {
      Ember.Logger.error(`\`${key}\` is not a valid key name`);
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

export function keyUp(keys) {
  return formattedListener('keyup', keys);
}

export function keyPress(keys) {
  return formattedListener('keypress', keys);
}
