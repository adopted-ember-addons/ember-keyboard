import Service from '@ember/service';
import { A } from '@ember/array';
import { getOwner } from '@ember/application';
import { get } from '@ember/object';
import { bind, run } from '@ember/runloop';
import { keyDown, keyPress, keyUp } from 'ember-keyboard/listeners/key-events';
import {
  handleKeyEventWithPropagation,
  handleKeyEventWithLaxPriorities
} from 'ember-keyboard/utils/handle-key-event';
import { reverseCompareProp } from 'ember-keyboard/utils/sort';

export default class KeyboardService extends Service {
  isPropagationEnabled = false;

  registeredResponders = null;

  get activeResponders() {
    let registeredResponders = this.registeredResponders || A([]);
    return A(registeredResponders.filterBy('keyboardActivated'));
  }

  get sortedResponders() {
    return A(this.activeResponders.toArray().sort((a, b) => {
      if (this.isPropagationEnabled) {
        return reverseCompareProp(a, b, 'keyboardPriority');
      } else {
        let compareValue = reverseCompareProp(a, b, 'keyboardFirstResponder', Boolean);
        if (compareValue === 0) {
          return reverseCompareProp(a, b, 'keyboardPriority');
        }
        return compareValue;
      }
    }));
  }

  get firstResponders() {
    return this.sortedResponders.filterBy('keyboardFirstResponder');
  }

  get normalResponders() {
    return this.sortedResponders.rejectBy('keyboardFirstResponder');
  }

  constructor(...args) {
    super(...args);

    if (typeof FastBoot !== 'undefined') {
      return;
    }

    const config = getOwner(this).resolveRegistration('config:environment') || {};

    const isPropagationEnabled = Boolean(get(config, 'emberKeyboard.propagation'));
    this.isPropagationEnabled = isPropagationEnabled;
    this.registeredResponders = A(this.registeredResponders || []);

    this._boundRespond = bind(this, this._respond);
    this._listeners = get(config, 'emberKeyboard.listeners') || ['keyUp', 'keyDown', 'keyPress'];
    this._listeners = this._listeners.map((listener) => listener.toLowerCase());

    this._listeners.forEach((type) => {
      document.addEventListener(type, this._boundRespond);
    });
  }

  willDestroy(...args) {
    super.willDestroy(...args);

    if (typeof FastBoot !== 'undefined') {
      return;
    }

    this._listeners.forEach((type) => {
      document.removeEventListener(type, this._boundRespond);
    });
  }

  _respond(event) {
    run(() => {
      if (this.isPropagationEnabled) {
        let { firstResponders, normalResponders } = this;
        handleKeyEventWithPropagation(event, { firstResponders, normalResponders });
      } else {
        let { sortedResponders } = this;
        handleKeyEventWithLaxPriorities(event, sortedResponders);
      }
    });
  }

  register(responder) {
    this.registeredResponders.push(responder);
  }

  unregister(responder) {
    const index = this.registeredResponders.indexOf(responder);
    if (index > -1) {
      this.registeredResponders.splice(index, 1);
    }
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
}
