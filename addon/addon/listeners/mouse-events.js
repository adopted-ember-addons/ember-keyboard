import listenerName from 'ember-keyboard/utils/listener-name';
import validMouseButtons from 'ember-keyboard/fixtures/mouse-buttons-array';
import validModifiers from 'ember-keyboard/fixtures/modifiers-array';

const validKeys = validMouseButtons.concat(validModifiers);

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

export function click(keys) {
  return formattedListener('click', keys);
}

export function mouseDown(keys) {
  return formattedListener('mousedown', keys);
}

export function mouseUp(keys) {
  return formattedListener('mouseup', keys);
}
