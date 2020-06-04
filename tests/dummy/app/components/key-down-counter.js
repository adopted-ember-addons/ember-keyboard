import Component from '@glimmer/component';
import { keyResponder, onKey } from 'ember-keyboard';
import { tracked } from '@glimmer/tracking';

function makeEventHandler(stepSize = 1) {
  return function(_event, ekEvent) {
    if (this.stopImmediatePropagation) {
      ekEvent.stopImmediatePropagation();
    }
    if (this.stopPropagation) {
      ekEvent.stopPropagation();
    }
    this.counter = this.counter + stepSize;
  }
}

@keyResponder
export default class extends Component {
  @tracked toggleActivated = true;
  @tracked counter = 0;
  @tracked keyboardPriority = 0;
  @tracked stopPropagation = false;
  @tracked stopImmediatePropagation = false;
  @tracked keyboardLaxPriority = false;
  @tracked keyboardFirstResponder = false;

  get keyboardActivated() {
    let toggleActivated = this.args.activatedToggle ? this.toggleActivated : true;
    return toggleActivated && this.args.parentActivated;
  }

  @onKey('ArrowLeft') dec1 = makeEventHandler(-1);
  @onKey('ArrowRight') inc1 = makeEventHandler(1);
  @onKey('shift+ArrowLeft') dec10 = makeEventHandler(-10);
  @onKey('shift+ArrowRight') inc10 = makeEventHandler(10);
  @onKey('ctrl+shift+ArrowLeft') dec100 = makeEventHandler(-100);
  @onKey('ctrl+shift+ArrowRight') inc100 = makeEventHandler(100);

  @onKey('KeyR', { event: 'keyup' })
  resetCounter() {
    this.counter = 0;
  }

  @onKey('Digit5', { event: 'keypress' })
  resetCounterTo5() {
    this.counter = 5;
  }
}
