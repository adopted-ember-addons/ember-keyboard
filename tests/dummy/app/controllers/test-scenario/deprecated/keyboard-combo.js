/* eslint-disable ember/no-actions-hash */
/* eslint-disable ember/no-classic-classes */
import Controller from '@ember/controller';

export default Controller.extend({
  wasCtrlKPressed: false,
  wasSPressed: false,
  wasSlashPressed: false,
  wasQuestionMarkPressed: false,
  actions: {
    onCtrlK() {
      this.set('wasCtrlKPressed', true);
    },
    onS() {
      this.set('wasSPressed', true);
    },
    onSlash() {
      this.set('wasSlashPressed', true);
    },
    onQuestionMark() {
      this.set('wasQuestionMarkPressed', true);
    }
  }
});
