import Component from '@glimmer/component';
import { keyResponder, onKey } from '#src/index.js';

@keyResponder
export default class DecoratorExample1 extends Component {
  @onKey('shift+c')
  onShiftCDown(e) {
    this.args.onTrigger(e);
  }

  @onKey('ctrl+alt+KeyE', { event: 'keyup' })
  onCtrlAltKeyEUp(e) {
    this.args.onTrigger(e);
  }

  @onKey('alt+ArrowLeft')
  @onKey('alt+ArrowRight')
  onAltLeftArrowOrRightArrowDown(e) {
    this.args.onTrigger(e);
  }
}
