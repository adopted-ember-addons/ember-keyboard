import { computed } from '@ember/object';
import Component from '@ember/component';
import { EKMixin, mouseDown } from 'ember-keyboard';

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

    this.on(mouseDown('left'), makeEventHandler(1));
    this.on(mouseDown('right'), makeEventHandler(10));
    this.on(mouseDown('middle'), makeEventHandler(-10));
  }

});
