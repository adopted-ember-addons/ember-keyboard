import Ember from 'ember';
import generateCodeMap from 'ember-keyboard/utils/generate-code-map';
import { module, test } from 'qunit';
import defaultCodeMap from 'ember-keyboard/fixtures/code-maps/default';

const { isNone } = Ember;

module('Unit | Utility | generate code map');

test('without navigator-derived arguments, it returns default values', function(assert) {
  assert.expect(1);

  const result = generateCodeMap();

  assert.deepEqual(result, defaultCodeMap, 'uses default');
});

test('when product===gecko', function(assert) {
  assert.expect(4);

  const result = generateCodeMap('', 'Gecko');

  assert.equal(result[91], 'OSRight', 'trumps default');
  assert.ok(isNone(result[108]), 'does not use gecko/linux map');
  assert.equal(result[12], 'NumpadEqual', 'does not use gecko/mac map');
  assert.equal(result[65], 'KeyA', 'based on default map');
});

test('when product===gecko and platform===linux', function(assert) {
  assert.expect(3);

  const result = generateCodeMap('Linux', 'Gecko');

  assert.equal(result[91], 'OSRight', 'trumps default with gecko map');
  assert.equal(result[225], 'AltRight', 'applies gecko/linux map');
  assert.equal(result[65], 'KeyA', 'based on default map');
});

test('when product===gecko and platform===mac', function(assert) {
  assert.expect(3);

  const result = generateCodeMap('Mac', 'Gecko');

  assert.equal(result[91], 'OSRight', 'trumps default with gecko map');
  assert.equal(result[12], 'NumLock', 'applies gecko/mac map');
  assert.equal(result[65], 'KeyA', 'based on default map');
});

test('when product===chromium and platform===linux', function(assert) {
  assert.expect(2);

  const result = generateCodeMap('Linux', 'Chromium');

  assert.equal(result[187], 'NumpadEqual', 'trumps default with chromium linux');
  assert.equal(result[65], 'KeyA', 'based on default map');
});

test('when product===chrome and platform===mac', function(assert) {
  assert.expect(2);

  const result = generateCodeMap('Mac', 'Chrome');

  assert.equal(result[190], 'NumpadComma', 'trumps default with mac map');
  assert.equal(result[65], 'KeyA', 'based on default map');
});

test('when product===safari and platform===mac', function(assert) {
  assert.expect(2);

  const result = generateCodeMap('Mac', 'Safari');

  assert.equal(result[190], 'NumpadComma', 'trumps default with mac map');
  assert.equal(result[65], 'KeyA', 'based on default map');
});
