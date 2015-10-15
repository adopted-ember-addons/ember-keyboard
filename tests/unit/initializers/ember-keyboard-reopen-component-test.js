import Ember from 'ember';
import { initialize } from '../../../initializers/ember-keyboard-reopen-component';
import { module, test } from 'qunit';

var registry, application;

module('Unit | Initializer | ember keyboard reopen component', {
  beforeEach: function() {
    Ember.run(function() {
      application = Ember.Application.create();
      registry = application.registry;
      application.deferReadiness();
    });
  }
});

test('Ember.Component is reopened', function(assert) {
  initialize();

  assert.equal(Ember.Component.create().get('keyboardPriority'), 0, 'keyboardPriority defaults to 0');
});
