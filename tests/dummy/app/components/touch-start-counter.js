import { get, computed } from '@ember/object';
import { on } from '@ember/object/evented';
import Component from '@ember/component';
import { EKMixin, touchStart } from 'ember-keyboard';

function makeEventHandler(stepSize = 1) {
  return function(event, ekEvent) {
    if (get(this, 'stopImmediatePropagation')) {
      ekEvent.stopImmediatePropagation();
    }
    if (get(this, 'stopPropagation')) {
      ekEvent.stopPropagation();
    }

    this.incrementProperty('counter', stepSize);
  }
}

export default Component.extend(EKMixin, {
  tagName: 'span',
  classNames: 'counter-container',
  toggleActivated: true,
  hook: 'touch-start-counter',

  counter: 0,

  keyboardActivated: computed('parentActivated', 'toggleActivated', 'activatedToggle', {
    get() {
      const toggleActivated = this.get('activatedToggle') ? this.get('toggleActivated') : true;

      return toggleActivated && this.get('parentActivated');
    }
  }).readOnly(),

  incrementCounter: on(touchStart(), makeEventHandler(1))
});
