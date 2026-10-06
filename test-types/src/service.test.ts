import Component from '@glimmer/component';
import { service } from '@ember/service';
import type Owner from '@ember/owner';
import { expectTypeOf } from 'expect-type';
import type { KeyboardResponder } from 'ember-keyboard';
import KeyboardService from 'ember-keyboard/services/keyboard';

export class UsesService extends Component {
  @service declare keyboard: KeyboardService;

  check() {
    expectTypeOf(this.keyboard.keyDown('a')).toBeString();
    expectTypeOf(this.keyboard.activeResponders).toEqualTypeOf<
      KeyboardResponder[]
    >();
  }
}

expectTypeOf<KeyboardService['register']>()
  .parameter(0)
  .toEqualTypeOf<KeyboardResponder>();

// registered in the service registry
declare const owner: Owner;
expectTypeOf(owner.lookup('service:keyboard')).toEqualTypeOf<KeyboardService>();
