/* eslint-disable ember/no-mixins */
import getMouseCode from 'ember-keyboard/utils/get-mouse-code';
import EKMixin from 'ember-keyboard/mixins/ember-keyboard';
import EKFirstResponderOnFocusMixin from 'ember-keyboard/mixins/keyboard-first-responder-on-focus';
import EKOnFocusMixin from 'ember-keyboard/mixins/activate-keyboard-on-focus';
import EKOnInsertMixin from 'ember-keyboard/mixins/activate-keyboard-on-insert';
import EKOnInitMixin from 'ember-keyboard/mixins/activate-keyboard-on-init';
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

export {
  EKMixin,
  EKFirstResponderOnFocusMixin,
  EKOnFocusMixin,
  EKOnInsertMixin,
  EKOnInitMixin,
  getCode,
  getKeyCode,
  getMouseCode,
  keyResponder,
  onKey,
};

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
