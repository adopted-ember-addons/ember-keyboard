import KeyboardListener from './keyboard-listener.js';
import getPlatform from './platform.js';
import { SHIFT_KEY_MAP, MAC_ALT_KEY_MAP, MAC_SHIFT_ALT_KEY_MAP } from '../fixtures/key-maps.js';
import validModifiers from '../fixtures/modifiers-array.js';
import getMouseName from './get-mouse-name.js';
import '../_rollupPluginBabelHelpers-2fc49ad3.js';
import '@ember/debug';
import '@ember/utils';

const ALL_SYMBOL = '_all';
function isKey(listenerOrListenerName, event, platform = getPlatform()) {
  let listener;
  if (listenerOrListenerName instanceof KeyboardListener) {
    listener = listenerOrListenerName;
  } else if (typeof listenerOrListenerName === 'string') {
    listener = KeyboardListener.parse(listenerOrListenerName, platform);
  } else {
    throw new Error('Expected a `string` or `KeyCombo` as `keyComboOrKeyComboString` argument to `isKey`');
  }
  if (listener.type !== event.type) {
    return false;
  }
  if (isAll(listener)) {
    return true;
  }
  if (modifiersMatch(listener, event) && (keyOrCodeMatches(listener, event) || mouseButtonMatches(listener, event))) {
    return true;
  }
  return specialCaseMatches(listener, event, platform);
}
function isAll(listener) {
  return listener.keyOrCode === ALL_SYMBOL && listener.altKey === false && listener.ctrlKey === false && listener.metaKey === false && listener.shiftKey === false;
}
function modifiersMatch(listener, keyboardEvent) {
  return listener.type === keyboardEvent.type && listener.altKey === keyboardEvent.altKey && listener.ctrlKey === keyboardEvent.ctrlKey && listener.metaKey === keyboardEvent.metaKey && listener.shiftKey === keyboardEvent.shiftKey;
}
function keyOrCodeMatches(listener, keyboardEvent) {
  if (!(keyboardEvent instanceof KeyboardEvent)) {
    return false;
  }
  if (listener.keyOrCode === ALL_SYMBOL) {
    return true;
  }
  return listener.keyOrCode === keyboardEvent.code || listener.keyOrCode === keyboardEvent.key;
}
function mouseButtonMatches(listener, mouseEvent) {
  if (!(mouseEvent instanceof MouseEvent)) {
    return false;
  }
  if (listener.keyOrCode === ALL_SYMBOL) {
    return true;
  }
  return listener.keyOrCode === getMouseName(mouseEvent.button);
}
function specialCaseMatches(keyboardListener, keyboardEvent, platform) {
  if (onlyModifiers([], keyboardListener) && onlyModifiers(['shift'], keyboardEvent)) {
    return keyboardEvent.key === keyboardListener.keyOrCode;
  }
  if (onlyModifiers(['shift'], keyboardListener) && onlyModifiers(['shift'], keyboardEvent)) {
    return rootKeyForShiftKey(keyboardEvent.key) === keyboardListener.keyOrCode;
  }
  if (platform === 'Macintosh' && onlyModifiers(['alt'], keyboardListener) && onlyModifiers(['alt'], keyboardEvent)) {
    return rootKeyForMacAltKey(keyboardEvent.key) === keyboardListener.keyOrCode;
  }
  if (platform === 'Macintosh' && onlyModifiers(['shift', 'alt'], keyboardListener) && onlyModifiers(['shift', 'alt'], keyboardEvent)) {
    return rootKeyForMacShiftAltKey(keyboardEvent.key) === keyboardListener.keyOrCode;
  }
  return false;
}
const ALL_MODIFIERS_EXCEPT_CMD = validModifiers.filter(m => m != 'cmd');
function onlyModifiers(names, obj) {
  for (let modifier of ALL_MODIFIERS_EXCEPT_CMD) {
    if (names.includes(modifier) && !obj[`${modifier}Key`]) {
      return false;
    }
    if (!names.includes(modifier) && obj[`${modifier}Key`]) {
      return false;
    }
  }
  return true;
}
function rootKeyForShiftKey(key) {
  return SHIFT_KEY_MAP[key] || key;
}
function rootKeyForMacAltKey(key) {
  return MAC_ALT_KEY_MAP[key] || key;
}
function rootKeyForMacShiftAltKey(key) {
  return MAC_SHIFT_ALT_KEY_MAP[key] || key;
}

export { isKey as default };
