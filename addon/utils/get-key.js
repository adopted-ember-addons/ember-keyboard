import KEY_MAP from 'ember-keyboard/fixtures/key-map';

export default function getKey(event) {
  return KEY_MAP[event.keyCode] || event.key;
}
