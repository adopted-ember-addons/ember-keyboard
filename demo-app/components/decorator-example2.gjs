import Component from '@glimmer/component';
import { keyResponder, onKey } from '#src/index.js';

@keyResponder
export default class DecoratorExample2 extends Component {
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
