import Component from '@glimmer/component';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import onKeyModifier from '#src/modifiers/on-key.js';

export default class OnKeyModifierExamples extends Component {
  @tracked bButtonTriggered = false;
  @tracked cButtonTriggered = false;
  @tracked dButtonTriggered = false;
  @tracked keyboardActivated = false;
  @tracked textFieldValue = '';
  @tracked wasEnterPressedInInput = false;
  @tracked priority = 0;
  @tracked priorityKeyFired = false;

  @action
  changeSetting(name, e) {
    this[name] = e.target.value;
  }

  @action
  applyCheckedValue(name, e) {
    this[name] = e.target.checked;
  }

  @action
  changePriority(e) {
    this.priority = e.target.value;
  }

  @action
  onEnterPressedInInput() {
    this.wasEnterPressedInInput = true;
  }

  setTrue = (key) => {
    this[key] = true;
  };

  <template>
    <div>
      <button
        type="button"
        {{on "click" (fn this.setTrue "bButtonTriggered")}}
        {{onKeyModifier "KeyB"}}
      >
        Press me or press "B"
      </button>

      <div data-test-b-button>
        {{if
          this.bButtonTriggered
          "button press triggered"
          "button press not triggered"
        }}
      </div>
    </div>

    <div>
      <label>
        <input
          data-test-checkbox
          type="checkbox"
          value={{this.keyboardActivated}}
          {{on "change" (fn this.applyCheckedValue "keyboardActivated")}}
        />Enable "C" keyboard shortcut
      </label>

      <button
        type="button"
        {{on "click" (fn this.setTrue "cButtonTriggered")}}
        {{onKeyModifier "KeyC" activated=this.keyboardActivated}}
      >
        Press me or press "C" (if the checkbox is checked)
      </button>

      <div data-test-c-button>
        {{if
          this.cButtonTriggered
          "button press triggered"
          "button press not triggered"
        }}
      </div>
    </div>

    <div>
      <button
        type="button"
        {{on "click" (fn this.setTrue "dButtonTriggered")}}
        {{onKeyModifier "d" event="keydown"}}
      >
        Press me or press "D"
      </button>

      <div data-test-d-button>
        {{if
          this.dButtonTriggered
          "button press triggered"
          "button press not triggered"
        }}
      </div>
    </div>

    <label>
      on-key with Enter:
      <input
        type="text"
        {{on "input" (fn this.changeSetting "textFieldValue")}}
        {{onKeyModifier "Enter" this.onEnterPressedInInput}}
      />
    </label>

    <span data-test-text-field>
      {{if
        this.wasEnterPressedInInput
        "enter pressed while input focused"
        "enter not pressed while input focused"
      }}
    </span>

    <div>
      Priority:
      <label for="">
        <input
          data-test-priority
          type="text"
          value={{this.priority}}
          {{on "input" this.changePriority}}
        />
        Take Priority
      </label>
      <div>
        <button
          type="button"
          {{on "click" (fn this.setTrue "priorityKeyFired")}}
          {{onKeyModifier "KeyP" priority=this.priority}}
        >
          Press me or press "P"
        </button>
        <div data-test-p-button>
          {{if
            this.priorityKeyFired
            "button press triggered"
            "button press not triggered"
          }}
        </div>
      </div>
    </div>
  </template>
}
