import { isNone } from '@ember/utils';

export default function getMouseName(buttonCode) {
  if (isNone(buttonCode)) return;

  switch (buttonCode) {
    case 'left': return 0;
    case 'middle': return 1;
    case 'right': return 2;
  }
}
