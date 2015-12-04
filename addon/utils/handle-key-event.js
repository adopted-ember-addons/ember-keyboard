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

export default function handleKeyEvent(event, responders) {
  const keys = gatherKeys(event);
  const listenerExclusive = listenerName(event.type, keys);
  const listenerInclusive = listenerName(event.type);

  const priority = responders.has('firstResponder') ? 'firstResponder' : [...responders.keys()].sort((a, b) => b - a)[0];

  if (isEmpty(priority)) { return; }

  responders.get(priority).forEach((responder) => {
    [listenerExclusive, listenerInclusive].forEach((triggerName) => {
      if (hasListeners(responder, triggerName)) {
        responder.trigger(triggerName, event);
      }
    });
  });
}
