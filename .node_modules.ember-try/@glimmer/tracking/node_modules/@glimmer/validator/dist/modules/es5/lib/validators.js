function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var symbol = typeof Symbol !== 'undefined' ? Symbol : function (key) {
    return '__' + key + Math.floor(Math.random() * Date.now()) + '__';
};
export var CONSTANT = 0;
export var INITIAL = 1;
export var VOLATILE = 9007199254740991; // MAX_INT
var $REVISION = INITIAL;
export function bump() {
    $REVISION++;
}
//////////
export var COMPUTE = symbol('TAG_COMPUTE');
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
export function value(_tag) {
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
export function validate(tag, snapshot) {
    return snapshot >= tag[COMPUTE]();
}
var TYPE = symbol('TAG_TYPE');
export var ALLOW_CYCLES = void 0;
if (false) {
    ALLOW_CYCLES = new WeakSet();
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

export var dirty = MonomorphicTagImpl.dirty;
export var update = MonomorphicTagImpl.update;
//////////
export function createTag() {
    return new MonomorphicTagImpl(0 /* Dirtyable */);
}
export function createUpdatableTag() {
    return new MonomorphicTagImpl(1 /* Updatable */);
}
//////////
export var CONSTANT_TAG = new MonomorphicTagImpl(3 /* Constant */);
export function isConst(_ref) {
    var tag = _ref.tag;

    return tag === CONSTANT_TAG;
}
export function isConstTag(tag) {
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

export var VOLATILE_TAG = new VolatileTag();
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

export var CURRENT_TAG = new CurrentTag();
//////////
export function combine(tags) {
    var optimized = [];
    for (var i = 0, l = tags.length; i < l; i++) {
        var tag = tags[i];
        if (tag === CONSTANT_TAG) continue;
        optimized.push(tag);
    }
    return createCombinatorTag(optimized);
}
export function createCombinatorTag(tags) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3ZhbGlkYXRvci9saWIvdmFsaWRhdG9ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQVdBLElBQU0sU0FDSixPQUFBLE1BQUEsS0FBQSxXQUFBLEdBQUEsTUFBQSxHQUVJO0FBQUEsa0JBQXNCLEdBQXRCLEdBQTRCLEtBQUEsS0FBQSxDQUFXLEtBQUEsTUFBQSxLQUFnQixLQUg3RCxHQUc2RCxFQUEzQixDQUE1QjtBQUFBLENBSE47QUFTQSxPQUFPLElBQU0sV0FBTixDQUFBO0FBQ1AsT0FBTyxJQUFNLFVBQU4sQ0FBQTtBQUNQLE9BQU8sSUFBTSxXQUFOLGdCQUFBLEMsQ0FBNkM7QUFFcEQsSUFBSSxZQUFKLE9BQUE7QUFFQSxPQUFNLFNBQUEsSUFBQSxHQUFjO0FBQ2xCO0FBQ0Q7QUFFRDtBQUVBLE9BQU8sSUFBTSxVQUF5QixPQUEvQixhQUErQixDQUEvQjtBQWdCUDtBQUVBOzs7Ozs7Ozs7Ozs7OztBQWNBLE9BQU0sU0FBQSxLQUFBLENBQUEsSUFBQSxFQUF5QjtBQUM3QixXQUFBLFNBQUE7QUFDRDtBQUVEOzs7Ozs7Ozs7O0FBVUEsT0FBTSxTQUFBLFFBQUEsQ0FBQSxHQUFBLEVBQUEsUUFBQSxFQUErQztBQUNuRCxXQUFPLFlBQVksSUFBbkIsT0FBbUIsR0FBbkI7QUFDRDtBQWlCRCxJQUFNLE9BQXNCLE9BQTVCLFVBQTRCLENBQTVCO0FBRUEsT0FBTyxJQUFBLHFCQUFBO0FBRVAsSUFBQSxLQUFBLEVBQVc7QUFDVCxtQkFBZSxJQUFmLE9BQWUsRUFBZjtBQUNEOztJQXFCRCxrQjtBQVdFLGdDQUFBLElBQUEsRUFBcUM7QUFBQTs7QUFWN0IsYUFBQSxRQUFBLEdBQUEsT0FBQTtBQUNBLGFBQUEsV0FBQSxHQUFBLE9BQUE7QUFDQSxhQUFBLFNBQUEsR0FBQSxPQUFBO0FBRUEsYUFBQSxVQUFBLEdBQUEsS0FBQTtBQUNBLGFBQUEsTUFBQSxHQUFBLElBQUE7QUFDQSxhQUFBLE9BQUEs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QWpDLEdBQWlDOztBQUNyQyxXQUFPLFFBQVAsWUFBQTtBQUNEO0FBRUQsT0FBTSxTQUFBLFVBQUEsQ0FBQSxHQUFBLEVBQTZCO0FBQ2pDLFdBQU8sUUFBUCxZQUFBO0FBQ0Q7QUFFRDs7SUFFQSxXOzs7OzswQkFDRSxPLGdCQUFTO0FBQ1AsZUFBQSxRQUFBO0FBQ0QsSzs7Ozs7QUFHSCxPQUFPLElBQU0sZUFBZSxJQUFyQixXQUFxQixFQUFyQjtBQUVQOztJQUVBLFU7Ozs7O3lCQUNFLE8sZ0JBQVM7QUFDUCxlQUFBLFNBQUE7QUFDRCxLOzs7OztBQUdILE9BQU8sSUFBTSxjQUFjLElBQXBCLFVBQW9CLEVBQXBCO0FBRVA7QUFFQSxPQUFNLFNBQUEsT0FBQSxDQUFBLElBQUEsRUFBNkI7QUFDakMsUUFBSSxZQUFKLEVBQUE7QUFFQSxTQUFLLElBQUksSUFBSixDQUFBLEVBQVcsSUFBSSxLQUFwQixNQUFBLEVBQWlDLElBQWpDLENBQUEsRUFBQSxHQUFBLEVBQTZDO0FBQzNDLFlBQUksTUFBTSxLQUFWLENBQVUsQ0FBVjtBQUNBLFlBQUksUUFBSixZQUFBLEVBQTBCO0FBQzFCLGtCQUFBLElBQUEsQ0FBQSxHQUFBO0FBQ0Q7QUFFRCxXQUFPLG9CQUFQLFNBQU8sQ0FBUDtBQUNEO0FBRUQsT0FBTSxTQUFBLG1CQUFBLENBQUEsSUFBQSxFQUF5QztBQUM3QyxZQUFRLEtBQVIsTUFBQTtBQUNFLGFBQUEsQ0FBQTtBQUNFLG1CQUFBLFlBQUE7QUFDRixhQUFBLENBQUE7QUFDRSxtQkFBTyxLQUFQLENBQU8sQ0FBUDtBQUNGO0FBQ0UsZ0JBQUksTUFBTSxJQUFBLGtCQUFBLENBQUEsQ0FBQSxDQUFWLGdCQUFVLENBQVY7QUFDQyxnQkFBQSxPQUFBLEdBQUEsSUFBQTtBQUNELG1CQUFBLEdBQUE7QUFSSjtBQVVEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgREVCVUcgfSBmcm9tICdAZ2xpbW1lci9sb2NhbC1kZWJ1Zy1mbGFncyc7XG5cbi8vLy8vLy8vLy9cblxuLy8gdXRpbHNcbnR5cGUgVW5pb25Ub0ludGVyc2VjdGlvbjxVPiA9IChVIGV4dGVuZHMgYW55ID8gKGs6IFUpID0+IHZvaWQgOiBuZXZlcikgZXh0ZW5kcyAoKFxuICBrOiBpbmZlciBJXG4pID0+IHZvaWQpXG4gID8gSVxuICA6IG5ldmVyO1xuXG5jb25zdCBzeW1ib2wgPVxuICB0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJ1xuICAgID8gU3ltYm9sXG4gICAgOiAoa2V5OiBzdHJpbmcpID0+IGBfXyR7a2V5fSR7TWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogRGF0ZS5ub3coKSl9X19gIGFzIGFueTtcblxuLy8vLy8vLy8vL1xuXG5leHBvcnQgdHlwZSBSZXZpc2lvbiA9IG51bWJlcjtcblxuZXhwb3J0IGNvbnN0IENPTlNUQU5UOiBSZXZpc2lvbiA9IDA7XG5leHBvcnQgY29uc3QgSU5JVElBTDogUmV2aXNpb24gPSAxO1xuZXhwb3J0IGNvbnN0IFZPTEFUSUxFOiBSZXZpc2lvbiA9IDkwMDcxOTkyNTQ3NDA5OTE7IC8vIE1BWF9JTlRcblxubGV0ICRSRVZJU0lPTiA9IElOSVRJQUw7XG5cbmV4cG9ydCBmdW5jdGlvbiBidW1wKCkge1xuICAkUkVWSVNJT04rKztcbn1cblxuLy8vLy8vLy8vL1xuXG5leHBvcnQgY29uc3QgQ09NUFVURTogdW5pcXVlIHN5bWJvbCA9IHN5bWJvbCgnVEFHX0NPTVBVVEUnKTtcblxuZXhwb3J0IGludGVyZmFjZSBFbnRpdHlUYWc8VD4ge1xuICBbQ09NUFVURV0oKTogVDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBUYWcgZXh0ZW5kcyBFbnRpdHlUYWc8UmV2aXNpb24+IHt9XG5cbmV4cG9ydCBpbnRlcmZhY2UgRW50aXR5VGFnZ2VkPFQ+IHtcbiAgdGFnOiBFbnRpdHlUYWc8VD47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGFnZ2VkIHtcbiAgdGFnOiBUYWc7XG59XG5cbi8vLy8vLy8vLy9cblxuLyoqXG4gKiBgdmFsdWVgIHJlY2VpdmVzIGEgdGFnIGFuZCByZXR1cm5zIGFuIG9wYXF1ZSBSZXZpc2lvbiBiYXNlZCBvbiB0aGF0IHRhZy4gVGhpc1xuICogc25hcHNob3QgY2FuIHRoZW4gbGF0ZXIgYmUgcGFzc2VkIHRvIGB2YWxpZGF0ZWAgd2l0aCB0aGUgc2FtZSB0YWcgdG9cbiAqIGRldGVybWluZSBpZiB0aGUgdGFnIGhhcyBjaGFuZ2VkIGF0IGFsbCBzaW5jZSB0aGUgdGltZSB0aGF0IGB2YWx1ZWAgd2FzXG4gKiBjYWxsZWQuXG4gKlxuICogVGhlIGN1cnJlbnQgaW1wbGVtZW50YXRpb24gcmV0dXJucyB0aGUgZ2xvYmFsIHJldmlzaW9uIGNvdW50IGRpcmVjdGx5IGZvclxuICogcGVyZm9ybWFuY2UgcmVhc29ucy4gVGhpcyBpcyBhbiBpbXBsZW1lbnRhdGlvbiBkZXRhaWwsIGFuZCBzaG91bGQgbm90IGJlXG4gKiByZWxpZWQgb24gZGlyZWN0bHkgYnkgdXNlcnMgb2YgdGhlc2UgQVBJcy4gSW5zdGVhZCwgUmV2aXNpb25zIHNob3VsZCBiZVxuICogdHJlYXRlZCBhcyBpZiB0aGV5IGFyZSBvcGFxdWUvdW5rbm93biwgYW5kIHNob3VsZCBvbmx5IGJlIGludGVyYWN0ZWQgd2l0aCB2aWFcbiAqIHRoZSBgdmFsdWVgL2B2YWxpZGF0ZWAgQVBJLlxuICpcbiAqIEBwYXJhbSB0YWdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbHVlKF90YWc6IFRhZyk6IFJldmlzaW9uIHtcbiAgcmV0dXJuICRSRVZJU0lPTjtcbn1cblxuLyoqXG4gKiBgdmFsaWRhdGVgIHJlY2VpdmVzIGEgdGFnIGFuZCBhIHNuYXBzaG90IGZyb20gYSBwcmV2aW91cyBjYWxsIHRvIGB2YWx1ZWAgd2l0aFxuICogdGhlIHNhbWUgdGFnLCBhbmQgZGV0ZXJtaW5lcyBpZiB0aGUgdGFnIGlzIHN0aWxsIHZhbGlkIGNvbXBhcmVkIHRvIHRoZVxuICogc25hcHNob3QuIElmIHRoZSB0YWcncyBzdGF0ZSBoYXMgY2hhbmdlZCBhdCBhbGwgc2luY2UgdGhlbiwgYHZhbGlkYXRlYCB3aWxsXG4gKiByZXR1cm4gZmFsc2UsIG90aGVyd2lzZSBpdCB3aWxsIHJldHVybiB0cnVlLiBUaGlzIGlzIHVzZWQgdG8gZGV0ZXJtaW5lIGlmIGFcbiAqIGNhbGN1bGF0aW9uIHJlbGF0ZWQgdG8gdGhlIHRhZ3Mgc2hvdWxkIGJlIHJlcnVuLlxuICpcbiAqIEBwYXJhbSB0YWdcbiAqIEBwYXJhbSBzbmFwc2hvdFxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGUodGFnOiBUYWcsIHNuYXBzaG90OiBSZXZpc2lvbikge1xuICByZXR1cm4gc25hcHNob3QgPj0gdGFnW0NPTVBVVEVdKCk7XG59XG5cbi8vLy8vLy8vLy9cblxuLyoqXG4gKiBUaGlzIGVudW0gcmVwcmVzZW50cyBhbGwgb2YgdGhlIHBvc3NpYmxlIHRhZyB0eXBlcyBmb3IgdGhlIG1vbm9tb3JwaGljIHRhZyBjbGFzcy5cbiAqIE90aGVyIGN1c3RvbSB0YWcgY2xhc3NlcyBjYW4gZXhpc3QsIHN1Y2ggYXMgQ3VycmVudFRhZyBhbmQgVm9sYXRpbGVUYWcsIGJ1dCBmb3JcbiAqIHBlcmZvcm1hbmNlIHJlYXNvbnMsIGFueSB0eXBlIG9mIHRhZyB0aGF0IGlzIG1lYW50IHRvIGJlIHVzZWQgZnJlcXVlbnRseSBzaG91bGRcbiAqIGJlIGFkZGVkIHRvIHRoZSBtb25vbW9ycGhpYyB0YWcuXG4gKi9cbmNvbnN0IGVudW0gTW9ub21vcnBoaWNUYWdUeXBlcyB7XG4gIERpcnR5YWJsZSxcbiAgVXBkYXRhYmxlLFxuICBDb21iaW5hdG9yLFxuICBDb25zdGFudCxcbn1cblxuY29uc3QgVFlQRTogdW5pcXVlIHN5bWJvbCA9IHN5bWJvbCgnVEFHX1RZUEUnKTtcblxuZXhwb3J0IGxldCBBTExPV19DWUNMRVM6IFdlYWtTZXQ8VXBkYXRhYmxlVGFnPjtcblxuaWYgKERFQlVHKSB7XG4gIEFMTE9XX0NZQ0xFUyA9IG5ldyBXZWFrU2V0KCk7XG59XG5cbmludGVyZmFjZSBNb25vbW9ycGhpY1RhZ0Jhc2U8VCBleHRlbmRzIE1vbm9tb3JwaGljVGFnVHlwZXM+IGV4dGVuZHMgVGFnIHtcbiAgW1RZUEVdOiBUO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERpcnR5YWJsZVRhZyBleHRlbmRzIE1vbm9tb3JwaGljVGFnQmFzZTxNb25vbW9ycGhpY1RhZ1R5cGVzLkRpcnR5YWJsZT4ge31cbmV4cG9ydCBpbnRlcmZhY2UgVXBkYXRhYmxlVGFnIGV4dGVuZHMgTW9ub21vcnBoaWNUYWdCYXNlPE1vbm9tb3JwaGljVGFnVHlwZXMuVXBkYXRhYmxlPiB7fVxuZXhwb3J0IGludGVyZmFjZSBDb21iaW5hdG9yVGFnIGV4dGVuZHMgTW9ub21vcnBoaWNUYWdCYXNlPE1vbm9tb3JwaGljVGFnVHlwZXMuQ29tYmluYXRvcj4ge31cbmV4cG9ydCBpbnRlcmZhY2UgQ29uc3RhbnRUYWcgZXh0ZW5kcyBNb25vbW9ycGhpY1RhZ0Jhc2U8TW9ub21vcnBoaWNUYWdUeXBlcy5Db25zdGFudD4ge31cblxuaW50ZXJmYWNlIE1vbm9tb3JwaGljVGFnTWFwcGluZyB7XG4gIFtNb25vbW9ycGhpY1RhZ1R5cGVzLkRpcnR5YWJsZV06IERpcnR5YWJsZVRhZztcbiAgW01vbm9tb3JwaGljVGFnVHlwZXMuVXBkYXRhYmxlXTogVXBkYXRhYmxlVGFnO1xuICBbTW9ub21vcnBoaWNUYWdUeXBlcy5Db21iaW5hdG9yXTogQ29tYmluYXRvclRhZztcbiAgW01vbm9tb3JwaGljVGFnVHlwZXMuQ29uc3RhbnRdOiBDb25zdGFudFRhZztcbn1cblxudHlwZSBNb25vbW9ycGhpY1RhZyA9IFVuaW9uVG9JbnRlcnNlY3Rpb248TW9ub21vcnBoaWNUYWdNYXBwaW5nW01vbm9tb3JwaGljVGFnVHlwZXNdPjtcbnR5cGUgTW9ub21vcnBoaWNUYWdUeXBlID0gVW5pb25Ub0ludGVyc2VjdGlvbjxNb25vbW9ycGhpY1RhZ1R5cGVzPjtcblxuY2xhc3MgTW9ub21vcnBoaWNUYWdJbXBsIGltcGxlbWVudHMgTW9ub21vcnBoaWNUYWcge1xuICBwcml2YXRlIHJldmlzaW9uID0gSU5JVElBTDtcbiAgcHJpdmF0ZSBsYXN0Q2hlY2tlZCA9IElOSVRJQUw7XG4gIHByaXZhdGUgbGFzdFZhbHVlID0gSU5JVElBTDtcblxuICBwcml2YXRlIGlzVXBkYXRpbmcgPSBmYWxzZTtcbiAgcHJpdmF0ZSBzdWJ0YWc6IFRhZyB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHN1YnRhZ3M6IFRhZ1tdIHwgbnVsbCA9IG51bGw7XG5cbiAgW1RZUEVdOiBNb25vbW9ycGhpY1RhZ1R5cGU7XG5cbiAgY29uc3RydWN0b3IodHlwZTogTW9ub21vcnBoaWNUYWdUeXBlcykge1xuICAgIHRoaXNbVFlQRV0gPSB0eXBlIGFzIE1vbm9tb3JwaGljVGFnVHlwZTtcbiAgfVxuXG4gIFtDT01QVVRFXSgpOiBSZXZpc2lvbiB7XG4gICAgbGV0IHsgbGFzdENoZWNrZWQgfSA9IHRoaXM7XG5cbiAgICBpZiAobGFzdENoZWNrZWQgIT09ICRSRVZJU0lPTikge1xuICAgICAgdGhpcy5pc1VwZGF0aW5nID0gdHJ1ZTtcbiAgICAgIHRoaXMubGFzdENoZWNrZWQgPSAkUkVWSVNJT047XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGxldCB7IHN1YnRhZ3MsIHN1YnRhZywgcmV2aXNpb24gfSA9IHRoaXM7XG5cbiAgICAgICAgaWYgKHN1YnRhZyAhPT0gbnVsbCkge1xuICAgICAgICAgIHJldmlzaW9uID0gTWF0aC5tYXgocmV2aXNpb24sIHN1YnRhZ1tDT01QVVRFXSgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzdWJ0YWdzICE9PSBudWxsKSB7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdWJ0YWdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSBzdWJ0YWdzW2ldW0NPTVBVVEVdKCk7XG4gICAgICAgICAgICByZXZpc2lvbiA9IE1hdGgubWF4KHZhbHVlLCByZXZpc2lvbik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5sYXN0VmFsdWUgPSByZXZpc2lvbjtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHRoaXMuaXNVcGRhdGluZyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmlzVXBkYXRpbmcgPT09IHRydWUpIHtcbiAgICAgIGlmIChERUJVRyAmJiAhQUxMT1dfQ1lDTEVTLmhhcyh0aGlzKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0N5Y2xlcyBpbiB0YWdzIGFyZSBub3QgYWxsb3dlZCcpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmxhc3RDaGVja2VkID0gKyskUkVWSVNJT047XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMubGFzdFZhbHVlO1xuICB9XG5cbiAgc3RhdGljIHVwZGF0ZShfdGFnOiBVcGRhdGFibGVUYWcsIHN1YnRhZzogVGFnKSB7XG4gICAgaWYgKERFQlVHICYmIF90YWdbVFlQRV0gIT09IE1vbm9tb3JwaGljVGFnVHlwZXMuVXBkYXRhYmxlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0F0dGVtcHRlZCB0byB1cGRhdGUgYSB0YWcgdGhhdCB3YXMgbm90IHVwZGF0YWJsZScpO1xuICAgIH1cblxuICAgIC8vIFRPRE86IFRTIDMuNyBzaG91bGQgYWxsb3cgdXMgdG8gZG8gdGhpcyB2aWEgYXNzZXJ0aW9uXG4gICAgbGV0IHRhZyA9IF90YWcgYXMgTW9ub21vcnBoaWNUYWdJbXBsO1xuXG4gICAgaWYgKHN1YnRhZyA9PT0gQ09OU1RBTlRfVEFHKSB7XG4gICAgICB0YWcuc3VidGFnID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGFnLnN1YnRhZyA9IHN1YnRhZztcblxuICAgICAgLy8gc3VidGFnIGNvdWxkIGJlIGFub3RoZXIgdHlwZSBvZiB0YWcsIGUuZy4gQ1VSUkVOVF9UQUcgb3IgVk9MQVRJTEVfVEFHLlxuICAgICAgLy8gSWYgc28sIGxhc3RDaGVja2VkL2xhc3RWYWx1ZSB3aWxsIGJlIHVuZGVmaW5lZCwgcmVzdWx0IGluIHRoZXNlIGJlaW5nXG4gICAgICAvLyBOYU4uIFRoaXMgaXMgZmluZSwgaXQgd2lsbCBmb3JjZSB0aGUgc3lzdGVtIHRvIHJlY29tcHV0ZS5cbiAgICAgIHRhZy5sYXN0Q2hlY2tlZCA9IE1hdGgubWluKHRhZy5sYXN0Q2hlY2tlZCwgKHN1YnRhZyBhcyBhbnkpLmxhc3RDaGVja2VkKTtcbiAgICAgIHRhZy5sYXN0VmFsdWUgPSBNYXRoLm1heCh0YWcubGFzdFZhbHVlLCAoc3VidGFnIGFzIGFueSkubGFzdFZhbHVlKTtcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgZGlydHkodGFnOiBEaXJ0eWFibGVUYWcgfCBVcGRhdGFibGVUYWcpIHtcbiAgICBpZiAoXG4gICAgICBERUJVRyAmJlxuICAgICAgISh0YWdbVFlQRV0gPT09IE1vbm9tb3JwaGljVGFnVHlwZXMuVXBkYXRhYmxlIHx8IHRhZ1tUWVBFXSA9PT0gTW9ub21vcnBoaWNUYWdUeXBlcy5EaXJ0eWFibGUpXG4gICAgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0F0dGVtcHRlZCB0byBkaXJ0eSBhIHRhZyB0aGF0IHdhcyBub3QgZGlydHlhYmxlJyk7XG4gICAgfVxuXG4gICAgKHRhZyBhcyBNb25vbW9ycGhpY1RhZ0ltcGwpLnJldmlzaW9uID0gKyskUkVWSVNJT047XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGRpcnR5ID0gTW9ub21vcnBoaWNUYWdJbXBsLmRpcnR5O1xuZXhwb3J0IGNvbnN0IHVwZGF0ZSA9IE1vbm9tb3JwaGljVGFnSW1wbC51cGRhdGU7XG5cbi8vLy8vLy8vLy9cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVRhZygpOiBEaXJ0eWFibGVUYWcge1xuICByZXR1cm4gbmV3IE1vbm9tb3JwaGljVGFnSW1wbChNb25vbW9ycGhpY1RhZ1R5cGVzLkRpcnR5YWJsZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVVcGRhdGFibGVUYWcoKTogVXBkYXRhYmxlVGFnIHtcbiAgcmV0dXJuIG5ldyBNb25vbW9ycGhpY1RhZ0ltcGwoTW9ub21vcnBoaWNUYWdUeXBlcy5VcGRhdGFibGUpO1xufVxuXG4vLy8vLy8vLy8vXG5cbmV4cG9ydCBjb25zdCBDT05TVEFOVF9UQUcgPSBuZXcgTW9ub21vcnBoaWNUYWdJbXBsKE1vbm9tb3JwaGljVGFnVHlwZXMuQ29uc3RhbnQpIGFzIENvbnN0YW50VGFnO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNDb25zdCh7IHRhZyB9OiBUYWdnZWQpOiBib29sZWFuIHtcbiAgcmV0dXJuIHRhZyA9PT0gQ09OU1RBTlRfVEFHO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNDb25zdFRhZyh0YWc6IFRhZyk6IHRhZyBpcyBDb25zdGFudFRhZyB7XG4gIHJldHVybiB0YWcgPT09IENPTlNUQU5UX1RBRztcbn1cblxuLy8vLy8vLy8vL1xuXG5jbGFzcyBWb2xhdGlsZVRhZyBpbXBsZW1lbnRzIFRhZyB7XG4gIFtDT01QVVRFXSgpIHtcbiAgICByZXR1cm4gVk9MQVRJTEU7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IFZPTEFUSUxFX1RBRyA9IG5ldyBWb2xhdGlsZVRhZygpO1xuXG4vLy8vLy8vLy8vXG5cbmNsYXNzIEN1cnJlbnRUYWcgaW1wbGVtZW50cyBDdXJyZW50VGFnIHtcbiAgW0NPTVBVVEVdKCkge1xuICAgIHJldHVybiAkUkVWSVNJT047XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IENVUlJFTlRfVEFHID0gbmV3IEN1cnJlbnRUYWcoKTtcblxuLy8vLy8vLy8vL1xuXG5leHBvcnQgZnVuY3Rpb24gY29tYmluZSh0YWdzOiBUYWdbXSk6IFRhZyB7XG4gIGxldCBvcHRpbWl6ZWQ6IFRhZ1tdID0gW107XG5cbiAgZm9yIChsZXQgaSA9IDAsIGwgPSB0YWdzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGxldCB0YWcgPSB0YWdzW2ldO1xuICAgIGlmICh0YWcgPT09IENPTlNUQU5UX1RBRykgY29udGludWU7XG4gICAgb3B0aW1pemVkLnB1c2godGFnKTtcbiAgfVxuXG4gIHJldHVybiBjcmVhdGVDb21iaW5hdG9yVGFnKG9wdGltaXplZCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDb21iaW5hdG9yVGFnKHRhZ3M6IFRhZ1tdKTogVGFnIHtcbiAgc3dpdGNoICh0YWdzLmxlbmd0aCkge1xuICAgIGNhc2UgMDpcbiAgICAgIHJldHVybiBDT05TVEFOVF9UQUc7XG4gICAgY2FzZSAxOlxuICAgICAgcmV0dXJuIHRhZ3NbMF07XG4gICAgZGVmYXVsdDpcbiAgICAgIGxldCB0YWcgPSBuZXcgTW9ub21vcnBoaWNUYWdJbXBsKE1vbm9tb3JwaGljVGFnVHlwZXMuQ29tYmluYXRvcikgYXMgQ29tYmluYXRvclRhZztcbiAgICAgICh0YWcgYXMgYW55KS5zdWJ0YWdzID0gdGFncztcbiAgICAgIHJldHVybiB0YWc7XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=