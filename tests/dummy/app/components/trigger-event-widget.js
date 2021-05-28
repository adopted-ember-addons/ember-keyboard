/* eslint-disable ember/no-classic-components */
/* eslint-disable ember/require-tagless-components */
/* eslint-disable ember/no-classic-classes */
import Component from '@ember/component';
import layout from '../templates/components/trigger-event-widget';
import { EKMixin, keyDown, keyPress, keyUp } from 'ember-keyboard';

export default Component.extend(EKMixin, {
  layout,

  keyboardActivated: true,
  keyDown: false,
  keyDownWithMods: false,
  keyPress: false,
  keyUp: false,

  // eslint-disable-next-line ember/no-component-lifecycle-hooks
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
