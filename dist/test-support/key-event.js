import getMouseName from '../utils/get-mouse-code.js';
import validModifiers from '../fixtures/modifiers-array.js';
import validMouseButtons from '../fixtures/mouse-buttons-array.js';
import getCmdKey from '../utils/get-cmd-key.js';
import { triggerEvent } from '@ember/test-helpers';
import '@ember/utils';

function keyEvent(keyCombo, type, element = document, eventOptions = {}) {
  let keyComboParts = (keyCombo || '').split('+');
  let eventProps = keyComboParts.reduce((eventProps, keyComboPart) => {
    let isValidModifier = validModifiers.indexOf(keyComboPart) > -1;
    if (isValidModifier) {
      keyComboPart = keyComboPart === 'cmd' ? getCmdKey() : keyComboPart;
      eventProps[`${keyComboPart}Key`] = true;
    }
    if (type.startsWith('key') && !isValidModifier) {
      eventProps.code = keyComboPart;
    }
    if (type.startsWith('mouse') && !isValidModifier && validMouseButtons.indexOf(keyComboPart) > -1) {
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
