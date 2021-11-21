/* eslint-disable ember/no-new-mixins */
import Mixin from '@ember/object/mixin';
import { on } from '@ember/object/evented';
import { set } from '@ember/object';
import { deprecate } from '@ember/debug';

export default Mixin.create({
  init(...args) {
    deprecate(
      '`EKOnInitMixin` mixin of ember-keyboard is deprecated. This behavior is now the default when using the @keyResponder decorator.',
      false,
      {
        id: 'ember-keyboard.activate-keyboard-on-init-mixin',
        for: 'ember-keyboard',
        since: '6.0.2',
        until: '7.0.0',
        url: 'https://adopted-ember-addons.github.io/ember-keyboard/deprecations#activate-keyboard-on-init-mixin',
      }
    );

    return this._super(...args);
  },

  activateKeyboardWhenStarted: on('init', function () {
    set(this, 'keyboardActivated', true);
  }),
});
