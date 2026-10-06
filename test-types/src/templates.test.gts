import { on } from '@ember/modifier';
import { expectTypeOf } from 'expect-type';
import onKey from 'ember-keyboard/helpers/on-key';
import ifKey from 'ember-keyboard/helpers/if-key';
import onKeyModifier from 'ember-keyboard/modifiers/on-key';
import type { EmberKeyboardEvent } from 'ember-keyboard';

const handle = (event: KeyboardEvent, ekEvent: EmberKeyboardEvent) => {
  expectTypeOf(event).toEqualTypeOf<KeyboardEvent>();
  ekEvent.stopPropagation();
};
const submit = (event: KeyboardEvent) => event.preventDefault();

export const Valid = <template>
  {{onKey "alt+c" handle}}
  {{onKey "Escape" handle event="keyup" activated=false priority=1}}

  <input aria-label="submit on enter" {{on "keydown" (ifKey "Enter" submit)}} />

  <button type="button" {{onKeyModifier "b"}}>click me with b</button>
  <div
    {{onKeyModifier
      "ctrl+s"
      handle
      event="keydown"
      activated=true
      priority="2"
      onlyWhenFocused=false
    }}
  ></div>
</template>;

export const Invalid = <template>
  {{! @glint-expect-error priority is a number }}
  {{onKey "a" handle priority="high"}}

  {{! @glint-expect-error key combo is a string }}
  <input aria-label="invalid key combo" {{on "keydown" (ifKey 1 submit)}} />

  {{! @glint-expect-error unknown named arg }}
  <button type="button" {{onKeyModifier "b" nope=true}}>x</button>
</template>;
