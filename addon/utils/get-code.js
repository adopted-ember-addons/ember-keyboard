import codeMap from 'ember-keyboard/fixtures/code-map';

export default function getCode(event) {
  const { code, key, keyCode } = event;

  // Note that keyCode is deprecated
  // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
  if (!code) {
    return codeMap[keyCode];
  }

  if (!code.includes('Key') || !key) {
    return codeMap[keyCode] || code;
  }

  // If we have a software-applied key-remapping
  // For example:
  //   in Dvorak:
  //     pressing 'k'
  //       will give a code of 'KeyV'
  //       and a key of 'k'
  const codeLetter = code.charAt(code.length - 1);
  const keyboardLetter = codeLetter.toLowerCase();
  const typedLetter = key.toLowerCase();

  if (typedLetter === keyboardLetter) {
    return code;
  }

  const newCode = `Key${typedLetter.toUpperCase()}`;

  return newCode;
}
