import Ember from 'ember';
import getKey from 'ember-keyboard/utils/get-key';
import listenerName from 'ember-keyboard/utils/listener-name';

const {
  hasListeners,
  get
} = Ember;

const gatherKeys = function gatherKeys(event) {
  const key = getKey(event);

  return ['ctrl', 'meta', 'alt', 'shift'].reduce((keys, keyName) => {
    if (event[`${keyName}Key`]) {
      keys.push(keyName);
    }

    return keys;
  }, [key]);
};

const sortPriorityLevelKeys = function sortPriorityLevelKeys(priorityLevels) {
  return Object.keys(priorityLevels).sort((a, b) => {
    if (a === 'firstResponder') {
      return -1;
    } else if (b === 'firstResponder') {
      return 1;
    } else {
      return b - a;
    }
  });
};

const triggerListeners = function triggerListeners(event, responders, listenerNames) {
  let isLax = true;

  [...responders].forEach((responder) => {
    if (!get(responder, 'keyboardLaxPriority')) {
      isLax = false;
    }

    listenerNames.forEach((triggerName) => {
      if (hasListeners(responder, triggerName)) {
        responder.trigger(triggerName, event);
      }
    });
  });

  return isLax;
};

export default function handleKeyEvent(event, priorityLevels) {
  const keys = gatherKeys(event);
  const listenerNames = [listenerName(event.type, keys), listenerName(event.type)];
  const sortedPriorityLevelKeys = sortPriorityLevelKeys(priorityLevels);

  sortedPriorityLevelKeys.every((key) => {
    return triggerListeners(event, get(priorityLevels, key), listenerNames);
  });
}
