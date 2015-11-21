export default function listenerName(type, keyArray = []) {
  const keys = keyArray.length === 0 ? '_all' : keyArray.sort().join('+');

  return `${type}:${keys}`;
}
