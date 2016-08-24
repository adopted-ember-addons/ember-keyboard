import Ember from 'ember';

export default Ember.Mixin.create({
  activate(...args) {
    this._super(...args);

    if (typeof FastBoot === 'undefined') {
      window.scrollTo(0,0);
    }
  }
});
