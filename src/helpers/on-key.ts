import Helper from '@ember/component/helper';
import { assert } from '@ember/debug';
import * as emberService from '@ember/service';
import listenerName from '../utils/listener-name.ts';
import type KeyboardService from '../services/keyboard.ts';
import type {
  KeyboardHandler,
  KeyboardResponder,
  ResponderHandler,
} from '../types.ts';

const service = emberService.service ?? emberService.inject;

export interface OnKeyHelperSignature {
  Args: {
    Positional: [keyCombo: string, callback: KeyboardHandler];
    Named: {
      /**
       * @default 'keydown'
       */
      event?: string;
      /**
       * @default true
       */
      activated?: boolean;
      /**
       * @default 0
       */
      priority?: number;
    };
  };
  Return: void;
}

/**
 * Calls `callback` whenever `keyCombo` is pressed, for as long as the
 * helper is rendered.
 *
 * ```hbs
 * {{on-key "alt+c" this.collapseAll}}
 * ```
 */
export default class OnKeyHelper
  extends Helper<OnKeyHelperSignature>
  implements KeyboardResponder
{
  @service declare keyboard: KeyboardService;
  keyCombo?: string;
  callback?: KeyboardHandler;
  keyboardActivated = true;
  keyboardPriority = 0;
  eventName = 'keydown';
  keyboardHandlers?: Record<string, ResponderHandler>;

  compute(
    [keyCombo, callback]: OnKeyHelperSignature['Args']['Positional'],
    {
      event = 'keydown',
      activated = true,
      priority = 0,
    }: OnKeyHelperSignature['Args']['Named'],
  ): void {
    assert(
      'ember-keyboard: You must pass a function as the second argument to the `on-key` helper',
      typeof callback === 'function',
    );

    this.keyCombo = keyCombo;
    this.callback = callback;
    this.eventName = event;
    this.keyboardActivated = activated;
    this.keyboardPriority = priority;
    this.keyboardHandlers = {};
    this.keyboardHandlers[listenerName(event, keyCombo)] = callback;
    this.keyboard.register(this);
  }

  willDestroy(): void {
    this.keyboard.unregister(this);
    super.willDestroy();
  }
}
