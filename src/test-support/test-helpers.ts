import { keyEvent } from './key-event.ts';

type KeyEventArgs = Parameters<typeof keyEvent>;

export function mouseDown(keyCombo?: string): Promise<void> {
  return keyEvent(keyCombo, 'mousedown');
}

export function mouseUp(keyCombo?: string): Promise<void> {
  return keyEvent(keyCombo, 'mouseup');
}

export function keyDown(keyCombo?: string): Promise<void> {
  return keyEvent(keyCombo, 'keydown');
}

export function keyDownWithElement(
  keyCombo: string | undefined,
  element?: KeyEventArgs[2],
  eventOptions?: KeyEventArgs[3],
): Promise<void> {
  return keyEvent(keyCombo, 'keydown', element, eventOptions);
}

export function keyUp(keyCombo?: string): Promise<void> {
  return keyEvent(keyCombo, 'keyup');
}

export function keyPress(keyCombo?: string): Promise<void> {
  return keyEvent(keyCombo, 'keypress');
}

export function touchStart(keyCombo?: string): Promise<void> {
  return keyEvent(keyCombo, 'touchstart');
}

export function touchEnd(keyCombo?: string): Promise<void> {
  return keyEvent(keyCombo, 'touchend');
}
