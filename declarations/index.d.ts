import getMouseCode from './utils/get-mouse-code.ts';
import { default as keyResponder } from './decorators/key-responder.ts';
import { default as onKey } from './decorators/on-key.ts';
declare function getCode(): never;
declare function getKeyCode(): never;
export { getCode, getKeyCode, getMouseCode, keyResponder, onKey };
export { keyDown, keyUp, keyPress } from './listeners/key-events.ts';
export { click, mouseDown, mouseUp } from './listeners/mouse-events.ts';
export { touchStart, touchEnd } from './listeners/touch-events.ts';
export { triggerKeyDown, triggerKeyPress, triggerKeyUp, } from './utils/trigger-event.ts';
export type { EmberKeyboardConfig, EmberKeyboardDOMEvent, EmberKeyboardEvent, KeyboardHandler, KeyboardResponder, KeyEventName, KeyResponderOptions, OnKeyOptions, ResponderHandler, } from './types.ts';
export type { default as KeyboardService } from './services/keyboard.ts';
export type { OnKeyModifierSignature } from './modifiers/on-key.ts';
export type { OnKeyHelperSignature } from './helpers/on-key.ts';
export type { IfKeySignature } from './helpers/if-key.ts';
//# sourceMappingURL=index.d.ts.map