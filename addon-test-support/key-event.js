import { getKeyCode, getMouseCode } from 'ember-keyboard';
import validModifiers from 'ember-keyboard/fixtures/modifiers-array';
import validMouseButtons from 'ember-keyboard/fixtures/mouse-buttons-array';
import getCmdKey from 'ember-keyboard/utils/get-cmd-key';
import { triggerEvent } from '@ember/test-helpers';

export const keyEvent = function keyEvent(attributes, type, element) {
  const event = (attributes || '').split('+').reduce((event, attribute) => { 
    if (validModifiers.indexOf(attribute) > -1) {
      attribute = attribute === 'cmd' ? getCmdKey() : attribute;
      event[`${attribute}Key`] = true;
    } else if (validMouseButtons.indexOf(attribute) > -1) {
      event.button = getMouseCode(attribute);
    } else {
      event.keyCode = getKeyCode(attribute);
    }

    return event;
  }, {});

  return triggerEvent(element || document.body, type, event);
}
