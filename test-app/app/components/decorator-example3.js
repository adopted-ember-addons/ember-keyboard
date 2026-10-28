/* eslint-disable ember/require-tagless-components */
/* eslint-disable ember/no-classic-classes */
/* eslint-disable ember/no-classic-components */
import Component from '@ember/component';
import { computed } from '@ember/object';
import { keyResponder, onKey } from 'ember-keyboard';

export default keyResponder(
  Component.extend({
    onShiftCDown: onKey('shift+c', function (e) {
      if (this.onTrigger) {
        this.onTrigger(e);
      }
    }),

    onCtrlAltKeyEUp: onKey('ctrl+alt+KeyE', { event: 'keyup' }, function (e) {
      if (this.onTrigger) {
        this.onTrigger(e);
      }
    }),

    onAltLeftArrowOrRightArrowDown: onKey(
      'alt+ArrowLeft',
      onKey('alt+ArrowRight', function (e) {
        if (this.onTrigger) {
          this.onTrigger(e);
        }
      })
    ),

    // This exists to ensure that we don't call getters when looking for handlers
    doNotCall: computed(function () {
      throw new Error('This should not be called');
    }),
  })
);
