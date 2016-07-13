import Ember from 'ember';
import assign from './assign-polyfill';
import getCmdKey from './get-cmd-key';
import { getKeyCode } from 'ember-keyboard';

const triggerKeyEvent = function triggerKeyEvent(eventType, rawCode) {
  const event = Ember.$.Event(eventType);
  const [code, ...modifiers] = rawCode.split('+');
  const properties = modifiers.reduce((properties, modifier) => {
    modifier = modifier === 'cmd' ? getCmdKey() : modifier;
    properties[`${modifier}Key`] = true;

    return properties;
  }, {});

  assign(event, { code, keyCode: getKeyCode(code) }, properties);

  Ember.$(document).trigger(event);
};

const triggerKeyDown = function triggerKeyDown(code) {
  triggerKeyEvent('keydown', code);
};

const triggerKeyPress = function triggerKeyPress(code) {
  triggerKeyEvent('keypress', code);
};

const triggerKeyUp = function triggerKeyUp(code) {
  triggerKeyEvent('keyup', code);
};

export {
  triggerKeyDown,
  triggerKeyPress,
  triggerKeyUp
};
