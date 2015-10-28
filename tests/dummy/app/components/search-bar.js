import Ember from 'ember';
import { keyUp } from 'ember-keyboard';

const { on, TextField } = Ember;

export default TextField.extend({
  name: 'Search Bar',

  attributeBindings: ['placeholder'],
  classNames: ['input'],
  placeholder: 'Events won\'t bubble while inputs and textareas are focused',

  focusOnS: on(keyUp('s'), function() {
    this.$().focus();
  })
});
