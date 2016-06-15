import codeMap from 'ember-keyboard/fixtures/code-map';

export default function getKeyCode(key) {
  return Object.keys(codeMap).filter((keyCode) => {
    return codeMap[keyCode] === key;
  })[0];
}
