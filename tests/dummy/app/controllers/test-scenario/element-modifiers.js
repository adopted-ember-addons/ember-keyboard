import Controller from '@ember/controller';

export default class extends Controller {
  constructor(...args) {
    super(...args);

    this.wasButtonTriggered = false;
    this.wasEnterPressedInInput = false;

    this.actions = {
      onTriggerButton() {
        this.set('wasButtonTriggered', true);
      },
      onEnterPressedInInput() {
        this.set('wasEnterPressedInInput', true);
      }
    }
  }
}
