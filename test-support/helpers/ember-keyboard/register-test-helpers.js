import Ember from 'ember';
import { getKeyCode } from 'ember-keyboard';

const keyEvent = function keyEvent(app, attributes, type) {
  const event = attributes.split('+').reduce((event, attribute) => {
    if (['ctrl', 'meta', 'alt', 'shift'].indexOf(attribute) > -1) {
      event[`${attribute}Key`] = true;
    } else {
      event.keyCode = getKeyCode(attribute);
    }

    return event;
  }, {});

  return app.testHelpers.triggerEvent(document, type, event);
}

export default function() {
  Ember.Test.registerAsyncHelper('keyDown', function(app, attributes) {
    return keyEvent(app, attributes, 'keydown');
  });

  Ember.Test.registerAsyncHelper('keyUp', function(app, attributes) {
    return keyEvent(app, attributes, 'keyup');
  });

  Ember.Test.registerAsyncHelper('keyPress', function(app, attributes) {
    return keyEvent(app, attributes, 'keypress');
  });
}
