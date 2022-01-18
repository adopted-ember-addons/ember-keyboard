/* eslint no-param-reassign: "off" */

import Helper from '@ember/component/helper';
import { addEventListener, removeEventListener } from '../utils/event-listener';
import { assert } from '@ember/debug';
import { DEBUG } from '@glimmer/env';

/**
 * These are private API and only used for testing instrumentation.
 */
let adds = 0;
let removes = 0;
export function __counts() {
  return { adds, removes };
}

const assertValidEventOptions =
  DEBUG &&
  (() => {
    const ALLOWED_EVENT_OPTIONS = ['capture', 'once', 'passive'];
    const joinOptions = options => options.map(o => `'${o}'`).join(', ');

    return function(eventOptions, eventName) {
      const invalidOptions = Object.keys(eventOptions).filter(
        o => !ALLOWED_EVENT_OPTIONS.includes(o)
      );

      assert(
        `ember-on-helper: Provided invalid event options (${joinOptions(
          invalidOptions
        )}) to '${eventName}' event listener. Only these options are valid: ${joinOptions(
          ALLOWED_EVENT_OPTIONS
        )}`,
        invalidOptions.length === 0
      );
    };
  })();

function setupListener(eventTarget, eventName, callback, eventOptions) {
  if (DEBUG) assertValidEventOptions(eventOptions, eventName);
  assert(
    `ember-on-helper: '${eventTarget}' is not a valid event target. It has to be an Element or an object that conforms to the EventTarget interface.`,
    eventTarget &&
      typeof eventTarget.addEventListener === 'function' &&
      typeof eventTarget.removeEventListener === 'function'
  );
  assert(
    `ember-on-helper: '${eventName}' is not a valid event name. It has to be a string with a minimum length of 1 character.`,
    typeof eventName === 'string' && eventName.length > 1
  );
  assert(
    `ember-on-helper: '${callback}' is not a valid callback. Provide a function.`,
    typeof callback === 'function'
  );

  adds++;
  addEventListener(eventTarget, eventName, callback, eventOptions);

  return callback;
}

function destroyListener(eventTarget, eventName, callback, eventOptions) {
  if (eventTarget && eventName && callback) {
    removes++;
    removeEventListener(eventTarget, eventName, callback, eventOptions);
  }
}

export default Helper.extend({
  eventTarget: null,
  eventName: undefined,
  callback: undefined,
  eventOptions: undefined,

  compute([eventTarget, eventName, callback], eventOptions) {
    destroyListener(
      this.eventTarget,
      this.eventName,
      this.callback,
      this.eventOptions
    );

    this.eventTarget = eventTarget;

    this.callback = setupListener(
      this.eventTarget,
      eventName,
      callback,
      eventOptions
    );

    this.eventName = eventName;
    this.eventOptions = eventOptions;
  },

  willDestroy() {
    this._super();

    destroyListener(
      this.eventTarget,
      this.eventName,
      this.callback,
      this.eventOptions
    );
  }
});
