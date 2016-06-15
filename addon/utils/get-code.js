import codeMap from 'ember-keyboard/fixtures/code-map';

export default function getCode(event) {
  return event.code || codeMap[event.keyCode];
}
