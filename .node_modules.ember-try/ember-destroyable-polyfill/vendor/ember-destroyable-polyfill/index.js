import Ember from 'ember';
import { assert } from '@ember/debug';
import { schedule } from '@ember/runloop';

import { DEBUG } from '@glimmer/env';
import { gte } from 'ember-compatibility-helpers';

(() => {
  'use strict';

  if (gte('3.20.0-beta.4')) {
    // @ts-ignore
    const glimmerRuntime = Ember.__loader.require('@glimmer/runtime');

    // Ember.destroy is already set by default, ignoring it here

    Ember._registerDestructor = glimmerRuntime.registerDestructor;
    Ember._unregisterDestructor = glimmerRuntime.unregisterDestructor;
    Ember._associateDestroyableChild = glimmerRuntime.associateDestroyableChild;
    Ember._isDestroying = glimmerRuntime.isDestroying;
    Ember._isDestroyed = glimmerRuntime.isDestroyed;

    // on 3.20.0-beta.4 through 3.20.2 (estimated) there is an issue with the upstream
    // `assertDestroyablesDestroyed` method that triggers the assertion in cases that it
    // should not; in order to allow code bases to function on those specific Ember versions
    // (including our own test suite) we detect and do nothing
    //
    // See https://github.com/glimmerjs/glimmer-vm/pull/1119
    if (gte('3.20.2')) {
      Ember._assertDestroyablesDestroyed =
        glimmerRuntime.assertDestroyablesDestroyed;
      Ember._enableDestroyableTracking =
        glimmerRuntime.enableDestroyableTracking;
    } else {
      Ember._assertDestroyablesDestroyed = function () {};
      Ember._enableDestroyableTracking = function () {};
    }
  } else {
    const Meta = gte('3.6.0')
      ? Ember.__loader.require('@ember/-internals/meta/lib/meta').Meta
      : Ember.__loader.require('ember-meta/lib/meta').Meta;

    let isTesting = false;

    let DESTRUCTORS = new WeakMap();
    let DESTROYABLE_PARENTS = new WeakMap();
    const DESTROYABLE_CHILDREN = new WeakMap();

    /**
     * Tears down the meta on an object so that it can be garbage collected.
     * Multiple calls will have no effect.
     *
     * On Ember < 3.16.4 this just calls `meta.destroy`
     * On Ember >= 3.16.4 this calls setSourceDestroying and schedules setSourceDestroyed + `meta.destroy`
     *
     * @param {Object} obj  the object to destroy
     * @return {void}
     */
    const _upstreamDestroy = Ember.destroy;

    function getDestructors(destroyable) {
      if (!DESTRUCTORS.has(destroyable)) {
        DESTRUCTORS.set(destroyable, new Set());
      }

      return DESTRUCTORS.get(destroyable);
    }

    function getDestroyableChildren(destroyable) {
      if (!DESTROYABLE_CHILDREN.has(destroyable)) {
        DESTROYABLE_CHILDREN.set(destroyable, new Set());
      }

      return DESTROYABLE_CHILDREN.get(destroyable);
    }

    function isDestroying(destroyable) {
      return Ember.meta(destroyable).isSourceDestroying();
    }

    function isDestroyed(destroyable) {
      return Ember.meta(destroyable).isSourceDestroyed();
    }

    function assertNotDestroyed(destroyable) {
      assert(
        `'${destroyable}' was already destroyed.`,
        !isDestroyed(destroyable)
      );
      assert(
        `'${destroyable}' is already being destroyed.`,
        !isDestroying(destroyable)
      );
    }

    function associateDestroyableChild(parent, child) {
      if (DEBUG) assertNotDestroyed(parent);
      if (DEBUG) assertNotDestroyed(child);

      assert(
        `'${child}' is already a child of '${parent}'.`,
        !DESTROYABLE_PARENTS.has(child)
      );

      DESTROYABLE_PARENTS.set(child, parent);
      getDestroyableChildren(parent).add(child);

      return child;
    }

    function unregisterDestructor(destroyable, destructor) {
      if (DEBUG) assertNotDestroyed(destroyable);

      const destructors = getDestructors(destroyable);
      assert(
        `'${destructor}' is not registered with '${destroyable}'.`,
        destructors.has(destructor)
      );
      destructors.delete(destructor);
    }

    function registerDestructor(destroyable, destructor) {
      if (DEBUG) assertNotDestroyed(destroyable);
      const destructors = getDestructors(destroyable);
      assert(
        `'${destructor}' is already registered with '${destroyable}'.`,
        !destructors.has(destructor)
      );
      destructors.add(destructor);
      return destructor;
    }

    function destroy(destroyable) {
      if (isDestroying(destroyable) || isDestroyed(destroyable)) return;

      if (gte('3.16.4')) {
        // Ember.destroy calls setSourceDestroying (which runs runDestructors) and schedules setSourceDestroyed
        _upstreamDestroy(destroyable);
        return;
      }

      const m = Ember.meta(destroyable);

      m.setSourceDestroying(); // This calls `runDestructors`
    }

    const RUNNING = new WeakSet();

    function runDestructors(destroyable) {
      if (RUNNING.has(destroyable)) return;
      RUNNING.add(destroyable);

      const m = Ember.meta(destroyable);

      for (const child of getDestroyableChildren(destroyable)) destroy(child);

      for (const destructor of getDestructors(destroyable)) {
        schedule('actions', undefined, destructor, destroyable);
      }

      schedule('destroy', () => {
        if (!gte('3.16.4')) {
          // between Ember 2.18 and 3.16.4 Ember.destroy
          _upstreamDestroy(destroyable);

          m.setSourceDestroyed();
        }
        DESTRUCTORS.delete(destroyable);
        DESTROYABLE_PARENTS.delete(destroyable);
      });
    }

    function enableDestroyableTracking() {
      DESTRUCTORS = new Map();
      DESTROYABLE_PARENTS = new Map();
      isTesting = true;
    }

    function assertDestroyablesDestroyed() {
      if (!isTesting) {
        throw new Error(
          'Attempted to assert destroyables destroyed, but you did not start a destroyable test. Did you forget to call `enableDestroyableTracking()`'
        );
      }

      const destructors = DESTRUCTORS;
      const children = DESTROYABLE_PARENTS;

      isTesting = false;
      DESTRUCTORS = new WeakMap();
      DESTROYABLE_PARENTS = new WeakMap();

      if (destructors.size > 0 || children.size > 0) {
        const error = new Error(
          `Some destroyables were not destroyed during this test`
        );

        Object.defineProperty(error, 'destroyables', {
          get() {
            return [...new Set([...destructors.keys(), ...children.keys()])];
          },
        });

        throw error;
      }
    }

    const { setSourceDestroying } = Meta.prototype;

    Meta.prototype.setSourceDestroying = function () {
      setSourceDestroying.call(this);
      runDestructors(this.source);
    };

    const callWillDestroy = (instance) => instance.willDestroy();

    // would prefer a WeakSet here but not available on IE11
    const willDestroyRegistered = new WeakMap();

    Ember.CoreObject.prototype.init = function destroyablesPolyfill_init() {
      if (!willDestroyRegistered.has(this)) {
        registerDestructor(this, callWillDestroy);
        willDestroyRegistered.set(this, true);
      }
    };

    Ember.CoreObject.prototype.destroy = function destroyablesPolyfill_destroy() {
      destroy(this);
      return this;
    };

    Ember.destroy = destroy;
    Ember._registerDestructor = registerDestructor;
    Ember._unregisterDestructor = unregisterDestructor;
    Ember._associateDestroyableChild = associateDestroyableChild;
    Ember._isDestroying = isDestroying;
    Ember._isDestroyed = isDestroyed;
    Ember._assertDestroyablesDestroyed = assertDestroyablesDestroyed;
    Ember._enableDestroyableTracking = enableDestroyableTracking;
  }
})();
