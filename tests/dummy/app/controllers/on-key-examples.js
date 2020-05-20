import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class extends Controller {
  @tracked wasCtrlKPressed = false;
  @tracked wasSPressed = false;
  @tracked wasSlashPressed = false;
  @tracked wasQuestionMarkPressed = false;
}
