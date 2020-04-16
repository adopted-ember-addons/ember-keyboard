import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class extends Controller {
  @tracked wasCtrlKPressed = false;
  @tracked wasSPressed = false;
  @tracked wasSlashPressed = false;

  @action
  onCtrlK() {
    this.set('wasCtrlKPressed', true);
  }

  @action
  onS() {
    this.set('wasSPressed', true);
  }

  @action
  onSlash() {
    this.set('wasSlashPressed', true);
  }
}
