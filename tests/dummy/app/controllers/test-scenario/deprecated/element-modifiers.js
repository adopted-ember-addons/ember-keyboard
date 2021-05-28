import Controller from '@ember/controller';
import { action } from '@ember/object';
import { set } from '@ember/object';

export default class extends Controller {
  constructor(...args) {
    super(...args);

    this.priority = 0
  }

  @action
  changeSetting(name, e) {
    set(this, name, e.target.value);
  }

  @action
  applyCheckedValue(name, e) {
    set(this, name, e.target.checked);
  }

  @action
  changePriority(e) {
    set(this, 'priority', e.target.value);
  }

  @action
  onEnterPressedInInput() {
    set(this, 'wasEnterPressedInInput', true);
  }
}
