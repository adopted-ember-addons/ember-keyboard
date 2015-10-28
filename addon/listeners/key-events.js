import Ember from 'ember';

const { on } = Ember;

const listenerName = function listenerName(type, keys) {
  return `${type}:${keys.split('+').sort().join('+')}`;
};

const keyEvent = function keyEvent(type, args) {
  const callback = args.pop();

  const listeners = args.map((keys) => {
    return listenerName(type, keys);
  });

  return on(...listeners, callback);
};

export function keyDown(keys) {
  return listenerName('keydown', keys);
}

export function onKeyDown(...args) {
  return keyEvent('keydown', args);
}

export function keyUp(keys) {
  return listenerName('keyup', keys);
}

export function onKeyUp(...args) {
  return keyEvent('keyup', args);
}
