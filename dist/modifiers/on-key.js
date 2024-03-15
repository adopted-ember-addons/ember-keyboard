import { a as _applyDecoratedDescriptor, b as _initializerDefineProperty, _ as _defineProperty } from '../_rollupPluginBabelHelpers-2fc49ad3.js';
import Modifier from 'ember-modifier';
import { inject } from '@ember/service';
import { action } from '@ember/object';
import { registerDestructor } from '@ember/destroyable';
import { macroCondition, dependencySatisfies } from '@embroider/macros';
import listenerName from '../utils/listener-name.js';
import isKey from '../utils/is-key.js';
import '../utils/get-cmd-key.js';
import '../utils/keyboard-listener.js';
import '../utils/platform.js';
import '@ember/debug';
import '../fixtures/key-maps.js';
import '../fixtures/modifiers-array.js';
import '../utils/get-mouse-name.js';
import '@ember/utils';

const ONLY_WHEN_FOCUSED_TAG_NAMES = ['input', 'select', 'textarea'];
let modifier;
if (macroCondition(dependencySatisfies('ember-modifier', '>=3.2.0 || 4.x'))) {
  var _class, _descriptor;
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
  modifier = (_class = class OnKeyModifier extends Modifier {
    constructor(owner, args) {
      super(owner, args);
      _initializerDefineProperty(this, "keyboard", _descriptor, this);
      _defineProperty(this, "element", void 0);
      _defineProperty(this, "keyboardPriority", 0);
      _defineProperty(this, "activatedParamValue", true);
      _defineProperty(this, "eventName", 'keydown');
      _defineProperty(this, "onlyWhenFocused", true);
      _defineProperty(this, "listenerName", void 0);
      _defineProperty(this, "removeEventListeners", () => {
        if (this.onlyWhenFocused) {
          this.element.removeEventListener('click', this.onFocus, true);
          this.element.removeEventListener('focus', this.onFocus, true);
          this.element.removeEventListener('focusout', this.onFocusOut, true);
        }
      });
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
      let [keyCombo, callback] = positional;
      let {
        activated,
        event,
        priority,
        onlyWhenFocused
      } = named;
      this.keyCombo = keyCombo;
      this.callback = callback;
      this.eventName = event || 'keydown';
      this.activatedParamValue = 'activated' in named ? !!activated : undefined;
      this.keyboardPriority = priority ? parseInt(priority, 10) : 0;
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
    onFocus() {
      this.isFocused = true;
    }
    onFocusOut() {
      this.isFocused = false;
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
  }, (_descriptor = _applyDecoratedDescriptor(_class.prototype, "keyboard", [inject], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _applyDecoratedDescriptor(_class.prototype, "onFocus", [action], Object.getOwnPropertyDescriptor(_class.prototype, "onFocus"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "onFocusOut", [action], Object.getOwnPropertyDescriptor(_class.prototype, "onFocusOut"), _class.prototype)), _class);
} else {
  var _class2, _descriptor2;
  modifier = (_class2 = class OnKeyModifier extends Modifier {
    constructor(...args) {
      super(...args);
      _initializerDefineProperty(this, "keyboard", _descriptor2, this);
      _defineProperty(this, "keyboardPriority", 0);
      _defineProperty(this, "activatedParamValue", true);
      _defineProperty(this, "eventName", 'keydown');
      _defineProperty(this, "onlyWhenFocused", true);
      _defineProperty(this, "listenerName", void 0);
    }
    didReceiveArguments() {
      let [keyCombo, callback] = this.args.positional;
      let {
        activated,
        event,
        priority
      } = this.args.named;
      this.keyCombo = keyCombo;
      this.callback = callback;
      this.eventName = event || 'keydown';
      this.activatedParamValue = Object.keys(this.args.named).includes('activated') ? !!activated : undefined;
      this.keyboardPriority = priority ? parseInt(priority, 10) : 0;
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
    onFocusOut() {
      this.isFocused = false;
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
  }, (_descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "keyboard", [inject], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _applyDecoratedDescriptor(_class2.prototype, "onFocus", [action], Object.getOwnPropertyDescriptor(_class2.prototype, "onFocus"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onFocusOut", [action], Object.getOwnPropertyDescriptor(_class2.prototype, "onFocusOut"), _class2.prototype)), _class2);
}
var modifier$1 = modifier;

export { modifier$1 as default };
