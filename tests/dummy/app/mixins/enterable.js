import Ember from 'ember';

const { Mixin } = Ember;
const { inject: { service } } = Ember;

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
