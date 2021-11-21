/* eslint-disable ember/no-new-mixins */
import { inject as service } from '@ember/service';
import Evented from '@ember/object/evented';
import Mixin from '@ember/object/mixin';
import {
  getListenerNames,
  triggerViaLegacyResponderApi,
} from 'ember-keyboard/utils/handle-key-event';
import { deprecate } from '@ember/debug';

export default Mixin.create(Evented, {
  keyboardPriority: 0,

  keyboard: service(),

  init(...args) {
    deprecate(
      '`EKMixin` of ember-keyboard is deprecated. Please use the @keyResponder decorator instead.',
      false,
      {
        id: 'ember-keyboard.ember-keyboard-mixin',
        for: 'ember-keyboard',
        since: '6.0.2',
        until: '7.0.0',
        url: 'https://adopted-ember-addons.github.io/ember-keyboard/deprecations#ember-keyboard-mixin',
      }
    );
    this.keyboard.register(this);

    return this._super(...args);
  },

  willDestroyElement(...args) {
    this._super(...args);

    this.keyboard.unregister(this);
  },

  willDestroy(...args) {
    this._super(...args);

    this.keyboard.unregister(this);
  },

  // These next two methods adapt this mixin to conform to the new responder API.
  // In the future, once we have good alternatives, we expect all of this addon's
  // mixins to be deprecated and removed, but for now this will let it execute
  // without triggering deprecation warnings.
  canHandleKeyboardEvent(event) {
    for (let listenerName of getListenerNames(event)) {
      if (this.has(listenerName)) {
        return true;
      }
    }
    return false;
  },

  handleKeyboardEvent(event, ekEvent) {
    triggerViaLegacyResponderApi(this, event, ekEvent);
  },
});
