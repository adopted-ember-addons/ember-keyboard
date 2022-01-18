'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CURRENT_TAG = exports.VOLATILE_TAG = exports.CONSTANT_TAG = exports.update = exports.dirty = exports.MonomorphicTagImpl = exports.ALLOW_CYCLES = exports.COMPUTE = exports.VOLATILE = exports.INITIAL = exports.CONSTANT = undefined;
exports.bump = bump;
exports.value = value;
exports.validate = validate;
exports.createTag = createTag;
exports.createUpdatableTag = createUpdatableTag;
exports.isConst = isConst;
exports.isConstTag = isConstTag;
exports.combineTagged = combineTagged;
exports.combineSlice = combineSlice;
exports.combine = combine;

var _util = require('@glimmer/util');

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var symbol = typeof Symbol !== 'undefined' ? Symbol : function (key) {
    return '__' + key + Math.floor(Math.random() * Date.now()) + '__';
};
var CONSTANT = exports.CONSTANT = 0;
var INITIAL = exports.INITIAL = 1;
var VOLATILE = exports.VOLATILE = 9007199254740991; // MAX_INT
var $REVISION = INITIAL;
function bump() {
    $REVISION++;
}
//////////
var COMPUTE = exports.COMPUTE = symbol('TAG_COMPUTE');
//////////
/**
 * `value` receives a tag and returns an opaque Revision based on that tag. This
 * snapshot can then later be passed to `validate` with the same tag to
 * determine if the tag has changed at all since the time that `value` was
 * called.
 *
 * The current implementation returns the global revision count directly for
 * performance reasons. This is an implementation detail, and should not be
 * relied on directly by users of these APIs. Instead, Revisions should be
 * treated as if they are opaque/unknown, and should only be interacted with via
 * the `value`/`validate` API.
 *
 * @param tag
 */
function value(_tag) {
    return $REVISION;
}
/**
 * `validate` receives a tag and a snapshot from a previous call to `value` with
 * the same tag, and determines if the tag is still valid compared to the
 * snapshot. If the tag's state has changed at all since then, `validate` will
 * return false, otherwise it will return true. This is used to determine if a
 * calculation related to the tags should be rerun.
 *
 * @param tag
 * @param snapshot
 */
function validate(tag, snapshot) {
    return snapshot >= tag[COMPUTE]();
}
var TYPE = symbol('TAG_TYPE');
var ALLOW_CYCLES = exports.ALLOW_CYCLES = void 0;
if (false) {
    exports.ALLOW_CYCLES = ALLOW_CYCLES = new WeakSet();
}
var MonomorphicTagImpl = exports.MonomorphicTagImpl = function () {
    function MonomorphicTagImpl(type) {
        _classCallCheck(this, MonomorphicTagImpl);

        this.revision = INITIAL;
        this.lastChecked = INITIAL;
        this.lastValue = INITIAL;
        this.isUpdating = false;
        this.subtag = null;
        this.subtags = null;
        this[TYPE] = type;
    }

    MonomorphicTagImpl.prototype[COMPUTE] = function () {
        var lastChecked = this.lastChecked;

        if (lastChecked !== $REVISION) {
            this.isUpdating = true;
            this.lastChecked = $REVISION;
            try {
                var subtags = this.subtags,
                    subtag = this.subtag,
                    revision = this.revision;

                if (subtag !== null) {
                    revision = Math.max(revision, subtag[COMPUTE]());
                }
                if (subtags !== null) {
                    for (var i = 0; i < subtags.length; i++) {
                        var _value = subtags[i][COMPUTE]();
                        revision = Math.max(_value, revision);
                    }
                }
                this.lastValue = revision;
            } finally {
                this.isUpdating = false;
            }
        }
        if (this.isUpdating === true) {
            if (false && !ALLOW_CYCLES.has(this)) {
                throw new Error('Cycles in tags are not allowed');
            }
            this.lastChecked = ++$REVISION;
        }
        return this.lastValue;
    };

    MonomorphicTagImpl.update = function update(_tag, subtag) {
        if (false) {
            false && (0, _util.assert)(_tag[TYPE] === 1 /* Updatable */, 'Attempted to update a tag that was not updatable');
        }
        // TODO: TS 3.7 should allow us to do this via assertion
        var tag = _tag;
        if (subtag === CONSTANT_TAG) {
            tag.subtag = null;
        } else {
            tag.subtag = subtag;
            // subtag could be another type of tag, e.g. CURRENT_TAG or VOLATILE_TAG.
            // If so, lastChecked/lastValue will be undefined, result in these being
            // NaN. This is fine, it will force the system to recompute.
            tag.lastChecked = Math.min(tag.lastChecked, subtag.lastChecked);
            tag.lastValue = Math.max(tag.lastValue, subtag.lastValue);
        }
    };

    MonomorphicTagImpl.dirty = function dirty(tag) {
        if (false) {
            false && (0, _util.assert)(tag[TYPE] === 1 /* Updatable */ || tag[TYPE] === 0 /* Dirtyable */, 'Attempted to dirty a tag that was not dirtyable');
        }
        tag.revision = ++$REVISION;
    };

    return MonomorphicTagImpl;
}();
var dirty = exports.dirty = MonomorphicTagImpl.dirty;
var update = exports.update = MonomorphicTagImpl.update;
//////////
function createTag() {
    return new MonomorphicTagImpl(0 /* Dirtyable */);
}
function createUpdatableTag() {
    return new MonomorphicTagImpl(1 /* Updatable */);
}
//////////
var CONSTANT_TAG = exports.CONSTANT_TAG = new MonomorphicTagImpl(3 /* Constant */);
function isConst(_ref) {
    var tag = _ref.tag;

    return tag === CONSTANT_TAG;
}
function isConstTag(tag) {
    return tag === CONSTANT_TAG;
}
//////////

var VolatileTag = function () {
    function VolatileTag() {
        _classCallCheck(this, VolatileTag);
    }

    VolatileTag.prototype[COMPUTE] = function () {
        return VOLATILE;
    };

    return VolatileTag;
}();

var VOLATILE_TAG = exports.VOLATILE_TAG = new VolatileTag();
//////////

var CurrentTag = function () {
    function CurrentTag() {
        _classCallCheck(this, CurrentTag);
    }

    CurrentTag.prototype[COMPUTE] = function () {
        return $REVISION;
    };

    return CurrentTag;
}();

var CURRENT_TAG = exports.CURRENT_TAG = new CurrentTag();
//////////
function combineTagged(tagged) {
    var optimized = [];
    for (var i = 0, l = tagged.length; i < l; i++) {
        var tag = tagged[i].tag;
        if (tag === CONSTANT_TAG) continue;
        optimized.push(tag);
    }
    return _combine(optimized);
}
function combineSlice(slice) {
    var optimized = [];
    var node = slice.head();
    while (node !== null) {
        var tag = node.tag;
        if (tag !== CONSTANT_TAG) optimized.push(tag);
        node = slice.nextNode(node);
    }
    return _combine(optimized);
}
function combine(tags) {
    var optimized = [];
    for (var i = 0, l = tags.length; i < l; i++) {
        var tag = tags[i];
        if (tag === CONSTANT_TAG) continue;
        optimized.push(tag);
    }
    return _combine(optimized);
}
function _combine(tags) {
    switch (tags.length) {
        case 0:
            return CONSTANT_TAG;
        case 1:
            return tags[0];
        default:
            var tag = new MonomorphicTagImpl(2 /* Combinator */);
            tag.subtags = tags;
            return tag;
    }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3JlZmVyZW5jZS9saWIvdmFsaWRhdG9ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7UUEyQk0sSSxHQUFBLEk7UUFzQ0EsSyxHQUFBLEs7UUFjQSxRLEdBQUEsUTtRQTRJQSxTLEdBQUEsUztRQUlBLGtCLEdBQUEsa0I7UUFRQSxPLEdBQUEsTztRQUlBLFUsR0FBQSxVO1FBMEJBLGEsR0FBQSxhO1FBWUEsWSxHQUFBLFk7UUFnQkEsTyxHQUFBLE87O0FBalNOOzs7Ozs7OztBQVlBLElBQU0sU0FDSixPQUFBLE1BQUEsS0FBQSxXQUFBLEdBQUEsTUFBQSxHQUVJLFVBQUEsR0FBQSxFQUFBO0FBQUEsV0FBQSxPQUFBLEdBQUEsR0FBNEIsS0FBQSxLQUFBLENBQVcsS0FBQSxNQUFBLEtBQWdCLEtBSDdELEdBRzZELEVBQTNCLENBQTVCLEdBQUEsSUFBQTtBQUhOLENBQUE7QUFTTyxJQUFNLDhCQUFOLENBQUE7QUFDQSxJQUFNLDRCQUFOLENBQUE7QUFDQSxJQUFNLDhCQUFOLGdCQUFBLEMsQ0FBNkM7QUFFcEQsSUFBSSxZQUFKLE9BQUE7QUFFTSxTQUFBLElBQUEsR0FBYztBQUNsQjtBQUNEO0FBRUQ7QUFFTyxJQUFNLDRCQUF5QixPQUEvQixhQUErQixDQUEvQjtBQWdCUDtBQUVBOzs7Ozs7Ozs7Ozs7OztBQWNNLFNBQUEsS0FBQSxDQUFBLElBQUEsRUFBeUI7QUFDN0IsV0FBQSxTQUFBO0FBQ0Q7QUFFRDs7Ozs7Ozs7OztBQVVNLFNBQUEsUUFBQSxDQUFBLEdBQUEsRUFBQSxRQUFBLEVBQStDO0FBQ25ELFdBQU8sWUFBWSxJQUFuQixPQUFtQixHQUFuQjtBQUNEO0FBaUJELElBQU0sT0FBc0IsT0FBNUIsVUFBNEIsQ0FBNUI7QUFFTyxJQUFBLHNDQUFBLEtBQUEsQ0FBQTtBQUVQLElBQUEsS0FBQSxFQUFXO0FBQ1QsWUFISyxZQUdMLGtCQUFlLElBQWYsT0FBZSxFQUFmO0FBQ0Q7QUFx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QUFJLE1BQU0sS0FBVixHQUFBO0FBRUEsWUFBSSxRQUFKLFlBQUEsRUFBMEIsVUFBQSxJQUFBLENBQUEsR0FBQTtBQUUxQixlQUFPLE1BQUEsUUFBQSxDQUFQLElBQU8sQ0FBUDtBQUNEO0FBRUQsV0FBTyxTQUFQLFNBQU8sQ0FBUDtBQUNEO0FBRUssU0FBQSxPQUFBLENBQUEsSUFBQSxFQUE2QjtBQUNqQyxRQUFJLFlBQUosRUFBQTtBQUVBLFNBQUssSUFBSSxJQUFKLENBQUEsRUFBVyxJQUFJLEtBQXBCLE1BQUEsRUFBaUMsSUFBakMsQ0FBQSxFQUFBLEdBQUEsRUFBNkM7QUFDM0MsWUFBSSxNQUFNLEtBQVYsQ0FBVSxDQUFWO0FBQ0EsWUFBSSxRQUFKLFlBQUEsRUFBMEI7QUFDMUIsa0JBQUEsSUFBQSxDQUFBLEdBQUE7QUFDRDtBQUVELFdBQU8sU0FBUCxTQUFPLENBQVA7QUFDRDtBQUVELFNBQUEsUUFBQSxDQUFBLElBQUEsRUFBNkI7QUFDM0IsWUFBUSxLQUFSLE1BQUE7QUFDRSxhQUFBLENBQUE7QUFDRSxtQkFBQSxZQUFBO0FBQ0YsYUFBQSxDQUFBO0FBQ0UsbUJBQU8sS0FBUCxDQUFPLENBQVA7QUFDRjtBQUNFLGdCQUFJLE1BQU0sSUFBQSxrQkFBQSxDQUFBLENBQUEsQ0FBVixnQkFBVSxDQUFWO0FBQ0MsZ0JBQUEsT0FBQSxHQUFBLElBQUE7QUFDRCxtQkFBQSxHQUFBO0FBUko7QUFVRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFNsaWNlLCBMaW5rZWRMaXN0Tm9kZSwgYXNzZXJ0IH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQgeyBERUJVRyB9IGZyb20gJ0BnbGltbWVyL2xvY2FsLWRlYnVnLWZsYWdzJztcblxuLy8vLy8vLy8vL1xuXG4vLyB1dGlsc1xudHlwZSBVbmlvblRvSW50ZXJzZWN0aW9uPFU+ID0gKFUgZXh0ZW5kcyBhbnkgPyAoazogVSkgPT4gdm9pZCA6IG5ldmVyKSBleHRlbmRzICgoXG4gIGs6IGluZmVyIElcbikgPT4gdm9pZClcbiAgPyBJXG4gIDogbmV2ZXI7XG5cbmNvbnN0IHN5bWJvbCA9XG4gIHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnXG4gICAgPyBTeW1ib2xcbiAgICA6IChrZXk6IHN0cmluZykgPT4gYF9fJHtrZXl9JHtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBEYXRlLm5vdygpKX1fX2AgYXMgYW55O1xuXG4vLy8vLy8vLy8vXG5cbmV4cG9ydCB0eXBlIFJldmlzaW9uID0gbnVtYmVyO1xuXG5leHBvcnQgY29uc3QgQ09OU1RBTlQ6IFJldmlzaW9uID0gMDtcbmV4cG9ydCBjb25zdCBJTklUSUFMOiBSZXZpc2lvbiA9IDE7XG5leHBvcnQgY29uc3QgVk9MQVRJTEU6IFJldmlzaW9uID0gOTAwNzE5OTI1NDc0MDk5MTsgLy8gTUFYX0lOVFxuXG5sZXQgJFJFVklTSU9OID0gSU5JVElBTDtcblxuZXhwb3J0IGZ1bmN0aW9uIGJ1bXAoKSB7XG4gICRSRVZJU0lPTisrO1xufVxuXG4vLy8vLy8vLy8vXG5cbmV4cG9ydCBjb25zdCBDT01QVVRFOiB1bmlxdWUgc3ltYm9sID0gc3ltYm9sKCdUQUdfQ09NUFVURScpO1xuXG5leHBvcnQgaW50ZXJmYWNlIEVudGl0eVRhZzxUPiB7XG4gIFtDT01QVVRFXSgpOiBUO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFRhZyBleHRlbmRzIEVudGl0eVRhZzxSZXZpc2lvbj4ge31cblxuZXhwb3J0IGludGVyZmFjZSBFbnRpdHlUYWdnZWQ8VD4ge1xuICB0YWc6IEVudGl0eVRhZzxUPjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBUYWdnZWQge1xuICB0YWc6IFRhZztcbn1cblxuLy8vLy8vLy8vL1xuXG4vKipcbiAqIGB2YWx1ZWAgcmVjZWl2ZXMgYSB0YWcgYW5kIHJldHVybnMgYW4gb3BhcXVlIFJldmlzaW9uIGJhc2VkIG9uIHRoYXQgdGFnLiBUaGlzXG4gKiBzbmFwc2hvdCBjYW4gdGhlbiBsYXRlciBiZSBwYXNzZWQgdG8gYHZhbGlkYXRlYCB3aXRoIHRoZSBzYW1lIHRhZyB0b1xuICogZGV0ZXJtaW5lIGlmIHRoZSB0YWcgaGFzIGNoYW5nZWQgYXQgYWxsIHNpbmNlIHRoZSB0aW1lIHRoYXQgYHZhbHVlYCB3YXNcbiAqIGNhbGxlZC5cbiAqXG4gKiBUaGUgY3VycmVudCBpbXBsZW1lbnRhdGlvbiByZXR1cm5zIHRoZSBnbG9iYWwgcmV2aXNpb24gY291bnQgZGlyZWN0bHkgZm9yXG4gKiBwZXJmb3JtYW5jZSByZWFzb25zLiBUaGlzIGlzIGFuIGltcGxlbWVudGF0aW9uIGRldGFpbCwgYW5kIHNob3VsZCBub3QgYmVcbiAqIHJlbGllZCBvbiBkaXJlY3RseSBieSB1c2VycyBvZiB0aGVzZSBBUElzLiBJbnN0ZWFkLCBSZXZpc2lvbnMgc2hvdWxkIGJlXG4gKiB0cmVhdGVkIGFzIGlmIHRoZXkgYXJlIG9wYXF1ZS91bmtub3duLCBhbmQgc2hvdWxkIG9ubHkgYmUgaW50ZXJhY3RlZCB3aXRoIHZpYVxuICogdGhlIGB2YWx1ZWAvYHZhbGlkYXRlYCBBUEkuXG4gKlxuICogQHBhcmFtIHRhZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsdWUoX3RhZzogVGFnKTogUmV2aXNpb24ge1xuICByZXR1cm4gJFJFVklTSU9OO1xufVxuXG4vKipcbiAqIGB2YWxpZGF0ZWAgcmVjZWl2ZXMgYSB0YWcgYW5kIGEgc25hcHNob3QgZnJvbSBhIHByZXZpb3VzIGNhbGwgdG8gYHZhbHVlYCB3aXRoXG4gKiB0aGUgc2FtZSB0YWcsIGFuZCBkZXRlcm1pbmVzIGlmIHRoZSB0YWcgaXMgc3RpbGwgdmFsaWQgY29tcGFyZWQgdG8gdGhlXG4gKiBzbmFwc2hvdC4gSWYgdGhlIHRhZydzIHN0YXRlIGhhcyBjaGFuZ2VkIGF0IGFsbCBzaW5jZSB0aGVuLCBgdmFsaWRhdGVgIHdpbGxcbiAqIHJldHVybiBmYWxzZSwgb3RoZXJ3aXNlIGl0IHdpbGwgcmV0dXJuIHRydWUuIFRoaXMgaXMgdXNlZCB0byBkZXRlcm1pbmUgaWYgYVxuICogY2FsY3VsYXRpb24gcmVsYXRlZCB0byB0aGUgdGFncyBzaG91bGQgYmUgcmVydW4uXG4gKlxuICogQHBhcmFtIHRhZ1xuICogQHBhcmFtIHNuYXBzaG90XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZSh0YWc6IFRhZywgc25hcHNob3Q6IFJldmlzaW9uKSB7XG4gIHJldHVybiBzbmFwc2hvdCA+PSB0YWdbQ09NUFVURV0oKTtcbn1cblxuLy8vLy8vLy8vL1xuXG4vKipcbiAqIFRoaXMgZW51bSByZXByZXNlbnRzIGFsbCBvZiB0aGUgcG9zc2libGUgdGFnIHR5cGVzIGZvciB0aGUgbW9ub21vcnBoaWMgdGFnIGNsYXNzLlxuICogT3RoZXIgY3VzdG9tIHRhZyBjbGFzc2VzIGNhbiBleGlzdCwgc3VjaCBhcyBDdXJyZW50VGFnIGFuZCBWb2xhdGlsZVRhZywgYnV0IGZvclxuICogcGVyZm9ybWFuY2UgcmVhc29ucywgYW55IHR5cGUgb2YgdGFnIHRoYXQgaXMgbWVhbnQgdG8gYmUgdXNlZCBmcmVxdWVudGx5IHNob3VsZFxuICogYmUgYWRkZWQgdG8gdGhlIG1vbm9tb3JwaGljIHRhZy5cbiAqL1xuY29uc3QgZW51bSBNb25vbW9ycGhpY1RhZ1R5cGVzIHtcbiAgRGlydHlhYmxlLFxuICBVcGRhdGFibGUsXG4gIENvbWJpbmF0b3IsXG4gIENvbnN0YW50LFxufVxuXG5jb25zdCBUWVBFOiB1bmlxdWUgc3ltYm9sID0gc3ltYm9sKCdUQUdfVFlQRScpO1xuXG5leHBvcnQgbGV0IEFMTE9XX0NZQ0xFUzogV2Vha1NldDxVcGRhdGFibGVUYWc+O1xuXG5pZiAoREVCVUcpIHtcbiAgQUxMT1dfQ1lDTEVTID0gbmV3IFdlYWtTZXQoKTtcbn1cblxuaW50ZXJmYWNlIE1vbm9tb3JwaGljVGFnQmFzZTxUIGV4dGVuZHMgTW9ub21vcnBoaWNUYWdUeXBlcz4gZXh0ZW5kcyBUYWcge1xuICBbVFlQRV06IFQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGlydHlhYmxlVGFnIGV4dGVuZHMgTW9ub21vcnBoaWNUYWdCYXNlPE1vbm9tb3JwaGljVGFnVHlwZXMuRGlydHlhYmxlPiB7fVxuZXhwb3J0IGludGVyZmFjZSBVcGRhdGFibGVUYWcgZXh0ZW5kcyBNb25vbW9ycGhpY1RhZ0Jhc2U8TW9ub21vcnBoaWNUYWdUeXBlcy5VcGRhdGFibGU+IHt9XG5leHBvcnQgaW50ZXJmYWNlIENvbWJpbmF0b3JUYWcgZXh0ZW5kcyBNb25vbW9ycGhpY1RhZ0Jhc2U8TW9ub21vcnBoaWNUYWdUeXBlcy5Db21iaW5hdG9yPiB7fVxuZXhwb3J0IGludGVyZmFjZSBDb25zdGFudFRhZyBleHRlbmRzIE1vbm9tb3JwaGljVGFnQmFzZTxNb25vbW9ycGhpY1RhZ1R5cGVzLkNvbnN0YW50PiB7fVxuXG5pbnRlcmZhY2UgTW9ub21vcnBoaWNUYWdNYXBwaW5nIHtcbiAgW01vbm9tb3JwaGljVGFnVHlwZXMuRGlydHlhYmxlXTogRGlydHlhYmxlVGFnO1xuICBbTW9ub21vcnBoaWNUYWdUeXBlcy5VcGRhdGFibGVdOiBVcGRhdGFibGVUYWc7XG4gIFtNb25vbW9ycGhpY1RhZ1R5cGVzLkNvbWJpbmF0b3JdOiBDb21iaW5hdG9yVGFnO1xuICBbTW9ub21vcnBoaWNUYWdUeXBlcy5Db25zdGFudF06IENvbnN0YW50VGFnO1xufVxuXG50eXBlIE1vbm9tb3JwaGljVGFnID0gVW5pb25Ub0ludGVyc2VjdGlvbjxNb25vbW9ycGhpY1RhZ01hcHBpbmdbTW9ub21vcnBoaWNUYWdUeXBlc10+O1xudHlwZSBNb25vbW9ycGhpY1RhZ1R5cGUgPSBVbmlvblRvSW50ZXJzZWN0aW9uPE1vbm9tb3JwaGljVGFnVHlwZXM+O1xuXG5leHBvcnQgY2xhc3MgTW9ub21vcnBoaWNUYWdJbXBsIGltcGxlbWVudHMgTW9ub21vcnBoaWNUYWcge1xuICBwcml2YXRlIHJldmlzaW9uID0gSU5JVElBTDtcbiAgcHJpdmF0ZSBsYXN0Q2hlY2tlZCA9IElOSVRJQUw7XG4gIHByaXZhdGUgbGFzdFZhbHVlID0gSU5JVElBTDtcblxuICBwcml2YXRlIGlzVXBkYXRpbmcgPSBmYWxzZTtcbiAgcHJpdmF0ZSBzdWJ0YWc6IFRhZyB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHN1YnRhZ3M6IFRhZ1tdIHwgbnVsbCA9IG51bGw7XG5cbiAgW1RZUEVdOiBNb25vbW9ycGhpY1RhZ1R5cGU7XG5cbiAgY29uc3RydWN0b3IodHlwZTogTW9ub21vcnBoaWNUYWdUeXBlcykge1xuICAgIHRoaXNbVFlQRV0gPSB0eXBlIGFzIE1vbm9tb3JwaGljVGFnVHlwZTtcbiAgfVxuXG4gIFtDT01QVVRFXSgpOiBSZXZpc2lvbiB7XG4gICAgbGV0IHsgbGFzdENoZWNrZWQgfSA9IHRoaXM7XG5cbiAgICBpZiAobGFzdENoZWNrZWQgIT09ICRSRVZJU0lPTikge1xuICAgICAgdGhpcy5pc1VwZGF0aW5nID0gdHJ1ZTtcbiAgICAgIHRoaXMubGFzdENoZWNrZWQgPSAkUkVWSVNJT047XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGxldCB7IHN1YnRhZ3MsIHN1YnRhZywgcmV2aXNpb24gfSA9IHRoaXM7XG5cbiAgICAgICAgaWYgKHN1YnRhZyAhPT0gbnVsbCkge1xuICAgICAgICAgIHJldmlzaW9uID0gTWF0aC5tYXgocmV2aXNpb24sIHN1YnRhZ1tDT01QVVRFXSgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzdWJ0YWdzICE9PSBudWxsKSB7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdWJ0YWdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSBzdWJ0YWdzW2ldW0NPTVBVVEVdKCk7XG4gICAgICAgICAgICByZXZpc2lvbiA9IE1hdGgubWF4KHZhbHVlLCByZXZpc2lvbik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5sYXN0VmFsdWUgPSByZXZpc2lvbjtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHRoaXMuaXNVcGRhdGluZyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmlzVXBkYXRpbmcgPT09IHRydWUpIHtcbiAgICAgIGlmIChERUJVRyAmJiAhQUxMT1dfQ1lDTEVTLmhhcyh0aGlzKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0N5Y2xlcyBpbiB0YWdzIGFyZSBub3QgYWxsb3dlZCcpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmxhc3RDaGVja2VkID0gKyskUkVWSVNJT047XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMubGFzdFZhbHVlO1xuICB9XG5cbiAgc3RhdGljIHVwZGF0ZShfdGFnOiBVcGRhdGFibGVUYWcsIHN1YnRhZzogVGFnKSB7XG4gICAgaWYgKERFQlVHKSB7XG4gICAgICBhc3NlcnQoXG4gICAgICAgIF90YWdbVFlQRV0gPT09IE1vbm9tb3JwaGljVGFnVHlwZXMuVXBkYXRhYmxlLFxuICAgICAgICAnQXR0ZW1wdGVkIHRvIHVwZGF0ZSBhIHRhZyB0aGF0IHdhcyBub3QgdXBkYXRhYmxlJ1xuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBUUyAzLjcgc2hvdWxkIGFsbG93IHVzIHRvIGRvIHRoaXMgdmlhIGFzc2VydGlvblxuICAgIGxldCB0YWcgPSBfdGFnIGFzIE1vbm9tb3JwaGljVGFnSW1wbDtcblxuICAgIGlmIChzdWJ0YWcgPT09IENPTlNUQU5UX1RBRykge1xuICAgICAgdGFnLnN1YnRhZyA9IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRhZy5zdWJ0YWcgPSBzdWJ0YWc7XG5cbiAgICAgIC8vIHN1YnRhZyBjb3VsZCBiZSBhbm90aGVyIHR5cGUgb2YgdGFnLCBlLmcuIENVUlJFTlRfVEFHIG9yIFZPTEFUSUxFX1RBRy5cbiAgICAgIC8vIElmIHNvLCBsYXN0Q2hlY2tlZC9sYXN0VmFsdWUgd2lsbCBiZSB1bmRlZmluZWQsIHJlc3VsdCBpbiB0aGVzZSBiZWluZ1xuICAgICAgLy8gTmFOLiBUaGlzIGlzIGZpbmUsIGl0IHdpbGwgZm9yY2UgdGhlIHN5c3RlbSB0byByZWNvbXB1dGUuXG4gICAgICB0YWcubGFzdENoZWNrZWQgPSBNYXRoLm1pbih0YWcubGFzdENoZWNrZWQsIChzdWJ0YWcgYXMgYW55KS5sYXN0Q2hlY2tlZCk7XG4gICAgICB0YWcubGFzdFZhbHVlID0gTWF0aC5tYXgodGFnLmxhc3RWYWx1ZSwgKHN1YnRhZyBhcyBhbnkpLmxhc3RWYWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIGRpcnR5KHRhZzogRGlydHlhYmxlVGFnIHwgVXBkYXRhYmxlVGFnKSB7XG4gICAgaWYgKERFQlVHKSB7XG4gICAgICBhc3NlcnQoXG4gICAgICAgIHRhZ1tUWVBFXSA9PT0gTW9ub21vcnBoaWNUYWdUeXBlcy5VcGRhdGFibGUgfHwgdGFnW1RZUEVdID09PSBNb25vbW9ycGhpY1RhZ1R5cGVzLkRpcnR5YWJsZSxcbiAgICAgICAgJ0F0dGVtcHRlZCB0byBkaXJ0eSBhIHRhZyB0aGF0IHdhcyBub3QgZGlydHlhYmxlJ1xuICAgICAgKTtcbiAgICB9XG5cbiAgICAodGFnIGFzIE1vbm9tb3JwaGljVGFnSW1wbCkucmV2aXNpb24gPSArKyRSRVZJU0lPTjtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgZGlydHkgPSBNb25vbW9ycGhpY1RhZ0ltcGwuZGlydHk7XG5leHBvcnQgY29uc3QgdXBkYXRlID0gTW9ub21vcnBoaWNUYWdJbXBsLnVwZGF0ZTtcblxuLy8vLy8vLy8vL1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVGFnKCk6IERpcnR5YWJsZVRhZyB7XG4gIHJldHVybiBuZXcgTW9ub21vcnBoaWNUYWdJbXBsKE1vbm9tb3JwaGljVGFnVHlwZXMuRGlydHlhYmxlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVVwZGF0YWJsZVRhZygpOiBVcGRhdGFibGVUYWcge1xuICByZXR1cm4gbmV3IE1vbm9tb3JwaGljVGFnSW1wbChNb25vbW9ycGhpY1RhZ1R5cGVzLlVwZGF0YWJsZSk7XG59XG5cbi8vLy8vLy8vLy9cblxuZXhwb3J0IGNvbnN0IENPTlNUQU5UX1RBRyA9IG5ldyBNb25vbW9ycGhpY1RhZ0ltcGwoTW9ub21vcnBoaWNUYWdUeXBlcy5Db25zdGFudCkgYXMgQ29uc3RhbnRUYWc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0NvbnN0KHsgdGFnIH06IFRhZ2dlZCk6IGJvb2xlYW4ge1xuICByZXR1cm4gdGFnID09PSBDT05TVEFOVF9UQUc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0NvbnN0VGFnKHRhZzogVGFnKTogdGFnIGlzIENvbnN0YW50VGFnIHtcbiAgcmV0dXJuIHRhZyA9PT0gQ09OU1RBTlRfVEFHO1xufVxuXG4vLy8vLy8vLy8vXG5cbmNsYXNzIFZvbGF0aWxlVGFnIGltcGxlbWVudHMgVGFnIHtcbiAgW0NPTVBVVEVdKCkge1xuICAgIHJldHVybiBWT0xBVElMRTtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgVk9MQVRJTEVfVEFHID0gbmV3IFZvbGF0aWxlVGFnKCk7XG5cbi8vLy8vLy8vLy9cblxuY2xhc3MgQ3VycmVudFRhZyBpbXBsZW1lbnRzIEN1cnJlbnRUYWcge1xuICBbQ09NUFVURV0oKSB7XG4gICAgcmV0dXJuICRSRVZJU0lPTjtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgQ1VSUkVOVF9UQUcgPSBuZXcgQ3VycmVudFRhZygpO1xuXG4vLy8vLy8vLy8vXG5cbmV4cG9ydCBmdW5jdGlvbiBjb21iaW5lVGFnZ2VkKHRhZ2dlZDogUmVhZG9ubHlBcnJheTxUYWdnZWQ+KTogVGFnIHtcbiAgbGV0IG9wdGltaXplZDogVGFnW10gPSBbXTtcblxuICBmb3IgKGxldCBpID0gMCwgbCA9IHRhZ2dlZC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBsZXQgdGFnID0gdGFnZ2VkW2ldLnRhZztcbiAgICBpZiAodGFnID09PSBDT05TVEFOVF9UQUcpIGNvbnRpbnVlO1xuICAgIG9wdGltaXplZC5wdXNoKHRhZyk7XG4gIH1cblxuICByZXR1cm4gX2NvbWJpbmUob3B0aW1pemVkKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbWJpbmVTbGljZShzbGljZTogU2xpY2U8VGFnZ2VkICYgTGlua2VkTGlzdE5vZGU+KTogVGFnIHtcbiAgbGV0IG9wdGltaXplZDogVGFnW10gPSBbXTtcblxuICBsZXQgbm9kZSA9IHNsaWNlLmhlYWQoKTtcblxuICB3aGlsZSAobm9kZSAhPT0gbnVsbCkge1xuICAgIGxldCB0YWcgPSBub2RlLnRhZztcblxuICAgIGlmICh0YWcgIT09IENPTlNUQU5UX1RBRykgb3B0aW1pemVkLnB1c2godGFnKTtcblxuICAgIG5vZGUgPSBzbGljZS5uZXh0Tm9kZShub2RlKTtcbiAgfVxuXG4gIHJldHVybiBfY29tYmluZShvcHRpbWl6ZWQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tYmluZSh0YWdzOiBUYWdbXSk6IFRhZyB7XG4gIGxldCBvcHRpbWl6ZWQ6IFRhZ1tdID0gW107XG5cbiAgZm9yIChsZXQgaSA9IDAsIGwgPSB0YWdzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGxldCB0YWcgPSB0YWdzW2ldO1xuICAgIGlmICh0YWcgPT09IENPTlNUQU5UX1RBRykgY29udGludWU7XG4gICAgb3B0aW1pemVkLnB1c2godGFnKTtcbiAgfVxuXG4gIHJldHVybiBfY29tYmluZShvcHRpbWl6ZWQpO1xufVxuXG5mdW5jdGlvbiBfY29tYmluZSh0YWdzOiBUYWdbXSk6IFRhZyB7XG4gIHN3aXRjaCAodGFncy5sZW5ndGgpIHtcbiAgICBjYXNlIDA6XG4gICAgICByZXR1cm4gQ09OU1RBTlRfVEFHO1xuICAgIGNhc2UgMTpcbiAgICAgIHJldHVybiB0YWdzWzBdO1xuICAgIGRlZmF1bHQ6XG4gICAgICBsZXQgdGFnID0gbmV3IE1vbm9tb3JwaGljVGFnSW1wbChNb25vbW9ycGhpY1RhZ1R5cGVzLkNvbWJpbmF0b3IpIGFzIENvbWJpbmF0b3JUYWc7XG4gICAgICAodGFnIGFzIGFueSkuc3VidGFncyA9IHRhZ3M7XG4gICAgICByZXR1cm4gdGFnO1xuICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9