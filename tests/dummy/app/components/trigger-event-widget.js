import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { keyResponder, onKey } from 'ember-keyboard';

@keyResponder({ activated: true })
export default class extends Component {
  @tracked keyboardActivated = true;
  @tracked keyDown = false;
  @tracked keyDownWithMods = false;
  @tracked keyPress = false;
  @tracked keyUp = false;

  @onKey('KeyA', { event: 'keydown' })
  toggleKeyDown = () => (this.keyDown = !this.keyDown);

  @onKey('KeyA+cmd+shift', { event: 'keydown' })
  toggleKeyDownWithMods = () => (this.keyDownWithMods = !this.keyDownWithMods);

  @onKey('KeyA', { event: 'keypress' })
  toggleKeyPress = () => (this.keyPress = !this.keyPress);

  @onKey('KeyA', { event: 'keyup' })
  toggleKeyUp = () => (this.keyUp = !this.keyUp);
}
