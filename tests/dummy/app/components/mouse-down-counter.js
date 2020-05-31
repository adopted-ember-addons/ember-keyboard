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

  get keyboardActivated() {
    let toggleActivated = this.args.activatedToggle ? this.toggleActivated : true;
    return toggleActivated && this.args.parentActivated;
  }

  @onKey('left', { event: 'mousedown' }) inc1 = makeEventHandler(1);
  @onKey('right', { event: 'mousedown' }) inc10 = makeEventHandler(10);
  @onKey('middle', { event: 'mousedown' }) dec10 = makeEventHandler(-10);
}
