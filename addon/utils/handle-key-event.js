import Ember from 'ember';
import KEY_MAP from 'ember-keyboard/fixtures/key-map';

const { hasListeners } = Ember;

// Transforms jquery events' `keyup` and `keydown` into Ember conventional `keyUp` and `keyDown`.
const normalizeEventType = function normalizeEventType(key, event) {
  return `key${Ember.String.capitalize(event.type.replace('key', ''))}:${key}`;
};

// Since app devs might define their modifier keys in any order (eg. `keyUp:shift+ctrl+a` or
// `keyUp:ctrl+shift+a`), we must check for each variant until we find the correct one.
const gatherEventNameVariants = function gatherEventNameVariants(event, keys, eventName) {
  if (keys.length === 0) {
    return [eventName];
  }

  return keys.reduce((variants, key) => {
    const modifiedEventName = !eventName ? normalizeEventType(key, event) : `${eventName}+${key}`;
    const remainingKeys = keys.filter((keyName) => keyName !== key);

    return variants.pushObjects(gatherEventNameVariants(event, remainingKeys, modifiedEventName));
  }, Ember.A());
};

// Check if any modifier keys are being held down.
const gatherKeys = function gatherKeys(event) {
  const key = event.key || KEY_MAP[event.keyCode];

  return ['ctrl', 'meta', 'alt', 'shift'].reduce((keys, keyName) => {
    if (event[`${keyName}Key`]) {
      keys.pushObject(keyName);
    }

    return keys;
  }, Ember.A([key]));
};

export default function handleKeyEvent(event, responderStack) {
  let triggeredVariant;
  const keys = gatherKeys(event);
  const variants = gatherEventNameVariants(event, keys);

  // Finds the first responder with a registered listener for one of the variants
  const responder = responderStack.find((responder) => {
    return triggeredVariant = variants.find((variant) => hasListeners(responder, variant));
  });

  if (responder) {
    responder.trigger(triggeredVariant);
  }
}
