export { default as getMouseCode } from './utils/get-mouse-code.js';
export { default as keyResponder } from './decorators/key-responder.js';
export { default as onKey } from './decorators/on-key.js';
export { keyDown, keyPress, keyUp } from './listeners/key-events.js';
export { click, mouseDown, mouseUp } from './listeners/mouse-events.js';
export { touchEnd, touchStart } from './listeners/touch-events.js';
export { triggerKeyDown, triggerKeyPress, triggerKeyUp } from './utils/trigger-event.js';

function getCode() {
  throw new Error('ember-keyboard: `getCode` has been removed. There is no longer a need for this function as you can directly specify `key` and/or `code` values');
}
function getKeyCode() {
  throw new Error('ember-keyboard: `getKeyCode` has been removed. There is no longer a need for this function as you can directly specify `key` and/or `code` values');
}

export { getCode, getKeyCode };
//# sourceMappingURL=index.js.map
