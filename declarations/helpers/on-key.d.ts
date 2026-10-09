import Helper from '@ember/component/helper';
import type KeyboardService from '../services/keyboard.ts';
import type { KeyboardHandler, KeyboardResponder, ResponderHandler } from '../types.ts';
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
export default class OnKeyHelper extends Helper<OnKeyHelperSignature> implements KeyboardResponder {
    keyboard: KeyboardService;
    keyCombo?: string;
    callback?: KeyboardHandler;
    keyboardActivated: boolean;
    keyboardPriority: number;
    eventName: string;
    keyboardHandlers?: Record<string, ResponderHandler>;
    compute([keyCombo, callback]: OnKeyHelperSignature['Args']['Positional'], { event, activated, priority, }: OnKeyHelperSignature['Args']['Named']): void;
    willDestroy(): void;
}
//# sourceMappingURL=on-key.d.ts.map