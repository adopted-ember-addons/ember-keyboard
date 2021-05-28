/* eslint-disable ember/no-component-lifecycle-hooks */
/* eslint-disable ember/require-tagless-components */
/* eslint-disable ember/no-classic-classes */
/* eslint-disable ember/no-classic-components */
import { computed } from '@ember/object';
import Component from '@ember/component';
import { EKMixin, touchStart } from 'ember-keyboard';

function makeEventHandler(stepSize = 1) {
  return function(event, ekEvent) {
    if (this.stopImmediatePropagation) {
      ekEvent.stopImmediatePropagation();
    }
    if (this.stopPropagation) {
      ekEvent.stopPropagation();
    }

    this.incrementProperty('counter', stepSize);
  }
}

export default Component.extend(EKMixin, {
  tagName: 'span',
  classNames: 'counter-container',
  toggleActivated: true,

  counter: 0,

  keyboardActivated: computed('parentActivated', 'toggleActivated', 'activatedToggle', {
    get() {
      const toggleActivated = this.activatedToggle ? this.toggleActivated : true;

      return toggleActivated && this.parentActivated;
    }
  }).readOnly(),

  didInsertElement() {
    this._super(...arguments);

    this.on(touchStart(), makeEventHandler(1))
  }

});
