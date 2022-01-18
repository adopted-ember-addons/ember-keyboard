define('@glimmer/validator', ['exports'], function (exports) { 'use strict';

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var symbol = typeof Symbol !== 'undefined' ? Symbol : function (key) {
        return '__' + key + Math.floor(Math.random() * Date.now()) + '__';
    };
    var CONSTANT = 0;
    var INITIAL = 1;
    var VOLATILE = 9007199254740991; // MAX_INT
    var $REVISION = INITIAL;
    function bump() {
        $REVISION++;
    }
    //////////
    var COMPUTE = symbol('TAG_COMPUTE');
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
    var ALLOW_CYCLES = void 0;

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
                this.lastChecked = ++$REVISION;
            }
            return this.lastValue;
        };

        MonomorphicTagImpl.update = function update(_tag, subtag) {
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
            tag.revision = ++$REVISION;
        };

        return MonomorphicTagImpl;
    }();

    var dirty = MonomorphicTagImpl.dirty;
    var update = MonomorphicTagImpl.update;
    //////////
    function createTag() {
        return new MonomorphicTagImpl(0 /* Dirtyable */);
    }
    function createUpdatableTag() {
        return new MonomorphicTagImpl(1 /* Updatable */);
    }
    //////////
    var CONSTANT_TAG = new MonomorphicTagImpl(3 /* Constant */);
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

    var VOLATILE_TAG = new VolatileTag();
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

    var CURRENT_TAG = new CurrentTag();
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

    var TRACKED_TAGS = new WeakMap();
    function isObject(u) {
        return typeof u === 'object' && u !== null;
    }
    function dirtyTag(obj, key) {
        if (isObject(obj)) {
            var tag = tagFor(obj, key);
            if (tag === undefined) {
                updateTag(obj, key, createUpdatableTag());
            } else if (isConstTag(tag)) {
                throw new Error('BUG: Can\'t update a constant tag');
            } else {
                dirty(tag);
            }
        } else {
            throw new Error('BUG: Can\'t update a tag for a primitive');
        }
    }
    function tagFor(obj, key) {
        if (isObject(obj)) {
            var tags = TRACKED_TAGS.get(obj);
            if (tags === undefined) {
                tags = new Map();
                TRACKED_TAGS.set(obj, tags);
            } else if (tags.has(key)) {
                return tags.get(key);
            }
            var tag = createUpdatableTag();
            tags.set(key, tag);
            return tag;
        } else {
            return CONSTANT_TAG;
        }
    }
    function updateTag(obj, key, newTag) {
        if (isObject(obj)) {
            var tag = tagFor(obj, key);
            if (isConstTag(tag)) {
                throw new Error('BUG: Can\'t update a constant tag');
            } else {
                update(tag, newTag);
            }
            return tag;
        } else {
            throw new Error('BUG: Can\'t update a tag for a primitive');
        }
    }

    function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    /**
     * Whenever a tracked computed property is entered, the current tracker is
     * saved off and a new tracker is replaced.
     *
     * Any tracked properties consumed are added to the current tracker.
     *
     * When a tracked computed property is exited, the tracker's tags are
     * combined and added to the parent tracker.
     *
     * The consequence is that each tracked computed property has a tag
     * that corresponds to the tracked properties consumed inside of
     * itself, including child tracked computed properties.
     */
    var CURRENT_TRACKER = null;
    /**
     * An object that that tracks @tracked properties that were consumed.
     */

    var Tracker = function () {
        function Tracker() {
            _classCallCheck$1(this, Tracker);

            this.tags = new Set();
            this.last = null;
        }

        Tracker.prototype.add = function add(tag) {
            this.tags.add(tag);
            this.last = tag;
        };

        Tracker.prototype.combine = function combine$$1() {
            var tags = this.tags;

            if (tags.size === 0) {
                return CONSTANT_TAG;
            } else if (tags.size === 1) {
                return this.last;
            } else {
                var tagsArr = [];
                tags.forEach(function (tag) {
                    return tagsArr.push(tag);
                });
                return combine(tagsArr);
            }
        };

        return Tracker;
    }();

    function track(callback) {
        var parent = CURRENT_TRACKER;
        var current = new Tracker();
        CURRENT_TRACKER = current;
        try {
            callback();
        } finally {
            CURRENT_TRACKER = parent;
        }
        return current.combine();
    }
    function consume(tag) {
        if (CURRENT_TRACKER !== null) {
            CURRENT_TRACKER.add(tag);
        }
    }
    //////////
    var EPOCH = createTag();
    function trackedData(key, initializer) {
        var values = new WeakMap();
        var hasInitializer = typeof initializer === 'function';
        function getter(self) {
            consume(tagFor(self, key));
            var value$$1 = void 0;
            // If the field has never been initialized, we should initialize it
            if (hasInitializer && !values.has(self)) {
                value$$1 = initializer();
                values.set(self, value$$1);
            } else {
                value$$1 = values.get(self);
            }
            return value$$1;
        }
        function setter(self, value$$1) {
            dirty(EPOCH);
            dirtyTag(self, key);
            values.set(self, value$$1);
        }
        return { getter: getter, setter: setter };
    }

    exports.ALLOW_CYCLES = ALLOW_CYCLES;
    exports.bump = bump;
    exports.combine = combine;
    exports.COMPUTE = COMPUTE;
    exports.CONSTANT_TAG = CONSTANT_TAG;
    exports.CONSTANT = CONSTANT;
    exports.createCombinatorTag = createCombinatorTag;
    exports.createTag = createTag;
    exports.createUpdatableTag = createUpdatableTag;
    exports.CURRENT_TAG = CURRENT_TAG;
    exports.dirty = dirty;
    exports.INITIAL = INITIAL;
    exports.isConst = isConst;
    exports.isConstTag = isConstTag;
    exports.update = update;
    exports.validate = validate;
    exports.value = value;
    exports.VOLATILE_TAG = VOLATILE_TAG;
    exports.VOLATILE = VOLATILE;
    exports.dirtyTag = dirtyTag;
    exports.tagFor = tagFor;
    exports.updateTag = updateTag;
    exports.track = track;
    exports.consume = consume;
    exports.EPOCH = EPOCH;
    exports.trackedData = trackedData;

    Object.defineProperty(exports, '__esModule', { value: true });

});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xpbW1lci12YWxpZGF0b3IuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3ZhbGlkYXRvci9saWIvdmFsaWRhdG9ycy50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3ZhbGlkYXRvci9saWIvbWV0YS50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3ZhbGlkYXRvci9saWIvdHJhY2tpbmcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgREVCVUcgfSBmcm9tICdAZ2xpbW1lci9sb2NhbC1kZWJ1Zy1mbGFncyc7XG5cbi8vLy8vLy8vLy9cblxuLy8gdXRpbHNcbnR5cGUgVW5pb25Ub0ludGVyc2VjdGlvbjxVPiA9IChVIGV4dGVuZHMgYW55ID8gKGs6IFUpID0+IHZvaWQgOiBuZXZlcikgZXh0ZW5kcyAoKFxuICBrOiBpbmZlciBJXG4pID0+IHZvaWQpXG4gID8gSVxuICA6IG5ldmVyO1xuXG5jb25zdCBzeW1ib2wgPVxuICB0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJ1xuICAgID8gU3ltYm9sXG4gICAgOiAoa2V5OiBzdHJpbmcpID0+IGBfXyR7a2V5fSR7TWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogRGF0ZS5ub3coKSl9X19gIGFzIGFueTtcblxuLy8vLy8vLy8vL1xuXG5leHBvcnQgdHlwZSBSZXZpc2lvbiA9IG51bWJlcjtcblxuZXhwb3J0IGNvbnN0IENPTlNUQU5UOiBSZXZpc2lvbiA9IDA7XG5leHBvcnQgY29uc3QgSU5JVElBTDogUmV2aXNpb24gPSAxO1xuZXhwb3J0IGNvbnN0IFZPTEFUSUxFOiBSZXZpc2lvbiA9IDkwMDcxOTkyNTQ3NDA5OTE7IC8vIE1BWF9JTlRcblxubGV0ICRSRVZJU0lPTiA9IElOSVRJQUw7XG5cbmV4cG9ydCBmdW5jdGlvbiBidW1wKCkge1xuICAkUkVWSVNJT04rKztcbn1cblxuLy8vLy8vLy8vL1xuXG5leHBvcnQgY29uc3QgQ09NUFVURTogdW5pcXVlIHN5bWJvbCA9IHN5bWJvbCgnVEFHX0NPTVBVVEUnKTtcblxuZXhwb3J0IGludGVyZmFjZSBFbnRpdHlUYWc8VD4ge1xuICBbQ09NUFVURV0oKTogVDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBUYWcgZXh0ZW5kcyBFbnRpdHlUYWc8UmV2aXNpb24+IHt9XG5cbmV4cG9ydCBpbnRlcmZhY2UgRW50aXR5VGFnZ2VkPFQ+IHtcbiAgdGFnOiBFbnRpdHlUYWc8VD47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGFnZ2VkIHtcbiAgdGFnOiBUYWc7XG59XG5cbi8vLy8vLy8vLy9cblxuLyoqXG4gKiBgdmFsdWVgIHJlY2VpdmVzIGEgdGFnIGFuZCByZXR1cm5zIGFuIG9wYXF1ZSBSZXZpc2lvbiBiYXNlZCBvbiB0aGF0IHRhZy4gVGhpc1xuICogc25hcHNob3QgY2FuIHRoZW4gbGF0ZXIgYmUgcGFzc2VkIHRvIGB2YWxpZGF0ZWAgd2l0aCB0aGUgc2FtZSB0YWcgdG9cbiAqIGRldGVybWluZSBpZiB0aGUgdGFnIGhhcyBjaGFuZ2VkIGF0IGFsbCBzaW5jZSB0aGUgdGltZSB0aGF0IGB2YWx1ZWAgd2FzXG4gKiBjYWxsZWQuXG4gKlxuICogVGhlIGN1cnJlbnQgaW1wbGVtZW50YXRpb24gcmV0dXJucyB0aGUgZ2xvYmFsIHJldmlzaW9uIGNvdW50IGRpcmVjdGx5IGZvclxuICogcGVyZm9ybWFuY2UgcmVhc29ucy4gVGhpcyBpcyBhbiBpbXBsZW1lbnRhdGlvbiBkZXRhaWwsIGFuZCBzaG91bGQgbm90IGJlXG4gKiByZWxpZWQgb24gZGlyZWN0bHkgYnkgdXNlcnMgb2YgdGhlc2UgQVBJcy4gSW5zdGVhZCwgUmV2aXNpb25zIHNob3VsZCBiZVxuICogdHJlYXRlZCBhcyBpZiB0aGV5IGFyZSBvcGFxdWUvdW5rbm93biwgYW5kIHNob3VsZCBvbmx5IGJlIGludGVyYWN0ZWQgd2l0aCB2aWFcbiAqIHRoZSBgdmFsdWVgL2B2YWxpZGF0ZWAgQVBJLlxuICpcbiAqIEBwYXJhbSB0YWdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbHVlKF90YWc6IFRhZyk6IFJldmlzaW9uIHtcbiAgcmV0dXJuICRSRVZJU0lPTjtcbn1cblxuLyoqXG4gKiBgdmFsaWRhdGVgIHJlY2VpdmVzIGEgdGFnIGFuZCBhIHNuYXBzaG90IGZyb20gYSBwcmV2aW91cyBjYWxsIHRvIGB2YWx1ZWAgd2l0aFxuICogdGhlIHNhbWUgdGFnLCBhbmQgZGV0ZXJtaW5lcyBpZiB0aGUgdGFnIGlzIHN0aWxsIHZhbGlkIGNvbXBhcmVkIHRvIHRoZVxuICogc25hcHNob3QuIElmIHRoZSB0YWcncyBzdGF0ZSBoYXMgY2hhbmdlZCBhdCBhbGwgc2luY2UgdGhlbiwgYHZhbGlkYXRlYCB3aWxsXG4gKiByZXR1cm4gZmFsc2UsIG90aGVyd2lzZSBpdCB3aWxsIHJldHVybiB0cnVlLiBUaGlzIGlzIHVzZWQgdG8gZGV0ZXJtaW5lIGlmIGFcbiAqIGNhbGN1bGF0aW9uIHJlbGF0ZWQgdG8gdGhlIHRhZ3Mgc2hvdWxkIGJlIHJlcnVuLlxuICpcbiAqIEBwYXJhbSB0YWdcbiAqIEBwYXJhbSBzbmFwc2hvdFxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGUodGFnOiBUYWcsIHNuYXBzaG90OiBSZXZpc2lvbikge1xuICByZXR1cm4gc25hcHNob3QgPj0gdGFnW0NPTVBVVEVdKCk7XG59XG5cbi8vLy8vLy8vLy9cblxuLyoqXG4gKiBUaGlzIGVudW0gcmVwcmVzZW50cyBhbGwgb2YgdGhlIHBvc3NpYmxlIHRhZyB0eXBlcyBmb3IgdGhlIG1vbm9tb3JwaGljIHRhZyBjbGFzcy5cbiAqIE90aGVyIGN1c3RvbSB0YWcgY2xhc3NlcyBjYW4gZXhpc3QsIHN1Y2ggYXMgQ3VycmVudFRhZyBhbmQgVm9sYXRpbGVUYWcsIGJ1dCBmb3JcbiAqIHBlcmZvcm1hbmNlIHJlYXNvbnMsIGFueSB0eXBlIG9mIHRhZyB0aGF0IGlzIG1lYW50IHRvIGJlIHVzZWQgZnJlcXVlbnRseSBzaG91bGRcbiAqIGJlIGFkZGVkIHRvIHRoZSBtb25vbW9ycGhpYyB0YWcuXG4gKi9cbmNvbnN0IGVudW0gTW9ub21vcnBoaWNUYWdUeXBlcyB7XG4gIERpcnR5YWJsZSxcbiAgVXBkYXRhYmxlLFxuICBDb21iaW5hdG9yLFxuICBDb25zdGFudCxcbn1cblxuY29uc3QgVFlQRTogdW5pcXVlIHN5bWJvbCA9IHN5bWJvbCgnVEFHX1RZUEUnKTtcblxuZXhwb3J0IGxldCBBTExPV19DWUNMRVM6IFdlYWtTZXQ8VXBkYXRhYmxlVGFnPjtcblxuaWYgKERFQlVHKSB7XG4gIEFMTE9XX0NZQ0xFUyA9IG5ldyBXZWFrU2V0KCk7XG59XG5cbmludGVyZmFjZSBNb25vbW9ycGhpY1RhZ0Jhc2U8VCBleHRlbmRzIE1vbm9tb3JwaGljVGFnVHlwZXM+IGV4dGVuZHMgVGFnIHtcbiAgW1RZUEVdOiBUO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERpcnR5YWJsZVRhZyBleHRlbmRzIE1vbm9tb3JwaGljVGFnQmFzZTxNb25vbW9ycGhpY1RhZ1R5cGVzLkRpcnR5YWJsZT4ge31cbmV4cG9ydCBpbnRlcmZhY2UgVXBkYXRhYmxlVGFnIGV4dGVuZHMgTW9ub21vcnBoaWNUYWdCYXNlPE1vbm9tb3JwaGljVGFnVHlwZXMuVXBkYXRhYmxlPiB7fVxuZXhwb3J0IGludGVyZmFjZSBDb21iaW5hdG9yVGFnIGV4dGVuZHMgTW9ub21vcnBoaWNUYWdCYXNlPE1vbm9tb3JwaGljVGFnVHlwZXMuQ29tYmluYXRvcj4ge31cbmV4cG9ydCBpbnRlcmZhY2UgQ29uc3RhbnRUYWcgZXh0ZW5kcyBNb25vbW9ycGhpY1RhZ0Jhc2U8TW9ub21vcnBoaWNUYWdUeXBlcy5Db25zdGFudD4ge31cblxuaW50ZXJmYWNlIE1vbm9tb3JwaGljVGFnTWFwcGluZyB7XG4gIFtNb25vbW9ycGhpY1RhZ1R5cGVzLkRpcnR5YWJsZV06IERpcnR5YWJsZVRhZztcbiAgW01vbm9tb3JwaGljVGFnVHlwZXMuVXBkYXRhYmxlXTogVXBkYXRhYmxlVGFnO1xuICBbTW9ub21vcnBoaWNUYWdUeXBlcy5Db21iaW5hdG9yXTogQ29tYmluYXRvclRhZztcbiAgW01vbm9tb3JwaGljVGFnVHlwZXMuQ29uc3RhbnRdOiBDb25zdGFudFRhZztcbn1cblxudHlwZSBNb25vbW9ycGhpY1RhZyA9IFVuaW9uVG9JbnRlcnNlY3Rpb248TW9ub21vcnBoaWNUYWdNYXBwaW5nW01vbm9tb3JwaGljVGFnVHlwZXNdPjtcbnR5cGUgTW9ub21vcnBoaWNUYWdUeXBlID0gVW5pb25Ub0ludGVyc2VjdGlvbjxNb25vbW9ycGhpY1RhZ1R5cGVzPjtcblxuY2xhc3MgTW9ub21vcnBoaWNUYWdJbXBsIGltcGxlbWVudHMgTW9ub21vcnBoaWNUYWcge1xuICBwcml2YXRlIHJldmlzaW9uID0gSU5JVElBTDtcbiAgcHJpdmF0ZSBsYXN0Q2hlY2tlZCA9IElOSVRJQUw7XG4gIHByaXZhdGUgbGFzdFZhbHVlID0gSU5JVElBTDtcblxuICBwcml2YXRlIGlzVXBkYXRpbmcgPSBmYWxzZTtcbiAgcHJpdmF0ZSBzdWJ0YWc6IFRhZyB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHN1YnRhZ3M6IFRhZ1tdIHwgbnVsbCA9IG51bGw7XG5cbiAgW1RZUEVdOiBNb25vbW9ycGhpY1RhZ1R5cGU7XG5cbiAgY29uc3RydWN0b3IodHlwZTogTW9ub21vcnBoaWNUYWdUeXBlcykge1xuICAgIHRoaXNbVFlQRV0gPSB0eXBlIGFzIE1vbm9tb3JwaGljVGFnVHlwZTtcbiAgfVxuXG4gIFtDT01QVVRFXSgpOiBSZXZpc2lvbiB7XG4gICAgbGV0IHsgbGFzdENoZWNrZWQgfSA9IHRoaXM7XG5cbiAgICBpZiAobGFzdENoZWNrZWQgIT09ICRSRVZJU0lPTikge1xuICAgICAgdGhpcy5pc1VwZGF0aW5nID0gdHJ1ZTtcbiAgICAgIHRoaXMubGFzdENoZWNrZWQgPSAkUkVWSVNJT047XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGxldCB7IHN1YnRhZ3MsIHN1YnRhZywgcmV2aXNpb24gfSA9IHRoaXM7XG5cbiAgICAgICAgaWYgKHN1YnRhZyAhPT0gbnVsbCkge1xuICAgICAgICAgIHJldmlzaW9uID0gTWF0aC5tYXgocmV2aXNpb24sIHN1YnRhZ1tDT01QVVRFXSgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzdWJ0YWdzICE9PSBudWxsKSB7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdWJ0YWdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSBzdWJ0YWdzW2ldW0NPTVBVVEVdKCk7XG4gICAgICAgICAgICByZXZpc2lvbiA9IE1hdGgubWF4KHZhbHVlLCByZXZpc2lvbik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5sYXN0VmFsdWUgPSByZXZpc2lvbjtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHRoaXMuaXNVcGRhdGluZyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmlzVXBkYXRpbmcgPT09IHRydWUpIHtcbiAgICAgIGlmIChERUJVRyAmJiAhQUxMT1dfQ1lDTEVTLmhhcyh0aGlzKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0N5Y2xlcyBpbiB0YWdzIGFyZSBub3QgYWxsb3dlZCcpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmxhc3RDaGVja2VkID0gKyskUkVWSVNJT047XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMubGFzdFZhbHVlO1xuICB9XG5cbiAgc3RhdGljIHVwZGF0ZShfdGFnOiBVcGRhdGFibGVUYWcsIHN1YnRhZzogVGFnKSB7XG4gICAgaWYgKERFQlVHICYmIF90YWdbVFlQRV0gIT09IE1vbm9tb3JwaGljVGFnVHlwZXMuVXBkYXRhYmxlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0F0dGVtcHRlZCB0byB1cGRhdGUgYSB0YWcgdGhhdCB3YXMgbm90IHVwZGF0YWJsZScpO1xuICAgIH1cblxuICAgIC8vIFRPRE86IFRTIDMuNyBzaG91bGQgYWxsb3cgdXMgdG8gZG8gdGhpcyB2aWEgYXNzZXJ0aW9uXG4gICAgbGV0IHRhZyA9IF90YWcgYXMgTW9ub21vcnBoaWNUYWdJbXBsO1xuXG4gICAgaWYgKHN1YnRhZyA9PT0gQ09OU1RBTlRfVEFHKSB7XG4gICAgICB0YWcuc3VidGFnID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGFnLnN1YnRhZyA9IHN1YnRhZztcblxuICAgICAgLy8gc3VidGFnIGNvdWxkIGJlIGFub3RoZXIgdHlwZSBvZiB0YWcsIGUuZy4gQ1VSUkVOVF9UQUcgb3IgVk9MQVRJTEVfVEFHLlxuICAgICAgLy8gSWYgc28sIGxhc3RDaGVja2VkL2xhc3RWYWx1ZSB3aWxsIGJlIHVuZGVmaW5lZCwgcmVzdWx0IGluIHRoZXNlIGJlaW5nXG4gICAgICAvLyBOYU4uIFRoaXMgaXMgZmluZSwgaXQgd2lsbCBmb3JjZSB0aGUgc3lzdGVtIHRvIHJlY29tcHV0ZS5cbiAgICAgIHRhZy5sYXN0Q2hlY2tlZCA9IE1hdGgubWluKHRhZy5sYXN0Q2hlY2tlZCwgKHN1YnRhZyBhcyBhbnkpLmxhc3RDaGVja2VkKTtcbiAgICAgIHRhZy5sYXN0VmFsdWUgPSBNYXRoLm1heCh0YWcubGFzdFZhbHVlLCAoc3VidGFnIGFzIGFueSkubGFzdFZhbHVlKTtcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgZGlydHkodGFnOiBEaXJ0eWFibGVUYWcgfCBVcGRhdGFibGVUYWcpIHtcbiAgICBpZiAoXG4gICAgICBERUJVRyAmJlxuICAgICAgISh0YWdbVFlQRV0gPT09IE1vbm9tb3JwaGljVGFnVHlwZXMuVXBkYXRhYmxlIHx8IHRhZ1tUWVBFXSA9PT0gTW9ub21vcnBoaWNUYWdUeXBlcy5EaXJ0eWFibGUpXG4gICAgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0F0dGVtcHRlZCB0byBkaXJ0eSBhIHRhZyB0aGF0IHdhcyBub3QgZGlydHlhYmxlJyk7XG4gICAgfVxuXG4gICAgKHRhZyBhcyBNb25vbW9ycGhpY1RhZ0ltcGwpLnJldmlzaW9uID0gKyskUkVWSVNJT047XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGRpcnR5ID0gTW9ub21vcnBoaWNUYWdJbXBsLmRpcnR5O1xuZXhwb3J0IGNvbnN0IHVwZGF0ZSA9IE1vbm9tb3JwaGljVGFnSW1wbC51cGRhdGU7XG5cbi8vLy8vLy8vLy9cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVRhZygpOiBEaXJ0eWFibGVUYWcge1xuICByZXR1cm4gbmV3IE1vbm9tb3JwaGljVGFnSW1wbChNb25vbW9ycGhpY1RhZ1R5cGVzLkRpcnR5YWJsZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVVcGRhdGFibGVUYWcoKTogVXBkYXRhYmxlVGFnIHtcbiAgcmV0dXJuIG5ldyBNb25vbW9ycGhpY1RhZ0ltcGwoTW9ub21vcnBoaWNUYWdUeXBlcy5VcGRhdGFibGUpO1xufVxuXG4vLy8vLy8vLy8vXG5cbmV4cG9ydCBjb25zdCBDT05TVEFOVF9UQUcgPSBuZXcgTW9ub21vcnBoaWNUYWdJbXBsKE1vbm9tb3JwaGljVGFnVHlwZXMuQ29uc3RhbnQpIGFzIENvbnN0YW50VGFnO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNDb25zdCh7IHRhZyB9OiBUYWdnZWQpOiBib29sZWFuIHtcbiAgcmV0dXJuIHRhZyA9PT0gQ09OU1RBTlRfVEFHO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNDb25zdFRhZyh0YWc6IFRhZyk6IHRhZyBpcyBDb25zdGFudFRhZyB7XG4gIHJldHVybiB0YWcgPT09IENPTlNUQU5UX1RBRztcbn1cblxuLy8vLy8vLy8vL1xuXG5jbGFzcyBWb2xhdGlsZVRhZyBpbXBsZW1lbnRzIFRhZyB7XG4gIFtDT01QVVRFXSgpIHtcbiAgICByZXR1cm4gVk9MQVRJTEU7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IFZPTEFUSUxFX1RBRyA9IG5ldyBWb2xhdGlsZVRhZygpO1xuXG4vLy8vLy8vLy8vXG5cbmNsYXNzIEN1cnJlbnRUYWcgaW1wbGVtZW50cyBDdXJyZW50VGFnIHtcbiAgW0NPTVBVVEVdKCkge1xuICAgIHJldHVybiAkUkVWSVNJT047XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IENVUlJFTlRfVEFHID0gbmV3IEN1cnJlbnRUYWcoKTtcblxuLy8vLy8vLy8vL1xuXG5leHBvcnQgZnVuY3Rpb24gY29tYmluZSh0YWdzOiBUYWdbXSk6IFRhZyB7XG4gIGxldCBvcHRpbWl6ZWQ6IFRhZ1tdID0gW107XG5cbiAgZm9yIChsZXQgaSA9IDAsIGwgPSB0YWdzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGxldCB0YWcgPSB0YWdzW2ldO1xuICAgIGlmICh0YWcgPT09IENPTlNUQU5UX1RBRykgY29udGludWU7XG4gICAgb3B0aW1pemVkLnB1c2godGFnKTtcbiAgfVxuXG4gIHJldHVybiBjcmVhdGVDb21iaW5hdG9yVGFnKG9wdGltaXplZCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDb21iaW5hdG9yVGFnKHRhZ3M6IFRhZ1tdKTogVGFnIHtcbiAgc3dpdGNoICh0YWdzLmxlbmd0aCkge1xuICAgIGNhc2UgMDpcbiAgICAgIHJldHVybiBDT05TVEFOVF9UQUc7XG4gICAgY2FzZSAxOlxuICAgICAgcmV0dXJuIHRhZ3NbMF07XG4gICAgZGVmYXVsdDpcbiAgICAgIGxldCB0YWcgPSBuZXcgTW9ub21vcnBoaWNUYWdJbXBsKE1vbm9tb3JwaGljVGFnVHlwZXMuQ29tYmluYXRvcikgYXMgQ29tYmluYXRvclRhZztcbiAgICAgICh0YWcgYXMgYW55KS5zdWJ0YWdzID0gdGFncztcbiAgICAgIHJldHVybiB0YWc7XG4gIH1cbn1cbiIsImltcG9ydCB7XG4gIGRpcnR5LFxuICB1cGRhdGUsXG4gIGNyZWF0ZVVwZGF0YWJsZVRhZyxcbiAgVXBkYXRhYmxlVGFnLFxuICBDT05TVEFOVF9UQUcsXG4gIGlzQ29uc3RUYWcsXG4gIENvbnN0YW50VGFnLFxufSBmcm9tICcuL3ZhbGlkYXRvcnMnO1xuXG50eXBlIFRhZ3MgPSBNYXA8UHJvcGVydHlLZXksIFVwZGF0YWJsZVRhZz47XG5jb25zdCBUUkFDS0VEX1RBR1MgPSBuZXcgV2Vha01hcDxvYmplY3QsIFRhZ3M+KCk7XG5cbmZ1bmN0aW9uIGlzT2JqZWN0PFQ+KHU6IFQpOiB1IGlzIG9iamVjdCAmIFQge1xuICByZXR1cm4gdHlwZW9mIHUgPT09ICdvYmplY3QnICYmIHUgIT09IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXJ0eVRhZzxUPihvYmo6IFQsIGtleToga2V5b2YgVCk6IHZvaWQge1xuICBpZiAoaXNPYmplY3Qob2JqKSkge1xuICAgIGxldCB0YWcgPSB0YWdGb3Iob2JqLCBrZXkpO1xuXG4gICAgaWYgKHRhZyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB1cGRhdGVUYWcob2JqLCBrZXksIGNyZWF0ZVVwZGF0YWJsZVRhZygpKTtcbiAgICB9IGVsc2UgaWYgKGlzQ29uc3RUYWcodGFnKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBCVUc6IENhbid0IHVwZGF0ZSBhIGNvbnN0YW50IHRhZ2ApO1xuICAgIH0gZWxzZSB7XG4gICAgICBkaXJ0eSh0YWcpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEJVRzogQ2FuJ3QgdXBkYXRlIGEgdGFnIGZvciBhIHByaW1pdGl2ZWApO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0YWdGb3I8VCBleHRlbmRzIG9iamVjdD4ob2JqOiBULCBrZXk6IGtleW9mIFQpOiBVcGRhdGFibGVUYWc7XG5leHBvcnQgZnVuY3Rpb24gdGFnRm9yPFQ+KG9iajogVCwga2V5OiBzdHJpbmcpOiBDb25zdGFudFRhZztcbmV4cG9ydCBmdW5jdGlvbiB0YWdGb3I8VD4ob2JqOiBULCBrZXk6IGtleW9mIFQpOiBVcGRhdGFibGVUYWcgfCBDb25zdGFudFRhZyB7XG4gIGlmIChpc09iamVjdChvYmopKSB7XG4gICAgbGV0IHRhZ3MgPSBUUkFDS0VEX1RBR1MuZ2V0KG9iaik7XG5cbiAgICBpZiAodGFncyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0YWdzID0gbmV3IE1hcCgpO1xuICAgICAgVFJBQ0tFRF9UQUdTLnNldChvYmosIHRhZ3MpO1xuICAgIH0gZWxzZSBpZiAodGFncy5oYXMoa2V5KSkge1xuICAgICAgcmV0dXJuIHRhZ3MuZ2V0KGtleSkhO1xuICAgIH1cblxuICAgIGxldCB0YWcgPSBjcmVhdGVVcGRhdGFibGVUYWcoKTtcbiAgICB0YWdzLnNldChrZXksIHRhZyk7XG4gICAgcmV0dXJuIHRhZztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gQ09OU1RBTlRfVEFHO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVUYWc8VD4ob2JqOiBULCBrZXk6IGtleW9mIFQsIG5ld1RhZzogVXBkYXRhYmxlVGFnKTogVXBkYXRhYmxlVGFnIHtcbiAgaWYgKGlzT2JqZWN0KG9iaikpIHtcbiAgICBsZXQgdGFnID0gdGFnRm9yKG9iaiwga2V5KTtcblxuICAgIGlmIChpc0NvbnN0VGFnKHRhZykpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQlVHOiBDYW4ndCB1cGRhdGUgYSBjb25zdGFudCB0YWdgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdXBkYXRlKHRhZywgbmV3VGFnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGFnO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihgQlVHOiBDYW4ndCB1cGRhdGUgYSB0YWcgZm9yIGEgcHJpbWl0aXZlYCk7XG4gIH1cbn1cbiIsImltcG9ydCB7IFRhZywgY29tYmluZSwgQ09OU1RBTlRfVEFHIH0gZnJvbSAnLi92YWxpZGF0b3JzJztcbmltcG9ydCB7IGNyZWF0ZVRhZywgZGlydHkgfSBmcm9tICcuL3ZhbGlkYXRvcnMnO1xuaW1wb3J0IHsgdGFnRm9yLCBkaXJ0eVRhZyB9IGZyb20gJy4vbWV0YSc7XG5cbnR5cGUgT3B0aW9uPFQ+ID0gVCB8IG51bGw7XG5cbi8qKlxuICogV2hlbmV2ZXIgYSB0cmFja2VkIGNvbXB1dGVkIHByb3BlcnR5IGlzIGVudGVyZWQsIHRoZSBjdXJyZW50IHRyYWNrZXIgaXNcbiAqIHNhdmVkIG9mZiBhbmQgYSBuZXcgdHJhY2tlciBpcyByZXBsYWNlZC5cbiAqXG4gKiBBbnkgdHJhY2tlZCBwcm9wZXJ0aWVzIGNvbnN1bWVkIGFyZSBhZGRlZCB0byB0aGUgY3VycmVudCB0cmFja2VyLlxuICpcbiAqIFdoZW4gYSB0cmFja2VkIGNvbXB1dGVkIHByb3BlcnR5IGlzIGV4aXRlZCwgdGhlIHRyYWNrZXIncyB0YWdzIGFyZVxuICogY29tYmluZWQgYW5kIGFkZGVkIHRvIHRoZSBwYXJlbnQgdHJhY2tlci5cbiAqXG4gKiBUaGUgY29uc2VxdWVuY2UgaXMgdGhhdCBlYWNoIHRyYWNrZWQgY29tcHV0ZWQgcHJvcGVydHkgaGFzIGEgdGFnXG4gKiB0aGF0IGNvcnJlc3BvbmRzIHRvIHRoZSB0cmFja2VkIHByb3BlcnRpZXMgY29uc3VtZWQgaW5zaWRlIG9mXG4gKiBpdHNlbGYsIGluY2x1ZGluZyBjaGlsZCB0cmFja2VkIGNvbXB1dGVkIHByb3BlcnRpZXMuXG4gKi9cbmxldCBDVVJSRU5UX1RSQUNLRVI6IE9wdGlvbjxUcmFja2VyPiA9IG51bGw7XG5cbi8qKlxuICogQW4gb2JqZWN0IHRoYXQgdGhhdCB0cmFja3MgQHRyYWNrZWQgcHJvcGVydGllcyB0aGF0IHdlcmUgY29uc3VtZWQuXG4gKi9cbmNsYXNzIFRyYWNrZXIge1xuICBwcml2YXRlIHRhZ3MgPSBuZXcgU2V0PFRhZz4oKTtcbiAgcHJpdmF0ZSBsYXN0OiBPcHRpb248VGFnPiA9IG51bGw7XG5cbiAgYWRkKHRhZzogVGFnKSB7XG4gICAgdGhpcy50YWdzLmFkZCh0YWcpO1xuICAgIHRoaXMubGFzdCA9IHRhZztcbiAgfVxuXG4gIGNvbWJpbmUoKTogVGFnIHtcbiAgICBsZXQgeyB0YWdzIH0gPSB0aGlzO1xuXG4gICAgaWYgKHRhZ3Muc2l6ZSA9PT0gMCkge1xuICAgICAgcmV0dXJuIENPTlNUQU5UX1RBRztcbiAgICB9IGVsc2UgaWYgKHRhZ3Muc2l6ZSA9PT0gMSkge1xuICAgICAgcmV0dXJuIHRoaXMubGFzdCBhcyBUYWc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCB0YWdzQXJyOiBUYWdbXSA9IFtdO1xuICAgICAgdGFncy5mb3JFYWNoKHRhZyA9PiB0YWdzQXJyLnB1c2godGFnKSk7XG4gICAgICByZXR1cm4gY29tYmluZSh0YWdzQXJyKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRyYWNrKGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogVGFnIHtcbiAgbGV0IHBhcmVudCA9IENVUlJFTlRfVFJBQ0tFUjtcbiAgbGV0IGN1cnJlbnQgPSBuZXcgVHJhY2tlcigpO1xuXG4gIENVUlJFTlRfVFJBQ0tFUiA9IGN1cnJlbnQ7XG5cbiAgdHJ5IHtcbiAgICBjYWxsYmFjaygpO1xuICB9IGZpbmFsbHkge1xuICAgIENVUlJFTlRfVFJBQ0tFUiA9IHBhcmVudDtcbiAgfVxuXG4gIHJldHVybiBjdXJyZW50LmNvbWJpbmUoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnN1bWUodGFnOiBUYWcpIHtcbiAgaWYgKENVUlJFTlRfVFJBQ0tFUiAhPT0gbnVsbCkge1xuICAgIENVUlJFTlRfVFJBQ0tFUi5hZGQodGFnKTtcbiAgfVxufVxuXG4vLy8vLy8vLy8vXG5cbmV4cG9ydCBjb25zdCBFUE9DSCA9IGNyZWF0ZVRhZygpO1xuXG5leHBvcnQgdHlwZSBHZXR0ZXI8VCwgSyBleHRlbmRzIGtleW9mIFQ+ID0gKHNlbGY6IFQpID0+IFRbS10gfCB1bmRlZmluZWQ7XG5leHBvcnQgdHlwZSBTZXR0ZXI8VCwgSyBleHRlbmRzIGtleW9mIFQ+ID0gKHNlbGY6IFQsIHZhbHVlOiBUW0tdKSA9PiB2b2lkO1xuXG5leHBvcnQgZnVuY3Rpb24gdHJhY2tlZERhdGE8VCBleHRlbmRzIG9iamVjdCwgSyBleHRlbmRzIGtleW9mIFQ+KFxuICBrZXk6IEssXG4gIGluaXRpYWxpemVyPzogKCkgPT4gVFtLXVxuKTogeyBnZXR0ZXI6IEdldHRlcjxULCBLPjsgc2V0dGVyOiBTZXR0ZXI8VCwgSz4gfSB7XG4gIGxldCB2YWx1ZXMgPSBuZXcgV2Vha01hcDxULCBUW0tdPigpO1xuICBsZXQgaGFzSW5pdGlhbGl6ZXIgPSB0eXBlb2YgaW5pdGlhbGl6ZXIgPT09ICdmdW5jdGlvbic7XG5cbiAgZnVuY3Rpb24gZ2V0dGVyKHNlbGY6IFQpIHtcbiAgICBjb25zdW1lKHRhZ0ZvcihzZWxmLCBrZXkpKTtcblxuICAgIGxldCB2YWx1ZTtcblxuICAgIC8vIElmIHRoZSBmaWVsZCBoYXMgbmV2ZXIgYmVlbiBpbml0aWFsaXplZCwgd2Ugc2hvdWxkIGluaXRpYWxpemUgaXRcbiAgICBpZiAoaGFzSW5pdGlhbGl6ZXIgJiYgIXZhbHVlcy5oYXMoc2VsZikpIHtcbiAgICAgIHZhbHVlID0gaW5pdGlhbGl6ZXIhKCk7XG4gICAgICB2YWx1ZXMuc2V0KHNlbGYsIHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgPSB2YWx1ZXMuZ2V0KHNlbGYpO1xuICAgIH1cblxuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldHRlcihzZWxmOiBULCB2YWx1ZTogVFtLXSk6IHZvaWQge1xuICAgIGRpcnR5KEVQT0NIKTtcbiAgICBkaXJ0eVRhZyhzZWxmLCBrZXkpO1xuICAgIHZhbHVlcy5zZXQoc2VsZiwgdmFsdWUpO1xuICB9XG5cbiAgcmV0dXJuIHsgZ2V0dGVyLCBzZXR0ZXIgfTtcbn1cbiJdLCJuYW1lcyI6WyJfY29tYmluZSIsInZhbHVlIl0sIm1hcHBpbmdzIjoiOzs7O0lBV0EsSUFBTSxTQUNKLE9BQUEsTUFBQSxLQUFBLFdBQUEsR0FBQSxNQUFBLEdBRUk7SUFBQSxrQkFBc0IsR0FBdEIsR0FBNEIsS0FBQSxLQUFBLENBQVcsS0FBQSxNQUFBLEtBQWdCLEtBSDdELEdBRzZELEVBQTNCLENBQTVCO0lBQUEsQ0FITjtBQVNBLFFBQWEsV0FBTixDQUFBO0FBQ1AsUUFBYSxVQUFOLENBQUE7QUFDUCxRQUFhLFdBQU4sZ0JBQUE7SUFFUCxJQUFJLFlBQUosT0FBQTtBQUVBLElBQU0sU0FBQSxJQUFBLEdBQWM7SUFDbEI7SUFDRDtJQUVEO0FBRUEsUUFBYSxVQUF5QixPQUEvQixhQUErQixDQUEv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