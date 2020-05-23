import Modifier from 'ember-modifier';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { gte } from 'ember-compatibility-helpers';
import listenerName from 'ember-keyboard/utils/listener-name';

const ONLY_WHEN_FOCUSED_TAG_NAMES = ['input', 'select', 'textarea'];

let Klass;
if (gte('3.12.0')) {

  /* This is an element modifier to trigger some behavior when
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
  Klass = class OnKeyModifier extends Modifier {
    @service keyboard;

    keyboardPriority = 0;
    activatedParamValue = true;
    eventName = 'keydown';
    onlyWhenFocused = true;
    listenerName;


    didReceiveArguments() {
      let [ keyCombo, callback ] = this.args.positional;
      let { activated, event, priority } = this.args.named;
      this.keyCombo = keyCombo;
      this.callback = callback;
      this.eventName = event || 'keydown';
      this.activatedParamValue = Object.keys(this.args.named).includes('activated') ? !!activated : undefined;
      this.keyboardPriority = priority ? parseInt(priority, 10) : 0;
      this.listenerName = listenerName(this.eventName, this.keyCombo.split('+'));
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

    @action onFocus() {
      this.isFocused = true;
    }

    @action onFocusOut() {
      this.isFocused=false;
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

    has(triggerName) {
      return triggerName === this.listenerName;
    }

    trigger(triggerName, event) {
      if (triggerName === this.listenerName) {
        if (this.callback) {
          this.callback(event);
        } else {
          this.element.click(event);
        }
      }
    }

  }
} else {
  Klass = class OnKeyModifier extends Modifier {
    didInstall() {
      throw new Error('ember-keyboard only supports the on-key element modifier in Ember 3.12 and higher.');
    }
  }
}

export default Klass;
