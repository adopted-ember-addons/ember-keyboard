// Importing test-support is what these type tests are for
/* eslint-disable ember/no-test-support-import */
import { expectTypeOf } from 'expect-type';
import { keyEvent } from 'ember-keyboard/test-support/key-event';
import {
  keyDown,
  keyDownWithElement,
  keyPress,
  keyUp,
  mouseDown,
  mouseUp,
  touchEnd,
  touchStart,
} from 'ember-keyboard/test-support/test-helpers';

for (const helper of [
  keyDown,
  keyPress,
  keyUp,
  mouseDown,
  mouseUp,
  touchEnd,
  touchStart,
]) {
  expectTypeOf(helper('ctrl+a')).toEqualTypeOf<Promise<void>>();
}

expectTypeOf(keyDownWithElement).toBeCallableWith('Enter', '.selector', {
  repeat: true,
});
expectTypeOf(keyDownWithElement).toBeCallableWith('Enter', document.body);
expectTypeOf(keyEvent('a', 'keydown')).toEqualTypeOf<Promise<void>>();
