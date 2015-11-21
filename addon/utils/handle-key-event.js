import Ember from 'ember';
import getKey from 'ember-keyboard/utils/get-key';
import listenerName from 'ember-keyboard/utils/listener-name';

const {
  hasListeners,
  isEmpty
} = Ember;

// joins and sorts any active modifier keys with the primary key.
const gatherKeys = function gatherKeys(event) {
  const key = getKey(event);

  return ['ctrl', 'meta', 'alt', 'shift'].reduce((keys, keyName) => {
    if (event[`${keyName}Key`]) {
      keys.push(keyName);
    }

    return keys;
  }, [key]);
};

export default function handleKeyEvent(event, responderStack) {
  if (isEmpty(responderStack)) { return; }

  const keys = gatherKeys(event);
  const listenerExclusive = listenerName(event.type, keys);
  const listenerInclusive = listenerName(event.type);

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

    [listenerExclusive, listenerInclusive].forEach((triggerName) => {
      if (hasListeners(responder, triggerName)) {
        responder.trigger(triggerName, event);
      }
    });
  });
}
