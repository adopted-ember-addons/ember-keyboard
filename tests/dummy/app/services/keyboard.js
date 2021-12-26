import { action } from '@ember/object';
import { run } from '@ember/runloop';
import KeyboardService from 'ember-keyboard/services/keyboard';
import isKey from 'ember-keyboard/utils/is-key';
import { reverseCompareProp } from 'ember-keyboard/utils/sort';

function handleKeyEventWithLaxPriorities(event, sortedResponders) {
  let currentPriorityLevel;
  let noFirstResponders = true;
  let isLax = true;

  sortedResponders.every((responder) => {
    const keyboardFirstResponder = responder.keyboardFirstResponder;
    const keyboardPriority = responder.keyboardPriority;

    if (
      keyboardFirstResponder ||
      (noFirstResponders && keyboardPriority >= currentPriorityLevel) ||
      isLax
    ) {
      if (!responder.keyboardLaxPriority) {
        isLax = false;
      }

      if (keyboardFirstResponder) {
        if (!isLax) {
          noFirstResponders = false;
        }
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
    if (
      responder.canHandleKeyboardEvent &&
      !responder.canHandleKeyboardEvent(event)
    ) {
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

  throw new Error(
    'A responder registered with the ember-keyboard service must implement either `keyboardHandlers` (property returning a dictionary of listenerNames to handler functions), or `handleKeyboardEvent(event)`)'
  );
}

/**
 * Support old propagation model (< 7.x) in docs.
 * See tests/dummy/app/mixins/enterable.js for usage.
 */
export default class extends KeyboardService {
  isPropagationEnabled = true;

  @action
  _respond(event) {
    if (this.isPropagationEnabled) {
      super._respond(event);
    } else {
      run(() => {
        const sortedResponders = this.activeResponders.sort((a, b) => {
          let compareValue = reverseCompareProp(
            a,
            b,
            'keyboardFirstResponder',
            Boolean
          );
          if (compareValue === 0) {
            return reverseCompareProp(a, b, 'keyboardPriority');
          }
          return compareValue;
        });

        handleKeyEventWithLaxPriorities(event, sortedResponders);
      });
    }
  }
}
