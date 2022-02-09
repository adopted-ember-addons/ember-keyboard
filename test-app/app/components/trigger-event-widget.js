import Component from '@glimmer/component';
import { set } from '@ember/object';
import { keyResponder, onKey } from 'ember-keyboard';

// Use set(this) instead of tracked properties for Ember 3.8 compatibility.
@keyResponder({ activated: true })
export default class extends Component {
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
}
