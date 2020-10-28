import getPlatform from "./platform";

const ALT_REGEX = /^alt$/i;
const SHIFT_REGEX = /^shift$/i;
const CTRL_REGEX = /^ctrl$/i;
const META_REGEX = /^meta$/i;
const CMD_REGEX = /^cmd$/i;

export default class KeyboardListener {
  type; // keydown, keyup, keypress
  altKey = false;
  ctrlKey = false;
  shiftKey = false;
  metaKey = false;
  keyOrCode;
  platform;

  constructor(platform = getPlatform()) {
    this.platform = platform;
  }

  static parse(s, platform = getPlatform()) {
    let keyboardListener = new KeyboardListener(platform);
    let [eventType, keyCombo] = s.split(':');
    keyboardListener.type = eventType;

    if (keyCombo === '+') {
      keyboardListener.keyOrCode = keyCombo;
      return keyboardListener;
    }

    keyCombo.split('+').forEach((part) => {
      if (ALT_REGEX.test(part)) {
        keyboardListener.altKey = true;
      } else if (CTRL_REGEX.test(part)) {
        keyboardListener.ctrlKey = true;
      } else if (META_REGEX.test(part)) {
        keyboardListener.metaKey = true;
      } else if (SHIFT_REGEX.test(part)) {
        keyboardListener.shiftKey = true;
      } else if (CMD_REGEX.test(part)) {
        if (platform.indexOf('Mac') > -1) {
          keyboardListener.metaKey = true;
        } else {
          keyboardListener.ctrlKey = true;
        }
      } else {
        keyboardListener.keyOrCode = part;
      }
    });
    return keyboardListener;
  }

  createMatchingKeyboardEvent(opts = {}) {
    return new KeyboardEvent(this.type, Object.assign({
      // one of these next two will be incorrect. For test usage, if usually
      // doesn't matter, but you can pass in correct values via opts if needed.
      key: this.keyOrCode,
      code: this.keyOrCode,

      altKey: this.altKey,
      ctrlKey: this.ctrlKey,
      metaKey: this.metaKey,
      shiftKey: this.shiftKey
    }, opts));
  }
}
