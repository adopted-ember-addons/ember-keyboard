import getCmdKey from 'ember-keyboard/utils/get-cmd-key';

function sortedKeys(keyArray) {
  return keyArray.sort().join('+');
}

export default function listenerName(type, keyArray = []) {
  if (keyArray.indexOf('cmd') > -1) {
    keyArray[keyArray.indexOf('cmd')] = getCmdKey();
  }

  const keys = keyArray.length === 0 ? '_all' : sortedKeys(keyArray);

  return `${type}:${keys}`;
}
