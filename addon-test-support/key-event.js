import { getKeyCode, getMouseCode } from 'ember-keyboard';
import validModifiers from 'ember-keyboard/fixtures/modifiers-array';
import validMouseButtons from 'ember-keyboard/fixtures/mouse-buttons-array';
import getCmdKey from 'ember-keyboard/utils/get-cmd-key';
import { triggerEvent } from '@ember/test-helpers';

export const keyEvent = function keyEvent(attributes, type, element) {
  const keys = (attributes || '').split('+');

  const event = keys.reduce((event, attribute) => {
    const isValidModifier = validModifiers.indexOf(attribute) > -1;

    if (isValidModifier) {
      attribute = attribute === 'cmd' ? getCmdKey() : attribute;

      event[`${attribute}Key`] = true;
    } else if (validMouseButtons.indexOf(attribute) > -1) {
      event.button = getMouseCode(attribute);
    } else {
      const keyCode = getKeyCode(attribute);

      event.code = attribute;

      // deprecated / removed from the Web Standards
      event.which = keyCode;
      event.keyCode = keyCode;
    }

    return event;
  }, {});

  return triggerEvent(element || document.body, type, event);
}
