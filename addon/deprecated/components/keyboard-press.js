import Component from '@ember/component';
import { EKMixin, keyPress, keyDown, keyUp, EKOnInsertMixin } from 'ember-keyboard';
import { deprecate } from '@ember/debug';

/* This is a component to allow an Ember template to declaratively specify an
 * action to run when a particular key event occurs. In the following example,
 * we trigger an action button when the "/" key is pressed:
 *
 * {{keyboard-press
 *    key='Slash'
 *    onDown=(action 'onSlash')
 *  }}
 */
export default Component.extend(EKMixin, EKOnInsertMixin, {
  didInsertElement() {
    deprecate(
      'The `keyboard-press` component of ember-keyboard is deprecated. Please use the `on-key` helper instead.',
      false,
      {
          id: 'ember-keyboard.keyboard-press',
          until: '7.0.0',
          url: 'https://adopted-ember-addons.github.io/ember-keyboard/usage#deprecations-keyboard-press'
      }
    );

    if (this.priority) {
      this.set('keyboardPriority', this.priority);
    }

    this._super(...arguments);

    if (this.onPress) {
      this.on(keyPress(this.key), this.onPress);
    }

    if (this.onDown) {
      this.on(keyDown(this.key), this.onDown);
    }

    if (this.onUp) {
      this.on(keyUp(this.key), this.onUp);
    }
  },
});
