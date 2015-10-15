import Ember from 'ember';

export function initialize() {
  Ember.Component.reopen({
    keyboardPriority: 0
  });
}

export default {
  name: 'ember-keyboard-reopen-component',
  initialize: initialize
};
