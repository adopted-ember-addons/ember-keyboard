import emberService__default from '@ember/service';
import { getOwner } from '@ember/application';
import { action } from '@ember/object';
import { run } from '@ember/runloop';
import { keyDown, keyPress, keyUp } from '../listeners/key-events.js';
import { handleKeyEventWithPropagation } from '../utils/handle-key-event.js';
import { reverseCompareProp } from '../utils/sort.js';
import { n } from 'decorator-transforms/runtime-esm';

// Event handlers here are bound with `@action`
/* eslint-disable @typescript-eslint/unbound-method */

class KeyboardService extends emberService__default {
  registeredResponders = new Set();
  get activeResponders() {
    const {
      registeredResponders
    } = this;
    return Array.from(registeredResponders).filter(r => r.keyboardActivated);
  }
  get sortedResponders() {
    return this.activeResponders.sort((a, b) => {
      return reverseCompareProp(a, b, 'keyboardPriority');
    });
  }
  get firstResponders() {
    return this.sortedResponders.filter(r => r.keyboardFirstResponder);
  }
  get normalResponders() {
    return this.sortedResponders.filter(r => !r.keyboardFirstResponder);
  }
  _disableOnInput;
  _listeners = [];
  constructor(...args) {
    super(...args);
    if (typeof FastBoot !== 'undefined') {
      return;
    }
    const owner = getOwner(this);
    const config = owner?.resolveRegistration('config:environment') || {};
    const emberKeyboardConfig = config.emberKeyboard || {};
    if (emberKeyboardConfig.disableOnInputFields) {
      this._disableOnInput = true;
    }
    this._listeners = emberKeyboardConfig.listeners || ['keyUp', 'keyDown', 'keyPress'];
    this._listeners = this._listeners.map(listener => listener.toLowerCase());
    this._listeners.forEach(type => {
      document.addEventListener(type, this._respond);
    });
  }
  willDestroy() {
    super.willDestroy();
    if (typeof FastBoot !== 'undefined') {
      return;
    }
    this._listeners.forEach(type => {
      document.removeEventListener(type, this._respond);
    });
  }
  _respond(event) {
    if (this._disableOnInput && event.target) {
      const target = event.composedPath()[0] ?? event.target;
      const tag = target.tagName;
      const isContentEditable = target.getAttribute && target.getAttribute('contenteditable') != null;
      if (isContentEditable || tag === 'TEXTAREA' || tag === 'INPUT') {
        return;
      }
    }

    // eslint-disable-next-line ember/no-runloop
    run(() => {
      const {
        firstResponders,
        normalResponders
      } = this;
      handleKeyEventWithPropagation(event, {
        firstResponders,
        normalResponders
      });
    });
  }
  static {
    n(this.prototype, "_respond", [action]);
  }
  register(responder) {
    this.registeredResponders.add(responder);
  }
  unregister(responder) {
    this.registeredResponders.delete(responder);
  }
  keyDown(keyCombo) {
    return keyDown(keyCombo);
  }
  keyPress(keyCombo) {
    return keyPress(keyCombo);
  }
  keyUp(keyCombo) {
    return keyUp(keyCombo);
  }
}

export { KeyboardService as default };
//# sourceMappingURL=keyboard.js.map
