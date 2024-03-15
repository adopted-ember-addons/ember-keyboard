import { a as _applyDecoratedDescriptor, _ as _defineProperty } from '../_rollupPluginBabelHelpers-2fc49ad3.js';
import Service from '@ember/service';
import { getOwner } from '@ember/application';
import { action } from '@ember/object';
import { run } from '@ember/runloop';
import { keyDown, keyPress, keyUp } from '../listeners/key-events.js';
import { handleKeyEventWithPropagation } from '../utils/handle-key-event.js';
import { reverseCompareProp } from '../utils/sort.js';
import '../utils/listener-name.js';
import '../utils/get-cmd-key.js';
import '../utils/is-key.js';
import '../utils/keyboard-listener.js';
import '../utils/platform.js';
import '@ember/debug';
import '../fixtures/key-maps.js';
import '../fixtures/modifiers-array.js';
import '../utils/get-mouse-name.js';
import '@ember/utils';

var _class;
let KeyboardService = (_class = class KeyboardService extends Service {
  get activeResponders() {
    let {
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
  constructor(...args) {
    super(...args);
    _defineProperty(this, "registeredResponders", new Set());
    if (typeof FastBoot !== 'undefined') {
      return;
    }
    const config = getOwner(this).resolveRegistration('config:environment') || {};
    let emberKeyboardConfig = config.emberKeyboard || {};
    if (emberKeyboardConfig.disableOnInputFields) {
      this._disableOnInput = true;
    }
    this._listeners = emberKeyboardConfig.listeners || ['keyUp', 'keyDown', 'keyPress'];
    this._listeners = this._listeners.map(listener => listener.toLowerCase());
    this._listeners.forEach(type => {
      document.addEventListener(type, this._respond);
    });
  }
  willDestroy(...args) {
    super.willDestroy(...args);
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
    run(() => {
      let {
        firstResponders,
        normalResponders
      } = this;
      handleKeyEventWithPropagation(event, {
        firstResponders,
        normalResponders
      });
    });
  }
  register(responder) {
    this.registeredResponders.add(responder);
  }
  unregister(responder) {
    this.registeredResponders.delete(responder);
  }
  keyDown(...args) {
    return keyDown(...args);
  }
  keyPress(...args) {
    return keyPress(...args);
  }
  keyUp(...args) {
    return keyUp(...args);
  }
}, (_applyDecoratedDescriptor(_class.prototype, "_respond", [action], Object.getOwnPropertyDescriptor(_class.prototype, "_respond"), _class.prototype)), _class);

export { KeyboardService as default };
