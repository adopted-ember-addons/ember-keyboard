import Ember from 'ember';
import { ActivateKeyboardOnInsertMixin, keyUp } from 'ember-keyboard';

const { Component } = Ember;

export default Component.extend(ActivateKeyboardOnInsertMixin, {
  name: 'Search Bar',

  attributeBindings: ['placeholder'],
  classNames: ['input'],
  placeholder: 'search-bar',
  tagName: 'input',

  focusOnS: keyUp('s', function() {
    this.$().focus();
  })
});
