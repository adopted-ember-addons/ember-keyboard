import Component from '@glimmer/component';
import { fn } from '@ember/helper';
import { tracked } from '@glimmer/tracking';
import onKey from '#src/helpers/on-key.js';

function setTrue(obj, key) {
  obj[key] = true;
}

export default class OnKeyHelperExamples extends Component {
  @tracked wasCtrlKPressed = false;
  @tracked wasSPressed = false;
  @tracked wasSlashPressed = false;
  @tracked wasQuestionMarkPressed = false;
  @tracked wasCtrlPlusPressed = false;

  <template>
    <span data-test-ctrl-k>
      {{if this.wasCtrlKPressed "Ctrl+K pressed" "Ctrl+K not pressed"}}
    </span>

    {{onKey "ctrl+k" (fn setTrue this "wasCtrlKPressed")}}

    <hr />

    <span data-test-s>
      {{if this.wasSPressed "S pressed" "S not pressed"}}
    </span>

    {{onKey "KeyS" (fn setTrue this "wasSPressed")}}

    <hr />

    <span data-test-slash>
      {{if this.wasSlashPressed "slash pressed" "slash not pressed"}}
    </span>

    {{onKey "Slash" (fn setTrue this "wasSlashPressed")}}

    <hr />

    <span data-test-question-mark>
      {{if
        this.wasQuestionMarkPressed
        "question mark pressed"
        "question mark not pressed"
      }}
    </span>

    {{onKey "shift+Slash" (fn setTrue this "wasQuestionMarkPressed")}}

    <hr />

    <span data-test-ctrl-plus>
      {{if this.wasCtrlPlusPressed "Ctrl++ pressed" "Ctrl++ not pressed"}}
    </span>

    {{onKey "ctrl++" (fn setTrue this "wasCtrlPlusPressed")}}
  </template>
}
