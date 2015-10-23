import Ember from 'ember';
import handleKeyEvent from 'ember-keyboard/utils/handle-key-event';

const {
  computed,
  isEmpty,
  Logger,
  on,
  Service
} = Ember;

const { error } = Logger;

export default Service.extend({
  _responderStack: computed(() => Ember.A()),

  activate(responder) {
    if (isEmpty(responder)) {
      return error(`ember-keyboard: \`activate\` expects a component as its first argument. You passed '${responder}'`);
    }

    // ensure the responder appears once and only once in the stack
    const responderStack = this.get('_responderStack');
    responderStack.removeObject(responder);
    responderStack.pushObject(responder);

    // ensure that the responder is removed from the stack upon its destruction
    responder.on('willDestroyElement', this, function() {
      this.deactivate(responder);
    });
  },

  deactivate(responder) {
    // ensure that deactivated responders are not assigned firstResponder
    if (responder.resignFirstResponder) {
      responder.resignFirstResponder();
    }

    this.get('_responderStack').removeObject(responder);
  },

  sortedResponderStack: computed('_responderStack.@each.keyboardPriority', {
    get() {
      return this.get('_responderStack').sort((a, b) => {
        return b.keyboardPriority - a.keyboardPriority;
      });
    }
  }).readOnly(),

  _initializeListener: on('init', function() {
    const eventNames = ['keyup', 'keydown'].map(function(name) {
      return `${name}.ember-keyboard-listener`;
    }).join(' ');

    Ember.$(document).on(eventNames, null, (event) => {
      handleKeyEvent(event, this.get('sortedResponderStack'));
    });    
  }),

  _teardownListener: on('isDestroying', function() {
    Ember.$(document).off('.ember-keyboard-listener');
  })
});
