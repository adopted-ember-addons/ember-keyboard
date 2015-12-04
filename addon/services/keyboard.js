import Ember from 'ember';
import handleKeyEvent from 'ember-keyboard/utils/handle-key-event';

const {
  computed,
  isEmpty,
  isPresent,
  Logger,
  on,
  Service
} = Ember;

const { error } = Logger;

export default Service.extend({
  responders: computed(() => new Map()),

  activate(responder) {
    if (isEmpty(responder)) {
      return error(`ember-keyboard: \`activate\` expects a component as its first argument. You passed '${responder}'`);
    }

    const responders = this.get('responders');
    const priority = responder.get('keyboardPriority');

    if (!responders.has(priority)) {
      responders.set(priority, new Set());
    }

    responders.get(priority).add(responder);

    responder.on('willDestroyElement', this, function() {
      this.deactivate(responder);
    });
  },

  deactivate(responder) {
    const responders = this.get('responders');
    const priority = responder.get('keyboardPriority');
    const prioritySet = responders.get(priority);

    this.resignFirstResponder(this);

    if (isPresent(prioritySet)) {
      prioritySet.delete(responder);

      if (prioritySet.size === 0) {
        responders.delete(priority);
      }
    }
  },

  becomeFirstResponder(responder) {
    const responders = this.get('responders');

    responders.set('firstResponder', new Set([responder]));
  },

  resignFirstResponder(responder) {
    const responders = this.get('responders');
    const firstResponder = responders.get('firstResponder');

    if (isPresent(firstResponder) && firstResponder.values().next().value.get('guid') === responder.get('guid')) {
      responders.delete('firstResponder');
    }
  },

  _initializeListener: on('init', function() {
    const eventNames = ['keyup', 'keydown'].map(function(name) {
      return `${name}.ember-keyboard-listener`;
    }).join(' ');

    Ember.$(document).on(eventNames, null, (event) => {
      handleKeyEvent(event, this.get('responders'));
    });
  }),

  _teardownListener: on('isDestroying', function() {
    Ember.$(document).off('.ember-keyboard-listener');
  })
});
