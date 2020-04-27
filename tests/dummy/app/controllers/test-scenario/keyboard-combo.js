import Controller from '@ember/controller';

export default Controller.extend({
  wasCtrlKPressed: false,
  wasSPressed: false,
  wasSlashPressed: false,
  wasQuestionMarkPressed: false,
  wasAltBPressed: false,
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
    },
    onAltB() {
      this.set('wasAltBPressed', true);
    }
  }
});
