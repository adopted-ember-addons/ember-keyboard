import Controller from '@ember/controller';

export default Controller.extend({
  wasCtrlKPressed: false,
  wasSPressed: false,
  wasSlashPressed: false,
  actions: {
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
});
