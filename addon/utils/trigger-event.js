import $ from 'jquery';
import { assign } from '@ember/polyfills';
import getCmdKey from './get-cmd-key';
import { getKeyCode } from 'ember-keyboard';
import validModifiers from 'ember-keyboard/fixtures/modifiers-array';

const triggerKeyEvent = function triggerKeyEvent(eventType, rawCode, element) {
  const event = $.Event(eventType);
  const parts = rawCode.split('+');
  const [code] = parts.filter((part) => !validModifiers.includes(part));
  const modifiers = parts.filter((part) => part !== code);
  const properties = modifiers.reduce((properties, modifier) => {
    modifier = modifier === 'cmd' ? getCmdKey() : modifier;
    properties[`${modifier}Key`] = true;

    return properties;
  }, {});

  assign(event, { code, keyCode: getKeyCode(code) }, properties);

  $(element || document).trigger(event);
};

const triggerKeyDown = function triggerKeyDown(code, element) {
  triggerKeyEvent('keydown', code, element);
};

const triggerKeyPress = function triggerKeyPress(code, element) {
  triggerKeyEvent('keypress', code, element);
};

const triggerKeyUp = function triggerKeyUp(code, element) {
  triggerKeyEvent('keyup', code, element);
};

export {
  triggerKeyDown,
  triggerKeyPress,
  triggerKeyUp
};
