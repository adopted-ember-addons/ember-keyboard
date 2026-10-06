import KeyboardListener from './keyboard-listener.ts';

const triggerKeyEvent = function triggerKeyEvent(
  eventType: string,
  keyCombo: string,
  element: EventTarget,
): void {
  const keyboardListener = KeyboardListener.parse(`${eventType}:${keyCombo}`);
  const event = keyboardListener.createMatchingKeyboardEvent();
  element.dispatchEvent(event);
};

const triggerKeyDown = function triggerKeyDown(
  keyCombo: string,
  element: EventTarget = document,
): void {
  triggerKeyEvent('keydown', keyCombo, element);
};

const triggerKeyPress = function triggerKeyPress(
  keyCombo: string,
  element: EventTarget = document,
): void {
  triggerKeyEvent('keypress', keyCombo, element);
};

const triggerKeyUp = function triggerKeyUp(
  keyCombo: string,
  element: EventTarget = document,
): void {
  triggerKeyEvent('keyup', keyCombo, element);
};

export { triggerKeyDown, triggerKeyPress, triggerKeyUp };
