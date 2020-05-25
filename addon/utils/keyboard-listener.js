const ALT_REGEX = /alt/i;
const SHIFT_REGEX = /shift/i;
const CTRL_REGEX = /ctrl/i;
const META_REGEX = /meta/i;

export default class KeyboardListener {
  type; // keydown, keyup, keypress
  altKey = false;
  ctrlKey = false;
  shiftKey = false;
  metaKey = false;
  keyOrCode;
  static parse(s) {
    let keyboardListener = new KeyboardListener();
    let [eventType, keyCombo] = s.split(':');
    keyboardListener.type = eventType;
    keyCombo.split('+').forEach((part) => {
      if (ALT_REGEX.test(part)) {
        keyboardListener.altKey = true;
      } else if (CTRL_REGEX.test(part)) {
        keyboardListener.ctrlKey = true;
      } else if (META_REGEX.test(part)) {
        keyboardListener.metaKey = true;
      } else if (SHIFT_REGEX.test(part)) {
        keyboardListener.shiftKey = true;
      } else {
        keyboardListener.keyOrCode = part;
      }
    });
    return keyboardListener;
  }
}
