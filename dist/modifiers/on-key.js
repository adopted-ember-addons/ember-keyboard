import Modifier from 'ember-modifier';
import * as emberService from '@ember/service';
import { action } from '@ember/object';
import { registerDestructor } from '@ember/destroyable';
import { macroCondition, dependencySatisfies } from '@embroider/macros';
import listenerName from '../utils/listener-name.js';
import isKey from '../utils/is-key.js';
import { g, i, n } from 'decorator-transforms/runtime-esm';

// Event handlers here are bound with `@action`
/* eslint-disable @typescript-eslint/unbound-method */

const service = emberService.service ?? emberService.inject;
const ONLY_WHEN_FOCUSED_TAG_NAMES = ['input', 'select', 'textarea'];
/**
 * This is an element modifier to trigger some behavior when
 * specified key combo is pressed. When used with a form element
 * (input, textarea, or select), the action fires only when element
 * has focus. When used with another element type, it will trigger the
 * passed action, OR if no action is passed, it will trigger a `click`
 * on the element. This allows for easy declaration of keyboard shortcuts
 * for anything clickable: In the following example, we trigger a
 * click on the button when the B key is pressed:
 *
 * <button
 *    type="button"
 *    {{on-key 'b'}}>
 *   Click me, or press "B"
 * </button>
 */
class OnKeyModifier extends Modifier {
  static {
    g(this.prototype, "keyboard", [service]);
  }
  #keyboard = (i(this, "keyboard"), void 0);
  element;
  keyboardPriority = 0;
  activatedParamValue = true;
  eventName = 'keydown';
  onlyWhenFocused = true;
  listenerName;
  keyCombo;
  callback;
  isFocused;
  constructor(owner, args) {
    super(owner, args);
    this.keyboard.register(this);
    registerDestructor(this, () => {
      this.removeEventListeners();
      this.keyboard.unregister(this);
    });
  }
  modify(element, positional, named) {
    this.element = element;
    this.removeEventListeners();
    this.setupProperties(positional, named);
    if (this.onlyWhenFocused) {
      this.addEventListeners();
    }
  }
  setupProperties(positional, named) {
    const [keyCombo, callback] = positional;
    const {
      activated,
      event,
      priority,
      onlyWhenFocused
    } = named;
    this.keyCombo = keyCombo;
    this.callback = callback;
    this.eventName = event || 'keydown';
    this.activatedParamValue = 'activated' in named ? !!activated : undefined;
    this.keyboardPriority = priority ? parseInt(String(priority), 10) : 0;
    this.listenerName = listenerName(this.eventName, this.keyCombo);
    if (onlyWhenFocused !== undefined) {
      this.onlyWhenFocused = onlyWhenFocused;
    } else {
      this.onlyWhenFocused = ONLY_WHEN_FOCUSED_TAG_NAMES.includes(this.element.tagName.toLowerCase());
    }
  }
  addEventListeners() {
    this.element.addEventListener('click', this.onFocus, true);
    this.element.addEventListener('focus', this.onFocus, true);
    this.element.addEventListener('focusout', this.onFocusOut, true);
  }
  removeEventListeners = () => {
    if (this.onlyWhenFocused) {
      this.element.removeEventListener('click', this.onFocus, true);
      this.element.removeEventListener('focus', this.onFocus, true);
      this.element.removeEventListener('focusout', this.onFocusOut, true);
    }
  };
  onFocus() {
    this.isFocused = true;
  }
  static {
    n(this.prototype, "onFocus", [action]);
  }
  onFocusOut() {
    this.isFocused = false;
  }
  static {
    n(this.prototype, "onFocusOut", [action]);
  }
  get keyboardActivated() {
    if (this.activatedParamValue === false) {
      return false;
    }
    if (this.onlyWhenFocused) {
      return this.isFocused;
    }
    return true;
  }
  get keyboardFirstResponder() {
    if (this.onlyWhenFocused) {
      return this.isFocused;
    }
    return false;
  }
  canHandleKeyboardEvent(event) {
    return isKey(this.listenerName, event);
  }
  handleKeyboardEvent(event, ekEvent) {
    if (isKey(this.listenerName, event)) {
      if (this.callback) {
        this.callback(event, ekEvent);
      } else {
        this.element.click();
      }
    }
  }
}

/**
 * The lifecycle-hook API of ember-modifier < 3.2,
 * which its current types no longer describe.
 */
const LegacyModifier = Modifier;
class LegacyOnKeyModifier extends LegacyModifier {
  static {
    g(this.prototype, "keyboard", [service]);
  }
  #keyboard = (i(this, "keyboard"), void 0);
  keyboardPriority = 0;
  activatedParamValue = true;
  eventName = 'keydown';
  onlyWhenFocused = true;
  listenerName;
  keyCombo;
  callback;
  isFocused;
  didReceiveArguments() {
    const [keyCombo, callback] = this.args.positional;
    const {
      activated,
      event,
      priority
    } = this.args.named;
    this.keyCombo = keyCombo;
    this.callback = callback;
    this.eventName = event || 'keydown';
    this.activatedParamValue = Object.keys(this.args.named).includes('activated') ? !!activated : undefined;
    this.keyboardPriority = priority ? parseInt(String(priority), 10) : 0;
    this.listenerName = listenerName(this.eventName, this.keyCombo);
    if (this.args.named.onlyWhenFocused !== undefined) {
      this.onlyWhenFocused = this.args.named.onlyWhenFocused;
    } else {
      this.onlyWhenFocused = ONLY_WHEN_FOCUSED_TAG_NAMES.includes(this.element.tagName.toLowerCase());
    }
  }
  didInstall() {
    this.keyboard.register(this);
    if (this.onlyWhenFocused) {
      this.element.addEventListener('click', this.onFocus, true);
      this.element.addEventListener('focus', this.onFocus, true);
      this.element.addEventListener('focusout', this.onFocusOut, true);
    }
  }
  willRemove() {
    if (this.onlyWhenFocused) {
      this.element.removeEventListener('click', this.onFocus, true);
      this.element.removeEventListener('focus', this.onFocus, true);
      this.element.removeEventListener('focusout', this.onFocusOut, true);
    }
    this.keyboard.unregister(this);
  }
  onFocus() {
    this.isFocused = true;
  }
  static {
    n(this.prototype, "onFocus", [action]);
  }
  onFocusOut() {
    this.isFocused = false;
  }
  static {
    n(this.prototype, "onFocusOut", [action]);
  }
  get keyboardActivated() {
    if (this.activatedParamValue === false) {
      return false;
    }
    if (this.onlyWhenFocused) {
      return this.isFocused;
    }
    return true;
  }
  get keyboardFirstResponder() {
    if (this.onlyWhenFocused) {
      return this.isFocused;
    }
    return false;
  }
  canHandleKeyboardEvent(event) {
    return isKey(this.listenerName, event);
  }
  handleKeyboardEvent(event, ekEvent) {
    if (isKey(this.listenerName, event)) {
      if (this.callback) {
        this.callback(event, ekEvent);
      } else {
        this.element.click();
      }
    }
  }
}
const modifier = macroCondition(dependencySatisfies('ember-modifier', '>=3.2.0 || 4.x')) ? OnKeyModifier : LegacyOnKeyModifier;

export { modifier as default };
//# sourceMappingURL=on-key.js.map
