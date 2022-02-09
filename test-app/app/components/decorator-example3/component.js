/* eslint-disable ember/require-tagless-components */
/* eslint-disable ember/no-classic-classes */
/* eslint-disable ember/no-classic-components */
import Component from '@ember/component';
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
  })
);
