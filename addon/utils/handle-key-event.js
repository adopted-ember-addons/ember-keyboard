import { get } from '@ember/object';
import getMouseName from 'ember-keyboard/utils/get-mouse-name';
import listenerName from 'ember-keyboard/utils/listener-name';
import isKey from 'ember-keyboard/utils/is-key';
import { deprecate } from '@ember/debug';


function modifierStrings(event) {
  if (event instanceof KeyboardEvent) {
    return ['alt', 'ctrl', 'meta', 'shift'].reduce((result, keyName) => {
      if (event[`${keyName}Key`]) {
        result.push(keyName);
      }

      return result;
    }, []);
  } else if (event instanceof MouseEvent) {
    let mouseButton = getMouseName(event.button);
    if (mouseButton) {
      return [mouseButton];
    }
    return []
  }
}

export function handleKeyEventWithPropagation(event, { firstResponders, normalResponders }) {
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
    triggerResponderListener(responder, event, ekEvent);

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

    triggerResponderListener(responder, event, ekEvent);
  }
  /* eslint-enable no-unused-vars */
}

export function handleKeyEventWithLaxPriorities(event, sortedResponders) {
  let currentPriorityLevel;
  let noFirstResponders = true;
  let isLax = true;

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

      triggerResponderListener(responder, event);

      return true;
    } else {
      return false;
    }
  });
}

function triggerResponderListener(responder, event, ekEvent = null) {
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
      'ember-keyboard registered responders handling events via `trigger(listenerName, event)` is deprecated. A responder should have either `keyboardHandlers` (a property returning a dictionary of listenerNames to handler functions), or `handleKeyboardEvent(event)`.',
      false,
      {
          id: 'ember-keyboard.responder-trigger',
          until: '7.0.0',
          url: 'https://adopted-ember-addons.github.io/ember-keyboard/deprecations#responder-trigger'
      }
    );

    triggerViaLegacyResponderApi(responder, event, ekEvent);
    return;
  }
  throw new Error('A responder registered with the ember-keyboard service must implement either `keyboardHandlers` (property returning a dictionary of listenerNames to handler functions), or `handleKeyboardEvent(event)`)');
}

export function getListenerNames(event) {
  let result = [];
  if (event instanceof KeyboardEvent) {
    if (event.key) {
      result.push(listenerName(event.type, modifierStrings(event).concat([event.key]).join('+')));
    }
    if (event.code && (event.key !== event.code)) {
      result.push(listenerName(event.type, modifierStrings(event).concat([event.code]).join('+')));
    }
  } else if (event instanceof MouseEvent) {
    let modifiers = modifierStrings(event);
    if (modifiers.length) {
      result.push(listenerName(event.type, modifierStrings(event).join('+')));
    }
  }
  result.push(listenerName(event.type));
  return result;
}

export function triggerViaLegacyResponderApi(responder, event, ekEvent) {
  for (const listenerName of getListenerNames(event)) {
    if (responder.has && !responder.has(listenerName)) {
      continue;
    }
    if (ekEvent) {
      responder.trigger(listenerName, event, ekEvent);
    } else {
      responder.trigger(listenerName, event);
    }
  }
}
