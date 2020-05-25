import KeyboardListener from './keyboard-listener';

const triggerKeyEvent = function triggerKeyEvent(eventType, keyCombo, element) {
  let keyboardListener = KeyboardListener.parse(`${eventType}:${keyCombo}`);
  const event = keyboardListener.createMatchingKeyboardEvent();
  element.dispatchEvent(event);
};

const triggerKeyDown = function triggerKeyDown(keyCombo, element = document) {
  triggerKeyEvent('keydown', keyCombo, element);
};

const triggerKeyPress = function triggerKeyPress(keyCombo, element = document) {
  triggerKeyEvent('keypress', keyCombo, element);
};

const triggerKeyUp = function triggerKeyUp(keyCombo, element = document) {
  triggerKeyEvent('keyup', keyCombo, element);
};

export {
  triggerKeyDown,
  triggerKeyPress,
  triggerKeyUp
};
