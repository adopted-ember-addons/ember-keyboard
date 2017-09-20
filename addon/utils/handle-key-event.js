import { get } from '@ember/object';
import getCode from 'ember-keyboard/utils/get-code';
import listenerName from 'ember-keyboard/utils/listener-name';

function gatherKeys(event) {
  const key = getCode(event);

  return ['alt', 'ctrl', 'meta', 'shift'].reduce((keys, keyName) => {
    if (event[`${keyName}Key`]) {
      keys.push(keyName);
    }

    return keys;
  }, [key]);
}

export function handleKeyEventWithPropagation(event, { firstResponders, normalResponders }) {
  const keys = gatherKeys(event);
  const listenerNames = [listenerName(event.type, keys), listenerName(event.type)];

  let isImmediatePropagationStopped = false;
  let isPropagationStopped = false;
  const ekEvent = {
    stopImmediatePropagation() {
      isImmediatePropagationStopped = true;
    },
    stopPropagation() {
      isPropagationStopped = true;
    }
  }

  for (const responder of firstResponders) {
    for (const listenerName of listenerNames) {
      responder.trigger(listenerName, event, ekEvent);
    }

    if (isImmediatePropagationStopped) {
      break;
    }
  }

  if (isPropagationStopped) {
    return;
  }

  isImmediatePropagationStopped = false;

  let previousPriorityLevel = Number.POSITIVE_INFINITY;

  for (const responder of normalResponders) {
    const currentPriorityLevel = Number(get(responder, 'keyboardPriority'));

    if (isImmediatePropagationStopped && currentPriorityLevel === previousPriorityLevel) {
      continue;
    }

    if (currentPriorityLevel < previousPriorityLevel) {
      if (isPropagationStopped) {
        return;
      }
      isImmediatePropagationStopped = false;
      previousPriorityLevel = currentPriorityLevel;
    }

    for (const listenerName of listenerNames) {
      responder.trigger(listenerName, event, ekEvent);
    }
  }
}

export function handleKeyEventWithLaxPriorities(event, sortedResponders) {
  let currentPriorityLevel;
  let noFirstResponders = true;
  let isLax = true;

  const keys = gatherKeys(event);
  const listenerNames = [listenerName(event.type, keys), listenerName(event.type)];

  sortedResponders.every((responder) => {
    const keyboardFirstResponder = get(responder, 'keyboardFirstResponder');
    const keyboardPriority = get(responder, 'keyboardPriority');

    if (keyboardFirstResponder || (noFirstResponders && keyboardPriority >= currentPriorityLevel) || isLax) {
      if (!get(responder, 'keyboardLaxPriority')) {
        isLax = false;
      }

      if (keyboardFirstResponder) {
        if (!isLax) { noFirstResponders = false; }
      } else {
        currentPriorityLevel = keyboardPriority;
      }

      listenerNames.forEach((triggerName) => {
        if (responder.has(triggerName)) {
          responder.trigger(triggerName, event);
        }
      });

      return true;
    } else {
      return false;
    }
  });
}
