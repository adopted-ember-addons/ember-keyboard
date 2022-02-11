import listenerName from '../utils/listener-name';

export function keyDown(keyCombo) {
  return listenerName('keydown', keyCombo);
}

export function keyPress(keyCombo) {
  return listenerName('keypress', keyCombo);
}

export function keyUp(keyCombo) {
  return listenerName('keyup', keyCombo);
}
