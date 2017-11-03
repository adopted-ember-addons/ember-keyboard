import { registerAsyncHelper } from '@ember/test';
import { getKeyCode, getMouseCode } from 'ember-keyboard';
import validModifiers from 'ember-keyboard/fixtures/modifiers-array';
import validMouseButtons from 'ember-keyboard/fixtures/mouse-buttons-array';
import getCmdKey from 'ember-keyboard/utils/get-cmd-key';

const keyEvent = function keyEvent(app, attributes, type, element) {
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

  return app.testHelpers.triggerEvent(element || document.body, type, event);
}

export default function() {
  registerAsyncHelper('keyDown', function(app, attributes, element) {
    return keyEvent(app, attributes, 'keydown', element);
  });

  registerAsyncHelper('keyUp', function(app, attributes, element) {
    return keyEvent(app, attributes, 'keyup', element);
  });

  registerAsyncHelper('keyPress', function(app, attributes, element) {
    return keyEvent(app, attributes, 'keypress', element);
  });

  registerAsyncHelper('mouseDown', function(app, attributes, element) {
    return keyEvent(app, attributes, 'mousedown', element);
  });

  registerAsyncHelper('mouseUp', function(app, attributes, element) {
    return keyEvent(app, attributes, 'mouseup', element);
  });

  registerAsyncHelper('touchStart', function(app, attributes, element) {
    return keyEvent(app, attributes, 'touchstart', element);
  });

  registerAsyncHelper('touchEnd', function(app, attributes, element) {
    return keyEvent(app, attributes, 'touchend', element);
  });
}
