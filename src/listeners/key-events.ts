import listenerName from '../utils/listener-name.ts';

export function keyDown(keyCombo?: string): string {
  return listenerName('keydown', keyCombo);
}

export function keyPress(keyCombo?: string): string {
  return listenerName('keypress', keyCombo);
}

export function keyUp(keyCombo?: string): string {
  return listenerName('keyup', keyCombo);
}
