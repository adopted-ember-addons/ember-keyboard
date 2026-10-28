import getMouseName from '../utils/get-mouse-code.js';
import modifiers from '../fixtures/modifiers-array.js';
import mouseButtons from '../fixtures/mouse-buttons-array.js';
import getCmdKey from '../utils/get-cmd-key.js';
import { triggerEvent } from '@ember/test-helpers';

function keyEvent(keyCombo, type, element = document, eventOptions = {}) {
  const keyComboParts = (keyCombo || '').split('+');
  const eventProps = keyComboParts.reduce((eventProps, keyComboPart) => {
    const isValidModifier = modifiers.indexOf(keyComboPart) > -1;
    if (isValidModifier) {
      keyComboPart = keyComboPart === 'cmd' ? getCmdKey() : keyComboPart;
      eventProps[`${keyComboPart}Key`] = true;
    }
    if (type.startsWith('key') && !isValidModifier) {
      eventProps.code = keyComboPart;
    }
    if (type.startsWith('mouse') && !isValidModifier && mouseButtons.indexOf(keyComboPart) > -1) {
      eventProps.button = getMouseName(keyComboPart);
    }
    return eventProps;
  }, {});
  return triggerEvent(element, type, {
    ...eventOptions,
    ...eventProps
  });
}

export { keyEvent };
//# sourceMappingURL=key-event.js.map
