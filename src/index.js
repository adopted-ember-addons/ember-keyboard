import getMouseCode from './utils/get-mouse-code.js';
import { default as keyResponder } from './decorators/key-responder.js';
import { default as onKey } from './decorators/on-key.js';

function getCode() {
  throw new Error(
    'ember-keyboard: `getCode` has been removed. There is no longer a need for this function as you can directly specify `key` and/or `code` values',
  );
}

function getKeyCode() {
  throw new Error(
    'ember-keyboard: `getKeyCode` has been removed. There is no longer a need for this function as you can directly specify `key` and/or `code` values',
  );
}

export { getCode, getKeyCode, getMouseCode, keyResponder, onKey };

export { keyDown, keyUp, keyPress } from './listeners/key-events.js';
export { click, mouseDown, mouseUp } from './listeners/mouse-events.js';
export { touchStart, touchEnd } from './listeners/touch-events.js';
export {
  triggerKeyDown,
  triggerKeyPress,
  triggerKeyUp,
} from './utils/trigger-event.js';
