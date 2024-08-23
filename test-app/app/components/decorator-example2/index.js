import Component from '@glimmer/component';
import { keyResponder, onKey } from 'ember-keyboard';

@keyResponder
export default class extends Component {
  get keyboardPriority() {
    return this.args.priority || 0;
  }

  get keyboardActivated() {
    if (this.args.activated === undefined) {
      return super.keyboardActivated;
    }
    return this.args.activated;
  }

  @onKey('Digit2')
  onDigit2Down(keyboardEvent, emberKeyboardEvent) {
    this.args.onTrigger(keyboardEvent, emberKeyboardEvent);
  }
}
