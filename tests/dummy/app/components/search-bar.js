import Ember from 'ember';
import { keyDown } from 'ember-keyboard';

const { on, TextField } = Ember;

export default TextField.extend({
  name: 'Search Bar',

  attributeBindings: ['placeholder'],
  classNames: ['input'],
  placeholder: 'Events won\'t bubble while inputs and textareas are focused',

  focusOnS: on(keyDown('ctrl+s'), function(event) {
    this.$().focus();
    event.preventDefault();
  })
});
