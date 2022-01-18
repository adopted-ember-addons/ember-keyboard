'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.bump = bump;
exports.value = value;
exports.validate = validate;
exports.createTag = createTag;
exports.createUpdatableTag = createUpdatableTag;
exports.isConst = isConst;
exports.isConstTag = isConstTag;
exports.combine = combine;
exports.createCombinatorTag = createCombinatorTag;
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

var MonomorphicTagImpl = function () {
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
        if (false && _tag[TYPE] !== 1 /* Updatable */) {
                throw new Error('Attempted to update a tag that was not updatable');
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
        if (false && !(tag[TYPE] === 1 /* Updatable */ || tag[TYPE] === 0 /* Dirtyable */)) {
            throw new Error('Attempted to dirty a tag that was not dirtyable');
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
function combine(tags) {
    var optimized = [];
    for (var i = 0, l = tags.length; i < l; i++) {
        var tag = tags[i];
        if (tag === CONSTANT_TAG) continue;
        optimized.push(tag);
    }
    return createCombinatorTag(optimized);
}
function createCombinatorTag(tags) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3ZhbGlkYXRvci9saWIvdmFsaWRhdG9ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztRQTBCTSxJLEdBQUEsSTtRQXNDQSxLLEdBQUEsSztRQWNBLFEsR0FBQSxRO1FBeUlBLFMsR0FBQSxTO1FBSUEsa0IsR0FBQSxrQjtRQVFBLE8sR0FBQSxPO1FBSUEsVSxHQUFBLFU7UUEwQkEsTyxHQUFBLE87UUFZQSxtQixHQUFBLG1COzs7Ozs7O0FBbFFOLElBQU0sU0FDSixPQUFBLE1BQUEsS0FBQSxXQUFBLEdBQUEsTUFBQSxHQUVJLFVBQUEsR0FBQSxFQUFBO0FBQUEsV0FBQSxPQUFBLEdBQUEsR0FBNEIsS0FBQSxLQUFBLENBQVcsS0FBQSxNQUFBLEtBQWdCLEtBSDdELEdBRzZELEVBQTNCLENBQTVCLEdBQUEsSUFBQTtBQUhOLENBQUE7QUFTTyxJQUFNLDhCQUFOLENBQUE7QUFDQSxJQUFNLDRCQUFOLENBQUE7QUFDQSxJQUFNLDhCQUFOLGdCQUFBLEMsQ0FBNkM7QUFFcEQsSUFBSSxZQUFKLE9BQUE7QUFFTSxTQUFBLElBQUEsR0FBYztBQUNsQjtBQUNEO0FBRUQ7QUFFTyxJQUFNLDRCQUF5QixPQUEvQixhQUErQixDQUEvQjtBQWdCUDtBQUVBOzs7Ozs7Ozs7Ozs7OztBQWNNLFNBQUEsS0FBQSxDQUFBLElBQUEsRUFBeUI7QUFDN0IsV0FBQSxTQUFBO0FBQ0Q7QUFFRDs7Ozs7Ozs7OztBQVVNLFNBQUEsUUFBQSxDQUFBLEdBQUEsRUFBQSxRQUFBLEVBQStDO0FBQ25ELFdBQU8sWUFBWSxJQUFuQixPQUFtQixHQUFuQjtBQUNEO0FBaUJELElBQU0sT0FBc0IsT0FBNUIsVUFBNEIsQ0FBNUI7QUFFTyxJQUFBLHNDQUFBLEtBQUEsQ0FBQTtBQUVQLElBQUEsS0FBQSxFQUFXO0FBQ1QsWUFISyxZQUdMLGtCQUFlLElBQWYsT0FBZSxFQUFmO0FBQ0Q7O0lBcUJELHFCO0FBV0UsYUFBQSxrQkFB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RyB9IGZyb20gJ0BnbGltbWVyL2xvY2FsLWRlYnVnLWZsYWdzJztcblxuLy8vLy8vLy8vL1xuXG4vLyB1dGlsc1xudHlwZSBVbmlvblRvSW50ZXJzZWN0aW9uPFU+ID0gKFUgZXh0ZW5kcyBhbnkgPyAoazogVSkgPT4gdm9pZCA6IG5ldmVyKSBleHRlbmRzICgoXG4gIGs6IGluZmVyIElcbikgPT4gdm9pZClcbiAgPyBJXG4gIDogbmV2ZXI7XG5cbmNvbnN0IHN5bWJvbCA9XG4gIHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnXG4gICAgPyBTeW1ib2xcbiAgICA6IChrZXk6IHN0cmluZykgPT4gYF9fJHtrZXl9JHtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBEYXRlLm5vdygpKX1fX2AgYXMgYW55O1xuXG4vLy8vLy8vLy8vXG5cbmV4cG9ydCB0eXBlIFJldmlzaW9uID0gbnVtYmVyO1xuXG5leHBvcnQgY29uc3QgQ09OU1RBTlQ6IFJldmlzaW9uID0gMDtcbmV4cG9ydCBjb25zdCBJTklUSUFMOiBSZXZpc2lvbiA9IDE7XG5leHBvcnQgY29uc3QgVk9MQVRJTEU6IFJldmlzaW9uID0gOTAwNzE5OTI1NDc0MDk5MTsgLy8gTUFYX0lOVFxuXG5sZXQgJFJFVklTSU9OID0gSU5JVElBTDtcblxuZXhwb3J0IGZ1bmN0aW9uIGJ1bXAoKSB7XG4gICRSRVZJU0lPTisrO1xufVxuXG4vLy8vLy8vLy8vXG5cbmV4cG9ydCBjb25zdCBDT01QVVRFOiB1bmlxdWUgc3ltYm9sID0gc3ltYm9sKCdUQUdfQ09NUFVURScpO1xuXG5leHBvcnQgaW50ZXJmYWNlIEVudGl0eVRhZzxUPiB7XG4gIFtDT01QVVRFXSgpOiBUO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFRhZyBleHRlbmRzIEVudGl0eVRhZzxSZXZpc2lvbj4ge31cblxuZXhwb3J0IGludGVyZmFjZSBFbnRpdHlUYWdnZWQ8VD4ge1xuICB0YWc6IEVudGl0eVRhZzxUPjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBUYWdnZWQge1xuICB0YWc6IFRhZztcbn1cblxuLy8vLy8vLy8vL1xuXG4vKipcbiAqIGB2YWx1ZWAgcmVjZWl2ZXMgYSB0YWcgYW5kIHJldHVybnMgYW4gb3BhcXVlIFJldmlzaW9uIGJhc2VkIG9uIHRoYXQgdGFnLiBUaGlzXG4gKiBzbmFwc2hvdCBjYW4gdGhlbiBsYXRlciBiZSBwYXNzZWQgdG8gYHZhbGlkYXRlYCB3aXRoIHRoZSBzYW1lIHRhZyB0b1xuICogZGV0ZXJtaW5lIGlmIHRoZSB0YWcgaGFzIGNoYW5nZWQgYXQgYWxsIHNpbmNlIHRoZSB0aW1lIHRoYXQgYHZhbHVlYCB3YXNcbiAqIGNhbGxlZC5cbiAqXG4gKiBUaGUgY3VycmVudCBpbXBsZW1lbnRhdGlvbiByZXR1cm5zIHRoZSBnbG9iYWwgcmV2aXNpb24gY291bnQgZGlyZWN0bHkgZm9yXG4gKiBwZXJmb3JtYW5jZSByZWFzb25zLiBUaGlzIGlzIGFuIGltcGxlbWVudGF0aW9uIGRldGFpbCwgYW5kIHNob3VsZCBub3QgYmVcbiAqIHJlbGllZCBvbiBkaXJlY3RseSBieSB1c2VycyBvZiB0aGVzZSBBUElzLiBJbnN0ZWFkLCBSZXZpc2lvbnMgc2hvdWxkIGJlXG4gKiB0cmVhdGVkIGFzIGlmIHRoZXkgYXJlIG9wYXF1ZS91bmtub3duLCBhbmQgc2hvdWxkIG9ubHkgYmUgaW50ZXJhY3RlZCB3aXRoIHZpYVxuICogdGhlIGB2YWx1ZWAvYHZhbGlkYXRlYCBBUEkuXG4gKlxuICogQHBhcmFtIHRhZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsdWUoX3RhZzogVGFnKTogUmV2aXNpb24ge1xuICByZXR1cm4gJFJFVklTSU9OO1xufVxuXG4vKipcbiAqIGB2YWxpZGF0ZWAgcmVjZWl2ZXMgYSB0YWcgYW5kIGEgc25hcHNob3QgZnJvbSBhIHByZXZpb3VzIGNhbGwgdG8gYHZhbHVlYCB3aXRoXG4gKiB0aGUgc2FtZSB0YWcsIGFuZCBkZXRlcm1pbmVzIGlmIHRoZSB0YWcgaXMgc3RpbGwgdmFsaWQgY29tcGFyZWQgdG8gdGhlXG4gKiBzbmFwc2hvdC4gSWYgdGhlIHRhZydzIHN0YXRlIGhhcyBjaGFuZ2VkIGF0IGFsbCBzaW5jZSB0aGVuLCBgdmFsaWRhdGVgIHdpbGxcbiAqIHJldHVybiBmYWxzZSwgb3RoZXJ3aXNlIGl0IHdpbGwgcmV0dXJuIHRydWUuIFRoaXMgaXMgdXNlZCB0byBkZXRlcm1pbmUgaWYgYVxuICogY2FsY3VsYXRpb24gcmVsYXRlZCB0byB0aGUgdGFncyBzaG91bGQgYmUgcmVydW4uXG4gKlxuICogQHBhcmFtIHRhZ1xuICogQHBhcmFtIHNuYXBzaG90XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZSh0YWc6IFRhZywgc25hcHNob3Q6IFJldmlzaW9uKSB7XG4gIHJldHVybiBzbmFwc2hvdCA+PSB0YWdbQ09NUFVURV0oKTtcbn1cblxuLy8vLy8vLy8vL1xuXG4vKipcbiAqIFRoaXMgZW51bSByZXByZXNlbnRzIGFsbCBvZiB0aGUgcG9zc2libGUgdGFnIHR5cGVzIGZvciB0aGUgbW9ub21vcnBoaWMgdGFnIGNsYXNzLlxuICogT3RoZXIgY3VzdG9tIHRhZyBjbGFzc2VzIGNhbiBleGlzdCwgc3VjaCBhcyBDdXJyZW50VGFnIGFuZCBWb2xhdGlsZVRhZywgYnV0IGZvclxuICogcGVyZm9ybWFuY2UgcmVhc29ucywgYW55IHR5cGUgb2YgdGFnIHRoYXQgaXMgbWVhbnQgdG8gYmUgdXNlZCBmcmVxdWVudGx5IHNob3VsZFxuICogYmUgYWRkZWQgdG8gdGhlIG1vbm9tb3JwaGljIHRhZy5cbiAqL1xuY29uc3QgZW51bSBNb25vbW9ycGhpY1RhZ1R5cGVzIHtcbiAgRGlydHlhYmxlLFxuICBVcGRhdGFibGUsXG4gIENvbWJpbmF0b3IsXG4gIENvbnN0YW50LFxufVxuXG5jb25zdCBUWVBFOiB1bmlxdWUgc3ltYm9sID0gc3ltYm9sKCdUQUdfVFlQRScpO1xuXG5leHBvcnQgbGV0IEFMTE9XX0NZQ0xFUzogV2Vha1NldDxVcGRhdGFibGVUYWc+O1xuXG5pZiAoREVCVUcpIHtcbiAgQUxMT1dfQ1lDTEVTID0gbmV3IFdlYWtTZXQoKTtcbn1cblxuaW50ZXJmYWNlIE1vbm9tb3JwaGljVGFnQmFzZTxUIGV4dGVuZHMgTW9ub21vcnBoaWNUYWdUeXBlcz4gZXh0ZW5kcyBUYWcge1xuICBbVFlQRV06IFQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGlydHlhYmxlVGFnIGV4dGVuZHMgTW9ub21vcnBoaWNUYWdCYXNlPE1vbm9tb3JwaGljVGFnVHlwZXMuRGlydHlhYmxlPiB7fVxuZXhwb3J0IGludGVyZmFjZSBVcGRhdGFibGVUYWcgZXh0ZW5kcyBNb25vbW9ycGhpY1RhZ0Jhc2U8TW9ub21vcnBoaWNUYWdUeXBlcy5VcGRhdGFibGU+IHt9XG5leHBvcnQgaW50ZXJmYWNlIENvbWJpbmF0b3JUYWcgZXh0ZW5kcyBNb25vbW9ycGhpY1RhZ0Jhc2U8TW9ub21vcnBoaWNUYWdUeXBlcy5Db21iaW5hdG9yPiB7fVxuZXhwb3J0IGludGVyZmFjZSBDb25zdGFudFRhZyBleHRlbmRzIE1vbm9tb3JwaGljVGFnQmFzZTxNb25vbW9ycGhpY1RhZ1R5cGVzLkNvbnN0YW50PiB7fVxuXG5pbnRlcmZhY2UgTW9ub21vcnBoaWNUYWdNYXBwaW5nIHtcbiAgW01vbm9tb3JwaGljVGFnVHlwZXMuRGlydHlhYmxlXTogRGlydHlhYmxlVGFnO1xuICBbTW9ub21vcnBoaWNUYWdUeXBlcy5VcGRhdGFibGVdOiBVcGRhdGFibGVUYWc7XG4gIFtNb25vbW9ycGhpY1RhZ1R5cGVzLkNvbWJpbmF0b3JdOiBDb21iaW5hdG9yVGFnO1xuICBbTW9ub21vcnBoaWNUYWdUeXBlcy5Db25zdGFudF06IENvbnN0YW50VGFnO1xufVxuXG50eXBlIE1vbm9tb3JwaGljVGFnID0gVW5pb25Ub0ludGVyc2VjdGlvbjxNb25vbW9ycGhpY1RhZ01hcHBpbmdbTW9ub21vcnBoaWNUYWdUeXBlc10+O1xudHlwZSBNb25vbW9ycGhpY1RhZ1R5cGUgPSBVbmlvblRvSW50ZXJzZWN0aW9uPE1vbm9tb3JwaGljVGFnVHlwZXM+O1xuXG5jbGFzcyBNb25vbW9ycGhpY1RhZ0ltcGwgaW1wbGVtZW50cyBNb25vbW9ycGhpY1RhZyB7XG4gIHByaXZhdGUgcmV2aXNpb24gPSBJTklUSUFMO1xuICBwcml2YXRlIGxhc3RDaGVja2VkID0gSU5JVElBTDtcbiAgcHJpdmF0ZSBsYXN0VmFsdWUgPSBJTklUSUFMO1xuXG4gIHByaXZhdGUgaXNVcGRhdGluZyA9IGZhbHNlO1xuICBwcml2YXRlIHN1YnRhZzogVGFnIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgc3VidGFnczogVGFnW10gfCBudWxsID0gbnVsbDtcblxuICBbVFlQRV06IE1vbm9tb3JwaGljVGFnVHlwZTtcblxuICBjb25zdHJ1Y3Rvcih0eXBlOiBNb25vbW9ycGhpY1RhZ1R5cGVzKSB7XG4gICAgdGhpc1tUWVBFXSA9IHR5cGUgYXMgTW9ub21vcnBoaWNUYWdUeXBlO1xuICB9XG5cbiAgW0NPTVBVVEVdKCk6IFJldmlzaW9uIHtcbiAgICBsZXQgeyBsYXN0Q2hlY2tlZCB9ID0gdGhpcztcblxuICAgIGlmIChsYXN0Q2hlY2tlZCAhPT0gJFJFVklTSU9OKSB7XG4gICAgICB0aGlzLmlzVXBkYXRpbmcgPSB0cnVlO1xuICAgICAgdGhpcy5sYXN0Q2hlY2tlZCA9ICRSRVZJU0lPTjtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgbGV0IHsgc3VidGFncywgc3VidGFnLCByZXZpc2lvbiB9ID0gdGhpcztcblxuICAgICAgICBpZiAoc3VidGFnICE9PSBudWxsKSB7XG4gICAgICAgICAgcmV2aXNpb24gPSBNYXRoLm1heChyZXZpc2lvbiwgc3VidGFnW0NPTVBVVEVdKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN1YnRhZ3MgIT09IG51bGwpIHtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN1YnRhZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHN1YnRhZ3NbaV1bQ09NUFVURV0oKTtcbiAgICAgICAgICAgIHJldmlzaW9uID0gTWF0aC5tYXgodmFsdWUsIHJldmlzaW9uKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxhc3RWYWx1ZSA9IHJldmlzaW9uO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgdGhpcy5pc1VwZGF0aW5nID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaXNVcGRhdGluZyA9PT0gdHJ1ZSkge1xuICAgICAgaWYgKERFQlVHICYmICFBTExPV19DWUNMRVMuaGFzKHRoaXMpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ3ljbGVzIGluIHRhZ3MgYXJlIG5vdCBhbGxvd2VkJyk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMubGFzdENoZWNrZWQgPSArKyRSRVZJU0lPTjtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5sYXN0VmFsdWU7XG4gIH1cblxuICBzdGF0aWMgdXBkYXRlKF90YWc6IFVwZGF0YWJsZVRhZywgc3VidGFnOiBUYWcpIHtcbiAgICBpZiAoREVCVUcgJiYgX3RhZ1tUWVBFXSAhPT0gTW9ub21vcnBoaWNUYWdUeXBlcy5VcGRhdGFibGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQXR0ZW1wdGVkIHRvIHVwZGF0ZSBhIHRhZyB0aGF0IHdhcyBub3QgdXBkYXRhYmxlJyk7XG4gICAgfVxuXG4gICAgLy8gVE9ETzogVFMgMy43IHNob3VsZCBhbGxvdyB1cyB0byBkbyB0aGlzIHZpYSBhc3NlcnRpb25cbiAgICBsZXQgdGFnID0gX3RhZyBhcyBNb25vbW9ycGhpY1RhZ0ltcGw7XG5cbiAgICBpZiAoc3VidGFnID09PSBDT05TVEFOVF9UQUcpIHtcbiAgICAgIHRhZy5zdWJ0YWcgPSBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICB0YWcuc3VidGFnID0gc3VidGFnO1xuXG4gICAgICAvLyBzdWJ0YWcgY291bGQgYmUgYW5vdGhlciB0eXBlIG9mIHRhZywgZS5nLiBDVVJSRU5UX1RBRyBvciBWT0xBVElMRV9UQUcuXG4gICAgICAvLyBJZiBzbywgbGFzdENoZWNrZWQvbGFzdFZhbHVlIHdpbGwgYmUgdW5kZWZpbmVkLCByZXN1bHQgaW4gdGhlc2UgYmVpbmdcbiAgICAgIC8vIE5hTi4gVGhpcyBpcyBmaW5lLCBpdCB3aWxsIGZvcmNlIHRoZSBzeXN0ZW0gdG8gcmVjb21wdXRlLlxuICAgICAgdGFnLmxhc3RDaGVja2VkID0gTWF0aC5taW4odGFnLmxhc3RDaGVja2VkLCAoc3VidGFnIGFzIGFueSkubGFzdENoZWNrZWQpO1xuICAgICAgdGFnLmxhc3RWYWx1ZSA9IE1hdGgubWF4KHRhZy5sYXN0VmFsdWUsIChzdWJ0YWcgYXMgYW55KS5sYXN0VmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBkaXJ0eSh0YWc6IERpcnR5YWJsZVRhZyB8IFVwZGF0YWJsZVRhZykge1xuICAgIGlmIChcbiAgICAgIERFQlVHICYmXG4gICAgICAhKHRhZ1tUWVBFXSA9PT0gTW9ub21vcnBoaWNUYWdUeXBlcy5VcGRhdGFibGUgfHwgdGFnW1RZUEVdID09PSBNb25vbW9ycGhpY1RhZ1R5cGVzLkRpcnR5YWJsZSlcbiAgICApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQXR0ZW1wdGVkIHRvIGRpcnR5IGEgdGFnIHRoYXQgd2FzIG5vdCBkaXJ0eWFibGUnKTtcbiAgICB9XG5cbiAgICAodGFnIGFzIE1vbm9tb3JwaGljVGFnSW1wbCkucmV2aXNpb24gPSArKyRSRVZJU0lPTjtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgZGlydHkgPSBNb25vbW9ycGhpY1RhZ0ltcGwuZGlydHk7XG5leHBvcnQgY29uc3QgdXBkYXRlID0gTW9ub21vcnBoaWNUYWdJbXBsLnVwZGF0ZTtcblxuLy8vLy8vLy8vL1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVGFnKCk6IERpcnR5YWJsZVRhZyB7XG4gIHJldHVybiBuZXcgTW9ub21vcnBoaWNUYWdJbXBsKE1vbm9tb3JwaGljVGFnVHlwZXMuRGlydHlhYmxlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVVwZGF0YWJsZVRhZygpOiBVcGRhdGFibGVUYWcge1xuICByZXR1cm4gbmV3IE1vbm9tb3JwaGljVGFnSW1wbChNb25vbW9ycGhpY1RhZ1R5cGVzLlVwZGF0YWJsZSk7XG59XG5cbi8vLy8vLy8vLy9cblxuZXhwb3J0IGNvbnN0IENPTlNUQU5UX1RBRyA9IG5ldyBNb25vbW9ycGhpY1RhZ0ltcGwoTW9ub21vcnBoaWNUYWdUeXBlcy5Db25zdGFudCkgYXMgQ29uc3RhbnRUYWc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0NvbnN0KHsgdGFnIH06IFRhZ2dlZCk6IGJvb2xlYW4ge1xuICByZXR1cm4gdGFnID09PSBDT05TVEFOVF9UQUc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0NvbnN0VGFnKHRhZzogVGFnKTogdGFnIGlzIENvbnN0YW50VGFnIHtcbiAgcmV0dXJuIHRhZyA9PT0gQ09OU1RBTlRfVEFHO1xufVxuXG4vLy8vLy8vLy8vXG5cbmNsYXNzIFZvbGF0aWxlVGFnIGltcGxlbWVudHMgVGFnIHtcbiAgW0NPTVBVVEVdKCkge1xuICAgIHJldHVybiBWT0xBVElMRTtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgVk9MQVRJTEVfVEFHID0gbmV3IFZvbGF0aWxlVGFnKCk7XG5cbi8vLy8vLy8vLy9cblxuY2xhc3MgQ3VycmVudFRhZyBpbXBsZW1lbnRzIEN1cnJlbnRUYWcge1xuICBbQ09NUFVURV0oKSB7XG4gICAgcmV0dXJuICRSRVZJU0lPTjtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgQ1VSUkVOVF9UQUcgPSBuZXcgQ3VycmVudFRhZygpO1xuXG4vLy8vLy8vLy8vXG5cbmV4cG9ydCBmdW5jdGlvbiBjb21iaW5lKHRhZ3M6IFRhZ1tdKTogVGFnIHtcbiAgbGV0IG9wdGltaXplZDogVGFnW10gPSBbXTtcblxuICBmb3IgKGxldCBpID0gMCwgbCA9IHRhZ3MubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgbGV0IHRhZyA9IHRhZ3NbaV07XG4gICAgaWYgKHRhZyA9PT0gQ09OU1RBTlRfVEFHKSBjb250aW51ZTtcbiAgICBvcHRpbWl6ZWQucHVzaCh0YWcpO1xuICB9XG5cbiAgcmV0dXJuIGNyZWF0ZUNvbWJpbmF0b3JUYWcob3B0aW1pemVkKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNvbWJpbmF0b3JUYWcodGFnczogVGFnW10pOiBUYWcge1xuICBzd2l0Y2ggKHRhZ3MubGVuZ3RoKSB7XG4gICAgY2FzZSAwOlxuICAgICAgcmV0dXJuIENPTlNUQU5UX1RBRztcbiAgICBjYXNlIDE6XG4gICAgICByZXR1cm4gdGFnc1swXTtcbiAgICBkZWZhdWx0OlxuICAgICAgbGV0IHRhZyA9IG5ldyBNb25vbW9ycGhpY1RhZ0ltcGwoTW9ub21vcnBoaWNUYWdUeXBlcy5Db21iaW5hdG9yKSBhcyBDb21iaW5hdG9yVGFnO1xuICAgICAgKHRhZyBhcyBhbnkpLnN1YnRhZ3MgPSB0YWdzO1xuICAgICAgcmV0dXJuIHRhZztcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==