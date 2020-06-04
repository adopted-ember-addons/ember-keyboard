import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import listenerName from 'ember-keyboard/utils/listener-name';
import { assert } from '@ember/debug';

export default class extends Helper {
  @service keyboard;
  keyCombo;
  callback;
  keyboardActivated = true;
  keyboardPriority = 0;
  eventName = 'keydown';
  keyboardHandlers;

  compute([keyCombo, callback], { event = 'keydown', activated = true, priority = 0 }) {
    assert(
      'ember-keyboard: You must pass a function as the second argument to the `on-key` helper',
      typeof callback === 'function'
    );

    this.keyCombo = keyCombo;
    this.callback = callback;
    this.eventName = event;
    this.keyboardActivated = activated;
    this.keyboardPriority = priority;
    this.keyboardHandlers = {};
    this.keyboardHandlers[listenerName(event, keyCombo)] = callback;
    this.keyboard.register(this);
  }

  destroy() {
    this.keyboard.unregister(this);
    super.destroy(...arguments);
  }
}
