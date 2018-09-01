import Controller from '@ember/controller';

export default class extends Controller {
  constructor(...args) {
    super(...args);

    this.wasCtrlKPressed = false;
    this.wasSPressed = false;
    this.wasSlashPressed = false;

    this.actions = {
      onCtrlK() {
        this.set('wasCtrlKPressed', true);
      },
      onS() {
        this.set('wasSPressed', true);
      },
      onSlash() {
        this.set('wasSlashPressed', true);
      }
    }
  }
}
