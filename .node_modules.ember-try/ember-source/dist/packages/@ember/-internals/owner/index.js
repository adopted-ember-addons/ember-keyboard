/**
@module @ember/application
*/
import { enumerableSymbol, symbol } from '@ember/-internals/utils';
import { deprecate } from '@ember/debug';
export const LEGACY_OWNER = enumerableSymbol('LEGACY_OWNER');
export const OWNER = symbol('OWNER');
/**
  Framework objects in an Ember application (components, services, routes, etc.)
  are created via a factory and dependency injection system. Each of these
  objects is the responsibility of an "owner", which handled its
  instantiation and manages its lifetime.

  `getOwner` fetches the owner object responsible for an instance. This can
  be used to lookup or resolve other class instances, or register new factories
  into the owner.

  For example, this component dynamically looks up a service based on the
  `audioType` passed as an argument:

  ```app/components/play-audio.js
  import Component from '@glimmer/component';
  import { action } from '@ember/object';
  import { getOwner } from '@ember/application';

  // Usage:
  //
  //   <PlayAudio @audioType={{@model.audioType}} @audioFile={{@model.file}}/>
  //
  export default class extends Component {
    get audioService() {
      let owner = getOwner(this);
      return owner.lookup(`service:${this.args.audioType}`);
    }

    @action
    onPlay() {
      let player = this.audioService;
      player.play(this.args.audioFile);
    }
  }
  ```

  @method getOwner
  @static
  @for @ember/application
  @param {Object} object An object with an owner.
  @return {Object} An owner object.
  @since 2.3.0
  @public
*/

export function getOwner(object) {
  let owner = object[OWNER];

  if (owner === undefined) {
    owner = object[LEGACY_OWNER];
    deprecate(`You accessed the owner using \`getOwner\` on an object, but it was not set on that object with \`setOwner\`. You must use \`setOwner\` to set the owner on all objects. You cannot use Object.assign().`, owner === undefined, {
      id: 'owner.legacy-owner-injection',
      until: '3.25.0'
    });
  }

  return owner;
}
/**
  `setOwner` forces a new owner on a given object instance. This is primarily
  useful in some testing cases.

  @method setOwner
  @static
  @for @ember/application
  @param {Object} object An object instance.
  @param {Object} object The new owner object of the object instance.
  @since 2.3.0
  @public
*/

export function setOwner(object, owner) {
  object[OWNER] = owner;
  object[LEGACY_OWNER] = owner;
}