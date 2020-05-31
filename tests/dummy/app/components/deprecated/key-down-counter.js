import { get, computed } from '@ember/object';
import Component from '@ember/component';
import { EKMixin, keyDown, keyUp, keyPress } from 'ember-keyboard';

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

    this.on(keyDown('ArrowLeft'), makeEventHandler(-1));
    this.on(keyDown('ArrowRight'), makeEventHandler(1));
    this.on(keyDown('shift+ArrowLeft'), makeEventHandler(-10));
    this.on(keyDown('shift+ArrowRight'), makeEventHandler(10));
    this.on(keyDown('ctrl+shift+ArrowLeft'), makeEventHandler(-100));
    this.on(keyDown('ctrl+shift+ArrowRight'), makeEventHandler(100));

    this.on(keyUp('KeyR'), function() {
      this.set('counter', 0);
    });

    this.on(keyPress('Digit5'), function() {
      this.set('counter', 5);
    });
  }


});
