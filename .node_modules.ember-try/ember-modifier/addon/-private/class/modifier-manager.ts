import { capabilities } from '@ember/modifier';
import { set } from '@ember/object';
import { destroy, registerDestructor } from '@ember/destroyable';

import ClassBasedModifier from './modifier';
import { ModifierArgs } from 'ember-modifier/-private/interfaces';

function destroyModifier(modifier: ClassBasedModifier): void {
  modifier.willRemove();
  modifier.willDestroy();
}

export default class ClassBasedModifierManager {
  capabilities = capabilities('3.13');

  constructor(private owner: unknown) {}

  createModifier(
    factory: { owner: unknown; class: typeof ClassBasedModifier },
    args: ModifierArgs
  ): ClassBasedModifier {
    const Modifier = factory.class;

    const modifier = new Modifier(this.owner, args);

    registerDestructor(modifier, destroyModifier);

    return modifier;
  }

  installModifier(instance: ClassBasedModifier, element: Element): void {
    instance.element = element;
    instance.didReceiveArguments();
    instance.didInstall();
  }

  updateModifier(instance: ClassBasedModifier, args: ModifierArgs): void {
    // TODO: this should be an args proxy
    set(instance, 'args', args);
    instance.didUpdateArguments();
    instance.didReceiveArguments();
  }

  destroyModifier(instance: ClassBasedModifier): void {
    destroy(instance);
  }
}
