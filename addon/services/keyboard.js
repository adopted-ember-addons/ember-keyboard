import Ember from 'ember';
import handleKeyEvent from 'ember-keyboard/utils/handle-key-event';

const {
  computed,
  on,
  Service
} = Ember;

export default Service.extend({
  responderStack: computed(() => Ember.A()),

  activate(responder) {
    const responderStack = this.get('responderStack');

    // ensure the responder appears only once in the stack
    responderStack.removeObject(responder);
    responderStack.unshiftObject(responder);
  },

  deactivate(responder) {
    this.get('responderStack').removeObject(responder);
  },

  _initializeListener: on('init', function() {
    const eventNames = ['keyup', 'keydown'].map(function(name) {
      return `${name}.ember-keyboard-listener`;
    }).join(' ');

    Ember.$(document).on(eventNames, null, (event) => {
      handleKeyEvent(event, this.get('responderStack'));
    });    
  }),

  _teardownListener: on('isDestroying', function() {
    Ember.$(document).off('.ember-keyboard-listener');
  })
});
