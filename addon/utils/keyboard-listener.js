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
      switch (part) {
        case 'alt':
          keyboardListener.altKey = true;
          break;
        case 'ctrl':
          keyboardListener.ctrlKey = true;
          break;
        case 'meta':
          keyboardListener.metaKey = true;
          break;
        case 'shift':
          keyboardListener.shiftKey = true;
          break;
        default:
          keyboardListener.keyOrCode = part;
      }
    });
    return keyboardListener;
  }
}
