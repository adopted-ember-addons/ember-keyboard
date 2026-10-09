import listenerName from '../utils/listener-name.js';
import modifiers from '../fixtures/modifiers-array.js';

function validateKeys(keysString) {
  const keys = keysString !== undefined ? keysString.split('+') : [];
  keys.forEach(key => {
    if (modifiers.indexOf(key) === -1) {
      /* eslint no-console: ["error", { allow: ["error"] }] */
      console.error(`\`${key}\` is not a valid key name`);
    }
  });
}
const formattedListener = function formattedListener(type, keysString) {
  validateKeys(keysString);
  return listenerName(type, keysString);
};
function touchEnd(keys) {
  return formattedListener('touchEnd', keys);
}
function touchStart(keys) {
  return formattedListener('touchstart', keys);
}

export { touchEnd, touchStart };
//# sourceMappingURL=touch-events.js.map
