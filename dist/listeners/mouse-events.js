import listenerName from '../utils/listener-name.js';
import validMouseButtons from '../fixtures/mouse-buttons-array.js';
import validModifiers from '../fixtures/modifiers-array.js';
import '../utils/get-cmd-key.js';

const validKeys = validMouseButtons.concat(validModifiers);
const validateKeys = function validateKeys(keys) {
  keys.forEach(key => {
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
function click(keys) {
  return formattedListener('click', keys);
}
function mouseDown(keys) {
  return formattedListener('mousedown', keys);
}
function mouseUp(keys) {
  return formattedListener('mouseup', keys);
}

export { click, mouseDown, mouseUp };
