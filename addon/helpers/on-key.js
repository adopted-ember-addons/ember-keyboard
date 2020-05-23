import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import listenerName from 'ember-keyboard/utils/listener-name';

export default class extends Helper {
  @service keyboard;
  keyCombo;
  callback;
  keyboardActivated = true;
  keyboardPriority = 0;
  eventName = 'keydown';
  listenerName;

  compute([keyCombo, callback], { event = 'keydown', activated = true, priority = 0 }) {
    this.keyCombo = keyCombo;
    this.callback = callback;
    this.eventName = event;
    this.keyboardActivated = activated;
    this.keyboardPriority = priority;
    this.listenerName = listenerName(this.eventName, this.keyCombo.split('+'));
    this.keyboard.register(this);
  }

  destroy() {
    this.keyboard.unregister(this);
    super.destroy(...arguments);
  }

  has(triggerName) {
    return triggerName === this.listenerName;
  }

  trigger(triggerName, event) {
    if (triggerName === this.listenerName) {
      if (this.callback) {
        this.callback(event);
      }
    }
  }
}
