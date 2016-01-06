import Ember from 'ember';
import handleKeyEvent from 'ember-keyboard/utils/handle-key-event';

const {
  Service,
  computed,
  get,
  isEmpty,
  on,
  set
} = Ember;

export default Service.extend({
  priorityLevels: computed(() => Ember.Object.create()),

  activate(responder) {
    const priorityLevels = get(this, 'priorityLevels');
    const priority = get(responder, '_keyboardPriorityLevel').toString();

    if (isEmpty(get(priorityLevels, priority))) {
      set(priorityLevels, priority, Ember.A());
    }

    const priorityLevel = get(priorityLevels, priority);

    if (!priorityLevel.contains(responder)) {
      get(priorityLevels, priority).pushObject(responder);

      responder.on('willDestroyElement', this, function() {
        this.deactivate(responder);
      });
    }
  },

  deactivate(responder) {
    const priorityLevels = get(this, 'priorityLevels');

    Object.keys(priorityLevels).forEach((key) => {
      const priorityLevel = get(priorityLevels, key);

      if (priorityLevel.contains(responder)) {
        priorityLevel.removeObject(responder);

        if (get(priorityLevel, 'length') === 0) {
          delete priorityLevels[key];
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
