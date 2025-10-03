import { _ as _defineProperty } from '../_rollupPluginBabelHelpers-2fc49ad3.js';
import getPlatform from './platform.js';
import '@ember/debug';

const ALT_REGEX = /^alt$/i;
const SHIFT_REGEX = /^shift$/i;
const CTRL_REGEX = /^ctrl$/i;
const META_REGEX = /^meta$/i;
const CMD_REGEX = /^cmd$/i;
class KeyboardListener {
  constructor(platform = getPlatform()) {
    _defineProperty(this, "type", void 0);
    // keydown, keyup, keypress
    _defineProperty(this, "altKey", false);
    _defineProperty(this, "ctrlKey", false);
    _defineProperty(this, "shiftKey", false);
    _defineProperty(this, "metaKey", false);
    _defineProperty(this, "keyOrCode", void 0);
    _defineProperty(this, "platform", void 0);
    this.platform = platform;
  }
  static parse(s, platform = getPlatform()) {
    let keyboardListener = new KeyboardListener(platform);
    let [eventType, ...keyCombo] = s.split(':');
    keyCombo = keyCombo.join(':'); // allow keyCombo contain semicolon
    keyboardListener.type = eventType;
    let maybePlus = false;
    keyCombo.split('+').reduce((result, part) => {
      if (part === '') {
        if (maybePlus) {
          result.push('+');
        }
        maybePlus = !maybePlus;
      } else {
        result.push(part);
      }
      return result;
    }, []).forEach(part => {
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

export { KeyboardListener as default };
