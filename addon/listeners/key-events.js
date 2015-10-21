import Ember from 'ember';

const { on } = Ember;

const keyEvent = function keyEvent(type, ...args) {
  const callback = args.pop();

  const listeners = args.map((key) => {
    return `${type}:${key.split('+').sort().join('+')}`;
  });

  return on(...listeners, callback);
};

export function keyDown() {
  return keyEvent('keydown', ...arguments);
}

export function keyUp() {
  return keyEvent('keyup', ...arguments);
}
