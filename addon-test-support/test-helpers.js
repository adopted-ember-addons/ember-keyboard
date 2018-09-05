import { keyEvent } from './key-event';

export function mouseDown(attributes) {
  return keyEvent(attributes, 'mousedown');
}

export function mouseUp(attributes) {
  return keyEvent(attributes, 'mouseup');
}

export function keyDown(attributes) {
  return keyEvent(attributes, 'keydown');
}

export function keyUp(attributes) {
  return keyEvent(attributes, 'keyup');
}

export function keyPress(attributes) {
  return keyEvent(attributes, 'keypress');
}

export function touchStart(attributes) {
  return keyEvent(attributes, 'touchstart');
}

export function touchEnd(attributes) {
  return keyEvent(attributes, 'touchend');
}
