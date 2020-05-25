import { keyEvent } from './key-event';

export function mouseDown(keyCombo) {
  return keyEvent(keyCombo, 'mousedown');
}

export function mouseUp(keyCombo) {
  return keyEvent(keyCombo, 'mouseup');
}

export function keyDown(keyCombo) {
  return keyEvent(keyCombo, 'keydown');
}

export function keyUp(keyCombo) {
  return keyEvent(keyCombo, 'keyup');
}

export function keyPress(keyCombo) {
  return keyEvent(keyCombo, 'keypress');
}

export function touchStart(keyCombo) {
  return keyEvent(keyCombo, 'touchstart');
}

export function touchEnd(keyCombo) {
  return keyEvent(keyCombo, 'touchend');
}
