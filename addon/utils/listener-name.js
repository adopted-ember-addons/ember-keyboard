function sortedKeys(keyArray) {
  return keyArray.sort().join('+');
}

export default function listenerName(type, keyArray = []) {
  const keys = keyArray.length === 0 ? '_all' : sortedKeys(keyArray);

  return `${type}:${keys}`;
}
