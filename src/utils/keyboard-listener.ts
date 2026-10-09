import getPlatform from './platform.ts';

const ALT_REGEX = /^alt$/i;
const SHIFT_REGEX = /^shift$/i;
const CTRL_REGEX = /^ctrl$/i;
const META_REGEX = /^meta$/i;
const CMD_REGEX = /^cmd$/i;

export default class KeyboardListener {
  type!: string; // keydown, keyup, keypress
  altKey = false;
  ctrlKey = false;
  shiftKey = false;
  metaKey = false;
  keyOrCode?: string;
  platform: string;

  constructor(platform: string = getPlatform()) {
    this.platform = platform;
  }

  static parse(s: string, platform: string = getPlatform()): KeyboardListener {
    const keyboardListener = new KeyboardListener(platform);
    const [eventType = '', ...keyComboParts] = s.split(':');
    const keyCombo = keyComboParts.join(':'); // allow keyCombo contain semicolon
    keyboardListener.type = eventType;

    let maybePlus = false;
    keyCombo
      .split('+')
      .reduce<string[]>((result, part) => {
        if (part === '') {
          if (maybePlus) {
            result.push('+');
          }

          maybePlus = !maybePlus;
        } else {
          result.push(part);
        }

        return result;
      }, [])
      .forEach((part) => {
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

  createMatchingKeyboardEvent(opts: KeyboardEventInit = {}): KeyboardEvent {
    return new KeyboardEvent(
      this.type,
      Object.assign(
        {
          // one of these next two will be incorrect. For test usage, if usually
          // doesn't matter, but you can pass in correct values via opts if needed.
          key: this.keyOrCode,
          code: this.keyOrCode,

          altKey: this.altKey,
          ctrlKey: this.ctrlKey,
          metaKey: this.metaKey,
          shiftKey: this.shiftKey,
        },
        opts,
      ),
    );
  }
}
