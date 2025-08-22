import listenerName from '../utils/listener-name.js';
import '../utils/get-cmd-key.js';

function keyDown(keyCombo) {
  return listenerName('keydown', keyCombo);
}
function keyPress(keyCombo) {
  return listenerName('keypress', keyCombo);
}
function keyUp(keyCombo) {
  return listenerName('keyup', keyCombo);
}

export { keyDown, keyPress, keyUp };
