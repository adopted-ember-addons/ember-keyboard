import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { keyResponder, onKey } from '#src/index.js';

function makeEventHandler(stepSize = 1) {
  return function (_event, ekEvent) {
    if (this.stopImmediatePropagation) {
      ekEvent.stopImmediatePropagation();
    }
    if (this.stopPropagation) {
      ekEvent.stopPropagation();
    }
    this.counter = this.counter + stepSize;
  };
}

@keyResponder
export default class TouchStartCounter extends Component {
  @tracked toggleActivated = true;
  @tracked counter = 0;

  get keyboardActivated() {
    let toggleActivated = this.args.activatedToggle
      ? this.toggleActivated
      : true;
    return toggleActivated && this.args.parentActivated;
  }

  @onKey('', { event: 'touchstart' }) inc1 = makeEventHandler(1);

  <template>
    <span class="counter-container" ...attributes>
      <div data-test-touch-counter-counter>{{this.counter}}</div>
    </span>
  </template>
}
