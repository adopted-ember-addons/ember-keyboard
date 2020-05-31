/* eslint-disable ember/no-new-mixins */
import Mixin from '@ember/object/mixin';
import { on } from '@ember/object/evented';
import { setProperties, set } from '@ember/object';
import { deprecate } from '@ember/debug';

export default Mixin.create({
  init(...args) {
    deprecate(
      '`EKFirstResponderOnFocusMixin` of ember-keyboard is deprecated. This behavior is now the default when using the `on-key` modifier with a text field. For other use cases, implement manually.',
      false,
      {
          id: 'ember-keyboard.keyboard-first-responder-on-focus-mixin',
          until: '7.0.0',
          url: 'https://adopted-ember-addons.github.io/ember-keyboard/deprecations#keyboard-first-responder-on-focus-mixin'
      }
    );

    return this._super(...args);
  },

  makeFirstResponderOnFocusIn: on('click', 'focusIn', function() {
    setProperties(this, {
      keyboardActivated: true,
      keyboardFirstResponder: true
    });
  }),

  resignFirstResponderOnFocusOut: on('focusOut', function() {
    set(this, 'keyboardFirstResponder', false);
  })
});
