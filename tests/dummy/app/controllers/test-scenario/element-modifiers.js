import Controller from '@ember/controller';
import { action } from '@ember/object';
export default class extends Controller {
  constructor(...args) {
    super(...args);

    this.priority = 0
  }

  @action
  changeSetting(name, e) {
    this.set(name, e.target.value)
  }

  @action
  changePriority(e) {
    this.set('priority', e.target.value)
  }

  @action
  onEnterPressedInInput() {
    this.set('wasEnterPressedInInput', true)
  }
}
