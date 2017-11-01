import Mixin from '@ember/object/mixin';

export default Mixin.create({
  activate(...args) {
    this._super(...args);

    if (typeof FastBoot === 'undefined') {
      window.scrollTo(0,0);
    }
  }
});
