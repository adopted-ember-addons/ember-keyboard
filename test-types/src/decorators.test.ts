import Component from '@glimmer/component';
import { expectTypeOf } from 'expect-type';
import { keyResponder, onKey } from 'ember-keyboard';

@keyResponder
class Bare extends Component {
  @onKey('ctrl+k')
  open(event: KeyboardEvent) {
    expectTypeOf(event).toEqualTypeOf<KeyboardEvent>();
  }

  @onKey('Escape', { event: 'keyup' })
  close() {}
}

@keyResponder({ priority: 2, activated: false })
class WithOptions extends Component {
  keyboardActivated = true;
}

// the decorator keeps the class type
expectTypeOf(keyResponder(Bare)).toEqualTypeOf<typeof Bare>();
expectTypeOf(keyResponder({ priority: 1 })(WithOptions)).toEqualTypeOf<
  typeof WithOptions
>();

// @ts-expect-error priority is a number
keyResponder({ priority: 'high' });

// classic (non-decorator) usage returns the wrapped function
const handler = (event: KeyboardEvent) => event.key;
expectTypeOf(onKey('a', handler)).toEqualTypeOf<typeof handler>();
expectTypeOf(onKey('a', { event: 'keyup' }, handler)).toEqualTypeOf<
  typeof handler
>();
