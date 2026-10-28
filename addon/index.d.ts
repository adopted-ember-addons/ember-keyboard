declare module 'ember-keyboard/helpers/on-key' {
  import Helper from '@ember/component/helper';

  export default class OnKeyHelper extends Helper<{
    Args: {
      Positional: [keyCombo: string, callback: (event: KeyboardEvent) => void];
    };
    Return: void;
  }> {}
}

declare module 'ember-keyboard/modifiers/on-key' {
  import Modifier from 'ember-modifier';

  export default class OnKeyModifier extends Modifier<{
    Args: {
      Positional: [keyCombo: string, callback?: (event: KeyboardEvent) => void];
      Named: {
        activated?: boolean;
        event?: string;
        priority?: number;
        onlyWhenFocused?: boolean;
      };
    };
    Element: HTMLElement;
  }> {}
}

declare module 'ember-keyboard/test-support/test-helpers' {
  export function keyDown(keyCombo: string): Promise<void>;
  export function keyUp(keyCombo: string): Promise<void>;
  export function keyPress(keyCombo: string): Promise<void>;
}
