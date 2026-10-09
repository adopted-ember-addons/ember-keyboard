import Modifier from 'ember-modifier';
import type Owner from '@ember/owner';
import type { ArgsFor } from 'ember-modifier';
import type KeyboardService from '../services/keyboard.ts';
import type { EmberKeyboardDOMEvent, EmberKeyboardEvent, KeyboardHandler, KeyboardResponder } from '../types.ts';
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
declare class OnKeyModifier extends Modifier<OnKeyModifierSignature> implements KeyboardResponder {
    keyboard: KeyboardService;
    element: HTMLElement;
    keyboardPriority: number;
    activatedParamValue: boolean | undefined;
    eventName: string;
    onlyWhenFocused: boolean;
    listenerName: string;
    keyCombo?: string;
    callback?: KeyboardHandler;
    isFocused?: boolean;
    constructor(owner: Owner, args: ArgsFor<OnKeyModifierSignature>);
    modify(element: HTMLElement, positional: Positional, named: Named): void;
    setupProperties(positional: Positional, named: Named): void;
    addEventListeners(): void;
    removeEventListeners: () => void;
    onFocus(): void;
    onFocusOut(): void;
    get keyboardActivated(): boolean | undefined;
    get keyboardFirstResponder(): boolean | undefined;
    canHandleKeyboardEvent(event: EmberKeyboardDOMEvent): boolean;
    handleKeyboardEvent(event: EmberKeyboardDOMEvent, ekEvent: EmberKeyboardEvent): void;
}
declare const modifier: typeof OnKeyModifier;
export default modifier;
//# sourceMappingURL=on-key.d.ts.map