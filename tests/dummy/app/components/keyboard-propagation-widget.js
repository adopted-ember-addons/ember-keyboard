import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { set } from '@ember/object';
import EnterableMixin from 'dummy/mixins/enterable';

export default Component.extend(EnterableMixin, {
  keyboard: service(),

  _activate() {
    this._super(...arguments);

    set(this, 'keyboard.isPropagationEnabled', true);
  },

  deactivate() {
    this._super(...arguments);

    set(this, 'keyboard.isPropagationEnabled', false);
  }
});
