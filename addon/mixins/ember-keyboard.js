import { inject as service } from '@ember/service';
import Evented from '@ember/object/evented';
import Mixin from '@ember/object/mixin';
import { get } from '@ember/object';

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
