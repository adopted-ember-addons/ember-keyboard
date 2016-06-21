import Ember from 'ember';

export default Ember.Mixin.create({
  activate(...args) {
    this._super(...args);

    window.scrollTo(0,0);
  }
});
