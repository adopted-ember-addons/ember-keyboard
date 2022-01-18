/**
 @module @ember/polyfills
*/

/**
  Copy properties from a source object to a target object. Source arguments remain unchanged.

  ```javascript
  import { assign } from '@ember/polyfills';

  var a = { first: 'Yehuda' };
  var b = { last: 'Katz' };
  var c = { company: 'Other Company' };
  var d = { company: 'Tilde Inc.' };
  assign(a, b, c, d); // a === { first: 'Yehuda', last: 'Katz', company: 'Tilde Inc.' };
  ```

  @method assign
  @for @ember/polyfills
  @param {Object} target The object to assign into
  @param {Object} ...args The objects to copy properties from
  @return {Object}
  @public
  @static
*/
export function assign(target) {
  for (let i = 1; i < arguments.length; i++) {
    let arg = arguments[i];

    if (!arg) {
      continue;
    }

    let updates = Object.keys(arg);

    for (let i = 0; i < updates.length; i++) {
      let prop = updates[i];
      target[prop] = arg[prop];
    }
  }

  return target;
} // Note: We use the bracket notation so
//       that the babel plugin does not
//       transform it.
// https://www.npmjs.com/package/babel-plugin-transform-object-assign

const {
  assign: _assign
} = Object;
export default _assign || assign;