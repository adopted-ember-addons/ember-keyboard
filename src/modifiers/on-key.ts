import Modifier from 'ember-modifier';
import * as emberService from '@ember/service';
import { action } from '@ember/object';
import { registerDestructor } from '@ember/destroyable';
import { macroCondition, dependencySatisfies } from '@embroider/macros';
import type Owner from '@ember/owner';
import type { ArgsFor } from 'ember-modifier';
import listenerName from '../utils/listener-name.ts';
import isKey from '../utils/is-key.ts';
import type KeyboardService from '../services/keyboard.ts';
import type {
  EmberKeyboardDOMEvent,
  EmberKeyboardEvent,
  KeyboardHandler,
  KeyboardResponder,
} from '../types.ts';

// Event handlers here are bound with `@action`
/* eslint-disable @typescript-eslint/unbound-method */

const service = emberService.service ?? emberService.inject;
const ONLY_WHEN_FOCUSED_TAG_NAMES = ['input', 'select', 'textarea'];

export interface OnKeyModifierSignature {
  Element: HTMLElement;
  Args: {
    /**
     * When `callback` is omitted, the element is clicked instead.
     */
    Positional: [keyCombo: string, callback?: KeyboardHandler];
    Named: {
      activated?: boolean;
      /**
       * @default 'keydown'
       */
      event?: string;
      /**
       * @default 0
       */
      priority?: number | string;
      /**
       * Defaults to `true` for `input`, `select`, and `textarea` elements.
       */
      onlyWhenFocused?: boolean;
    };
  };
}

type Positional = OnKeyModifierSignature['Args']['Positional'];
type Named = OnKeyModifierSignature['Args']['Named'];

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
class OnKeyModifier
  extends Modifier<OnKeyModifierSignature>
  implements KeyboardResponder
{
  @service declare keyboard: KeyboardService;

  element!: HTMLElement;
  keyboardPriority = 0;
  activatedParamValue: boolean | undefined = true;
  eventName = 'keydown';
  onlyWhenFocused = true;
  listenerName!: string;
  keyCombo?: string;
  callback?: KeyboardHandler;
  isFocused?: boolean;

  constructor(owner: Owner, args: ArgsFor<OnKeyModifierSignature>) {
    super(owner, args);
    this.keyboard.register(this);

    registerDestructor(this, () => {
      this.removeEventListeners();
      this.keyboard.unregister(this);
    });
  }

  modify(element: HTMLElement, positional: Positional, named: Named): void {
    this.element = element;

    this.removeEventListeners();

    this.setupProperties(positional, named);

    if (this.onlyWhenFocused) {
      this.addEventListeners();
    }
  }

  setupProperties(positional: Positional, named: Named): void {
    const [keyCombo, callback] = positional;
    const { activated, event, priority, onlyWhenFocused } = named;

    this.keyCombo = keyCombo;
    this.callback = callback;
    this.eventName = event || 'keydown';
    this.activatedParamValue = 'activated' in named ? !!activated : undefined;
    this.keyboardPriority = priority ? parseInt(String(priority), 10) : 0;
    this.listenerName = listenerName(this.eventName, this.keyCombo);
    if (onlyWhenFocused !== undefined) {
      this.onlyWhenFocused = onlyWhenFocused;
    } else {
      this.onlyWhenFocused = ONLY_WHEN_FOCUSED_TAG_NAMES.includes(
        this.element.tagName.toLowerCase(),
      );
    }
  }

  addEventListeners(): void {
    this.element.addEventListener('click', this.onFocus, true);
    this.element.addEventListener('focus', this.onFocus, true);
    this.element.addEventListener('focusout', this.onFocusOut, true);
  }

  removeEventListeners = (): void => {
    if (this.onlyWhenFocused) {
      this.element.removeEventListener('click', this.onFocus, true);
      this.element.removeEventListener('focus', this.onFocus, true);
      this.element.removeEventListener('focusout', this.onFocusOut, true);
    }
  };

  @action
  onFocus(): void {
    this.isFocused = true;
  }

  @action
  onFocusOut(): void {
    this.isFocused = false;
  }

  get keyboardActivated(): boolean | undefined {
    if (this.activatedParamValue === false) {
      return false;
    }
    if (this.onlyWhenFocused) {
      return this.isFocused;
    }
    return true;
  }

  get keyboardFirstResponder(): boolean | undefined {
    if (this.onlyWhenFocused) {
      return this.isFocused;
    }
    return false;
  }

  canHandleKeyboardEvent(event: EmberKeyboardDOMEvent): boolean {
    return isKey(this.listenerName, event);
  }

  handleKeyboardEvent(
    event: EmberKeyboardDOMEvent,
    ekEvent: EmberKeyboardEvent,
  ): void {
    if (isKey(this.listenerName, event)) {
      if (this.callback) {
        this.callback(event as KeyboardEvent, ekEvent);
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
const LegacyModifier = Modifier as unknown as new (
  owner: Owner,
  args: ArgsFor<OnKeyModifierSignature>,
) => {
  element: HTMLElement;
  args: { positional: Positional; named: Named };
};

class LegacyOnKeyModifier extends LegacyModifier implements KeyboardResponder {
  @service declare keyboard: KeyboardService;

  keyboardPriority = 0;
  activatedParamValue: boolean | undefined = true;
  eventName = 'keydown';
  onlyWhenFocused = true;
  listenerName!: string;
  keyCombo?: string;
  callback?: KeyboardHandler;
  isFocused?: boolean;

  didReceiveArguments(): void {
    const [keyCombo, callback] = this.args.positional;
    const { activated, event, priority } = this.args.named;
    this.keyCombo = keyCombo;
    this.callback = callback;
    this.eventName = event || 'keydown';
    this.activatedParamValue = Object.keys(this.args.named).includes(
      'activated',
    )
      ? !!activated
      : undefined;
    this.keyboardPriority = priority ? parseInt(String(priority), 10) : 0;
    this.listenerName = listenerName(this.eventName, this.keyCombo);
    if (this.args.named.onlyWhenFocused !== undefined) {
      this.onlyWhenFocused = this.args.named.onlyWhenFocused;
    } else {
      this.onlyWhenFocused = ONLY_WHEN_FOCUSED_TAG_NAMES.includes(
        this.element.tagName.toLowerCase(),
      );
    }
  }

  didInstall(): void {
    this.keyboard.register(this);
    if (this.onlyWhenFocused) {
      this.element.addEventListener('click', this.onFocus, true);
      this.element.addEventListener('focus', this.onFocus, true);
      this.element.addEventListener('focusout', this.onFocusOut, true);
    }
  }

  willRemove(): void {
    if (this.onlyWhenFocused) {
      this.element.removeEventListener('click', this.onFocus, true);
      this.element.removeEventListener('focus', this.onFocus, true);
      this.element.removeEventListener('focusout', this.onFocusOut, true);
    }
    this.keyboard.unregister(this);
  }

  @action
  onFocus(): void {
    this.isFocused = true;
  }

  @action
  onFocusOut(): void {
    this.isFocused = false;
  }

  get keyboardActivated(): boolean | undefined {
    if (this.activatedParamValue === false) {
      return false;
    }
    if (this.onlyWhenFocused) {
      return this.isFocused;
    }
    return true;
  }

  get keyboardFirstResponder(): boolean | undefined {
    if (this.onlyWhenFocused) {
      return this.isFocused;
    }
    return false;
  }

  canHandleKeyboardEvent(event: EmberKeyboardDOMEvent): boolean {
    return isKey(this.listenerName, event);
  }

  handleKeyboardEvent(
    event: EmberKeyboardDOMEvent,
    ekEvent: EmberKeyboardEvent,
  ): void {
    if (isKey(this.listenerName, event)) {
      if (this.callback) {
        this.callback(event as KeyboardEvent, ekEvent);
      } else {
        this.element.click();
      }
    }
  }
}

const modifier = macroCondition(
  dependencySatisfies('ember-modifier', '>=3.2.0 || 4.x'),
)
  ? OnKeyModifier
  : (LegacyOnKeyModifier as unknown as typeof OnKeyModifier);

export default modifier;
