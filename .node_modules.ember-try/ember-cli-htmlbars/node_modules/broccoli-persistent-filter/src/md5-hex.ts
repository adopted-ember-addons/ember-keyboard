/// @ts-check
'use strict';

import * as crypto from 'crypto';

function md5sum(input: Buffer | string | Array<Buffer | string>): string {
  let hash = crypto.createHash('md5');

  /**
   * @param buf {}
   */
  function update(buf: Buffer | string) {
    if (typeof buf === 'string') {
      hash.update(buf, 'utf8');
    } else {
      hash.update(buf);
    }
  }

  if (arguments.length > 1) {
    throw new Error('Too many arguments. Try specifying an array.');
  }

  if (Array.isArray(input)) {
    input.forEach(update);
  } else {
    update(input);
  }

  return hash.digest('hex');
}

export = md5sum;
