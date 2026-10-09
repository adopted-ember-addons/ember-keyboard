/**
 * The second argument passed to keyboard handlers.
 * Controls propagation between ember-keyboard responders
 * (not DOM propagation).
 */
export interface EmberKeyboardEvent {
    stopPropagation(): void;
    stopImmediatePropagation(): void;
}
/**
 * Any DOM event that ember-keyboard can be configured to listen for.
 */
export type EmberKeyboardDOMEvent = KeyboardEvent | MouseEvent | TouchEvent;
export type KeyboardHandler<E extends EmberKeyboardDOMEvent = KeyboardEvent> = (event: E, ekEvent: EmberKeyboardEvent) => void;
/**
 * Method syntax makes the parameters bivariant, so a responder can declare
 * handlers for the specific event type it listens for (e.g. `KeyboardEvent`).
 */
export type ResponderHandler = {
    handler(event: EmberKeyboardDOMEvent, ekEvent: EmberKeyboardEvent): void;
}['handler'];
/**
 * The `keydown`, `keyup`, and `keypress` events that `on-key` responds to.
 */
export type KeyEventName = 'keydown' | 'keyup' | 'keypress';
/**
 * An object registered with the keyboard service.
 *
 * A responder must implement either `keyboardHandlers` or
 * `handleKeyboardEvent`.
 */
export interface KeyboardResponder {
    keyboardActivated?: boolean;
    keyboardPriority?: number;
    keyboardFirstResponder?: boolean;
    /**
     * A dictionary of listener names (e.g. `keydown:ctrl+k`) to handlers.
     */
    keyboardHandlers?: Record<string, ResponderHandler>;
    canHandleKeyboardEvent?(event: EmberKeyboardDOMEvent): boolean;
    handleKeyboardEvent?(event: EmberKeyboardDOMEvent, ekEvent: EmberKeyboardEvent): void;
}
export interface KeyResponderOptions {
    /**
     * @default 0
     */
    priority?: number;
    /**
     * @default true
     */
    activated?: boolean;
}
export interface OnKeyOptions {
    /**
     * @default 'keydown'
     */
    event?: string;
}
/**
 * The shape of `ENV.emberKeyboard` in `config/environment`.
 */
export interface EmberKeyboardConfig {
    disableOnInputFields?: boolean;
    /**
     * DOM event names the service listens for on `document`.
     *
     * @default ['keyUp', 'keyDown', 'keyPress']
     */
    listeners?: string[];
}
//# sourceMappingURL=types.d.ts.map