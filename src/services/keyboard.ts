import Service from '@ember/service';
import { getOwner } from '@ember/application';
import { action } from '@ember/object';
import { run } from '@ember/runloop';
import type EngineInstance from '@ember/engine/instance';
import { keyDown, keyPress, keyUp } from '../listeners/key-events.ts';
import { handleKeyEventWithPropagation } from '../utils/handle-key-event.ts';
import { reverseCompareProp } from '../utils/sort.ts';
import type {
  EmberKeyboardConfig,
  EmberKeyboardDOMEvent,
  KeyboardResponder,
} from '../types.ts';

// Event handlers here are bound with `@action`
/* eslint-disable @typescript-eslint/unbound-method */

export default class KeyboardService extends Service {
  registeredResponders = new Set<KeyboardResponder>();

  get activeResponders(): KeyboardResponder[] {
    const { registeredResponders } = this;
    return Array.from(registeredResponders).filter((r) => r.keyboardActivated);
  }

  get sortedResponders(): KeyboardResponder[] {
    return this.activeResponders.sort((a, b) => {
      return reverseCompareProp(a, b, 'keyboardPriority');
    });
  }

  get firstResponders(): KeyboardResponder[] {
    return this.sortedResponders.filter((r) => r.keyboardFirstResponder);
  }

  get normalResponders(): KeyboardResponder[] {
    return this.sortedResponders.filter((r) => !r.keyboardFirstResponder);
  }

  _disableOnInput?: boolean;
  _listeners: string[] = [];

  constructor(...args: ConstructorParameters<typeof Service>) {
    super(...args);

    if (typeof FastBoot !== 'undefined') {
      return;
    }

    const owner = getOwner(this) as EngineInstance | undefined;
    const config = (owner?.resolveRegistration('config:environment') || {}) as {
      emberKeyboard?: EmberKeyboardConfig;
    };
    const emberKeyboardConfig = config.emberKeyboard || {};

    if (emberKeyboardConfig.disableOnInputFields) {
      this._disableOnInput = true;
    }

    this._listeners = emberKeyboardConfig.listeners || [
      'keyUp',
      'keyDown',
      'keyPress',
    ];
    this._listeners = this._listeners.map((listener) => listener.toLowerCase());

    this._listeners.forEach((type) => {
      document.addEventListener(type, this._respond);
    });
  }

  willDestroy(): void {
    super.willDestroy();

    if (typeof FastBoot !== 'undefined') {
      return;
    }

    this._listeners.forEach((type) => {
      document.removeEventListener(type, this._respond);
    });
  }

  @action
  _respond(event: Event): void {
    if (this._disableOnInput && event.target) {
      const target = (event.composedPath()[0] ?? event.target) as Element;
      const tag = target.tagName;
      const isContentEditable =
        target.getAttribute && target.getAttribute('contenteditable') != null;
      if (isContentEditable || tag === 'TEXTAREA' || tag === 'INPUT') {
        return;
      }
    }

    // eslint-disable-next-line ember/no-runloop
    run(() => {
      const { firstResponders, normalResponders } = this;
      handleKeyEventWithPropagation(event as EmberKeyboardDOMEvent, {
        firstResponders,
        normalResponders,
      });
    });
  }

  register(responder: KeyboardResponder): void {
    this.registeredResponders.add(responder);
  }

  unregister(responder: KeyboardResponder): void {
    this.registeredResponders.delete(responder);
  }

  keyDown(keyCombo?: string): string {
    return keyDown(keyCombo);
  }

  keyPress(keyCombo?: string): string {
    return keyPress(keyCombo);
  }

  keyUp(keyCombo?: string): string {
    return keyUp(keyCombo);
  }
}

declare module '@ember/service' {
  interface Registry {
    keyboard: KeyboardService;
  }
}
