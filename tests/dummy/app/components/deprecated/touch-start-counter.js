import { get, computed } from '@ember/object';
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

  counter: 0,

  keyboardActivated: computed('parentActivated', 'toggleActivated', 'activatedToggle', {
    get() {
      const toggleActivated = this.get('activatedToggle') ? this.get('toggleActivated') : true;

      return toggleActivated && this.get('parentActivated');
    }
  }).readOnly(),

  didInsertElement() {
    this._super(...arguments);

    this.on(touchStart(), makeEventHandler(1))
  }

});
