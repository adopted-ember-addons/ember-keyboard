/* eslint-disable ember/require-tagless-components */
/* eslint-disable ember/no-classic-classes */
/* eslint-disable ember/no-classic-components */
import Component from '@ember/component';
import { keyResponder, onKey } from 'ember-keyboard';

export default keyResponder(
  Component.extend({
    get keyboardPriority() {
      return this.priority || 0;
    },

    get keyboardActivated() {
      if (this.activated === undefined) {
        return super.keyboardActivated;
      }
      return this.activated;
    },

    onDigit2Down: onKey('Digit2', function (keyboardEvent, emberKeyboardEvent) {
      if (this.onTrigger) {
        this.onTrigger(keyboardEvent, emberKeyboardEvent);
      }
    }),
  })
);
