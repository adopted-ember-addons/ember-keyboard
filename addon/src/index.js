import getMouseCode from './utils/get-mouse-code';
import { default as keyResponder } from './decorators/key-responder';
import { default as onKey } from './decorators/on-key';

function getCode() {
  throw new Error(
    'ember-keyboard: `getCode` has been removed. There is no longer a need for this function as you can directly specify `key` and/or `code` values'
  );
}

function getKeyCode() {
  throw new Error(
    'ember-keyboard: `getKeyCode` has been removed. There is no longer a need for this function as you can directly specify `key` and/or `code` values'
  );
}

export { getCode, getKeyCode, getMouseCode, keyResponder, onKey };

export { keyDown, keyUp, keyPress } from './listeners/key-events';
export { click, mouseDown, mouseUp } from './listeners/mouse-events';
export { touchStart, touchEnd } from './listeners/touch-events';
export {
  triggerKeyDown,
  triggerKeyPress,
  triggerKeyUp,
} from './utils/trigger-event';
