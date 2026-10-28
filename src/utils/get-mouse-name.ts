import { isNone } from '@ember/utils';
import type { MouseButtonName } from '../fixtures/mouse-buttons-array.ts';

export default function getMouseName(
  buttonCode?: number | null,
): MouseButtonName | undefined {
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
