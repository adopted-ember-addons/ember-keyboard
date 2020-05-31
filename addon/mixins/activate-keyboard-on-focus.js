/* eslint-disable ember/no-new-mixins */
import Mixin from '@ember/object/mixin';
import { on } from '@ember/object/evented';
import { set } from '@ember/object';
import { deprecate } from '@ember/debug';

export default Mixin.create({
  init(...args) {
    deprecate(
      '`EKOnFocusMixin` of ember-keyboard is deprecated. This behavior is now automatic when using the `on-key` modifier with a text field. For other use cases, implement manually.',
      false,
      {
          id: 'ember-keyboard.activate-keyboard-on-focus-mixin',
          until: '7.0.0',
          url: 'https://adopted-ember-addons.github.io/ember-keyboard/deprecations#activate-keyboard-on-focus-mixin'
      }
    );

    return this._super(...args);
  },

  activateKeyboardWhenFocused: on('click', 'focusIn', function() {
    set(this, 'keyboardActivated', true);
  }),

  deactivateKeyboardWhenFocusOut: on('focusOut', function() {
    set(this, 'keyboardActivated', false);
  })
});
