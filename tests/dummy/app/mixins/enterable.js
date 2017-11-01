import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';

export default Mixin.create( {
  classNames: ['keyboard-widget'],
  classNameBindings: ['keyboardActivated:active'],
  widgetManager: service(),

  click() {
    this._activate();
  },

  deactivate() {
    this.set('keyboardActivated', false);
  },

  _activate() {
    this.get('widgetManager').activate(this);
    this.set('keyboardActivated', true);
  }
});
