import { isNone } from '@ember/utils';

function getMouseName(buttonCode) {
  if (isNone(buttonCode)) return;
  switch (buttonCode) {
    case 0:
      return 'left';
    case 1:
      return 'middle';
    case 2:
      return 'right';
  }
}

export { getMouseName as default };
