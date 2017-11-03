import $ from 'jquery';
import Service from '@ember/service';
import { A } from '@ember/array';
import { getOwner } from '@ember/application';
import { get, getProperties, set } from '@ember/object';
import { computed } from '@ember/object';
import { filter, filterBy, sort } from '@ember/object/computed';
import { run } from '@ember/runloop';
import { keyDown, keyPress, keyUp } from 'ember-keyboard/listeners/key-events';
import {
  handleKeyEventWithPropagation,
  handleKeyEventWithLaxPriorities
} from 'ember-keyboard/utils/handle-key-event';

export default Service.extend({
  isPropagationEnabled: false,

  registeredResponders: computed(() => A()),

  activeResponders: filterBy('registeredResponders', 'keyboardActivated'),

  sortedRespondersSortDefinition: computed('isPropagationEnabled', function() {
    return get(this, 'isPropagationEnabled') ?
      ['keyboardPriority:desc'] :
      ['keyboardFirstResponder:desc', 'keyboardPriority:desc']
  }),

  sortedResponders: sort('activeResponders', 'sortedRespondersSortDefinition'),

  firstResponders: filterBy('sortedResponders', 'keyboardFirstResponder'),

  normalResponders: filter(
    'sortedResponders.@each.keyboardFirstResponder',
    responder => !get(responder, 'keyboardFirstResponder')
  ),

  init(...args) {
    this._super(...args);

    if (typeof FastBoot !== 'undefined') {
      return;
    }

    const config = getOwner(this).resolveRegistration('config:environment') || {};

    const isPropagationEnabled = Boolean(get(config, 'emberKeyboard.propagation'));
    set(this, 'isPropagationEnabled', isPropagationEnabled);

    const listeners = get(config, 'emberKeyboard.listeners') || ['keyUp', 'keyDown', 'keyPress', 'click', 'mouseDown', 'mouseUp', 'touchStart', 'touchEnd'];
    const eventNames = listeners.map(function(name) {
      return `${name.toLowerCase()}.ember-keyboard-listener`;
    }).join(' ');

    $(document).on(eventNames, null, (event) => {
      run(() => {
        if (get(this, 'isPropagationEnabled')) {
          handleKeyEventWithPropagation(event, getProperties(this, 'firstResponders', 'normalResponders'));
        } else {
          handleKeyEventWithLaxPriorities(event, get(this, 'sortedResponders'));
        }
      });
    });
  },

  willDestroy(...args) {
    this._super(...args);

    if (typeof FastBoot !== 'undefined') {
      return;
    }

    $(document).off('.ember-keyboard-listener');
  },

  register(responder) {
    get(this, 'registeredResponders').pushObject(responder);
  },

  unregister(responder) {
    get(this, 'registeredResponders').removeObject(responder);
  },

  keyDown(...args) {
    return keyDown(...args);
  },

  keyPress(...args) {
    return keyPress(...args);
  },

  keyUp(...args) {
    return keyUp(...args);
  }
});
