import KEY_MAP from 'ember-keyboard/fixtures/key-map';

export default function getKey(event) {
  return event.key || KEY_MAP[event.keyCode];
}
