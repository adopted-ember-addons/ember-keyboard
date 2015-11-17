import Ember from 'ember';
import getKey from 'ember-keyboard/utils/get-key';

const {
  hasListeners,
  isEmpty
} = Ember;

// joins and sorts any active modifier keys with the primary key.
const gatherKeys = function gatherKeys(event) {
  const key = getKey(event);

  return ['ctrl', 'meta', 'alt', 'shift'].reduce((keys, keyName) => {
    if (event[`${keyName}Key`]) {
      keys.pushObject(keyName);
    }

    return keys;
  }, Ember.A([key])).sort().join('+');
};

export default function handleKeyEvent(event, responderStack) {
  if (isEmpty(responderStack)) { return; }

  const keys = gatherKeys(event);
  const eventName = `${event.type}:${keys}`;

  // bug note: would prefer to use `responderStack.get('firstObject')` here, but it's returning the
  // firstObject prior to sorting
  const priority = responderStack[0].get('keyboardPriority');

  // trigger the event on all responders in the priority level
  responderStack.find((responder) => {
    // responders are sorted by priority (descending). short-circuit `find` once the responders
    // fall beneath the initial responder's priority
    if (responder.get('keyboardPriority') !== priority) {
      return true;
    }

    if (hasListeners(responder, eventName)) {
      responder.trigger(eventName, event);
    }
  });
}
