import KeyboardListener from "./keyboard-listener";
const ALL_SYMBOL = '_all';

export default function isKey(listenerOrListenerName, keyboardEvent) {
  let keyboardListener;
  if (listenerOrListenerName instanceof KeyboardListener) {
    keyboardListener = listenerOrListenerName;
  } else if (typeof listenerOrListenerName === 'string') {
    keyboardListener = KeyboardListener.parse(listenerOrListenerName);
  } else {
    throw new Error('Expected a `string` or `KeyCombo` as `keyComboOrKeyComboString` argument to `isKey`');
  }
  if (isAll(keyboardListener)) {
    return true;
  }

  return modifiersMatch(keyboardListener, keyboardEvent)
      && keyOrCodeMatches(keyboardListener, keyboardEvent);
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