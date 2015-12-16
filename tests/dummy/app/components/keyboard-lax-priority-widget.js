import Ember from 'ember';
import EnterableMixin from 'dummy/mixins/enterable';

const { Component } = Ember;

export default Component.extend(EnterableMixin, {
  hook: 'lax-widget'
});
