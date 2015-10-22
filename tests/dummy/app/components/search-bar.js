import Ember from 'ember';
import { keyUp } from 'ember-keyboard';

const { TextField } = Ember;

export default TextField.extend({
  name: 'Search Bar',

  attributeBindings: ['placeholder'],
  classNames: ['input'],
  placeholder: 'Events won\'t bubble while inputs and textareas are focused',

  focusOnS: keyUp('s', function() {
    this.$().focus();
  })
});
