import isKey from './is-key.ts';
import type {
  EmberKeyboardDOMEvent,
  EmberKeyboardEvent,
  KeyboardResponder,
} from '../types.ts';

export function handleKeyEventWithPropagation(
  event: EmberKeyboardDOMEvent,
  {
    firstResponders,
    normalResponders,
  }: {
    firstResponders: KeyboardResponder[];
    normalResponders: KeyboardResponder[];
  },
): void {
  let isImmediatePropagationStopped = false;
  let isPropagationStopped = false;
  const ekEvent: EmberKeyboardEvent = {
    stopImmediatePropagation() {
      isImmediatePropagationStopped = true;
    },
    stopPropagation() {
      isPropagationStopped = true;
    },
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

    if (
      isImmediatePropagationStopped &&
      currentPriorityLevel === previousPriorityLevel
    ) {
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
}

function triggerResponderListener(
  responder: KeyboardResponder,
  event: EmberKeyboardDOMEvent,
  ekEvent: EmberKeyboardEvent,
): void {
  if (responder.handleKeyboardEvent) {
    if (
      responder.canHandleKeyboardEvent &&
      !responder.canHandleKeyboardEvent(event)
    ) {
      return;
    }
    responder.handleKeyboardEvent(event, ekEvent);
    return;
  }

  const { keyboardHandlers } = responder;
  if (keyboardHandlers) {
    Object.keys(keyboardHandlers).forEach((responderListenerName) => {
      if (isKey(responderListenerName, event)) {
        keyboardHandlers[responderListenerName]!(event, ekEvent);
      }
    });
    return;
  }

  throw new Error(
    'A responder registered with the ember-keyboard service must implement either `keyboardHandlers` (property returning a dictionary of listenerNames to handler functions), or `handleKeyboardEvent(event)`)',
  );
}
