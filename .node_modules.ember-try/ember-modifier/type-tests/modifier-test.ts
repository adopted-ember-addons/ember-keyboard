import { expectTypeOf } from 'expect-type';

import Modifier, { modifier, ModifierArgs } from 'ember-modifier';

// --- function modifier --- //
expectTypeOf(modifier).toEqualTypeOf<
  (
    callback: (
      element: Element,
      positional: unknown[],
      named: Record<string, unknown>
    ) => (() => unknown) | void
  ) => unknown
>();

// --- class-based modifier --- //
expectTypeOf(Modifier).constructorParameters.toEqualTypeOf<
  [unknown, ModifierArgs]
>();
expectTypeOf<Modifier['args']>().toEqualTypeOf<ModifierArgs>();
expectTypeOf<Modifier['element']>().toEqualTypeOf<Element>();
expectTypeOf<Modifier['didReceiveArguments']>().toEqualTypeOf<() => void>();
expectTypeOf<Modifier['didUpdateArguments']>().toEqualTypeOf<() => void>();
expectTypeOf<Modifier['didInstall']>().toEqualTypeOf<() => void>();
expectTypeOf<Modifier['willRemove']>().toEqualTypeOf<() => void>();
expectTypeOf<Modifier['willDestroy']>().toEqualTypeOf<() => void>();
expectTypeOf<Modifier['isDestroying']>().toEqualTypeOf<boolean>();
expectTypeOf<Modifier['isDestroyed']>().toEqualTypeOf<boolean>();

// --- type utilities --- //
expectTypeOf<ModifierArgs>().toEqualTypeOf<{
  named: Record<string, unknown>;
  positional: unknown[];
}>();
