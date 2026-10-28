import { isNone } from '@ember/utils';

export default function getMouseName(
  buttonCode?: string | null,
): 0 | 1 | 2 | undefined {
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
