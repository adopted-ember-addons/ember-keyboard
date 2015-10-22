import Ember from 'ember';

const { Component } = Ember;

export default Component.extend({
  classNames: ['mixin-test-buttons'],
  tagName: 'aside',

  actions: {
    toggleMixin(name) {
      this.toggleProperty(name);
    }
  }
});
