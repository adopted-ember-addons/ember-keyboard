import isKey from './is-key.js';
import './keyboard-listener.js';
import '../_rollupPluginBabelHelpers-2fc49ad3.js';
import './platform.js';
import '@ember/debug';
import '../fixtures/key-maps.js';
import '../fixtures/modifiers-array.js';
import './get-mouse-name.js';
import '@ember/utils';

function handleKeyEventWithPropagation(event, {
  firstResponders,
  normalResponders
}) {
  let isImmediatePropagationStopped = false;
  let isPropagationStopped = false;
  const ekEvent = {
    stopImmediatePropagation() {
      isImmediatePropagationStopped = true;
    },
    stopPropagation() {
      isPropagationStopped = true;
    }
  };
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
    const currentPriorityLevel = Number(responder.keyboardPriority);
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
function triggerResponderListener(responder, event, ekEvent = null) {
  if (responder.handleKeyboardEvent) {
    if (responder.canHandleKeyboardEvent && !responder.canHandleKeyboardEvent(event)) {
      return;
    }
    responder.handleKeyboardEvent(event, ekEvent);
    return;
  }
  if (responder.keyboardHandlers) {
    Object.keys(responder.keyboardHandlers).forEach(responderListenerName => {
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
  throw new Error('A responder registered with the ember-keyboard service must implement either `keyboardHandlers` (property returning a dictionary of listenerNames to handler functions), or `handleKeyboardEvent(event)`)');
}

export { handleKeyEventWithPropagation };
