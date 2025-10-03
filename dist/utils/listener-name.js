import getCmdKey from './get-cmd-key.js';

function sortedKeys(keyArray) {
  return keyArray.sort().join('+');
}
function listenerName(type, keyArrayOrString = []) {
  let keyArray = keyArrayOrString;
  if (typeof keyArrayOrString === 'string') {
    keyArray = keyArrayOrString.split('+');
  }
  if (keyArray.indexOf('cmd') > -1) {
    keyArray[keyArray.indexOf('cmd')] = getCmdKey();
  }
  let keys = sortedKeys(keyArray || []);
  if (keys === '') {
    keys = '_all';
  }
  return `${type}:${keys}`;
}

export { listenerName as default };
