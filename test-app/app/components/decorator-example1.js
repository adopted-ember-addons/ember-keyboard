import Component from '@glimmer/component';
import { keyResponder, onKey } from 'ember-keyboard';

@keyResponder
export default class extends Component {
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
