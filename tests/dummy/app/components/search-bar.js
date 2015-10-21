import Ember from 'ember';
import { keyUp } from 'ember-keyboard';

const {
  Component,
  inject,
  on
} = Ember;

export default Component.extend({
  attributeBindings: ['placeholder'],
  classNames: ['input'],
  keyboard: inject.service(),
  placeholder: 'search-bar',
  tagName: 'input',

  activateKeyboard: on('didInsertElement', function() {
    this.get('keyboard').activate(this);
  }),

  focusOnS: keyUp('s', function() {
    this.$().focus();
  })
});
