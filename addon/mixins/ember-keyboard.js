import Ember from 'ember';

const {
  Evented,
  Mixin,
  get
} = Ember;

const { inject: { service } } = Ember;

export default Mixin.create(Evented, {
  keyboardPriority: 0,

  keyboard: service(),

  init(...args) {
    get(this, 'keyboard').register(this);

    return this._super(...args);
  },

  willDestroyElement(...args) {
    this._super(...args);

    get(this, 'keyboard').unregister(this);
  },

  willDestroy(...args) {
    this._super(...args);

    get(this, 'keyboard').unregister(this);
  }
});
