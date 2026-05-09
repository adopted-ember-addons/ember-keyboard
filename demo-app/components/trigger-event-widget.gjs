import Component from '@glimmer/component';
import { set } from '@ember/object';
import { keyResponder, onKey } from '#src/index.js';

@keyResponder({ activated: true })
export default class TriggerEventWidget extends Component {
  keyboardActivated = true;
  keyDown = false;
  keyDownWithMods = false;
  keyPress = false;
  keyUp = false;

  @onKey('KeyA', { event: 'keydown' })
  toggleKeyDown = () => set(this, 'keyDown', !this.keyDown);

  @onKey('KeyA+cmd+shift', { event: 'keydown' })
  toggleKeyDownWithMods = () =>
    set(this, 'keyDownWithMods', !this.keyDownWithMods);

  @onKey('KeyA', { event: 'keypress' })
  toggleKeyPress = () => set(this, 'keyPress', !this.keyPress);

  @onKey('KeyA', { event: 'keyup' })
  toggleKeyUp = () => set(this, 'keyUp', !this.keyUp);

  <template>
    <div data-test-key_down>{{this.keyDown}}</div>
    <div data-test-key_down_with_mods>{{this.keyDownWithMods}}</div>
    <div data-test-key_press>{{this.keyPress}}</div>
    <div data-test-key_up>{{this.keyUp}}</div>
  </template>
}
