import Ember from 'ember';
import layout from '../templates/components/trigger-event-test';
import { EKMixin, keyDown, keyPress, keyUp } from 'ember-keyboard';

export default Ember.Component.extend(EKMixin, {
  layout,

  keyboardActivated: true,
  keyDown: false,
  keyDownWithMods: false,
  keyPress: false,
  keyUp: false,

  onKeyDown: Ember.on(keyDown('KeyA'), function() {
    this.toggleProperty('keyDown');
  }),

  onKeyDownWithMods: Ember.on(keyDown('KeyA+cmd+shift'), function() {
    this.toggleProperty('keyDownWithMods');
  }),

  onKeyPress: Ember.on(keyPress('KeyA'), function() {
    this.toggleProperty('keyPress');
  }),

  onKeyUp: Ember.on(keyUp('KeyA'), function() {
    this.toggleProperty('keyUp');
  })
});
