import Ember from 'ember';
import { getKeyCode } from 'ember-keyboard';
import validModifiers from 'ember-keyboard/fixtures/modifiers-array';
import getCmdKey from 'ember-keyboard/utils/get-cmd-key';

const keyEvent = function keyEvent(app, attributes, type, element) {
  const event = attributes.split('+').reduce((event, attribute) => {
    if (validModifiers.indexOf(attribute) > -1) {
      attribute = attribute === 'cmd' ? getCmdKey() : attribute;
      event[`${attribute}Key`] = true;
    } else {
      event.keyCode = getKeyCode(attribute);
    }

    return event;
  }, {});

  return app.testHelpers.triggerEvent(element || document, type, event);
}

export default function() {
  Ember.Test.registerAsyncHelper('keyDown', function(app, attributes, element) {
    return keyEvent(app, attributes, 'keydown', element);
  });

  Ember.Test.registerAsyncHelper('keyUp', function(app, attributes, element) {
    return keyEvent(app, attributes, 'keyup', element);
  });

  Ember.Test.registerAsyncHelper('keyPress', function(app, attributes, element) {
    return keyEvent(app, attributes, 'keypress', element);
  });
}
