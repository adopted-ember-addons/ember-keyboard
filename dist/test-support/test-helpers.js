import { keyEvent } from './key-event.js';

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
//# sourceMappingURL=test-helpers.js.map
