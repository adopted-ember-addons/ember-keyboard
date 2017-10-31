import { on } from '@ember/object/evented';
import Component from '@ember/component';
import layout from '../templates/components/trigger-event-test';
import { EKMixin, keyDown, keyPress, keyUp } from 'ember-keyboard';

export default Component.extend(EKMixin, {
  layout,

  keyboardActivated: true,
  keyDown: false,
  keyDownWithMods: false,
  keyPress: false,
  keyUp: false,

  onKeyDown: on(keyDown('KeyA'), function() {
    this.toggleProperty('keyDown');
  }),

  onKeyDownWithMods: on(keyDown('KeyA+cmd+shift'), function() {
    this.toggleProperty('keyDownWithMods');
  }),

  onKeyPress: on(keyPress('KeyA'), function() {
    this.toggleProperty('keyPress');
  }),

  onKeyUp: on(keyUp('KeyA'), function() {
    this.toggleProperty('keyUp');
  })
});
