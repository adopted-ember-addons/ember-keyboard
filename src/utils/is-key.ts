import KeyboardListener from './keyboard-listener.ts';
import getPlatform from './platform.ts';
import {
  SHIFT_KEY_MAP,
  MAC_ALT_KEY_MAP,
  MAC_SHIFT_ALT_KEY_MAP,
} from '../fixtures/key-maps.ts';
import ALL_MODIFIERS, {
  type ModifierName,
} from '../fixtures/modifiers-array.ts';
import getMouseName from './get-mouse-name.ts';
import type { EmberKeyboardDOMEvent } from '../types.ts';

type ModifierFlags = Pick<
  KeyboardListener,
  'altKey' | 'ctrlKey' | 'metaKey' | 'shiftKey'
>;

const ALL_SYMBOL = '_all';

export default function isKey(
  listenerOrListenerName: KeyboardListener | string,
  event: Event,
  platform: string = getPlatform(),
): boolean {
  let listener: KeyboardListener;
  if (listenerOrListenerName instanceof KeyboardListener) {
    listener = listenerOrListenerName;
  } else if (typeof listenerOrListenerName === 'string') {
    listener = KeyboardListener.parse(listenerOrListenerName, platform);
  } else {
    throw new Error(
      'Expected a `string` or `KeyCombo` as `keyComboOrKeyComboString` argument to `isKey`',
    );
  }

  if (listener.type !== event.type) {
    return false;
  }

  if (isAll(listener)) {
    return true;
  }

  if (
    modifiersMatch(listener, event as EmberKeyboardDOMEvent) &&
    (keyOrCodeMatches(listener, event) || mouseButtonMatches(listener, event))
  ) {
    return true;
  }

  return specialCaseMatches(listener, event as KeyboardEvent, platform);
}

function isAll(listener: KeyboardListener): boolean {
  return (
    listener.keyOrCode === ALL_SYMBOL &&
    listener.altKey === false &&
    listener.ctrlKey === false &&
    listener.metaKey === false &&
    listener.shiftKey === false
  );
}

function modifiersMatch(
  listener: KeyboardListener,
  keyboardEvent: EmberKeyboardDOMEvent,
): boolean {
  return (
    listener.type === keyboardEvent.type &&
    listener.altKey === keyboardEvent.altKey &&
    listener.ctrlKey === keyboardEvent.ctrlKey &&
    listener.metaKey === keyboardEvent.metaKey &&
    listener.shiftKey === keyboardEvent.shiftKey
  );
}

function keyOrCodeMatches(
  listener: KeyboardListener,
  keyboardEvent: Event,
): boolean {
  if (!(keyboardEvent instanceof KeyboardEvent)) {
    return false;
  }
  if (listener.keyOrCode === ALL_SYMBOL) {
    return true;
  }
  return (
    listener.keyOrCode === keyboardEvent.code ||
    listener.keyOrCode === keyboardEvent.key
  );
}

function mouseButtonMatches(
  listener: KeyboardListener,
  mouseEvent: Event,
): boolean {
  if (!(mouseEvent instanceof MouseEvent)) {
    return false;
  }
  if (listener.keyOrCode === ALL_SYMBOL) {
    return true;
  }
  return listener.keyOrCode === getMouseName(mouseEvent.button);
}

function specialCaseMatches(
  keyboardListener: KeyboardListener,
  keyboardEvent: KeyboardEvent,
  platform: string,
): boolean {
  if (
    onlyModifiers([], keyboardListener) &&
    onlyModifiers(['shift'], keyboardEvent)
  ) {
    return keyboardEvent.key === keyboardListener.keyOrCode;
  }

  if (
    onlyModifiers(['shift'], keyboardListener) &&
    onlyModifiers(['shift'], keyboardEvent)
  ) {
    return rootKeyForShiftKey(keyboardEvent.key) === keyboardListener.keyOrCode;
  }

  if (
    platform === 'Macintosh' &&
    onlyModifiers(['alt'], keyboardListener) &&
    onlyModifiers(['alt'], keyboardEvent)
  ) {
    return (
      rootKeyForMacAltKey(keyboardEvent.key) === keyboardListener.keyOrCode
    );
  }
  if (
    platform === 'Macintosh' &&
    onlyModifiers(['shift', 'alt'], keyboardListener) &&
    onlyModifiers(['shift', 'alt'], keyboardEvent)
  ) {
    return (
      rootKeyForMacShiftAltKey(keyboardEvent.key) === keyboardListener.keyOrCode
    );
  }
  return false;
}

const ALL_MODIFIERS_EXCEPT_CMD = ALL_MODIFIERS.filter(
  (m): m is Exclude<ModifierName, 'cmd'> => m != 'cmd',
);
function onlyModifiers(names: string[], obj: ModifierFlags): boolean {
  for (const modifier of ALL_MODIFIERS_EXCEPT_CMD) {
    const flag = `${modifier}Key` as const;
    if (names.includes(modifier) && !obj[flag]) {
      return false;
    }
    if (!names.includes(modifier) && obj[flag]) {
      return false;
    }
  }
  return true;
}

function rootKeyForShiftKey(key: string): string {
  return SHIFT_KEY_MAP[key] || key;
}

function rootKeyForMacAltKey(key: string): string {
  return MAC_ALT_KEY_MAP[key] || key;
}

function rootKeyForMacShiftAltKey(key: string): string {
  return MAC_SHIFT_ALT_KEY_MAP[key] || key;
}
