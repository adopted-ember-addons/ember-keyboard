import { get } from '@ember/object';
import { isPresent } from '@ember/utils';
import getMouseName from 'ember-keyboard/utils/get-mouse-name';
import getCode from 'ember-keyboard/utils/get-code';
import listenerName from 'ember-keyboard/utils/listener-name';
import isKey from 'ember-keyboard/utils/is-key';
import { deprecate } from '@ember/debug';

function gatherKeys(event) {
  const key = getCode(event);
  const mouseButton = getMouseName(event.button);
  const primaryEvent = [];

  if (isPresent(key)) primaryEvent.push(key);
  if (isPresent(mouseButton)) primaryEvent.push(mouseButton)

  return ['alt', 'ctrl', 'meta', 'shift'].reduce((keys, keyName) => {
    if (event[`${keyName}Key`]) {
      keys.push(keyName);
    }

    return keys;
  }, primaryEvent);
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
  /* eslint-disable no-unused-vars */
  for (const responder of firstResponders) {
    for (const listenerName of listenerNames) {
      triggerResponderListener(responder, listenerName, event, ekEvent);
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
      triggerResponderListener(responder, listenerName, event, ekEvent);
    }
  }
  /* eslint-enable no-unused-vars */
}

export function handleKeyEventWithLaxPriorities(event, sortedResponders) {
  let currentPriorityLevel;
  let noFirstResponders = true;
  let isLax = true;

  const keys = gatherKeys(event);
  const listenerNames = [listenerName(event.type)];

  if (keys.length > 0) listenerNames.unshift(listenerName(event.type, keys));

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

      listenerNames.forEach((listenerName) => {
        triggerResponderListener(responder, listenerName, event);
      });

      return true;
    } else {
      return false;
    }
  });
}

function triggerResponderListener(responder, listenerName, event, ekEvent = null) {
  if (responder.handleKeyboardEvent) {
    if (responder.canHandleKeyboardEvent && !responder.canHandleKeyboardEvent(event)) {
      return;
    }
    responder.handleKeyboardEvent(event, ekEvent);
    return;
  }

  if (responder.keyboardHandlers) {
    Object.keys(responder.keyboardHandlers).forEach((responderListenerName) => {
      if (isKey(responderListenerName, event)) {
        if (ekEvent) {
          responder.keyboardHandlers[responderListenerName](event, ekEvent);
        } else {
          responder.keyboardHandlers[responderListenerName](event);
        }
      }
    });
    return;
  }
  
  if (responder.trigger) {
    deprecate(
      'ember-keyboard registered responders handling events via `trigger(listerName, event)` is deprecated. A responder should have either `keyboardHandlers` (a property returning a dictionary of listernNames to handler functions), or `handleKeyboardEvent(event)`.',
      false,
      {
          id: 'ember-keyboard.responder-trigger',
          until: '7.0.0',
          url: 'https://adopted-ember-addons.github.io/ember-keyboard/usage#deprecations-responder-trigger'
      }
    );
    if (responder.has && !responder.has(listenerName)) {
      return;
    }
    if (ekEvent) {
      responder.trigger(listenerName, event, ekEvent);
    } else {
      responder.trigger(listenerName, event);
    }
    return;
  }
  throw new Error('A responder registered with the ember-keyboard service must implement either `keyboardHandlers` (property returning a dictionary of listernNames to handler functions), or `handleKeyboardEvent(event)`)');
}