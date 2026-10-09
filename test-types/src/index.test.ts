import { expectTypeOf } from 'expect-type';
import {
  click,
  getCode,
  getKeyCode,
  getMouseCode,
  keyDown,
  keyPress,
  keyUp,
  mouseDown,
  mouseUp,
  touchEnd,
  touchStart,
  triggerKeyDown,
  triggerKeyPress,
  triggerKeyUp,
  type EmberKeyboardEvent,
  type KeyboardHandler,
  type KeyboardResponder,
} from 'ember-keyboard';

// listener names
expectTypeOf(keyDown).toEqualTypeOf<(keyCombo?: string) => string>();
expectTypeOf(keyUp('ctrl+k')).toBeString();
expectTypeOf(keyPress()).toBeString();
expectTypeOf(click('left')).toBeString();
expectTypeOf(mouseDown('right+shift')).toBeString();
expectTypeOf(mouseUp()).toBeString();
expectTypeOf(touchStart()).toBeString();
expectTypeOf(touchEnd('alt')).toBeString();

// @ts-expect-error key combos are strings
keyDown(1);

// removed APIs throw
expectTypeOf(getCode).returns.toBeNever();
expectTypeOf(getKeyCode).returns.toBeNever();

expectTypeOf(getMouseCode('left')).toEqualTypeOf<0 | 1 | 2 | undefined>();

expectTypeOf(triggerKeyDown('Enter')).toBeVoid();
expectTypeOf(triggerKeyPress).toBeCallableWith('a', document.body);
expectTypeOf(triggerKeyUp).toBeCallableWith('a', window);
// @ts-expect-error element must be an EventTarget
triggerKeyUp('a', 'body');

// handlers
expectTypeOf<KeyboardHandler>().parameters.toEqualTypeOf<
  [KeyboardEvent, EmberKeyboardEvent]
>();
expectTypeOf<EmberKeyboardEvent>().toHaveProperty('stopPropagation');
expectTypeOf<EmberKeyboardEvent>().toHaveProperty('stopImmediatePropagation');

// responders can declare the specific event type they handle
const responder: KeyboardResponder = {
  keyboardPriority: 1,
  keyboardHandlers: {
    [keyDown('Escape')]: (event: KeyboardEvent) => event.key,
    [mouseDown('left')]: (event: MouseEvent, ekEvent) => {
      expectTypeOf(event.button).toBeNumber();
      ekEvent.stopPropagation();
    },
  },
};
expectTypeOf(responder).toExtend<KeyboardResponder>();
