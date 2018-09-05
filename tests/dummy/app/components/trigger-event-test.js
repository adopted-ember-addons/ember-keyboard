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

  didInsertElement() {
    this._super(...arguments);

    this.on(keyDown('KeyA'), function() {
      this.toggleProperty('keyDown');
    }),

    this.on(keyDown('KeyA+cmd+shift'), function() {
      this.toggleProperty('keyDownWithMods');
    }),

    this.on(keyPress('KeyA'), function() {
      this.toggleProperty('keyPress');
    }),

    this.on(keyUp('KeyA'), function() {
      this.toggleProperty('keyUp');
    })
  }
});
