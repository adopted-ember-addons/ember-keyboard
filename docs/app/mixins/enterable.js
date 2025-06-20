/* eslint-disable ember/no-new-mixins */
import * as emberService from '@ember/service';
import Mixin from '@ember/object/mixin';

const service = emberService.service ?? emberService.inject;

export default Mixin.create({
  classNames: ['keyboard-widget'],
  classNameBindings: ['keyboardActivated:active'],
  keyboard: service(),
  widgetManager: service(),

  click() {
    this._activate();
  },

  deactivate() {
    this.set('keyboardActivated', false);

    // Ensure we reset old propagation model.
    if (this.oldPropagationModel) {
      this.keyboard.isPropagationEnabled = true;
    }
  },

  _activate() {
    this.widgetManager.activate(this);
    this.set('keyboardActivated', true);

    // Support old propagation model (< 7.x) in docs.
    // See docs/app/services/keyboard.js which extends addon service with old code.
    // See docs/app/templates/priority.hbs when property is set usage.
    if (this.oldPropagationModel) {
      this.keyboard.isPropagationEnabled = false;
    }
  },
});
