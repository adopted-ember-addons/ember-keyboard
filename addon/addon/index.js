import getMouseCode from 'ember-keyboard/utils/get-mouse-code';
import { default as keyResponder } from 'ember-keyboard/decorators/key-responder';
import { default as onKey } from 'ember-keyboard/decorators/on-key';

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

export { keyDown, keyUp, keyPress } from 'ember-keyboard/listeners/key-events';
export {
  click,
  mouseDown,
  mouseUp,
} from 'ember-keyboard/listeners/mouse-events';
export { touchStart, touchEnd } from 'ember-keyboard/listeners/touch-events';
export {
  triggerKeyDown,
  triggerKeyPress,
  triggerKeyUp,
} from 'ember-keyboard/utils/trigger-event';
