import getMouseCode from '../utils/get-mouse-code.ts';
import validModifiers from '../fixtures/modifiers-array.ts';
import validMouseButtons from '../fixtures/mouse-buttons-array.ts';
import getCmdKey from '../utils/get-cmd-key.ts';
import { triggerEvent } from '@ember/test-helpers';

type Target = Parameters<typeof triggerEvent>[0];

export function keyEvent(
  keyCombo: string | undefined,
  type: string,
  element: Target | Document = document,
  eventOptions: Record<string, unknown> = {},
): Promise<void> {
  const keyComboParts = (keyCombo || '').split('+');

  const eventProps = keyComboParts.reduce<Record<string, unknown>>(
    (eventProps, keyComboPart) => {
      const isValidModifier =
        (validModifiers as readonly string[]).indexOf(keyComboPart) > -1;

      if (isValidModifier) {
        keyComboPart =
          keyComboPart === 'cmd' ? (getCmdKey() as string) : keyComboPart;
        eventProps[`${keyComboPart}Key`] = true;
      }

      if (type.startsWith('key') && !isValidModifier) {
        eventProps.code = keyComboPart;
      }

      if (
        type.startsWith('mouse') &&
        !isValidModifier &&
        (validMouseButtons as readonly string[]).indexOf(keyComboPart) > -1
      ) {
        eventProps.button = getMouseCode(keyComboPart);
      }

      return eventProps;
    },
    {},
  );

  return triggerEvent(element, type, {
    ...eventOptions,
    ...eventProps,
  });
}
