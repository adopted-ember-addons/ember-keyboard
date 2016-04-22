import altKeyNames from 'ember-keyboard/fixtures/alt-key-names';

function convertArray(keyArray) {
  return keyArray.map((key) => altKeyNames[key] || key);
}

function sortedKeys(keyArray) {
  const convertedArray = convertArray(keyArray);

  return convertedArray.sort().join('+');
}

export default function listenerName(type, keyArray = []) {
  const keys = keyArray.length === 0 ? '_all' : sortedKeys(keyArray);

  return `${type}:${keys}`;
}
