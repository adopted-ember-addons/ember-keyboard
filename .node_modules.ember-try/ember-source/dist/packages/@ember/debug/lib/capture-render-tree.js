import { expect } from '@glimmer/util';
/**
  @module @ember/debug
*/

/**
  Ember Inspector calls this function to capture the current render tree.

  In production mode, this requires turning on `ENV._DEBUG_RENDER_TREE`
  before loading Ember.

  @private
  @static
  @method captureRenderTree
  @for @ember/debug
  @param app {ApplicationInstance} An `ApplicationInstance`.
  @since 3.14.0
*/

export default function captureRenderTree(app) {
  let env = expect(app.lookup('-environment:main'), 'BUG: owner is missing -environment:main');
  let rendererType = env.isInteractive ? 'renderer:-dom' : 'renderer:-inert';
  let renderer = expect(app.lookup(rendererType), `BUG: owner is missing ${rendererType}`);
  return renderer.debugRenderTree.capture();
}