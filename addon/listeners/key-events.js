const listenerName = function listenerName(type, keys) {
  return `${type}:${keys.split('+').sort().join('+')}`;
};

export function keyDown(keys) {
  return listenerName('keydown', keys);
}

export function keyUp(keys) {
  return listenerName('keyup', keys);
}
