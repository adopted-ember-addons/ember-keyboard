import Ember from 'ember';
import config from 'ember-get-config';
import handleKeyEvent from 'ember-keyboard/utils/handle-key-event';

const {
  Service,
  computed,
  get,
  on,
  set,
  typeOf
} = Ember;

export default Service.extend({
  priorityLevels: computed(() => Ember.Object.create()),

  activate(responder) {
    const priorityLevels = get(this, 'priorityLevels');
    const priority = get(responder, '_keyboardPriorityLevel').toString();

    const priorityLevel = get(priorityLevels, priority) || set(priorityLevels, priority, Ember.A());

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

      if (typeOf(priorityLevel) !== 'array') { return; }

      if (priorityLevel.contains(responder)) {
        priorityLevel.removeObject(responder);

        if (get(priorityLevel, 'length') === 0) {
          delete priorityLevels[key];
        }
      }
    });
  },

  _initializeListener: on('init', function() {
    const listeners = get(config, 'emberKeyboard.listeners') || ['keyUp', 'keyDown', 'keyPress'];
    const eventNames = listeners.map(function(name) {
      return `${name.toLowerCase()}.ember-keyboard-listener`;
    }).join(' ');

    Ember.$(document).on(eventNames, null, (event) => {
      handleKeyEvent(event, get(this, 'priorityLevels'));
    });
  }),

  _teardownListener: on('isDestroying', function() {
    Ember.$(document).off('.ember-keyboard-listener');
  })
});
