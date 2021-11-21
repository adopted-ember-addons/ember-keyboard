/* eslint-disable ember/no-new-mixins */
import Mixin from '@ember/object/mixin';
import { on } from '@ember/object/evented';
import { set } from '@ember/object';
import { deprecate } from '@ember/debug';

export default Mixin.create({
  init(...args) {
    deprecate(
      '`EKOnInsertMixin` of ember-keyboard is deprecated. You can achieve this behavior by using the `on-key` helper, or by using `@keyResponder` in conjunction with a `did-insert` modifier.',
      false,
      {
        id: 'ember-keyboard.activate-keyboard-on-insert-mixin',
        for: 'ember-keyboard',
        since: '6.0.2',
        until: '7.0.0',
        url: 'https://adopted-ember-addons.github.io/ember-keyboard/deprecations#activate-keyboard-on-insert-mixin',
      }
    );

    return this._super(...args);
  },

  activateKeyboardWhenPresent: on('didInsertElement', function () {
    set(this, 'keyboardActivated', true);
  }),
});
