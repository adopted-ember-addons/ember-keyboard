import { isNone } from '@ember/utils';

function getMouseName(buttonCode) {
  if (isNone(buttonCode)) return;
  switch (buttonCode) {
    case 'left':
      return 0;
    case 'middle':
      return 1;
    case 'right':
      return 2;
  }
}

export { getMouseName as default };
