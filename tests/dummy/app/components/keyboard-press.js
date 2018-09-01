import Component from '@ember/component';
import { EKMixin, keyPress, keyDown, keyUp, EKOnInsertMixin } from 'ember-keyboard';

// TODO: should something like this be exposed for general addon-consumption?
export default Component.extend(EKMixin,
  EKOnInsertMixin,
  {


  didInsertElement() {
    this._super(...arguments);

    if (this.onPress) {
      this.on(keyPress(this.key), this.onPress);
    }

    if (this.onDown) {
      this.on(keyDown(this.key), this.onDown);
    }

    if (this.onUp) {
      this.on(keyUp(this.key), this.onUp);
    }
  },
});
