import Ember from 'ember';
import handleKeyEvent from 'ember-keyboard/utils/handle-key-event';

const {
  Service,
  computed,
  get,
  on
} = Ember;

export default Service.extend({
  priorityLevels: computed(() => new Map()),

  activate(responder) {
    const priorityLevels = get(this, 'priorityLevels');
    const priority = get(responder, '_keyboardPriorityLevel');

    if (!priorityLevels.has(priority)) {
      priorityLevels.set(priority, new Set());
    }

    priorityLevels.get(priority).add(responder);

    responder.on('willDestroyElement', this, function() {
      this.deactivate(responder);
    });
  },

  deactivate(responder) {
    const priorityLevels = get(this, 'priorityLevels');

    priorityLevels.forEach((priorityLevel) => {
      if (priorityLevel.has(responder)) {
        priorityLevel.delete(responder);

        if (priorityLevel.size === 0) {
          priorityLevels.delete(priorityLevel);
        }
      }
    });
  },

  _initializeListener: on('init', function() {
    const eventNames = ['keyup', 'keydown'].map(function(name) {
      return `${name}.ember-keyboard-listener`;
    }).join(' ');

    Ember.$(document).on(eventNames, null, (event) => {
      handleKeyEvent(event, get(this, 'priorityLevels'));
    });
  }),

  _teardownListener: on('isDestroying', function() {
    Ember.$(document).off('.ember-keyboard-listener');
  })
});
