import getCmdKey from './get-cmd-key.ts';

function sortedKeys(keyArray: string[]): string {
  return keyArray.sort().join('+');
}

export default function listenerName(
  type: string,
  keyArrayOrString: string | string[] = [],
): string {
  let keyArray = keyArrayOrString;
  if (typeof keyArrayOrString === 'string') {
    keyArray = keyArrayOrString.split('+');
  }

  if (keyArray.indexOf('cmd') > -1) {
    (keyArray as string[])[keyArray.indexOf('cmd')] = getCmdKey() as string;
  }

  let keys = sortedKeys((keyArray as string[]) || []);
  if (keys === '') {
    keys = '_all';
  }

  return `${type}:${keys}`;
}
