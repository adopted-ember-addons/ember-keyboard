import getCmdKey from 'ember-keyboard/utils/get-cmd-key';

function sortedKeys(keyArray) {
  return keyArray.sort().join('+');
}

export default function listenerName(type, keyArrayOrString = []) {
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
