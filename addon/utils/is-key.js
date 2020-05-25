import KeyboardListener from "./keyboard-listener";
import getPlatform from "./platform";
import { SHIFT_KEY_MAP, MAC_ALT_KEY_MAP, MAC_SHIFT_ALT_KEY_MAP } from 'ember-keyboard/fixtures/key-maps';
import ALL_MODIFIERS from 'ember-keyboard/fixtures/modifiers-array';
const ALL_SYMBOL = '_all';

export default function isKey(listenerOrListenerName, keyboardEvent, platform = getPlatform()) {
  let keyboardListener;
  if (listenerOrListenerName instanceof KeyboardListener) {
    keyboardListener = listenerOrListenerName;
  } else if (typeof listenerOrListenerName === 'string') {
    keyboardListener = KeyboardListener.parse(listenerOrListenerName, platform);
  } else {
    throw new Error('Expected a `string` or `KeyCombo` as `keyComboOrKeyComboString` argument to `isKey`');
  }

  if (keyboardListener.type !== keyboardEvent.type) {
    return false;
  }

  if (isAll(keyboardListener)) {
    return true;
  }

  if (modifiersMatch(keyboardListener, keyboardEvent) && keyOrCodeMatches(keyboardListener, keyboardEvent)) {
    return true;
  }

  return specialCaseMatches(keyboardListener, keyboardEvent, platform);
}

function isAll(keyboardListener) {
  return keyboardListener.keyOrCode === ALL_SYMBOL
    && keyboardListener.altKey === false
    && keyboardListener.ctrlKey === false
    && keyboardListener.metaKey === false
    && keyboardListener.shiftKey === false;
}

function modifiersMatch(keyboardListener, keyboardEvent) {
  return keyboardListener.type === keyboardEvent.type
    && keyboardListener.altKey === keyboardEvent.altKey
    && keyboardListener.ctrlKey === keyboardEvent.ctrlKey
    && keyboardListener.metaKey === keyboardEvent.metaKey
    && keyboardListener.shiftKey === keyboardEvent.shiftKey;
}

function keyOrCodeMatches(keyboardListener, keyboardEvent) {
  if (keyboardListener.keyOrCode === ALL_SYMBOL) {
    return true;
  }
  return keyboardListener.keyOrCode === keyboardEvent.code || keyboardListener.keyOrCode === keyboardEvent.key;
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
  if (platform === 'Macintosh' && onlyModifiers(['shift','alt'], keyboardListener) && onlyModifiers(['shift','alt'], keyboardEvent)) {
    return rootKeyForMacShiftAltKey(keyboardEvent.key) === keyboardListener.keyOrCode;
  }
  return false;
}

const ALL_MODIFIERS_EXCEPT_CMD = ALL_MODIFIERS.filter(m => m != 'cmd');
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