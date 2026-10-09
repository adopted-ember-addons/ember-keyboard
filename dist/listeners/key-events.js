import listenerName from '../utils/listener-name.js';

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
//# sourceMappingURL=key-events.js.map
