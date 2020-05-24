import KeyboardListener from "./keyboard-listener";

export default function isKey(listenerOrListenerName, keyboardEvent) {
  let keyboardListener;
  if (listenerOrListenerName instanceof KeyboardListener) {
    keyboardListener = listenerOrListenerName;
  } else if (typeof listenerOrListenerName === 'string') {
    keyboardListener = KeyboardListener.parse(listenerOrListenerName);
  } else {
    throw new Error('Expected a `string` or `KeyCombo` as `keyComboOrKeyComboString` argument to `isKey`');
  }

  return modifiersMatch(keyboardListener, keyboardEvent)
      && keyOrCodeMatches(keyboardListener, keyboardEvent);
}

function modifiersMatch(keyboardListener, keyboardEvent) {
  return keyboardListener.type === keyboardEvent.type
      && keyboardListener.altKey === keyboardEvent.altKey
      && keyboardListener.ctrlKey === keyboardEvent.ctrlKey
      && keyboardListener.metaKey === keyboardEvent.metaKey
      && keyboardListener.shiftKey === keyboardEvent.shiftKey;
}

function keyOrCodeMatches(keyCombo, keyboardEvent) {
  return keyCombo.keyOrCode === keyboardEvent.code || keyCombo.keyOrCode === keyboardEvent.key;
}