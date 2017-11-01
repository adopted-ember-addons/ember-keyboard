import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import {
  triggerKeyDown,
  triggerKeyPress,
  triggerKeyUp,
  initialize
} from 'ember-keyboard';
import { hook } from 'ember-hook';

moduleForComponent('trigger-event-test', 'Integration | Util | triggerEvent', {
  integration: true,

  beforeEach() {
    initialize();
  }
});

test('`keyDown` triggers a keydown event', function(assert) {
  assert.expect(4);

  this.render(hbs`{{trigger-event-test}}`);

  triggerKeyDown('KeyA');

  assert.equal(this.$(hook('key_down')).text().trim(), 'true', 'keyDown was triggered');
  assert.equal(this.$(hook('key_down_with_mods')).text().trim(), 'false', 'keyDown was triggered with mods');
  assert.equal(this.$(hook('key_press')).text().trim(), 'false', 'keyPress was triggered');
  assert.equal(this.$(hook('key_up')).text().trim(), 'false', 'keyUp was triggered');
});

test('`keyPress` triggers a keypress event', function(assert) {
  assert.expect(4);

  this.render(hbs`{{trigger-event-test}}`);

  triggerKeyPress('KeyA');

  assert.equal(this.$(hook('key_down')).text().trim(), 'false', 'keyDown was triggered');
  assert.equal(this.$(hook('key_down_with_mods')).text().trim(), 'false', 'keyDown was triggered with mods');
  assert.equal(this.$(hook('key_press')).text().trim(), 'true', 'keyPress was triggered');
  assert.equal(this.$(hook('key_up')).text().trim(), 'false', 'keyUp was triggered');
});

test('`keyUp` triggers a keyup event', function(assert) {
  assert.expect(4);

  this.render(hbs`{{trigger-event-test}}`);

  triggerKeyUp('KeyA');

  assert.equal(this.$(hook('key_down')).text().trim(), 'false', 'keyDown was triggered');
  assert.equal(this.$(hook('key_down_with_mods')).text().trim(), 'false', 'keyDown was triggered with mods');
  assert.equal(this.$(hook('key_press')).text().trim(), 'false', 'keyPress was triggered');
  assert.equal(this.$(hook('key_up')).text().trim(), 'true', 'keyUp was triggered');
});

test('modifiers can be added', function(assert) {
  assert.expect(4);

  this.render(hbs`{{trigger-event-test}}`);

  triggerKeyDown('shift+KeyA+cmd');

  assert.equal(this.$(hook('key_down')).text().trim(), 'false', 'keyDown was triggered');
  assert.equal(this.$(hook('key_down_with_mods')).text().trim(), 'true', 'keyDown was triggered with mods');
  assert.equal(this.$(hook('key_press')).text().trim(), 'false', 'keyPress was triggered');
  assert.equal(this.$(hook('key_up')).text().trim(), 'false', 'keyUp was triggered');
});
