import KEY_MAP from 'ember-keyboard/fixtures/key-map';

export default function getKeyCode(key) {
  return Object.keys(KEY_MAP).filter((keyCode) => {
    return KEY_MAP[keyCode] === key;
  })[0];
}
