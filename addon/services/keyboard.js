import Ember from 'ember';
import handleKeyEvent from 'ember-keyboard/utils/handle-key-event';
import { keyDown, keyPress, keyUp } from 'ember-keyboard/listeners/key-events';

const {
  Service,
  computed,
  get,
  getOwner,
  run
} = Ember;

const {
  filterBy,
  sort
} = computed;

export default Service.extend({
  registeredResponders: computed(() => Ember.A()),
  activeResponders: filterBy('registeredResponders', 'keyboardActivated').volatile(),
  sortedResponders: sort('activeResponders', function(a, b) {
    if (get(a, 'keyboardFirstResponder')) {
      return -1;
    } else if (get(b, 'keyboardFirstResponder')) {
      return 1;
    } else {
      return get(b, 'keyboardPriority') - get(a, 'keyboardPriority');
    }
  }).volatile(),

  init(...args) {
    this._super(...args);

    if (typeof FastBoot !== 'undefined') {
      return;
    }

    const config = getOwner(this).resolveRegistration('config:environment') || {};
    const listeners = get(config, 'emberKeyboard.listeners') || ['keyUp', 'keyDown', 'keyPress'];
    const eventNames = listeners.map(function(name) {
      return `${name.toLowerCase()}.ember-keyboard-listener`;
    }).join(' ');

    Ember.$(document).on(eventNames, null, (event) => {
      run(() => {
        handleKeyEvent(event, get(this, 'sortedResponders'));
      });
    });
  },

  willDestroy(...args) {
    this._super(...args);

    if (typeof FastBoot !== 'undefined') {
      return;
    }

    Ember.$(document).off('.ember-keyboard-listener');
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
