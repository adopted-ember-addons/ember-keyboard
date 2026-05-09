import Component from '@glimmer/component';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { keyResponder, onKey } from '#src/index.js';
import { tracked } from '@glimmer/tracking';
import pick from '../helpers/pick.js';

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

function setValue(obj, key, value) {
  obj[key] = value;
}

@keyResponder
export default class KeyDownCounter extends Component {
  @tracked toggleActivated = true;
  @tracked counter = 0;
  @tracked keyboardPriority = 0;
  @tracked stopPropagation = false;
  @tracked stopImmediatePropagation = false;
  @tracked keyboardLaxPriority = false;
  @tracked keyboardFirstResponder = false;

  get keyboardActivated() {
    let toggleActivated = this.args.activatedToggle
      ? this.toggleActivated
      : true;
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

  <template>
    <span class="counter-container" ...attributes>
      {{#if @priorityInput}}
        <label><code>keyboardPriority</code>:
          <input
            class="input-field"
            data-test-counter-priority-input
            value={{this.keyboardPriority}}
            {{on
              "input"
              (pick "target.value" (fn setValue this "keyboardPriority"))
            }}
          />
        </label>
      {{/if}}

      {{#if @activatedToggle}}
        <label><code>keyboardActivated</code>:
          <input
            type="checkbox"
            data-test-counter-activated-toggle
            checked={{this.toggleActivated}}
            {{on
              "click"
              (pick "target.checked" (fn setValue this "toggleActivated"))
            }}
          />
        </label>
      {{/if}}

      {{#if @firstResponderToggle}}
        <label><code>keyboardFirstResponder</code>:
          <input
            type="checkbox"
            data-test-counter-first-responder-toggle
            checked={{this.keyboardFirstResponder}}
            {{on
              "click"
              (pick
                "target.checked" (fn setValue this "keyboardFirstResponder")
              )
            }}
          />
        </label>
      {{/if}}

      {{#if @laxPriorityToggle}}
        <label><code>keyboardLaxPriority</code>:
          <input
            type="checkbox"
            data-test-counter-lax-priority-toggle
            checked={{this.keyboardLaxPriority}}
            {{on
              "click"
              (pick "target.checked" (fn setValue this "keyboardLaxPriority"))
            }}
          />
        </label>
      {{/if}}

      {{#if @stopImmediatePropagationToggle}}
        <label><code>stopImmediatePropagation()</code>:
          <input
            type="checkbox"
            data-test-counter-stop-immediate-propagation-toggle
            checked={{this.stopImmediatePropagation}}
            {{on
              "click"
              (pick
                "target.checked" (fn setValue this "stopImmediatePropagation")
              )
            }}
          />
        </label>
      {{/if}}

      {{#if @stopPropagationToggle}}
        <label><code>stopPropagation()</code>:
          <input
            type="checkbox"
            data-test-counter-stop-propagation-toggle
            checked={{this.stopPropagation}}
            {{on
              "click"
              (pick "target.checked" (fn setValue this "stopPropagation"))
            }}
          />
        </label>
      {{/if}}

      <div data-test-counter-counter>{{this.counter}}</div>
    </span>
  </template>
}
