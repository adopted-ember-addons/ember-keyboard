import { keyEvent } from './key-event.js';
import '../utils/get-mouse-code.js';
import '@ember/utils';
import '../fixtures/modifiers-array.js';
import '../fixtures/mouse-buttons-array.js';
import '../utils/get-cmd-key.js';
import '@ember/test-helpers';

function mouseDown(keyCombo) {
  return keyEvent(keyCombo, 'mousedown');
}
function mouseUp(keyCombo) {
  return keyEvent(keyCombo, 'mouseup');
}
function keyDown(keyCombo) {
  return keyEvent(keyCombo, 'keydown');
}
function keyDownWithElement(keyCombo, element, eventOptions) {
  return keyEvent(keyCombo, 'keydown', element, eventOptions);
}
function keyUp(keyCombo) {
  return keyEvent(keyCombo, 'keyup');
}
function keyPress(keyCombo) {
  return keyEvent(keyCombo, 'keypress');
}
function touchStart(keyCombo) {
  return keyEvent(keyCombo, 'touchstart');
}
function touchEnd(keyCombo) {
  return keyEvent(keyCombo, 'touchend');
}

export { keyDown, keyDownWithElement, keyPress, keyUp, mouseDown, mouseUp, touchEnd, touchStart };
