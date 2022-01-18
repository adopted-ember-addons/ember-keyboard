define('@glimmer/reference', ['exports', '@glimmer/util'], function (exports, util) { 'use strict';

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

    function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    var CachedReference = function () {
        function CachedReference() {
            _classCallCheck$1(this, CachedReference);

            this.lastRevision = null;
            this.lastValue = null;
        }

        CachedReference.prototype.value = function value$$1() {
            var tag = this.tag,
                lastRevision = this.lastRevision,
                lastValue = this.lastValue;

            if (lastRevision === null || !validate(tag, lastRevision)) {
                lastValue = this.lastValue = this.compute();
                this.lastRevision = value(tag);
            }
            return lastValue;
        };

        CachedReference.prototype.invalidate = function invalidate() {
            this.lastRevision = null;
        };

        return CachedReference;
    }();
    //////////
    var ReferenceCache = function () {
        function ReferenceCache(reference) {
            _classCallCheck$1(this, ReferenceCache);

            this.lastValue = null;
            this.lastRevision = null;
            this.initialized = false;
            this.tag = reference.tag;
            this.reference = reference;
        }

        ReferenceCache.prototype.peek = function peek() {
            if (!this.initialized) {
                return this.initialize();
            }
            return this.lastValue;
        };

        ReferenceCache.prototype.revalidate = function revalidate() {
            if (!this.initialized) {
                return this.initialize();
            }
            var reference = this.reference,
                lastRevision = this.lastRevision;

            var tag = reference.tag;
            if (validate(tag, lastRevision)) return NOT_MODIFIED;
            this.lastRevision = value(tag);
            var lastValue = this.lastValue;

            var currentValue = reference.value();
            if (currentValue === lastValue) return NOT_MODIFIED;
            this.lastValue = currentValue;
            return currentValue;
        };

        ReferenceCache.prototype.initialize = function initialize() {
            var reference = this.reference;

            var currentValue = this.lastValue = reference.value();
            this.lastRevision = value(reference.tag);
            this.initialized = true;
            return currentValue;
        };

        return ReferenceCache;
    }();
    var NOT_MODIFIED = 'adb3b78e-3d22-4e4b-877a-6317c2c5c145';
    function isModified(value$$1) {
        return value$$1 !== NOT_MODIFIED;
    }

    var TRACKED_TAGS = new WeakMap();
    function dirtyTag(obj, key) {
        if (util.isObject(obj)) {
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
        if (util.isObject(obj)) {
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
        if (util.isObject(obj)) {
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

    function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var PrivateImpl = function () {
        function PrivateImpl() {
            _classCallCheck$2(this, PrivateImpl);

            this.inner = undefined;
        }

        PrivateImpl.prototype.get = function get() {
            return this.inner;
        };

        PrivateImpl.prototype.set = function set(value$$1) {
            this.inner = value$$1;
        };

        return PrivateImpl;
    }();

    var PRIVATES = new WeakMap();
    function privateFor(object, key) {
        var privates = void 0;
        if (PRIVATES.has(object)) {
            privates = PRIVATES.get(object);
        } else {
            privates = util.dict();
            PRIVATES.set(object, privates);
        }
        if (key in privates) {
            return privates[key];
        } else {
            var p = new PrivateImpl();
            privates[key] = p;
            return p;
        }
    }
    var EPOCH = createTag();
    function setStateFor(object, key, value$$1) {
        dirty(EPOCH);
        dirtyTag(object, key);
        privateFor(object, key).set(value$$1);
    }
    function getStateFor(object, key) {
        return privateFor(object, key).get();
    }

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _classCallCheck$3(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var Tracker = function () {
        function Tracker() {
            _classCallCheck$3(this, Tracker);

            this.tags = new Set();
            this.last = null;
        }

        Tracker.prototype.add = function add(tag) {
            this.tags.add(tag);
            this.last = tag;
        };

        Tracker.prototype.combine = function combine$$1() {
            var tags = this.tags;

            var tag = createUpdatableTag();
            if (tags.size === 1) {
                update(tag, this.last);
            } else if (tags.size > 1) {
                var _tags = [];
                this.tags.forEach(function (tag) {
                    return _tags.push(tag);
                });
                update(tag, combine(_tags));
            }
            return tag;
        };

        _createClass(Tracker, [{
            key: 'size',
            get: function get() {
                return this.tags.size;
            }
        }]);

        return Tracker;
    }();

    function pushTrackFrame() {
        var old = CURRENT_TRACKER;
        var tracker = new Tracker();
        CURRENT_TRACKER = tracker;
        return old;
    }
    function popTrackFrame(old) {
        var tag = CURRENT_TRACKER.combine();
        CURRENT_TRACKER = old;
        if (CURRENT_TRACKER) CURRENT_TRACKER.add(tag);
        return tag;
    }
    var CURRENT_TRACKER = null;
    function trackedData(key) {
        function getter(self) {
            if (CURRENT_TRACKER) CURRENT_TRACKER.add(tagFor(self, key));
            return getStateFor(self, key);
        }
        function setter(self, value$$1) {
            setStateFor(self, key, value$$1);
        }
        return { getter: getter, setter: setter };
    }

    function _classCallCheck$4(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    var RootReference = function () {
        function RootReference(inner) {
            _classCallCheck$4(this, RootReference);

            this.inner = inner;
            this.children = util.dict();
            this.tag = CONSTANT_TAG;
        }

        RootReference.prototype.value = function value$$1() {
            return this.inner;
        };

        RootReference.prototype.get = function get(propertyKey) {
            var ref = this.children[propertyKey];
            if (!ref) {
                ref = this.children[propertyKey] = new RootPropertyReference(this.inner, propertyKey);
            }
            return ref;
        };

        return RootReference;
    }();
    var ImmutableRootReference = function () {
        function ImmutableRootReference(inner) {
            _classCallCheck$4(this, ImmutableRootReference);

            this.inner = inner;
            this.children = util.dict();
            this.tag = CONSTANT_TAG;
        }

        ImmutableRootReference.prototype.value = function value$$1() {
            return this.inner;
        };

        ImmutableRootReference.prototype.get = function get(propertyKey) {
            var ref = this.children[propertyKey];
            if (!ref) {
                ref = this.children[propertyKey] = new RootPropertyReference(this.inner, propertyKey);
            }
            return ref;
        };

        return ImmutableRootReference;
    }();
    var PrimitiveReference = function () {
        function PrimitiveReference(inner) {
            _classCallCheck$4(this, PrimitiveReference);

            this.inner = inner;
            this.tag = CONSTANT_TAG;
        }

        PrimitiveReference.prototype.value = function value$$1() {
            return this.inner;
        };

        PrimitiveReference.prototype.get = function get(_key) {
            return UNDEFINED_REFERENCE;
        };

        return PrimitiveReference;
    }();
    var UNDEFINED_REFERENCE = new PrimitiveReference(undefined);
    function cached(inner) {
        return new Cached(inner);
    }
    var Cached = function () {
        function Cached(inner) {
            _classCallCheck$4(this, Cached);

            this.inner = inner;
            this._lastRevision = null;
            this._lastValue = null;
            this.tag = CONSTANT_TAG;
        }

        Cached.prototype.value = function value$$1() {
            var tag = this.tag,
                _lastRevision = this._lastRevision,
                _lastValue = this._lastValue;

            if (!_lastRevision || !validate(tag, _lastRevision)) {
                _lastValue = this._lastValue = this.inner.value();
                this._lastRevision = value(tag);
            }
            return _lastValue;
        };

        Cached.prototype.get = function get(key) {
            return property(this, key);
        };

        return Cached;
    }();
    function data(value$$1) {
        if (util.isDict(value$$1)) {
            return new RootReference(value$$1);
        } else {
            return new PrimitiveReference(value$$1);
        }
    }
    function property(parentReference, propertyKey) {
        if (isConst(parentReference)) {
            return new RootPropertyReference(parentReference.value(), propertyKey);
        } else {
            return new NestedPropertyReference(parentReference, propertyKey);
        }
    }
    // function isMutable(value: unknown): boolean {
    //   return value !== null && typeof value === 'object' && !Object.isFrozen(value);
    // }
    // function child(value: unknown, key: string): VersionedPathReference {}
    var RootPropertyReference = function () {
        function RootPropertyReference(_parentValue, _propertyKey) {
            _classCallCheck$4(this, RootPropertyReference);

            this._parentValue = _parentValue;
            this._propertyKey = _propertyKey;
            this.tag = createUpdatableTag();
        }

        RootPropertyReference.prototype.value = function value$$1() {
            var _parentValue = this._parentValue;

            if (util.isDict(_parentValue)) {
                var old = pushTrackFrame();
                var ret = _parentValue[this._propertyKey];
                var tag = popTrackFrame(old);
                update(this.tag, tag);
                return ret;
            } else {
                return undefined;
            }
        };

        RootPropertyReference.prototype.get = function get(key) {
            return new NestedPropertyReference(this, key);
        };

        return RootPropertyReference;
    }();
    var NestedPropertyReference = function () {
        function NestedPropertyReference(_parentReference, _propertyKey) {
            _classCallCheck$4(this, NestedPropertyReference);

            this._parentReference = _parentReference;
            this._propertyKey = _propertyKey;
            var parentObjectTag = this._parentObjectTag = createUpdatableTag();
            var parentReferenceTag = _parentReference.tag;
            this.tag = combine([parentReferenceTag, parentObjectTag]);
        }

        NestedPropertyReference.prototype.value = function value$$1() {
            var _parentReference = this._parentReference,
                _parentObjectTag = this._parentObjectTag,
                _propertyKey = this._propertyKey;

            var parentValue = _parentReference.value();
            update(_parentObjectTag, tagFor(parentValue, _propertyKey));
            if (util.isDict(parentValue)) {
                var old = pushTrackFrame();
                var ret = parentValue[_propertyKey];
                var tag = popTrackFrame(old);
                update(_parentObjectTag, tag);
                return ret;
            } else {
                return undefined;
            }
        };

        NestedPropertyReference.prototype.get = function get(key) {
            return new NestedPropertyReference(this, key);
        };

        return NestedPropertyReference;
    }();
    var UpdatableReference = function () {
        function UpdatableReference(_value) {
            _classCallCheck$4(this, UpdatableReference);

            this._value = _value;
            this.tag = createUpdatableTag();
        }

        UpdatableReference.prototype.value = function value$$1() {
            return this._value;
        };

        UpdatableReference.prototype.update = function update$$1(value$$1) {
            var _value = this._value;

            if (value$$1 !== _value) {
                dirty(this.tag);
                this._value = value$$1;
            }
        };

        UpdatableReference.prototype.forceUpdate = function forceUpdate(value$$1) {
            dirty(this.tag);
            this._value = value$$1;
        };

        UpdatableReference.prototype.dirty = function dirty$$1() {
            dirty(this.tag);
        };

        UpdatableReference.prototype.get = function get(key) {
            return new NestedPropertyReference(this, key);
        };

        return UpdatableReference;
    }();
    function State(data) {
        return new UpdatableReference(data);
    }
    var STABLE_STATE = new WeakMap();
    function StableState(data) {
        if (STABLE_STATE.has(data)) {
            return STABLE_STATE.get(data);
        } else {
            var ref = new UpdatableReference(data);
            STABLE_STATE.set(data, ref);
            return ref;
        }
    }

    function _classCallCheck$5(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    var ConstReference = function () {
        function ConstReference(inner) {
            _classCallCheck$5(this, ConstReference);

            this.inner = inner;
            this.tag = CONSTANT_TAG;
        }

        ConstReference.prototype.value = function value$$1() {
            return this.inner;
        };

        ConstReference.prototype.get = function get(_key) {
            return UNDEFINED_REFERENCE;
        };

        return ConstReference;
    }();

    function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

    function _classCallCheck$6(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }
    var ListItem = function (_ListNode) {
        _inherits(ListItem, _ListNode);

        function ListItem(iterable, result) {
            _classCallCheck$6(this, ListItem);

            var _this = _possibleConstructorReturn(this, _ListNode.call(this, iterable.valueReferenceFor(result)));

            _this.retained = false;
            _this.seen = false;
            _this.key = result.key;
            _this.iterable = iterable;
            _this.memo = iterable.memoReferenceFor(result);
            return _this;
        }

        ListItem.prototype.update = function update(item) {
            this.retained = true;
            this.iterable.updateValueReference(this.value, item);
            this.iterable.updateMemoReference(this.memo, item);
        };

        ListItem.prototype.shouldRemove = function shouldRemove() {
            return !this.retained;
        };

        ListItem.prototype.reset = function reset() {
            this.retained = false;
            this.seen = false;
        };

        return ListItem;
    }(util.ListNode);
    var IterationArtifacts = function () {
        function IterationArtifacts(iterable) {
            _classCallCheck$6(this, IterationArtifacts);

            this.iterator = null;
            this.map = new Map();
            this.list = new util.LinkedList();
            this.tag = iterable.tag;
            this.iterable = iterable;
        }

        IterationArtifacts.prototype.isEmpty = function isEmpty() {
            var iterator = this.iterator = this.iterable.iterate();
            return iterator.isEmpty();
        };

        IterationArtifacts.prototype.iterate = function iterate() {
            var iterator = void 0;
            if (this.iterator === null) {
                iterator = this.iterable.iterate();
            } else {
                iterator = this.iterator;
            }
            this.iterator = null;
            return iterator;
        };

        IterationArtifacts.prototype.advanceToKey = function advanceToKey(key, current) {
            var seek = current;
            while (seek !== null && seek.key !== key) {
                seek = this.advanceNode(seek);
            }
            return seek;
        };

        IterationArtifacts.prototype.has = function has(key) {
            return this.map.has(key);
        };

        IterationArtifacts.prototype.get = function get(key) {
            return this.map.get(key);
        };

        IterationArtifacts.prototype.wasSeen = function wasSeen(key) {
            var node = this.map.get(key);
            return node !== undefined && node.seen;
        };

        IterationArtifacts.prototype.update = function update(item) {
            var found = this.get(item.key);
            found.update(item);
            return found;
        };

        IterationArtifacts.prototype.append = function append(item) {
            var map = this.map,
                list = this.list,
                iterable = this.iterable;

            var node = new ListItem(iterable, item);
            map.set(item.key, node);
            list.append(node);
            return node;
        };

        IterationArtifacts.prototype.insertBefore = function insertBefore(item, reference) {
            var map = this.map,
                list = this.list,
                iterable = this.iterable;

            var node = new ListItem(iterable, item);
            map.set(item.key, node);
            node.retained = true;
            list.insertBefore(node, reference);
            return node;
        };

        IterationArtifacts.prototype.move = function move(item, reference) {
            var list = this.list;

            item.retained = true;
            list.remove(item);
            list.insertBefore(item, reference);
        };

        IterationArtifacts.prototype.remove = function remove(item) {
            var list = this.list;

            list.remove(item);
            this.map.delete(item.key);
        };

        IterationArtifacts.prototype.nextNode = function nextNode(item) {
            return this.list.nextNode(item);
        };

        IterationArtifacts.prototype.advanceNode = function advanceNode(item) {
            item.seen = true;
            return this.list.nextNode(item);
        };

        IterationArtifacts.prototype.head = function head() {
            return this.list.head();
        };

        return IterationArtifacts;
    }();
    var ReferenceIterator = function () {
        // if anyone needs to construct this object with something other than
        // an iterable, let @wycats know.
        function ReferenceIterator(iterable) {
            _classCallCheck$6(this, ReferenceIterator);

            this.iterator = null;
            var artifacts = new IterationArtifacts(iterable);
            this.artifacts = artifacts;
        }

        ReferenceIterator.prototype.next = function next() {
            var artifacts = this.artifacts;

            var iterator = this.iterator = this.iterator || artifacts.iterate();
            var item = iterator.next();
            if (item === null) return null;
            return artifacts.append(item);
        };

        return ReferenceIterator;
    }();
    var Phase;
    (function (Phase) {
        Phase[Phase["Append"] = 0] = "Append";
        Phase[Phase["Prune"] = 1] = "Prune";
        Phase[Phase["Done"] = 2] = "Done";
    })(Phase || (Phase = {}));
    var END = 'END [2600abdf-889f-4406-b059-b44ecbafa5c5]';
    var IteratorSynchronizer = function () {
        function IteratorSynchronizer(_ref) {
            var target = _ref.target,
                artifacts = _ref.artifacts,
                env = _ref.env;

            _classCallCheck$6(this, IteratorSynchronizer);

            this.target = target;
            this.artifacts = artifacts;
            this.iterator = artifacts.iterate();
            this.current = artifacts.head();
            this.env = env;
        }

        IteratorSynchronizer.prototype.sync = function sync() {
            var phase = Phase.Append;
            while (true) {
                switch (phase) {
                    case Phase.Append:
                        phase = this.nextAppend();
                        break;
                    case Phase.Prune:
                        phase = this.nextPrune();
                        break;
                    case Phase.Done:
                        this.nextDone();
                        return;
                }
            }
        };

        IteratorSynchronizer.prototype.advanceToKey = function advanceToKey(key) {
            var current = this.current,
                artifacts = this.artifacts;

            if (current === null) return;
            var next = artifacts.advanceNode(current);
            if (next.key === key) {
                this.current = artifacts.advanceNode(next);
                return;
            }
            var seek = artifacts.advanceToKey(key, current);
            if (seek) {
                this.move(seek, current);
                this.current = artifacts.nextNode(current);
            }
        };

        IteratorSynchronizer.prototype.move = function move(item, reference) {
            if (item.next !== reference) {
                this.artifacts.move(item, reference);
                this.target.move(this.env, item.key, item.value, item.memo, reference ? reference.key : END);
            }
        };

        IteratorSynchronizer.prototype.nextAppend = function nextAppend() {
            var iterator = this.iterator,
                current = this.current,
                artifacts = this.artifacts;

            var item = iterator.next();
            if (item === null) {
                return this.startPrune();
            }
            var key = item.key;

            if (current !== null && current.key === key) {
                this.nextRetain(item, current);
            } else if (artifacts.has(key)) {
                this.nextMove(item);
            } else {
                this.nextInsert(item);
            }
            return Phase.Append;
        };

        IteratorSynchronizer.prototype.nextRetain = function nextRetain(item, current) {
            var artifacts = this.artifacts;
            // current = expect(current, 'BUG: current is empty');

            current.update(item);
            this.current = artifacts.nextNode(current);
            this.target.retain(this.env, item.key, current.value, current.memo);
        };

        IteratorSynchronizer.prototype.nextMove = function nextMove(item) {
            var current = this.current,
                artifacts = this.artifacts;
            var key = item.key;

            var found = artifacts.update(item);
            if (artifacts.wasSeen(key)) {
                this.move(found, current);
            } else {
                this.advanceToKey(key);
            }
        };

        IteratorSynchronizer.prototype.nextInsert = function nextInsert(item) {
            var artifacts = this.artifacts,
                target = this.target,
                current = this.current;

            var node = artifacts.insertBefore(item, current);
            target.insert(this.env, node.key, node.value, node.memo, current ? current.key : null);
        };

        IteratorSynchronizer.prototype.startPrune = function startPrune() {
            this.current = this.artifacts.head();
            return Phase.Prune;
        };

        IteratorSynchronizer.prototype.nextPrune = function nextPrune() {
            var artifacts = this.artifacts,
                target = this.target,
                current = this.current;

            if (current === null) {
                return Phase.Done;
            }
            var node = current;
            this.current = artifacts.nextNode(node);
            if (node.shouldRemove()) {
                artifacts.remove(node);
                target.delete(this.env, node.key);
            } else {
                node.reset();
            }
            return Phase.Prune;
        };

        IteratorSynchronizer.prototype.nextDone = function nextDone() {
            this.target.done(this.env);
        };

        return IteratorSynchronizer;
    }();

    function _classCallCheck$7(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    function keyFor(path, definitions) {
        if (path in definitions.named) {
            return definitions.named[path];
        } else {
            return definitions.default;
        }
    }
    var IterableImpl = function () {
        function IterableImpl(ref, keyFor) {
            _classCallCheck$7(this, IterableImpl);

            this.ref = ref;
            this.keyFor = keyFor;
            this.tag = ref.tag;
            this.ref = ref;
            this.keyFor = keyFor;
        }

        IterableImpl.prototype.iterate = function iterate() {
            var ref = this.ref,
                keyFor = this.keyFor;

            var iterable = ref.value();
            if (Array.isArray(iterable)) {
                return new ArrayIterator(iterable, keyFor);
            } else if (iterable && iterable[Symbol.iterator]) {
                return new NativeIteratorIterator(iterable[Symbol.iterator](), keyFor);
            } else {
                return new ArrayIterator(util.EMPTY_ARRAY, function () {
                    return null;
                });
            }
        };

        IterableImpl.prototype.valueReferenceFor = function valueReferenceFor(item) {
            return new UpdatableReference(item.value);
        };

        IterableImpl.prototype.updateValueReference = function updateValueReference(reference, item) {
            reference.forceUpdate(item.value);
        };

        IterableImpl.prototype.memoReferenceFor = function memoReferenceFor(item) {
            return new UpdatableReference(item.memo);
        };

        IterableImpl.prototype.updateMemoReference = function updateMemoReference(reference, item) {
            reference.forceUpdate(item.memo);
        };

        return IterableImpl;
    }();

    var NativeIteratorIterator = function () {
        function NativeIteratorIterator(iterator, keyFor) {
            _classCallCheck$7(this, NativeIteratorIterator);

            this.iterator = iterator;
            this.keyFor = keyFor;
            this.pos = 0;
            var first = iterator.next();
            if (first.done === true) {
                this.current = { kind: 'empty' };
            } else {
                this.current = { kind: 'first', value: first.value };
            }
        }

        NativeIteratorIterator.prototype.isEmpty = function isEmpty() {
            return this.current.kind === 'empty';
        };

        NativeIteratorIterator.prototype.next = function next() {
            var value = void 0;
            var current = this.current;
            if (current.kind === 'first') {
                this.current = { kind: 'progress' };
                value = current.value;
            } else {
                var next = this.iterator.next();
                this.pos++;
                if (next.done) {
                    return null;
                } else {
                    value = next.value;
                }
            }
            var keyFor = this.keyFor;

            var key = keyFor(value, this.pos);
            var memo = this.pos;
            return { key: key, value: value, memo: memo };
        };

        return NativeIteratorIterator;
    }();

    var ArrayIterator = function () {
        function ArrayIterator(iterator, keyFor) {
            _classCallCheck$7(this, ArrayIterator);

            this.iterator = iterator;
            this.keyFor = keyFor;
            this.pos = 0;
            if (iterator.length === 0) {
                this.current = { kind: 'empty' };
            } else {
                this.current = { kind: 'first', value: iterator[this.pos] };
            }
        }

        ArrayIterator.prototype.isEmpty = function isEmpty() {
            return this.current.kind === 'empty';
        };

        ArrayIterator.prototype.next = function next() {
            var value = void 0;
            var current = this.current;
            if (current.kind === 'first') {
                this.current = { kind: 'progress' };
                value = current.value;
            } else if (this.pos >= this.iterator.length - 1) {
                return null;
            } else {
                value = this.iterator[++this.pos];
            }
            var keyFor = this.keyFor;

            var key = keyFor(value, this.pos);
            var memo = this.pos;
            return { key: key, value: value, memo: memo };
        };

        return ArrayIterator;
    }();

    function _classCallCheck$8(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    function map(input, callback) {
        return new MapReference(input, callback);
    }

    var MapReference = function () {
        function MapReference(inner, callback) {
            _classCallCheck$8(this, MapReference);

            this.inner = inner;
            this.callback = callback;
            this.updatable = createUpdatableTag();
            this.tag = combine([inner.tag, this.updatable]);
        }

        MapReference.prototype.value = function value$$1() {
            var inner = this.inner,
                callback = this.callback;

            var old = pushTrackFrame();
            var ret = callback(inner.value());
            var tag = popTrackFrame(old);
            update(this.updatable, tag);
            return ret;
        };

        MapReference.prototype.get = function get(key) {
            return property(this, key);
        };

        return MapReference;
    }();

    exports.CachedReference = CachedReference;
    exports.ReferenceCache = ReferenceCache;
    exports.isModified = isModified;
    exports.ConstReference = ConstReference;
    exports.ListItem = ListItem;
    exports.END = END;
    exports.IterationArtifacts = IterationArtifacts;
    exports.ReferenceIterator = ReferenceIterator;
    exports.IteratorSynchronizer = IteratorSynchronizer;
    exports.CONSTANT = CONSTANT;
    exports.INITIAL = INITIAL;
    exports.VOLATILE = VOLATILE;
    exports.bump = bump;
    exports.COMPUTE = COMPUTE;
    exports.value = value;
    exports.validate = validate;
    exports.ALLOW_CYCLES = ALLOW_CYCLES;
    exports.MonomorphicTagImpl = MonomorphicTagImpl;
    exports.dirty = dirty;
    exports.update = update;
    exports.createTag = createTag;
    exports.createUpdatableTag = createUpdatableTag;
    exports.CONSTANT_TAG = CONSTANT_TAG;
    exports.isConst = isConst;
    exports.isConstTag = isConstTag;
    exports.VOLATILE_TAG = VOLATILE_TAG;
    exports.CURRENT_TAG = CURRENT_TAG;
    exports.combineTagged = combineTagged;
    exports.combineSlice = combineSlice;
    exports.combine = combine;
    exports.RootReference = RootReference;
    exports.ImmutableRootReference = ImmutableRootReference;
    exports.PrimitiveReference = PrimitiveReference;
    exports.UNDEFINED_REFERENCE = UNDEFINED_REFERENCE;
    exports.cached = cached;
    exports.Cached = Cached;
    exports.data = data;
    exports.property = property;
    exports.RootPropertyReference = RootPropertyReference;
    exports.NestedPropertyReference = NestedPropertyReference;
    exports.UpdatableReference = UpdatableReference;
    exports.State = State;
    exports.StableState = StableState;
    exports.keyFor = keyFor;
    exports.IterableImpl = IterableImpl;
    exports.EPOCH = EPOCH;
    exports.setStateFor = setStateFor;
    exports.getStateFor = getStateFor;
    exports.pushTrackFrame = pushTrackFrame;
    exports.popTrackFrame = popTrackFrame;
    exports.trackedData = trackedData;
    exports.dirtyTag = dirtyTag;
    exports.tagFor = tagFor;
    exports.updateTag = updateTag;
    exports.map = map;

    Object.defineProperty(exports, '__esModule', { value: true });

});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xpbW1lci1yZWZlcmVuY2UuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3JlZmVyZW5jZS9saWIvdmFsaWRhdG9ycy50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3JlZmVyZW5jZS9saWIvcmVmZXJlbmNlLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvcmVmZXJlbmNlL2xpYi90YWdzLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvcmVmZXJlbmNlL2xpYi90cmFja2VkLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvcmVmZXJlbmNlL2xpYi9hdXRvdHJhY2sudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci9yZWZlcmVuY2UvbGliL3Byb3BlcnR5LnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvcmVmZXJlbmNlL2xpYi9jb25zdC50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3JlZmVyZW5jZS9saWIvaXRlcmFibGUudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci9yZWZlcmVuY2UvbGliL2l0ZXJhYmxlLWltcGwudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci9yZWZlcmVuY2UvbGliL2NvbWJpbmF0b3JzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFNsaWNlLCBMaW5rZWRMaXN0Tm9kZSwgYXNzZXJ0IH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQgeyBERUJVRyB9IGZyb20gJ0BnbGltbWVyL2xvY2FsLWRlYnVnLWZsYWdzJztcblxuLy8vLy8vLy8vL1xuXG4vLyB1dGlsc1xudHlwZSBVbmlvblRvSW50ZXJzZWN0aW9uPFU+ID0gKFUgZXh0ZW5kcyBhbnkgPyAoazogVSkgPT4gdm9pZCA6IG5ldmVyKSBleHRlbmRzICgoXG4gIGs6IGluZmVyIElcbikgPT4gdm9pZClcbiAgPyBJXG4gIDogbmV2ZXI7XG5cbmNvbnN0IHN5bWJvbCA9XG4gIHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnXG4gICAgPyBTeW1ib2xcbiAgICA6IChrZXk6IHN0cmluZykgPT4gYF9fJHtrZXl9JHtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBEYXRlLm5vdygpKX1fX2AgYXMgYW55O1xuXG4vLy8vLy8vLy8vXG5cbmV4cG9ydCB0eXBlIFJldmlzaW9uID0gbnVtYmVyO1xuXG5leHBvcnQgY29uc3QgQ09OU1RBTlQ6IFJldmlzaW9uID0gMDtcbmV4cG9ydCBjb25zdCBJTklUSUFMOiBSZXZpc2lvbiA9IDE7XG5leHBvcnQgY29uc3QgVk9MQVRJTEU6IFJldmlzaW9uID0gOTAwNzE5OTI1NDc0MDk5MTsgLy8gTUFYX0lOVFxuXG5sZXQgJFJFVklTSU9OID0gSU5JVElBTDtcblxuZXhwb3J0IGZ1bmN0aW9uIGJ1bXAoKSB7XG4gICRSRVZJU0lPTisrO1xufVxuXG4vLy8vLy8vLy8vXG5cbmV4cG9ydCBjb25zdCBDT01QVVRFOiB1bmlxdWUgc3ltYm9sID0gc3ltYm9sKCdUQUdfQ09NUFVURScpO1xuXG5leHBvcnQgaW50ZXJmYWNlIEVudGl0eVRhZzxUPiB7XG4gIFtDT01QVVRFXSgpOiBUO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFRhZyBleHRlbmRzIEVudGl0eVRhZzxSZXZpc2lvbj4ge31cblxuZXhwb3J0IGludGVyZmFjZSBFbnRpdHlUYWdnZWQ8VD4ge1xuICB0YWc6IEVudGl0eVRhZzxUPjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBUYWdnZWQge1xuICB0YWc6IFRhZztcbn1cblxuLy8vLy8vLy8vL1xuXG4vKipcbiAqIGB2YWx1ZWAgcmVjZWl2ZXMgYSB0YWcgYW5kIHJldHVybnMgYW4gb3BhcXVlIFJldmlzaW9uIGJhc2VkIG9uIHRoYXQgdGFnLiBUaGlzXG4gKiBzbmFwc2hvdCBjYW4gdGhlbiBsYXRlciBiZSBwYXNzZWQgdG8gYHZhbGlkYXRlYCB3aXRoIHRoZSBzYW1lIHRhZyB0b1xuICogZGV0ZXJtaW5lIGlmIHRoZSB0YWcgaGFzIGNoYW5nZWQgYXQgYWxsIHNpbmNlIHRoZSB0aW1lIHRoYXQgYHZhbHVlYCB3YXNcbiAqIGNhbGxlZC5cbiAqXG4gKiBUaGUgY3VycmVudCBpbXBsZW1lbnRhdGlvbiByZXR1cm5zIHRoZSBnbG9iYWwgcmV2aXNpb24gY291bnQgZGlyZWN0bHkgZm9yXG4gKiBwZXJmb3JtYW5jZSByZWFzb25zLiBUaGlzIGlzIGFuIGltcGxlbWVudGF0aW9uIGRldGFpbCwgYW5kIHNob3VsZCBub3QgYmVcbiAqIHJlbGllZCBvbiBkaXJlY3RseSBieSB1c2VycyBvZiB0aGVzZSBBUElzLiBJbnN0ZWFkLCBSZXZpc2lvbnMgc2hvdWxkIGJlXG4gKiB0cmVhdGVkIGFzIGlmIHRoZXkgYXJlIG9wYXF1ZS91bmtub3duLCBhbmQgc2hvdWxkIG9ubHkgYmUgaW50ZXJhY3RlZCB3aXRoIHZpYVxuICogdGhlIGB2YWx1ZWAvYHZhbGlkYXRlYCBBUEkuXG4gKlxuICogQHBhcmFtIHRhZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsdWUoX3RhZzogVGFnKTogUmV2aXNpb24ge1xuICByZXR1cm4gJFJFVklTSU9OO1xufVxuXG4vKipcbiAqIGB2YWxpZGF0ZWAgcmVjZWl2ZXMgYSB0YWcgYW5kIGEgc25hcHNob3QgZnJvbSBhIHByZXZpb3VzIGNhbGwgdG8gYHZhbHVlYCB3aXRoXG4gKiB0aGUgc2FtZSB0YWcsIGFuZCBkZXRlcm1pbmVzIGlmIHRoZSB0YWcgaXMgc3RpbGwgdmFsaWQgY29tcGFyZWQgdG8gdGhlXG4gKiBzbmFwc2hvdC4gSWYgdGhlIHRhZydzIHN0YXRlIGhhcyBjaGFuZ2VkIGF0IGFsbCBzaW5jZSB0aGVuLCBgdmFsaWRhdGVgIHdpbGxcbiAqIHJldHVybiBmYWxzZSwgb3RoZXJ3aXNlIGl0IHdpbGwgcmV0dXJuIHRydWUuIFRoaXMgaXMgdXNlZCB0byBkZXRlcm1pbmUgaWYgYVxuICogY2FsY3VsYXRpb24gcmVsYXRlZCB0byB0aGUgdGFncyBzaG91bGQgYmUgcmVydW4uXG4gKlxuICogQHBhcmFtIHRhZ1xuICogQHBhcmFtIHNuYXBzaG90XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZSh0YWc6IFRhZywgc25hcHNob3Q6IFJldmlzaW9uKSB7XG4gIHJldHVybiBzbmFwc2hvdCA+PSB0YWdbQ09NUFVURV0oKTtcbn1cblxuLy8vLy8vLy8vL1xuXG4vKipcbiAqIFRoaXMgZW51bSByZXByZXNlbnRzIGFsbCBvZiB0aGUgcG9zc2libGUgdGFnIHR5cGVzIGZvciB0aGUgbW9ub21vcnBoaWMgdGFnIGNsYXNzLlxuICogT3RoZXIgY3VzdG9tIHRhZyBjbGFzc2VzIGNhbiBleGlzdCwgc3VjaCBhcyBDdXJyZW50VGFnIGFuZCBWb2xhdGlsZVRhZywgYnV0IGZvclxuICogcGVyZm9ybWFuY2UgcmVhc29ucywgYW55IHR5cGUgb2YgdGFnIHRoYXQgaXMgbWVhbnQgdG8gYmUgdXNlZCBmcmVxdWVudGx5IHNob3VsZFxuICogYmUgYWRkZWQgdG8gdGhlIG1vbm9tb3JwaGljIHRhZy5cbiAqL1xuY29uc3QgZW51bSBNb25vbW9ycGhpY1RhZ1R5cGVzIHtcbiAgRGlydHlhYmxlLFxuICBVcGRhdGFibGUsXG4gIENvbWJpbmF0b3IsXG4gIENvbnN0YW50LFxufVxuXG5jb25zdCBUWVBFOiB1bmlxdWUgc3ltYm9sID0gc3ltYm9sKCdUQUdfVFlQRScpO1xuXG5leHBvcnQgbGV0IEFMTE9XX0NZQ0xFUzogV2Vha1NldDxVcGRhdGFibGVUYWc+O1xuXG5pZiAoREVCVUcpIHtcbiAgQUxMT1dfQ1lDTEVTID0gbmV3IFdlYWtTZXQoKTtcbn1cblxuaW50ZXJmYWNlIE1vbm9tb3JwaGljVGFnQmFzZTxUIGV4dGVuZHMgTW9ub21vcnBoaWNUYWdUeXBlcz4gZXh0ZW5kcyBUYWcge1xuICBbVFlQRV06IFQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGlydHlhYmxlVGFnIGV4dGVuZHMgTW9ub21vcnBoaWNUYWdCYXNlPE1vbm9tb3JwaGljVGFnVHlwZXMuRGlydHlhYmxlPiB7fVxuZXhwb3J0IGludGVyZmFjZSBVcGRhdGFibGVUYWcgZXh0ZW5kcyBNb25vbW9ycGhpY1RhZ0Jhc2U8TW9ub21vcnBoaWNUYWdUeXBlcy5VcGRhdGFibGU+IHt9XG5leHBvcnQgaW50ZXJmYWNlIENvbWJpbmF0b3JUYWcgZXh0ZW5kcyBNb25vbW9ycGhpY1RhZ0Jhc2U8TW9ub21vcnBoaWNUYWdUeXBlcy5Db21iaW5hdG9yPiB7fVxuZXhwb3J0IGludGVyZmFjZSBDb25zdGFudFRhZyBleHRlbmRzIE1vbm9tb3JwaGljVGFnQmFzZTxNb25vbW9ycGhpY1RhZ1R5cGVzLkNvbnN0YW50PiB7fVxuXG5pbnRlcmZhY2UgTW9ub21vcnBoaWNUYWdNYXBwaW5nIHtcbiAgW01vbm9tb3JwaGljVGFnVHlwZXMuRGlydHlhYmxlXTogRGlydHlhYmxlVGFnO1xuICBbTW9ub21vcnBoaWNUYWdUeXBlcy5VcGRhdGFibGVdOiBVcGRhdGFibGVUYWc7XG4gIFtNb25vbW9ycGhpY1RhZ1R5cGVzLkNvbWJpbmF0b3JdOiBDb21iaW5hdG9yVGFnO1xuICBbTW9ub21vcnBoaWNUYWdUeXBlcy5Db25zdGFudF06IENvbnN0YW50VGFnO1xufVxuXG50eXBlIE1vbm9tb3JwaGljVGFnID0gVW5pb25Ub0ludGVyc2VjdGlvbjxNb25vbW9ycGhpY1RhZ01hcHBpbmdbTW9ub21vcnBoaWNUYWdUeXBlc10+O1xudHlwZSBNb25vbW9ycGhpY1RhZ1R5cGUgPSBVbmlvblRvSW50ZXJzZWN0aW9uPE1vbm9tb3JwaGljVGFnVHlwZXM+O1xuXG5leHBvcnQgY2xhc3MgTW9ub21vcnBoaWNUYWdJbXBsIGltcGxlbWVudHMgTW9ub21vcnBoaWNUYWcge1xuICBwcml2YXRlIHJldmlzaW9uID0gSU5JVElBTDtcbiAgcHJpdmF0ZSBsYXN0Q2hlY2tlZCA9IElOSVRJQUw7XG4gIHByaXZhdGUgbGFzdFZhbHVlID0gSU5JVElBTDtcblxuICBwcml2YXRlIGlzVXBkYXRpbmcgPSBmYWxzZTtcbiAgcHJpdmF0ZSBzdWJ0YWc6IFRhZyB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHN1YnRhZ3M6IFRhZ1tdIHwgbnVsbCA9IG51bGw7XG5cbiAgW1RZUEVdOiBNb25vbW9ycGhpY1RhZ1R5cGU7XG5cbiAgY29uc3RydWN0b3IodHlwZTogTW9ub21vcnBoaWNUYWdUeXBlcykge1xuICAgIHRoaXNbVFlQRV0gPSB0eXBlIGFzIE1vbm9tb3JwaGljVGFnVHlwZTtcbiAgfVxuXG4gIFtDT01QVVRFXSgpOiBSZXZpc2lvbiB7XG4gICAgbGV0IHsgbGFzdENoZWNrZWQgfSA9IHRoaXM7XG5cbiAgICBpZiAobGFzdENoZWNrZWQgIT09ICRSRVZJU0lPTikge1xuICAgICAgdGhpcy5pc1VwZGF0aW5nID0gdHJ1ZTtcbiAgICAgIHRoaXMubGFzdENoZWNrZWQgPSAkUkVWSVNJT047XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGxldCB7IHN1YnRhZ3MsIHN1YnRhZywgcmV2aXNpb24gfSA9IHRoaXM7XG5cbiAgICAgICAgaWYgKHN1YnRhZyAhPT0gbnVsbCkge1xuICAgICAgICAgIHJldmlzaW9uID0gTWF0aC5tYXgocmV2aXNpb24sIHN1YnRhZ1tDT01QVVRFXSgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzdWJ0YWdzICE9PSBudWxsKSB7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdWJ0YWdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSBzdWJ0YWdzW2ldW0NPTVBVVEVdKCk7XG4gICAgICAgICAgICByZXZpc2lvbiA9IE1hdGgubWF4KHZhbHVlLCByZXZpc2lvbik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5sYXN0VmFsdWUgPSByZXZpc2lvbjtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHRoaXMuaXNVcGRhdGluZyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmlzVXBkYXRpbmcgPT09IHRydWUpIHtcbiAgICAgIGlmIChERUJVRyAmJiAhQUxMT1dfQ1lDTEVTLmhhcyh0aGlzKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0N5Y2xlcyBpbiB0YWdzIGFyZSBub3QgYWxsb3dlZCcpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmxhc3RDaGVja2VkID0gKyskUkVWSVNJT047XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMubGFzdFZhbHVlO1xuICB9XG5cbiAgc3RhdGljIHVwZGF0ZShfdGFnOiBVcGRhdGFibGVUYWcsIHN1YnRhZzogVGFnKSB7XG4gICAgaWYgKERFQlVHKSB7XG4gICAgICBhc3NlcnQoXG4gICAgICAgIF90YWdbVFlQRV0gPT09IE1vbm9tb3JwaGljVGFnVHlwZXMuVXBkYXRhYmxlLFxuICAgICAgICAnQXR0ZW1wdGVkIHRvIHVwZGF0ZSBhIHRhZyB0aGF0IHdhcyBub3QgdXBkYXRhYmxlJ1xuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBUUyAzLjcgc2hvdWxkIGFsbG93IHVzIHRvIGRvIHRoaXMgdmlhIGFzc2VydGlvblxuICAgIGxldCB0YWcgPSBfdGFnIGFzIE1vbm9tb3JwaGljVGFnSW1wbDtcblxuICAgIGlmIChzdWJ0YWcgPT09IENPTlNUQU5UX1RBRykge1xuICAgICAgdGFnLnN1YnRhZyA9IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRhZy5zdWJ0YWcgPSBzdWJ0YWc7XG5cbiAgICAgIC8vIHN1YnRhZyBjb3VsZCBiZSBhbm90aGVyIHR5cGUgb2YgdGFnLCBlLmcuIENVUlJFTlRfVEFHIG9yIFZPTEFUSUxFX1RBRy5cbiAgICAgIC8vIElmIHNvLCBsYXN0Q2hlY2tlZC9sYXN0VmFsdWUgd2lsbCBiZSB1bmRlZmluZWQsIHJlc3VsdCBpbiB0aGVzZSBiZWluZ1xuICAgICAgLy8gTmFOLiBUaGlzIGlzIGZpbmUsIGl0IHdpbGwgZm9yY2UgdGhlIHN5c3RlbSB0byByZWNvbXB1dGUuXG4gICAgICB0YWcubGFzdENoZWNrZWQgPSBNYXRoLm1pbih0YWcubGFzdENoZWNrZWQsIChzdWJ0YWcgYXMgYW55KS5sYXN0Q2hlY2tlZCk7XG4gICAgICB0YWcubGFzdFZhbHVlID0gTWF0aC5tYXgodGFnLmxhc3RWYWx1ZSwgKHN1YnRhZyBhcyBhbnkpLmxhc3RWYWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIGRpcnR5KHRhZzogRGlydHlhYmxlVGFnIHwgVXBkYXRhYmxlVGFnKSB7XG4gICAgaWYgKERFQlVHKSB7XG4gICAgICBhc3NlcnQoXG4gICAgICAgIHRhZ1tUWVBFXSA9PT0gTW9ub21vcnBoaWNUYWdUeXBlcy5VcGRhdGFibGUgfHwgdGFnW1RZUEVdID09PSBNb25vbW9ycGhpY1RhZ1R5cGVzLkRpcnR5YWJsZSxcbiAgICAgICAgJ0F0dGVtcHRlZCB0byBkaXJ0eSBhIHRhZyB0aGF0IHdhcyBub3QgZGlydHlhYmxlJ1xuICAgICAgKTtcbiAgICB9XG5cbiAgICAodGFnIGFzIE1vbm9tb3JwaGljVGFnSW1wbCkucmV2aXNpb24gPSArKyRSRVZJU0lPTjtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgZGlydHkgPSBNb25vbW9ycGhpY1RhZ0ltcGwuZGlydHk7XG5leHBvcnQgY29uc3QgdXBkYXRlID0gTW9ub21vcnBoaWNUYWdJbXBsLnVwZGF0ZTtcblxuLy8vLy8vLy8vL1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVGFnKCk6IERpcnR5YWJsZVRhZyB7XG4gIHJldHVybiBuZXcgTW9ub21vcnBoaWNUYWdJbXBsKE1vbm9tb3JwaGljVGFnVHlwZXMuRGlydHlhYmxlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVVwZGF0YWJsZVRhZygpOiBVcGRhdGFibGVUYWcge1xuICByZXR1cm4gbmV3IE1vbm9tb3JwaGljVGFnSW1wbChNb25vbW9ycGhpY1RhZ1R5cGVzLlVwZGF0YWJsZSk7XG59XG5cbi8vLy8vLy8vLy9cblxuZXhwb3J0IGNvbnN0IENPTlNUQU5UX1RBRyA9IG5ldyBNb25vbW9ycGhpY1RhZ0ltcGwoTW9ub21vcnBoaWNUYWdUeXBlcy5Db25zdGFudCkgYXMgQ29uc3RhbnRUYWc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0NvbnN0KHsgdGFnIH06IFRhZ2dlZCk6IGJvb2xlYW4ge1xuICByZXR1cm4gdGFnID09PSBDT05TVEFOVF9UQUc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0NvbnN0VGFnKHRhZzogVGFnKTogdGFnIGlzIENvbnN0YW50VGFnIHtcbiAgcmV0dXJuIHRhZyA9PT0gQ09OU1RBTlRfVEFHO1xufVxuXG4vLy8vLy8vLy8vXG5cbmNsYXNzIFZvbGF0aWxlVGFnIGltcGxlbWVudHMgVGFnIHtcbiAgW0NPTVBVVEVdKCkge1xuICAgIHJldHVybiBWT0xBVElMRTtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgVk9MQVRJTEVfVEFHID0gbmV3IFZvbGF0aWxlVGFnKCk7XG5cbi8vLy8vLy8vLy9cblxuY2xhc3MgQ3VycmVudFRhZyBpbXBsZW1lbnRzIEN1cnJlbnRUYWcge1xuICBbQ09NUFVURV0oKSB7XG4gICAgcmV0dXJuICRSRVZJU0lPTjtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgQ1VSUkVOVF9UQUcgPSBuZXcgQ3VycmVudFRhZygpO1xuXG4vLy8vLy8vLy8vXG5cbmV4cG9ydCBmdW5jdGlvbiBjb21iaW5lVGFnZ2VkKHRhZ2dlZDogUmVhZG9ubHlBcnJheTxUYWdnZWQ+KTogVGFnIHtcbiAgbGV0IG9wdGltaXplZDogVGFnW10gPSBbXTtcblxuICBmb3IgKGxldCBpID0gMCwgbCA9IHRhZ2dlZC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBsZXQgdGFnID0gdGFnZ2VkW2ldLnRhZztcbiAgICBpZiAodGFnID09PSBDT05TVEFOVF9UQUcpIGNvbnRpbnVlO1xuICAgIG9wdGltaXplZC5wdXNoKHRhZyk7XG4gIH1cblxuICByZXR1cm4gX2NvbWJpbmUob3B0aW1pemVkKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbWJpbmVTbGljZShzbGljZTogU2xpY2U8VGFnZ2VkICYgTGlua2VkTGlzdE5vZGU+KTogVGFnIHtcbiAgbGV0IG9wdGltaXplZDogVGFnW10gPSBbXTtcblxuICBsZXQgbm9kZSA9IHNsaWNlLmhlYWQoKTtcblxuICB3aGlsZSAobm9kZSAhPT0gbnVsbCkge1xuICAgIGxldCB0YWcgPSBub2RlLnRhZztcblxuICAgIGlmICh0YWcgIT09IENPTlNUQU5UX1RBRykgb3B0aW1pemVkLnB1c2godGFnKTtcblxuICAgIG5vZGUgPSBzbGljZS5uZXh0Tm9kZShub2RlKTtcbiAgfVxuXG4gIHJldHVybiBfY29tYmluZShvcHRpbWl6ZWQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tYmluZSh0YWdzOiBUYWdbXSk6IFRhZyB7XG4gIGxldCBvcHRpbWl6ZWQ6IFRhZ1tdID0gW107XG5cbiAgZm9yIChsZXQgaSA9IDAsIGwgPSB0YWdzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGxldCB0YWcgPSB0YWdzW2ldO1xuICAgIGlmICh0YWcgPT09IENPTlNUQU5UX1RBRykgY29udGludWU7XG4gICAgb3B0aW1pemVkLnB1c2godGFnKTtcbiAgfVxuXG4gIHJldHVybiBfY29tYmluZShvcHRpbWl6ZWQpO1xufVxuXG5mdW5jdGlvbiBfY29tYmluZSh0YWdzOiBUYWdbXSk6IFRhZyB7XG4gIHN3aXRjaCAodGFncy5sZW5ndGgpIHtcbiAgICBjYXNlIDA6XG4gICAgICByZXR1cm4gQ09OU1RBTlRfVEFHO1xuICAgIGNhc2UgMTpcbiAgICAgIHJldHVybiB0YWdzWzBdO1xuICAgIGRlZmF1bHQ6XG4gICAgICBsZXQgdGFnID0gbmV3IE1vbm9tb3JwaGljVGFnSW1wbChNb25vbW9ycGhpY1RhZ1R5cGVzLkNvbWJpbmF0b3IpIGFzIENvbWJpbmF0b3JUYWc7XG4gICAgICAodGFnIGFzIGFueSkuc3VidGFncyA9IHRhZ3M7XG4gICAgICByZXR1cm4gdGFnO1xuICB9XG59XG4iLCJpbXBvcnQgeyBPcHRpb24gfSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCB7IFJldmlzaW9uLCBUYWcsIFRhZ2dlZCwgdmFsdWUsIHZhbGlkYXRlIH0gZnJvbSAnLi92YWxpZGF0b3JzJztcblxuZXhwb3J0IGludGVyZmFjZSBSZWZlcmVuY2U8VD4ge1xuICB2YWx1ZSgpOiBUO1xufVxuXG5leHBvcnQgZGVmYXVsdCBSZWZlcmVuY2U7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGF0aFJlZmVyZW5jZTxUPiBleHRlbmRzIFJlZmVyZW5jZTxUPiB7XG4gIGdldChrZXk6IHN0cmluZyk6IFBhdGhSZWZlcmVuY2U8dW5rbm93bj47XG59XG5cbi8vLy8vLy8vLy9cblxuZXhwb3J0IGludGVyZmFjZSBWZXJzaW9uZWRSZWZlcmVuY2U8VCA9IHVua25vd24+IGV4dGVuZHMgUmVmZXJlbmNlPFQ+LCBUYWdnZWQge31cblxuZXhwb3J0IGludGVyZmFjZSBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPFQgPSB1bmtub3duPiBleHRlbmRzIFBhdGhSZWZlcmVuY2U8VD4sIFRhZ2dlZCB7XG4gIGdldChwcm9wZXJ0eTogc3RyaW5nKTogVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTx1bmtub3duPjtcbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENhY2hlZFJlZmVyZW5jZTxUPiBpbXBsZW1lbnRzIFZlcnNpb25lZFJlZmVyZW5jZTxUPiB7XG4gIHB1YmxpYyBhYnN0cmFjdCB0YWc6IFRhZztcblxuICBwcml2YXRlIGxhc3RSZXZpc2lvbjogT3B0aW9uPFJldmlzaW9uPiA9IG51bGw7XG4gIHByaXZhdGUgbGFzdFZhbHVlOiBPcHRpb248VD4gPSBudWxsO1xuXG4gIHZhbHVlKCk6IFQge1xuICAgIGxldCB7IHRhZywgbGFzdFJldmlzaW9uLCBsYXN0VmFsdWUgfSA9IHRoaXM7XG5cbiAgICBpZiAobGFzdFJldmlzaW9uID09PSBudWxsIHx8ICF2YWxpZGF0ZSh0YWcsIGxhc3RSZXZpc2lvbikpIHtcbiAgICAgIGxhc3RWYWx1ZSA9IHRoaXMubGFzdFZhbHVlID0gdGhpcy5jb21wdXRlKCk7XG4gICAgICB0aGlzLmxhc3RSZXZpc2lvbiA9IHZhbHVlKHRhZyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGxhc3RWYWx1ZSBhcyBUO1xuICB9XG5cbiAgcHJvdGVjdGVkIGFic3RyYWN0IGNvbXB1dGUoKTogVDtcblxuICBwcm90ZWN0ZWQgaW52YWxpZGF0ZSgpIHtcbiAgICB0aGlzLmxhc3RSZXZpc2lvbiA9IG51bGw7XG4gIH1cbn1cblxuLy8vLy8vLy8vL1xuXG5leHBvcnQgY2xhc3MgUmVmZXJlbmNlQ2FjaGU8VD4gaW1wbGVtZW50cyBUYWdnZWQge1xuICBwdWJsaWMgdGFnOiBUYWc7XG5cbiAgcHJpdmF0ZSByZWZlcmVuY2U6IFZlcnNpb25lZFJlZmVyZW5jZTxUPjtcbiAgcHJpdmF0ZSBsYXN0VmFsdWU6IE9wdGlvbjxUPiA9IG51bGw7XG4gIHByaXZhdGUgbGFzdFJldmlzaW9uOiBPcHRpb248UmV2aXNpb24+ID0gbnVsbDtcbiAgcHJpdmF0ZSBpbml0aWFsaXplZCA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKHJlZmVyZW5jZTogVmVyc2lvbmVkUmVmZXJlbmNlPFQ+KSB7XG4gICAgdGhpcy50YWcgPSByZWZlcmVuY2UudGFnO1xuICAgIHRoaXMucmVmZXJlbmNlID0gcmVmZXJlbmNlO1xuICB9XG5cbiAgcGVlaygpOiBUIHtcbiAgICBpZiAoIXRoaXMuaW5pdGlhbGl6ZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLmluaXRpYWxpemUoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5sYXN0VmFsdWUgYXMgVDtcbiAgfVxuXG4gIHJldmFsaWRhdGUoKTogVmFsaWRhdGlvbjxUPiB7XG4gICAgaWYgKCF0aGlzLmluaXRpYWxpemVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbml0aWFsaXplKCk7XG4gICAgfVxuXG4gICAgbGV0IHsgcmVmZXJlbmNlLCBsYXN0UmV2aXNpb24gfSA9IHRoaXM7XG4gICAgbGV0IHRhZyA9IHJlZmVyZW5jZS50YWc7XG5cbiAgICBpZiAodmFsaWRhdGUodGFnLCBsYXN0UmV2aXNpb24gYXMgbnVtYmVyKSkgcmV0dXJuIE5PVF9NT0RJRklFRDtcbiAgICB0aGlzLmxhc3RSZXZpc2lvbiA9IHZhbHVlKHRhZyk7XG5cbiAgICBsZXQgeyBsYXN0VmFsdWUgfSA9IHRoaXM7XG4gICAgbGV0IGN1cnJlbnRWYWx1ZSA9IHJlZmVyZW5jZS52YWx1ZSgpO1xuICAgIGlmIChjdXJyZW50VmFsdWUgPT09IGxhc3RWYWx1ZSkgcmV0dXJuIE5PVF9NT0RJRklFRDtcbiAgICB0aGlzLmxhc3RWYWx1ZSA9IGN1cnJlbnRWYWx1ZTtcblxuICAgIHJldHVybiBjdXJyZW50VmFsdWU7XG4gIH1cblxuICBwcml2YXRlIGluaXRpYWxpemUoKTogVCB7XG4gICAgbGV0IHsgcmVmZXJlbmNlIH0gPSB0aGlzO1xuXG4gICAgbGV0IGN1cnJlbnRWYWx1ZSA9ICh0aGlzLmxhc3RWYWx1ZSA9IHJlZmVyZW5jZS52YWx1ZSgpKTtcbiAgICB0aGlzLmxhc3RSZXZpc2lvbiA9IHZhbHVlKHJlZmVyZW5jZS50YWcpO1xuICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xuXG4gICAgcmV0dXJuIGN1cnJlbnRWYWx1ZTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBWYWxpZGF0aW9uPFQ+ID0gVCB8IE5vdE1vZGlmaWVkO1xuXG5leHBvcnQgdHlwZSBOb3RNb2RpZmllZCA9ICdhZGIzYjc4ZS0zZDIyLTRlNGItODc3YS02MzE3YzJjNWMxNDUnO1xuXG5jb25zdCBOT1RfTU9ESUZJRUQ6IE5vdE1vZGlmaWVkID0gJ2FkYjNiNzhlLTNkMjItNGU0Yi04NzdhLTYzMTdjMmM1YzE0NSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc01vZGlmaWVkPFQ+KHZhbHVlOiBWYWxpZGF0aW9uPFQ+KTogdmFsdWUgaXMgVCB7XG4gIHJldHVybiB2YWx1ZSAhPT0gTk9UX01PRElGSUVEO1xufVxuIiwiaW1wb3J0IHsgaXNPYmplY3QgfSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCB7XG4gIGRpcnR5LFxuICB1cGRhdGUsXG4gIGNyZWF0ZVVwZGF0YWJsZVRhZyxcbiAgVXBkYXRhYmxlVGFnLFxuICBDT05TVEFOVF9UQUcsXG4gIGlzQ29uc3RUYWcsXG4gIENvbnN0YW50VGFnLFxufSBmcm9tICcuL3ZhbGlkYXRvcnMnO1xuXG50eXBlIFRhZ3MgPSBNYXA8UHJvcGVydHlLZXksIFVwZGF0YWJsZVRhZz47XG5jb25zdCBUUkFDS0VEX1RBR1MgPSBuZXcgV2Vha01hcDxvYmplY3QsIFRhZ3M+KCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXJ0eVRhZzxUPihvYmo6IFQsIGtleToga2V5b2YgVCk6IHZvaWQge1xuICBpZiAoaXNPYmplY3Qob2JqKSkge1xuICAgIGxldCB0YWcgPSB0YWdGb3Iob2JqLCBrZXkpO1xuXG4gICAgaWYgKHRhZyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB1cGRhdGVUYWcob2JqLCBrZXksIGNyZWF0ZVVwZGF0YWJsZVRhZygpKTtcbiAgICB9IGVsc2UgaWYgKGlzQ29uc3RUYWcodGFnKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBCVUc6IENhbid0IHVwZGF0ZSBhIGNvbnN0YW50IHRhZ2ApO1xuICAgIH0gZWxzZSB7XG4gICAgICBkaXJ0eSh0YWcpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEJVRzogQ2FuJ3QgdXBkYXRlIGEgdGFnIGZvciBhIHByaW1pdGl2ZWApO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0YWdGb3I8VCBleHRlbmRzIG9iamVjdD4ob2JqOiBULCBrZXk6IGtleW9mIFQpOiBVcGRhdGFibGVUYWc7XG5leHBvcnQgZnVuY3Rpb24gdGFnRm9yPFQ+KG9iajogVCwga2V5OiBzdHJpbmcpOiBDb25zdGFudFRhZztcbmV4cG9ydCBmdW5jdGlvbiB0YWdGb3I8VD4ob2JqOiBULCBrZXk6IGtleW9mIFQpOiBVcGRhdGFibGVUYWcgfCBDb25zdGFudFRhZyB7XG4gIGlmIChpc09iamVjdChvYmopKSB7XG4gICAgbGV0IHRhZ3MgPSBUUkFDS0VEX1RBR1MuZ2V0KG9iaik7XG5cbiAgICBpZiAodGFncyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0YWdzID0gbmV3IE1hcCgpO1xuICAgICAgVFJBQ0tFRF9UQUdTLnNldChvYmosIHRhZ3MpO1xuICAgIH0gZWxzZSBpZiAodGFncy5oYXMoa2V5KSkge1xuICAgICAgcmV0dXJuIHRhZ3MuZ2V0KGtleSkhO1xuICAgIH1cblxuICAgIGxldCB0YWcgPSBjcmVhdGVVcGRhdGFibGVUYWcoKTtcbiAgICB0YWdzLnNldChrZXksIHRhZyk7XG4gICAgcmV0dXJuIHRhZztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gQ09OU1RBTlRfVEFHO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVUYWc8VD4ob2JqOiBULCBrZXk6IGtleW9mIFQsIG5ld1RhZzogVXBkYXRhYmxlVGFnKTogVXBkYXRhYmxlVGFnIHtcbiAgaWYgKGlzT2JqZWN0KG9iaikpIHtcbiAgICBsZXQgdGFnID0gdGFnRm9yKG9iaiwga2V5KTtcblxuICAgIGlmIChpc0NvbnN0VGFnKHRhZykpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQlVHOiBDYW4ndCB1cGRhdGUgYSBjb25zdGFudCB0YWdgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdXBkYXRlKHRhZywgbmV3VGFnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGFnO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihgQlVHOiBDYW4ndCB1cGRhdGUgYSB0YWcgZm9yIGEgcHJpbWl0aXZlYCk7XG4gIH1cbn1cbiIsImltcG9ydCB7IGRpY3QgfSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCB7IGNyZWF0ZVRhZywgZGlydHkgfSBmcm9tICcuL3ZhbGlkYXRvcnMnO1xuaW1wb3J0IHsgZGlydHlUYWcgfSBmcm9tICcuL3RhZ3MnO1xuXG50eXBlIFByaXZhdGVzPFQ+ID0geyBbSyBpbiBrZXlvZiBUXT86IFByaXZhdGU8VFtLXT4gfTtcblxuaW50ZXJmYWNlIFByaXZhdGU8VD4ge1xuICBnZXQoKTogVCB8IHVuZGVmaW5lZDtcbiAgc2V0KHZhbHVlOiBUKTogdm9pZDtcbn1cblxuY2xhc3MgUHJpdmF0ZUltcGw8VD4gaW1wbGVtZW50cyBQcml2YXRlPFQ+IHtcbiAgcHJpdmF0ZSBpbm5lcjogVCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICBnZXQoKTogVCB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuaW5uZXI7XG4gIH1cblxuICBzZXQodmFsdWU6IFQpOiB2b2lkIHtcbiAgICB0aGlzLmlubmVyID0gdmFsdWU7XG4gIH1cbn1cblxuY29uc3QgUFJJVkFURVMgPSBuZXcgV2Vha01hcDxvYmplY3QsIFByaXZhdGVzPG9iamVjdD4+KCk7XG5cbmZ1bmN0aW9uIHByaXZhdGVGb3I8TyBleHRlbmRzIG9iamVjdCwgSyBleHRlbmRzIGtleW9mIE8+KG9iamVjdDogTywga2V5OiBLKTogUHJpdmF0ZTxPW0tdPiB7XG4gIGxldCBwcml2YXRlczogUHJpdmF0ZXM8Tz47XG5cbiAgaWYgKFBSSVZBVEVTLmhhcyhvYmplY3QpKSB7XG4gICAgcHJpdmF0ZXMgPSBQUklWQVRFUy5nZXQob2JqZWN0KSEgYXMgUHJpdmF0ZXM8Tz47XG4gIH0gZWxzZSB7XG4gICAgcHJpdmF0ZXMgPSBkaWN0KCkgYXMgUHJpdmF0ZXM8Tz47XG4gICAgUFJJVkFURVMuc2V0KG9iamVjdCwgcHJpdmF0ZXMpO1xuICB9XG5cbiAgaWYgKGtleSBpbiBwcml2YXRlcykge1xuICAgIHJldHVybiBwcml2YXRlc1trZXldITtcbiAgfSBlbHNlIHtcbiAgICBsZXQgcCA9IG5ldyBQcml2YXRlSW1wbDxPW0tdPigpO1xuICAgIHByaXZhdGVzW2tleV0gPSBwO1xuICAgIHJldHVybiBwO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBFUE9DSCA9IGNyZWF0ZVRhZygpO1xuXG5leHBvcnQgZnVuY3Rpb24gc2V0U3RhdGVGb3I8TyBleHRlbmRzIG9iamVjdCwgSyBleHRlbmRzIGtleW9mIE8+KFxuICBvYmplY3Q6IE8sXG4gIGtleTogSyxcbiAgdmFsdWU6IE9bS11cbik6IHZvaWQge1xuICBkaXJ0eShFUE9DSCk7XG4gIGRpcnR5VGFnKG9iamVjdCwga2V5KTtcbiAgcHJpdmF0ZUZvcihvYmplY3QsIGtleSkuc2V0KHZhbHVlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFN0YXRlRm9yPE8gZXh0ZW5kcyBvYmplY3QsIEsgZXh0ZW5kcyBrZXlvZiBPPihcbiAgb2JqZWN0OiBPLFxuICBrZXk6IEtcbik6IE9bS10gfCB1bmRlZmluZWQge1xuICByZXR1cm4gcHJpdmF0ZUZvcihvYmplY3QsIGtleSkuZ2V0KCk7XG59XG4iLCJpbXBvcnQgeyBUYWcsIGNvbWJpbmUsIHVwZGF0ZSwgVXBkYXRhYmxlVGFnLCBjcmVhdGVVcGRhdGFibGVUYWcgfSBmcm9tICcuL3ZhbGlkYXRvcnMnO1xuaW1wb3J0IHsgT3B0aW9uIH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBnZXRTdGF0ZUZvciwgc2V0U3RhdGVGb3IgfSBmcm9tICcuL3RyYWNrZWQnO1xuaW1wb3J0IHsgdGFnRm9yIH0gZnJvbSAnLi90YWdzJztcblxuY2xhc3MgVHJhY2tlciB7XG4gIHByaXZhdGUgdGFncyA9IG5ldyBTZXQ8VGFnPigpO1xuICBwcml2YXRlIGxhc3Q6IE9wdGlvbjxUYWc+ID0gbnVsbDtcblxuICBhZGQodGFnOiBUYWcpOiB2b2lkIHtcbiAgICB0aGlzLnRhZ3MuYWRkKHRhZyk7XG4gICAgdGhpcy5sYXN0ID0gdGFnO1xuICB9XG5cbiAgZ2V0IHNpemUoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy50YWdzLnNpemU7XG4gIH1cblxuICBjb21iaW5lKCk6IFVwZGF0YWJsZVRhZyB7XG4gICAgbGV0IHsgdGFncyB9ID0gdGhpcztcbiAgICBsZXQgdGFnID0gY3JlYXRlVXBkYXRhYmxlVGFnKCk7XG5cbiAgICBpZiAodGFncy5zaXplID09PSAxKSB7XG4gICAgICB1cGRhdGUodGFnLCB0aGlzLmxhc3QhKTtcbiAgICB9IGVsc2UgaWYgKHRhZ3Muc2l6ZSA+IDEpIHtcbiAgICAgIGxldCB0YWdzOiBUYWdbXSA9IFtdO1xuICAgICAgdGhpcy50YWdzLmZvckVhY2godGFnID0+IHRhZ3MucHVzaCh0YWcpKTtcblxuICAgICAgdXBkYXRlKHRhZywgY29tYmluZSh0YWdzKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRhZztcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcHVzaFRyYWNrRnJhbWUoKTogT3B0aW9uPFRyYWNrZXI+IHtcbiAgbGV0IG9sZCA9IENVUlJFTlRfVFJBQ0tFUjtcbiAgbGV0IHRyYWNrZXIgPSBuZXcgVHJhY2tlcigpO1xuXG4gIENVUlJFTlRfVFJBQ0tFUiA9IHRyYWNrZXI7XG4gIHJldHVybiBvbGQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwb3BUcmFja0ZyYW1lKG9sZDogT3B0aW9uPFRyYWNrZXI+KTogVXBkYXRhYmxlVGFnIHtcbiAgbGV0IHRhZyA9IENVUlJFTlRfVFJBQ0tFUiEuY29tYmluZSgpO1xuICBDVVJSRU5UX1RSQUNLRVIgPSBvbGQ7XG4gIGlmIChDVVJSRU5UX1RSQUNLRVIpIENVUlJFTlRfVFJBQ0tFUi5hZGQodGFnKTtcbiAgcmV0dXJuIHRhZztcbn1cblxubGV0IENVUlJFTlRfVFJBQ0tFUjogT3B0aW9uPFRyYWNrZXI+ID0gbnVsbDtcblxuZXhwb3J0IHR5cGUgR2V0dGVyPFQsIEsgZXh0ZW5kcyBrZXlvZiBUPiA9IChzZWxmOiBUKSA9PiBUW0tdIHwgdW5kZWZpbmVkO1xuZXhwb3J0IHR5cGUgU2V0dGVyPFQsIEsgZXh0ZW5kcyBrZXlvZiBUPiA9IChzZWxmOiBULCB2YWx1ZTogVFtLXSkgPT4gdm9pZDtcblxuZXhwb3J0IGZ1bmN0aW9uIHRyYWNrZWREYXRhPFQgZXh0ZW5kcyBvYmplY3QsIEsgZXh0ZW5kcyBrZXlvZiBUPihcbiAga2V5OiBLXG4pOiB7IGdldHRlcjogR2V0dGVyPFQsIEs+OyBzZXR0ZXI6IFNldHRlcjxULCBLPiB9IHtcbiAgZnVuY3Rpb24gZ2V0dGVyKHNlbGY6IFQpIHtcbiAgICBpZiAoQ1VSUkVOVF9UUkFDS0VSKSBDVVJSRU5UX1RSQUNLRVIuYWRkKHRhZ0ZvcihzZWxmLCBrZXkpKTtcbiAgICByZXR1cm4gZ2V0U3RhdGVGb3Ioc2VsZiwga2V5KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldHRlcihzZWxmOiBULCB2YWx1ZTogVFtLXSk6IHZvaWQge1xuICAgIHNldFN0YXRlRm9yKHNlbGYsIGtleSwgdmFsdWUpO1xuICB9XG5cbiAgcmV0dXJuIHsgZ2V0dGVyLCBzZXR0ZXIgfTtcbn1cbiIsImltcG9ydCB7IGRpY3QsIGlzRGljdCB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0IHtcbiAgQ09OU1RBTlRfVEFHLFxuICBpc0NvbnN0LFxuICBUYWcsXG4gIGNvbWJpbmUsXG4gIGNyZWF0ZVVwZGF0YWJsZVRhZyxcbiAgVXBkYXRhYmxlVGFnLFxuICB2YWxpZGF0ZSxcbiAgdmFsdWUsXG4gIGRpcnR5LFxuICB1cGRhdGUsXG59IGZyb20gJy4vdmFsaWRhdG9ycyc7XG5pbXBvcnQgeyBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlIH0gZnJvbSAnLi9yZWZlcmVuY2UnO1xuaW1wb3J0IHsgcHVzaFRyYWNrRnJhbWUsIHBvcFRyYWNrRnJhbWUgfSBmcm9tICcuL2F1dG90cmFjayc7XG5pbXBvcnQgeyB0YWdGb3IgfSBmcm9tICcuL3RhZ3MnO1xuXG5leHBvcnQgY2xhc3MgUm9vdFJlZmVyZW5jZTxUPiBpbXBsZW1lbnRzIFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8VD4ge1xuICBwcml2YXRlIGNoaWxkcmVuID0gZGljdDxSb290UHJvcGVydHlSZWZlcmVuY2U+KCk7XG5cbiAgdGFnID0gQ09OU1RBTlRfVEFHO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaW5uZXI6IFQpIHt9XG5cbiAgdmFsdWUoKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuaW5uZXI7XG4gIH1cblxuICBnZXQocHJvcGVydHlLZXk6IHN0cmluZyk6IFJvb3RQcm9wZXJ0eVJlZmVyZW5jZSB7XG4gICAgbGV0IHJlZiA9IHRoaXMuY2hpbGRyZW5bcHJvcGVydHlLZXldO1xuXG4gICAgaWYgKCFyZWYpIHtcbiAgICAgIHJlZiA9IHRoaXMuY2hpbGRyZW5bcHJvcGVydHlLZXldID0gbmV3IFJvb3RQcm9wZXJ0eVJlZmVyZW5jZSh0aGlzLmlubmVyLCBwcm9wZXJ0eUtleSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlZjtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgSW1tdXRhYmxlUm9vdFJlZmVyZW5jZTxUPiBpbXBsZW1lbnRzIFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8VD4ge1xuICBwcml2YXRlIGNoaWxkcmVuID0gZGljdDxSb290UHJvcGVydHlSZWZlcmVuY2U+KCk7XG5cbiAgdGFnID0gQ09OU1RBTlRfVEFHO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaW5uZXI6IFQpIHt9XG5cbiAgdmFsdWUoKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuaW5uZXI7XG4gIH1cblxuICBnZXQocHJvcGVydHlLZXk6IHN0cmluZyk6IFJvb3RQcm9wZXJ0eVJlZmVyZW5jZSB7XG4gICAgbGV0IHJlZiA9IHRoaXMuY2hpbGRyZW5bcHJvcGVydHlLZXldO1xuXG4gICAgaWYgKCFyZWYpIHtcbiAgICAgIHJlZiA9IHRoaXMuY2hpbGRyZW5bcHJvcGVydHlLZXldID0gbmV3IFJvb3RQcm9wZXJ0eVJlZmVyZW5jZSh0aGlzLmlubmVyLCBwcm9wZXJ0eUtleSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlZjtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBQcmltaXRpdmUgPSB1bmRlZmluZWQgfCBudWxsIHwgYm9vbGVhbiB8IG51bWJlciB8IHN0cmluZztcblxuZXhwb3J0IGNsYXNzIFByaW1pdGl2ZVJlZmVyZW5jZTxUIGV4dGVuZHMgUHJpbWl0aXZlPiBpbXBsZW1lbnRzIFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8VD4ge1xuICByZWFkb25seSB0YWcgPSBDT05TVEFOVF9UQUc7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBpbm5lcjogVCkge31cblxuICB2YWx1ZSgpOiBUIHtcbiAgICByZXR1cm4gdGhpcy5pbm5lcjtcbiAgfVxuXG4gIGdldChfa2V5OiBzdHJpbmcpOiBQcmltaXRpdmVSZWZlcmVuY2U8UHJpbWl0aXZlPiB7XG4gICAgcmV0dXJuIFVOREVGSU5FRF9SRUZFUkVOQ0U7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IFVOREVGSU5FRF9SRUZFUkVOQ0U6IFByaW1pdGl2ZVJlZmVyZW5jZTx1bmRlZmluZWQ+ID0gbmV3IFByaW1pdGl2ZVJlZmVyZW5jZSh1bmRlZmluZWQpO1xuXG5leHBvcnQgZnVuY3Rpb24gY2FjaGVkPFQ+KGlubmVyOiBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPFQ+KTogVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTxUPiB7XG4gIHJldHVybiBuZXcgQ2FjaGVkKGlubmVyKTtcbn1cblxuZXhwb3J0IGNsYXNzIENhY2hlZDxUID0gdW5rbm93bj4gaW1wbGVtZW50cyBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPFQ+IHtcbiAgcHJpdmF0ZSBfbGFzdFJldmlzaW9uOiBudW1iZXIgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfbGFzdFZhbHVlOiBhbnkgPSBudWxsO1xuXG4gIHRhZzogVGFnID0gQ09OU1RBTlRfVEFHO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaW5uZXI6IFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8VD4pIHt9XG5cbiAgdmFsdWUoKSB7XG4gICAgbGV0IHsgdGFnLCBfbGFzdFJldmlzaW9uLCBfbGFzdFZhbHVlIH0gPSB0aGlzO1xuXG4gICAgaWYgKCFfbGFzdFJldmlzaW9uIHx8ICF2YWxpZGF0ZSh0YWcsIF9sYXN0UmV2aXNpb24pKSB7XG4gICAgICBfbGFzdFZhbHVlID0gdGhpcy5fbGFzdFZhbHVlID0gdGhpcy5pbm5lci52YWx1ZSgpO1xuICAgICAgdGhpcy5fbGFzdFJldmlzaW9uID0gdmFsdWUodGFnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gX2xhc3RWYWx1ZTtcbiAgfVxuXG4gIGdldChrZXk6IHN0cmluZyk6IFZlcnNpb25lZFBhdGhSZWZlcmVuY2Uge1xuICAgIHJldHVybiBwcm9wZXJ0eSh0aGlzLCBrZXkpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkYXRhKHZhbHVlOiB1bmtub3duKTogVmVyc2lvbmVkUGF0aFJlZmVyZW5jZSB7XG4gIGlmIChpc0RpY3QodmFsdWUpKSB7XG4gICAgcmV0dXJuIG5ldyBSb290UmVmZXJlbmNlKHZhbHVlKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbmV3IFByaW1pdGl2ZVJlZmVyZW5jZSh2YWx1ZSBhcyBudWxsIHwgdW5kZWZpbmVkKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvcGVydHkocGFyZW50UmVmZXJlbmNlOiBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlLCBwcm9wZXJ0eUtleTogc3RyaW5nKSB7XG4gIGlmIChpc0NvbnN0KHBhcmVudFJlZmVyZW5jZSkpIHtcbiAgICByZXR1cm4gbmV3IFJvb3RQcm9wZXJ0eVJlZmVyZW5jZShwYXJlbnRSZWZlcmVuY2UudmFsdWUoKSwgcHJvcGVydHlLZXkpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBuZXcgTmVzdGVkUHJvcGVydHlSZWZlcmVuY2UocGFyZW50UmVmZXJlbmNlLCBwcm9wZXJ0eUtleSk7XG4gIH1cbn1cblxuLy8gZnVuY3Rpb24gaXNNdXRhYmxlKHZhbHVlOiB1bmtub3duKTogYm9vbGVhbiB7XG4vLyAgIHJldHVybiB2YWx1ZSAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmICFPYmplY3QuaXNGcm96ZW4odmFsdWUpO1xuLy8gfVxuXG4vLyBmdW5jdGlvbiBjaGlsZCh2YWx1ZTogdW5rbm93biwga2V5OiBzdHJpbmcpOiBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlIHt9XG5cbmV4cG9ydCBjbGFzcyBSb290UHJvcGVydHlSZWZlcmVuY2UgaW1wbGVtZW50cyBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlIHtcbiAgdGFnID0gY3JlYXRlVXBkYXRhYmxlVGFnKCk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfcGFyZW50VmFsdWU6IHVua25vd24sIHByaXZhdGUgX3Byb3BlcnR5S2V5OiBzdHJpbmcpIHt9XG5cbiAgdmFsdWUoKTogdW5rbm93biB7XG4gICAgbGV0IHsgX3BhcmVudFZhbHVlIH0gPSB0aGlzO1xuICAgIGlmIChpc0RpY3QoX3BhcmVudFZhbHVlKSkge1xuICAgICAgbGV0IG9sZCA9IHB1c2hUcmFja0ZyYW1lKCk7XG4gICAgICBsZXQgcmV0ID0gX3BhcmVudFZhbHVlW3RoaXMuX3Byb3BlcnR5S2V5XTtcbiAgICAgIGxldCB0YWcgPSBwb3BUcmFja0ZyYW1lKG9sZCk7XG4gICAgICB1cGRhdGUodGhpcy50YWcsIHRhZyk7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIGdldChrZXk6IHN0cmluZyk6IFZlcnNpb25lZFBhdGhSZWZlcmVuY2Uge1xuICAgIHJldHVybiBuZXcgTmVzdGVkUHJvcGVydHlSZWZlcmVuY2UodGhpcywga2V5KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTmVzdGVkUHJvcGVydHlSZWZlcmVuY2UgaW1wbGVtZW50cyBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlIHtcbiAgcHVibGljIHRhZzogVGFnO1xuICBwcml2YXRlIF9wYXJlbnRPYmplY3RUYWc6IFVwZGF0YWJsZVRhZztcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9wYXJlbnRSZWZlcmVuY2U6IFZlcnNpb25lZFBhdGhSZWZlcmVuY2UsIHByaXZhdGUgX3Byb3BlcnR5S2V5OiBzdHJpbmcpIHtcbiAgICBsZXQgcGFyZW50T2JqZWN0VGFnID0gKHRoaXMuX3BhcmVudE9iamVjdFRhZyA9IGNyZWF0ZVVwZGF0YWJsZVRhZygpKTtcbiAgICBsZXQgcGFyZW50UmVmZXJlbmNlVGFnID0gX3BhcmVudFJlZmVyZW5jZS50YWc7XG5cbiAgICB0aGlzLnRhZyA9IGNvbWJpbmUoW3BhcmVudFJlZmVyZW5jZVRhZywgcGFyZW50T2JqZWN0VGFnXSk7XG4gIH1cblxuICB2YWx1ZSgpIHtcbiAgICBsZXQgeyBfcGFyZW50UmVmZXJlbmNlLCBfcGFyZW50T2JqZWN0VGFnLCBfcHJvcGVydHlLZXkgfSA9IHRoaXM7XG5cbiAgICBsZXQgcGFyZW50VmFsdWUgPSBfcGFyZW50UmVmZXJlbmNlLnZhbHVlKCk7XG5cbiAgICB1cGRhdGUoX3BhcmVudE9iamVjdFRhZywgdGFnRm9yKHBhcmVudFZhbHVlLCBfcHJvcGVydHlLZXkpKTtcblxuICAgIGlmIChpc0RpY3QocGFyZW50VmFsdWUpKSB7XG4gICAgICBsZXQgb2xkID0gcHVzaFRyYWNrRnJhbWUoKTtcbiAgICAgIGxldCByZXQgPSBwYXJlbnRWYWx1ZVtfcHJvcGVydHlLZXldO1xuICAgICAgbGV0IHRhZyA9IHBvcFRyYWNrRnJhbWUob2xkKTtcbiAgICAgIHVwZGF0ZShfcGFyZW50T2JqZWN0VGFnLCB0YWcpO1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICBnZXQoa2V5OiBzdHJpbmcpOiBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlIHtcbiAgICByZXR1cm4gbmV3IE5lc3RlZFByb3BlcnR5UmVmZXJlbmNlKHRoaXMsIGtleSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFVwZGF0YWJsZVJlZmVyZW5jZTxUID0gdW5rbm93bj4gaW1wbGVtZW50cyBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPFQ+IHtcbiAgcHVibGljIHRhZyA9IGNyZWF0ZVVwZGF0YWJsZVRhZygpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3ZhbHVlOiBUKSB7fVxuXG4gIHZhbHVlKCkge1xuICAgIHJldHVybiB0aGlzLl92YWx1ZTtcbiAgfVxuXG4gIHVwZGF0ZSh2YWx1ZTogVCkge1xuICAgIGxldCB7IF92YWx1ZSB9ID0gdGhpcztcblxuICAgIGlmICh2YWx1ZSAhPT0gX3ZhbHVlKSB7XG4gICAgICBkaXJ0eSh0aGlzLnRhZyk7XG4gICAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIGZvcmNlVXBkYXRlKHZhbHVlOiBUKSB7XG4gICAgZGlydHkodGhpcy50YWcpO1xuICAgIHRoaXMuX3ZhbHVlID0gdmFsdWU7XG4gIH1cblxuICBkaXJ0eSgpIHtcbiAgICBkaXJ0eSh0aGlzLnRhZyk7XG4gIH1cblxuICBnZXQoa2V5OiBzdHJpbmcpOiBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlIHtcbiAgICByZXR1cm4gbmV3IE5lc3RlZFByb3BlcnR5UmVmZXJlbmNlKHRoaXMsIGtleSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFN0YXRlPFQ+KGRhdGE6IFQpOiBVcGRhdGFibGVSZWZlcmVuY2U8VD4ge1xuICByZXR1cm4gbmV3IFVwZGF0YWJsZVJlZmVyZW5jZShkYXRhKTtcbn1cblxuY29uc3QgU1RBQkxFX1NUQVRFID0gbmV3IFdlYWtNYXAoKTtcblxuZXhwb3J0IGZ1bmN0aW9uIFN0YWJsZVN0YXRlPFQgZXh0ZW5kcyBvYmplY3Q+KGRhdGE6IFQpOiBVcGRhdGFibGVSZWZlcmVuY2U8VD4ge1xuICBpZiAoU1RBQkxFX1NUQVRFLmhhcyhkYXRhKSkge1xuICAgIHJldHVybiBTVEFCTEVfU1RBVEUuZ2V0KGRhdGEpO1xuICB9IGVsc2Uge1xuICAgIGxldCByZWYgPSBuZXcgVXBkYXRhYmxlUmVmZXJlbmNlKGRhdGEpO1xuICAgIFNUQUJMRV9TVEFURS5zZXQoZGF0YSwgcmVmKTtcbiAgICByZXR1cm4gcmVmO1xuICB9XG59XG4iLCJpbXBvcnQgeyBDT05TVEFOVF9UQUcsIFRhZyB9IGZyb20gJy4vdmFsaWRhdG9ycyc7XG5pbXBvcnQgeyBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlIH0gZnJvbSAnLi9yZWZlcmVuY2UnO1xuaW1wb3J0IHsgVU5ERUZJTkVEX1JFRkVSRU5DRSB9IGZyb20gJy4vcHJvcGVydHknO1xuXG5leHBvcnQgY2xhc3MgQ29uc3RSZWZlcmVuY2U8VCA9IHVua25vd24+IGltcGxlbWVudHMgVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTxUPiB7XG4gIHB1YmxpYyB0YWc6IFRhZyA9IENPTlNUQU5UX1RBRztcblxuICBjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgaW5uZXI6IFQpIHt9XG5cbiAgdmFsdWUoKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuaW5uZXI7XG4gIH1cblxuICBnZXQoX2tleTogc3RyaW5nKTogVmVyc2lvbmVkUGF0aFJlZmVyZW5jZSB7XG4gICAgcmV0dXJuIFVOREVGSU5FRF9SRUZFUkVOQ0U7XG4gIH1cbn1cbiIsImltcG9ydCB7IExpbmtlZExpc3QsIExpc3ROb2RlLCBPcHRpb24gfSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCB7IFRhZyB9IGZyb20gJy4vdmFsaWRhdG9ycyc7XG5pbXBvcnQgeyBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlIGFzIFBhdGhSZWZlcmVuY2UgfSBmcm9tICcuL3JlZmVyZW5jZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSXRlcmF0aW9uSXRlbTxULCBVPiB7XG4gIGtleTogdW5rbm93bjtcbiAgdmFsdWU6IFQ7XG4gIG1lbW86IFU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQWJzdHJhY3RJdGVyYXRvcjxULCBVLCBWIGV4dGVuZHMgSXRlcmF0aW9uSXRlbTxULCBVPj4ge1xuICBpc0VtcHR5KCk6IGJvb2xlYW47XG4gIG5leHQoKTogT3B0aW9uPFY+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFic3RyYWN0SXRlcmFibGU8XG4gIFQsXG4gIFUsXG4gIEl0ZW1UeXBlIGV4dGVuZHMgSXRlcmF0aW9uSXRlbTxULCBVPixcbiAgVmFsdWVSZWZlcmVuY2VUeXBlIGV4dGVuZHMgUGF0aFJlZmVyZW5jZTxUPixcbiAgTWVtb1JlZmVyZW5jZVR5cGUgZXh0ZW5kcyBQYXRoUmVmZXJlbmNlPFU+XG4+IHtcbiAgdGFnOiBUYWc7XG4gIGl0ZXJhdGUoKTogQWJzdHJhY3RJdGVyYXRvcjxULCBVLCBJdGVtVHlwZT47XG5cbiAgdmFsdWVSZWZlcmVuY2VGb3IoaXRlbTogSXRlbVR5cGUpOiBWYWx1ZVJlZmVyZW5jZVR5cGU7XG4gIHVwZGF0ZVZhbHVlUmVmZXJlbmNlKHJlZmVyZW5jZTogVmFsdWVSZWZlcmVuY2VUeXBlLCBpdGVtOiBJdGVtVHlwZSk6IHZvaWQ7XG5cbiAgbWVtb1JlZmVyZW5jZUZvcihpdGVtOiBJdGVtVHlwZSk6IE1lbW9SZWZlcmVuY2VUeXBlO1xuICB1cGRhdGVNZW1vUmVmZXJlbmNlKHJlZmVyZW5jZTogTWVtb1JlZmVyZW5jZVR5cGUsIGl0ZW06IEl0ZW1UeXBlKTogdm9pZDtcbn1cblxuZXhwb3J0IHR5cGUgSXRlcmF0b3I8VCwgVT4gPSBBYnN0cmFjdEl0ZXJhdG9yPFQsIFUsIEl0ZXJhdGlvbkl0ZW08VCwgVT4+O1xuZXhwb3J0IHR5cGUgSXRlcmFibGU8VCwgVT4gPSBBYnN0cmFjdEl0ZXJhYmxlPFxuICBULFxuICBVLFxuICBJdGVyYXRpb25JdGVtPFQsIFU+LFxuICBQYXRoUmVmZXJlbmNlPFQ+LFxuICBQYXRoUmVmZXJlbmNlPFU+XG4+O1xuXG5leHBvcnQgdHlwZSBPcGFxdWVJdGVyYXRpb25JdGVtID0gSXRlcmF0aW9uSXRlbTx1bmtub3duLCB1bmtub3duPjtcbmV4cG9ydCB0eXBlIE9wYXF1ZUl0ZXJhdG9yID0gQWJzdHJhY3RJdGVyYXRvcjx1bmtub3duLCB1bmtub3duLCBPcGFxdWVJdGVyYXRpb25JdGVtPjtcbmV4cG9ydCB0eXBlIE9wYXF1ZVBhdGhSZWZlcmVuY2UgPSBQYXRoUmVmZXJlbmNlPHVua25vd24+O1xuZXhwb3J0IHR5cGUgT3BhcXVlSXRlcmFibGUgPSBBYnN0cmFjdEl0ZXJhYmxlPFxuICB1bmtub3duLFxuICB1bmtub3duLFxuICBPcGFxdWVJdGVyYXRpb25JdGVtLFxuICBPcGFxdWVQYXRoUmVmZXJlbmNlLFxuICBPcGFxdWVQYXRoUmVmZXJlbmNlXG4+O1xuZXhwb3J0IHR5cGUgT3BhcXVlUGF0aFJlZmVyZW5jZUl0ZXJhdGlvbkl0ZW0gPSBJdGVyYXRpb25JdGVtPFxuICBPcGFxdWVQYXRoUmVmZXJlbmNlLFxuICBPcGFxdWVQYXRoUmVmZXJlbmNlXG4+O1xuXG5leHBvcnQgY2xhc3MgTGlzdEl0ZW0gZXh0ZW5kcyBMaXN0Tm9kZTxPcGFxdWVQYXRoUmVmZXJlbmNlPiBpbXBsZW1lbnRzIE9wYXF1ZUl0ZXJhdGlvbkl0ZW0ge1xuICBwdWJsaWMga2V5OiB1bmtub3duO1xuICBwdWJsaWMgbWVtbzogT3BhcXVlUGF0aFJlZmVyZW5jZTtcbiAgcHVibGljIHJldGFpbmVkID0gZmFsc2U7XG4gIHB1YmxpYyBzZWVuID0gZmFsc2U7XG4gIHByaXZhdGUgaXRlcmFibGU6IE9wYXF1ZUl0ZXJhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKGl0ZXJhYmxlOiBPcGFxdWVJdGVyYWJsZSwgcmVzdWx0OiBPcGFxdWVJdGVyYXRpb25JdGVtKSB7XG4gICAgc3VwZXIoaXRlcmFibGUudmFsdWVSZWZlcmVuY2VGb3IocmVzdWx0KSk7XG4gICAgdGhpcy5rZXkgPSByZXN1bHQua2V5O1xuICAgIHRoaXMuaXRlcmFibGUgPSBpdGVyYWJsZTtcbiAgICB0aGlzLm1lbW8gPSBpdGVyYWJsZS5tZW1vUmVmZXJlbmNlRm9yKHJlc3VsdCk7XG4gIH1cblxuICB1cGRhdGUoaXRlbTogT3BhcXVlSXRlcmF0aW9uSXRlbSkge1xuICAgIHRoaXMucmV0YWluZWQgPSB0cnVlO1xuICAgIHRoaXMuaXRlcmFibGUudXBkYXRlVmFsdWVSZWZlcmVuY2UodGhpcy52YWx1ZSwgaXRlbSk7XG4gICAgdGhpcy5pdGVyYWJsZS51cGRhdGVNZW1vUmVmZXJlbmNlKHRoaXMubWVtbywgaXRlbSk7XG4gIH1cblxuICBzaG91bGRSZW1vdmUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICF0aGlzLnJldGFpbmVkO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5yZXRhaW5lZCA9IGZhbHNlO1xuICAgIHRoaXMuc2VlbiA9IGZhbHNlO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBJdGVyYXRpb25BcnRpZmFjdHMge1xuICBwdWJsaWMgdGFnOiBUYWc7XG5cbiAgcHJpdmF0ZSBpdGVyYWJsZTogT3BhcXVlSXRlcmFibGU7XG4gIHByaXZhdGUgaXRlcmF0b3I6IE9wdGlvbjxPcGFxdWVJdGVyYXRvcj4gPSBudWxsO1xuICBwcml2YXRlIG1hcCA9IG5ldyBNYXA8dW5rbm93biwgTGlzdEl0ZW0+KCk7XG4gIHByaXZhdGUgbGlzdCA9IG5ldyBMaW5rZWRMaXN0PExpc3RJdGVtPigpO1xuXG4gIGNvbnN0cnVjdG9yKGl0ZXJhYmxlOiBPcGFxdWVJdGVyYWJsZSkge1xuICAgIHRoaXMudGFnID0gaXRlcmFibGUudGFnO1xuICAgIHRoaXMuaXRlcmFibGUgPSBpdGVyYWJsZTtcbiAgfVxuXG4gIGlzRW1wdHkoKTogYm9vbGVhbiB7XG4gICAgbGV0IGl0ZXJhdG9yID0gKHRoaXMuaXRlcmF0b3IgPSB0aGlzLml0ZXJhYmxlLml0ZXJhdGUoKSk7XG4gICAgcmV0dXJuIGl0ZXJhdG9yLmlzRW1wdHkoKTtcbiAgfVxuXG4gIGl0ZXJhdGUoKTogT3BhcXVlSXRlcmF0b3Ige1xuICAgIGxldCBpdGVyYXRvcjogT3BhcXVlSXRlcmF0b3I7XG5cbiAgICBpZiAodGhpcy5pdGVyYXRvciA9PT0gbnVsbCkge1xuICAgICAgaXRlcmF0b3IgPSB0aGlzLml0ZXJhYmxlLml0ZXJhdGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaXRlcmF0b3IgPSB0aGlzLml0ZXJhdG9yO1xuICAgIH1cblxuICAgIHRoaXMuaXRlcmF0b3IgPSBudWxsO1xuXG4gICAgcmV0dXJuIGl0ZXJhdG9yO1xuICB9XG5cbiAgYWR2YW5jZVRvS2V5KGtleTogdW5rbm93biwgY3VycmVudDogTGlzdEl0ZW0pOiBPcHRpb248TGlzdEl0ZW0+IHtcbiAgICBsZXQgc2VlayA9IGN1cnJlbnQ7XG5cbiAgICB3aGlsZSAoc2VlayAhPT0gbnVsbCAmJiBzZWVrLmtleSAhPT0ga2V5KSB7XG4gICAgICBzZWVrID0gdGhpcy5hZHZhbmNlTm9kZShzZWVrKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2VlaztcbiAgfVxuXG4gIGhhcyhrZXk6IHVua25vd24pOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5tYXAuaGFzKGtleSk7XG4gIH1cblxuICBnZXQoa2V5OiB1bmtub3duKTogTGlzdEl0ZW0ge1xuICAgIHJldHVybiB0aGlzLm1hcC5nZXQoa2V5KSE7XG4gIH1cblxuICB3YXNTZWVuKGtleTogdW5rbm93bik6IGJvb2xlYW4ge1xuICAgIGxldCBub2RlID0gdGhpcy5tYXAuZ2V0KGtleSk7XG4gICAgcmV0dXJuIG5vZGUgIT09IHVuZGVmaW5lZCAmJiBub2RlLnNlZW47XG4gIH1cblxuICB1cGRhdGUoaXRlbTogT3BhcXVlSXRlcmF0aW9uSXRlbSk6IExpc3RJdGVtIHtcbiAgICBsZXQgZm91bmQgPSB0aGlzLmdldChpdGVtLmtleSk7XG4gICAgZm91bmQudXBkYXRlKGl0ZW0pO1xuICAgIHJldHVybiBmb3VuZDtcbiAgfVxuXG4gIGFwcGVuZChpdGVtOiBPcGFxdWVJdGVyYXRpb25JdGVtKTogTGlzdEl0ZW0ge1xuICAgIGxldCB7IG1hcCwgbGlzdCwgaXRlcmFibGUgfSA9IHRoaXM7XG5cbiAgICBsZXQgbm9kZSA9IG5ldyBMaXN0SXRlbShpdGVyYWJsZSwgaXRlbSk7XG4gICAgbWFwLnNldChpdGVtLmtleSwgbm9kZSk7XG5cbiAgICBsaXN0LmFwcGVuZChub2RlKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIGluc2VydEJlZm9yZShpdGVtOiBPcGFxdWVJdGVyYXRpb25JdGVtLCByZWZlcmVuY2U6IE9wdGlvbjxMaXN0SXRlbT4pOiBMaXN0SXRlbSB7XG4gICAgbGV0IHsgbWFwLCBsaXN0LCBpdGVyYWJsZSB9ID0gdGhpcztcblxuICAgIGxldCBub2RlID0gbmV3IExpc3RJdGVtKGl0ZXJhYmxlLCBpdGVtKTtcbiAgICBtYXAuc2V0KGl0ZW0ua2V5LCBub2RlKTtcbiAgICBub2RlLnJldGFpbmVkID0gdHJ1ZTtcbiAgICBsaXN0Lmluc2VydEJlZm9yZShub2RlLCByZWZlcmVuY2UpO1xuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgbW92ZShpdGVtOiBMaXN0SXRlbSwgcmVmZXJlbmNlOiBPcHRpb248TGlzdEl0ZW0+KTogdm9pZCB7XG4gICAgbGV0IHsgbGlzdCB9ID0gdGhpcztcbiAgICBpdGVtLnJldGFpbmVkID0gdHJ1ZTtcbiAgICBsaXN0LnJlbW92ZShpdGVtKTtcbiAgICBsaXN0Lmluc2VydEJlZm9yZShpdGVtLCByZWZlcmVuY2UpO1xuICB9XG5cbiAgcmVtb3ZlKGl0ZW06IExpc3RJdGVtKTogdm9pZCB7XG4gICAgbGV0IHsgbGlzdCB9ID0gdGhpcztcblxuICAgIGxpc3QucmVtb3ZlKGl0ZW0pO1xuICAgIHRoaXMubWFwLmRlbGV0ZShpdGVtLmtleSk7XG4gIH1cblxuICBuZXh0Tm9kZShpdGVtOiBMaXN0SXRlbSk6IExpc3RJdGVtIHtcbiAgICByZXR1cm4gdGhpcy5saXN0Lm5leHROb2RlKGl0ZW0pO1xuICB9XG5cbiAgYWR2YW5jZU5vZGUoaXRlbTogTGlzdEl0ZW0pOiBMaXN0SXRlbSB7XG4gICAgaXRlbS5zZWVuID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcy5saXN0Lm5leHROb2RlKGl0ZW0pO1xuICB9XG5cbiAgaGVhZCgpOiBPcHRpb248TGlzdEl0ZW0+IHtcbiAgICByZXR1cm4gdGhpcy5saXN0LmhlYWQoKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVmZXJlbmNlSXRlcmF0b3Ige1xuICBwdWJsaWMgYXJ0aWZhY3RzOiBJdGVyYXRpb25BcnRpZmFjdHM7XG4gIHByaXZhdGUgaXRlcmF0b3I6IE9wdGlvbjxPcGFxdWVJdGVyYXRvcj4gPSBudWxsO1xuXG4gIC8vIGlmIGFueW9uZSBuZWVkcyB0byBjb25zdHJ1Y3QgdGhpcyBvYmplY3Qgd2l0aCBzb21ldGhpbmcgb3RoZXIgdGhhblxuICAvLyBhbiBpdGVyYWJsZSwgbGV0IEB3eWNhdHMga25vdy5cbiAgY29uc3RydWN0b3IoaXRlcmFibGU6IE9wYXF1ZUl0ZXJhYmxlKSB7XG4gICAgbGV0IGFydGlmYWN0cyA9IG5ldyBJdGVyYXRpb25BcnRpZmFjdHMoaXRlcmFibGUpO1xuICAgIHRoaXMuYXJ0aWZhY3RzID0gYXJ0aWZhY3RzO1xuICB9XG5cbiAgbmV4dCgpOiBPcHRpb248TGlzdEl0ZW0+IHtcbiAgICBsZXQgeyBhcnRpZmFjdHMgfSA9IHRoaXM7XG5cbiAgICBsZXQgaXRlcmF0b3IgPSAodGhpcy5pdGVyYXRvciA9IHRoaXMuaXRlcmF0b3IgfHwgYXJ0aWZhY3RzLml0ZXJhdGUoKSk7XG5cbiAgICBsZXQgaXRlbSA9IGl0ZXJhdG9yLm5leHQoKTtcblxuICAgIGlmIChpdGVtID09PSBudWxsKSByZXR1cm4gbnVsbDtcblxuICAgIHJldHVybiBhcnRpZmFjdHMuYXBwZW5kKGl0ZW0pO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSXRlcmF0b3JTeW5jaHJvbml6ZXJEZWxlZ2F0ZTxFbnY+IHtcbiAgcmV0YWluKGVudjogRW52LCBrZXk6IHVua25vd24sIGl0ZW06IFBhdGhSZWZlcmVuY2U8dW5rbm93bj4sIG1lbW86IFBhdGhSZWZlcmVuY2U8dW5rbm93bj4pOiB2b2lkO1xuICBpbnNlcnQoXG4gICAgZW52OiBFbnYsXG4gICAga2V5OiB1bmtub3duLFxuICAgIGl0ZW06IFBhdGhSZWZlcmVuY2U8dW5rbm93bj4sXG4gICAgbWVtbzogUGF0aFJlZmVyZW5jZTx1bmtub3duPixcbiAgICBiZWZvcmU6IE9wdGlvbjx1bmtub3duPlxuICApOiB2b2lkO1xuICBtb3ZlKFxuICAgIGVudjogRW52LFxuICAgIGtleTogdW5rbm93bixcbiAgICBpdGVtOiBQYXRoUmVmZXJlbmNlPHVua25vd24+LFxuICAgIG1lbW86IFBhdGhSZWZlcmVuY2U8dW5rbm93bj4sXG4gICAgYmVmb3JlOiBPcHRpb248dW5rbm93bj5cbiAgKTogdm9pZDtcbiAgZGVsZXRlKGVudjogRW52LCBrZXk6IHVua25vd24pOiB2b2lkO1xuICBkb25lKGVudjogRW52KTogdm9pZDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJdGVyYXRvclN5bmNocm9uaXplck9wdGlvbnM8RW52PiB7XG4gIHRhcmdldDogSXRlcmF0b3JTeW5jaHJvbml6ZXJEZWxlZ2F0ZTxFbnY+O1xuICBhcnRpZmFjdHM6IEl0ZXJhdGlvbkFydGlmYWN0cztcbiAgZW52OiBFbnY7XG59XG5cbmVudW0gUGhhc2Uge1xuICBBcHBlbmQsXG4gIFBydW5lLFxuICBEb25lLFxufVxuXG5leHBvcnQgY29uc3QgRU5EID0gJ0VORCBbMjYwMGFiZGYtODg5Zi00NDA2LWIwNTktYjQ0ZWNiYWZhNWM1XSc7XG5cbmV4cG9ydCBjbGFzcyBJdGVyYXRvclN5bmNocm9uaXplcjxFbnY+IHtcbiAgcHJpdmF0ZSB0YXJnZXQ6IEl0ZXJhdG9yU3luY2hyb25pemVyRGVsZWdhdGU8RW52PjtcbiAgcHJpdmF0ZSBpdGVyYXRvcjogT3BhcXVlSXRlcmF0b3I7XG4gIHByaXZhdGUgY3VycmVudDogT3B0aW9uPExpc3RJdGVtPjtcbiAgcHJpdmF0ZSBhcnRpZmFjdHM6IEl0ZXJhdGlvbkFydGlmYWN0cztcbiAgcHJpdmF0ZSBlbnY6IEVudjtcblxuICBjb25zdHJ1Y3Rvcih7IHRhcmdldCwgYXJ0aWZhY3RzLCBlbnYgfTogSXRlcmF0b3JTeW5jaHJvbml6ZXJPcHRpb25zPEVudj4pIHtcbiAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcbiAgICB0aGlzLmFydGlmYWN0cyA9IGFydGlmYWN0cztcbiAgICB0aGlzLml0ZXJhdG9yID0gYXJ0aWZhY3RzLml0ZXJhdGUoKTtcbiAgICB0aGlzLmN1cnJlbnQgPSBhcnRpZmFjdHMuaGVhZCgpO1xuICAgIHRoaXMuZW52ID0gZW52O1xuICB9XG5cbiAgc3luYygpIHtcbiAgICBsZXQgcGhhc2U6IFBoYXNlID0gUGhhc2UuQXBwZW5kO1xuXG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIHN3aXRjaCAocGhhc2UpIHtcbiAgICAgICAgY2FzZSBQaGFzZS5BcHBlbmQ6XG4gICAgICAgICAgcGhhc2UgPSB0aGlzLm5leHRBcHBlbmQoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBQaGFzZS5QcnVuZTpcbiAgICAgICAgICBwaGFzZSA9IHRoaXMubmV4dFBydW5lKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgUGhhc2UuRG9uZTpcbiAgICAgICAgICB0aGlzLm5leHREb25lKCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYWR2YW5jZVRvS2V5KGtleTogdW5rbm93bikge1xuICAgIGxldCB7IGN1cnJlbnQsIGFydGlmYWN0cyB9ID0gdGhpcztcblxuICAgIGlmIChjdXJyZW50ID09PSBudWxsKSByZXR1cm47XG5cbiAgICBsZXQgbmV4dCA9IGFydGlmYWN0cy5hZHZhbmNlTm9kZShjdXJyZW50KTtcblxuICAgIGlmIChuZXh0LmtleSA9PT0ga2V5KSB7XG4gICAgICB0aGlzLmN1cnJlbnQgPSBhcnRpZmFjdHMuYWR2YW5jZU5vZGUobmV4dCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IHNlZWsgPSBhcnRpZmFjdHMuYWR2YW5jZVRvS2V5KGtleSwgY3VycmVudCk7XG5cbiAgICBpZiAoc2Vlaykge1xuICAgICAgdGhpcy5tb3ZlKHNlZWssIGN1cnJlbnQpO1xuICAgICAgdGhpcy5jdXJyZW50ID0gYXJ0aWZhY3RzLm5leHROb2RlKGN1cnJlbnQpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgbW92ZShpdGVtOiBMaXN0SXRlbSwgcmVmZXJlbmNlOiBPcHRpb248TGlzdEl0ZW0+KSB7XG4gICAgaWYgKGl0ZW0ubmV4dCAhPT0gcmVmZXJlbmNlKSB7XG4gICAgICB0aGlzLmFydGlmYWN0cy5tb3ZlKGl0ZW0sIHJlZmVyZW5jZSk7XG4gICAgICB0aGlzLnRhcmdldC5tb3ZlKHRoaXMuZW52LCBpdGVtLmtleSwgaXRlbS52YWx1ZSwgaXRlbS5tZW1vLCByZWZlcmVuY2UgPyByZWZlcmVuY2Uua2V5IDogRU5EKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG5leHRBcHBlbmQoKTogUGhhc2Uge1xuICAgIGxldCB7IGl0ZXJhdG9yLCBjdXJyZW50LCBhcnRpZmFjdHMgfSA9IHRoaXM7XG5cbiAgICBsZXQgaXRlbSA9IGl0ZXJhdG9yLm5leHQoKTtcblxuICAgIGlmIChpdGVtID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5zdGFydFBydW5lKCk7XG4gICAgfVxuXG4gICAgbGV0IHsga2V5IH0gPSBpdGVtO1xuXG4gICAgaWYgKGN1cnJlbnQgIT09IG51bGwgJiYgY3VycmVudC5rZXkgPT09IGtleSkge1xuICAgICAgdGhpcy5uZXh0UmV0YWluKGl0ZW0sIGN1cnJlbnQpO1xuICAgIH0gZWxzZSBpZiAoYXJ0aWZhY3RzLmhhcyhrZXkpKSB7XG4gICAgICB0aGlzLm5leHRNb3ZlKGl0ZW0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm5leHRJbnNlcnQoaXRlbSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFBoYXNlLkFwcGVuZDtcbiAgfVxuXG4gIHByaXZhdGUgbmV4dFJldGFpbihpdGVtOiBPcGFxdWVJdGVyYXRpb25JdGVtLCBjdXJyZW50OiBMaXN0SXRlbSkge1xuICAgIGxldCB7IGFydGlmYWN0cyB9ID0gdGhpcztcblxuICAgIC8vIGN1cnJlbnQgPSBleHBlY3QoY3VycmVudCwgJ0JVRzogY3VycmVudCBpcyBlbXB0eScpO1xuXG4gICAgY3VycmVudC51cGRhdGUoaXRlbSk7XG4gICAgdGhpcy5jdXJyZW50ID0gYXJ0aWZhY3RzLm5leHROb2RlKGN1cnJlbnQpO1xuICAgIHRoaXMudGFyZ2V0LnJldGFpbih0aGlzLmVudiwgaXRlbS5rZXksIGN1cnJlbnQudmFsdWUsIGN1cnJlbnQubWVtbyk7XG4gIH1cblxuICBwcml2YXRlIG5leHRNb3ZlKGl0ZW06IE9wYXF1ZUl0ZXJhdGlvbkl0ZW0pIHtcbiAgICBsZXQgeyBjdXJyZW50LCBhcnRpZmFjdHMgfSA9IHRoaXM7XG4gICAgbGV0IHsga2V5IH0gPSBpdGVtO1xuXG4gICAgbGV0IGZvdW5kID0gYXJ0aWZhY3RzLnVwZGF0ZShpdGVtKTtcblxuICAgIGlmIChhcnRpZmFjdHMud2FzU2VlbihrZXkpKSB7XG4gICAgICB0aGlzLm1vdmUoZm91bmQsIGN1cnJlbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmFkdmFuY2VUb0tleShrZXkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgbmV4dEluc2VydChpdGVtOiBPcGFxdWVJdGVyYXRpb25JdGVtKSB7XG4gICAgbGV0IHsgYXJ0aWZhY3RzLCB0YXJnZXQsIGN1cnJlbnQgfSA9IHRoaXM7XG5cbiAgICBsZXQgbm9kZSA9IGFydGlmYWN0cy5pbnNlcnRCZWZvcmUoaXRlbSwgY3VycmVudCk7XG4gICAgdGFyZ2V0Lmluc2VydCh0aGlzLmVudiwgbm9kZS5rZXksIG5vZGUudmFsdWUsIG5vZGUubWVtbywgY3VycmVudCA/IGN1cnJlbnQua2V5IDogbnVsbCk7XG4gIH1cblxuICBwcml2YXRlIHN0YXJ0UHJ1bmUoKTogUGhhc2Uge1xuICAgIHRoaXMuY3VycmVudCA9IHRoaXMuYXJ0aWZhY3RzLmhlYWQoKTtcbiAgICByZXR1cm4gUGhhc2UuUHJ1bmU7XG4gIH1cblxuICBwcml2YXRlIG5leHRQcnVuZSgpOiBQaGFzZSB7XG4gICAgbGV0IHsgYXJ0aWZhY3RzLCB0YXJnZXQsIGN1cnJlbnQgfSA9IHRoaXM7XG5cbiAgICBpZiAoY3VycmVudCA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIFBoYXNlLkRvbmU7XG4gICAgfVxuXG4gICAgbGV0IG5vZGUgPSBjdXJyZW50O1xuICAgIHRoaXMuY3VycmVudCA9IGFydGlmYWN0cy5uZXh0Tm9kZShub2RlKTtcblxuICAgIGlmIChub2RlLnNob3VsZFJlbW92ZSgpKSB7XG4gICAgICBhcnRpZmFjdHMucmVtb3ZlKG5vZGUpO1xuICAgICAgdGFyZ2V0LmRlbGV0ZSh0aGlzLmVudiwgbm9kZS5rZXkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBub2RlLnJlc2V0KCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFBoYXNlLlBydW5lO1xuICB9XG5cbiAgcHJpdmF0ZSBuZXh0RG9uZSgpIHtcbiAgICB0aGlzLnRhcmdldC5kb25lKHRoaXMuZW52KTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgQWJzdHJhY3RJdGVyYWJsZSwgSXRlcmF0aW9uSXRlbSwgT3BhcXVlSXRlcmF0b3IgfSBmcm9tICcuL2l0ZXJhYmxlJztcbmltcG9ydCB7IFRhZyB9IGZyb20gJy4vdmFsaWRhdG9ycyc7XG5pbXBvcnQgeyBWZXJzaW9uZWRSZWZlcmVuY2UgfSBmcm9tICcuL3JlZmVyZW5jZSc7XG5pbXBvcnQgeyBPcHRpb24sIERpY3QgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IEVNUFRZX0FSUkFZIH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQgeyBVcGRhdGFibGVSZWZlcmVuY2UgfSBmcm9tICcuL3Byb3BlcnR5JztcblxuZXhwb3J0IHR5cGUgS2V5Rm9yID0gKGl0ZW06IERpY3QsIGluZGV4OiB1bmtub3duKSA9PiB1bmtub3duO1xuZXhwb3J0IHR5cGUgVW5rbm93bktleUZvciA9IChrZXk6IHN0cmluZykgPT4gS2V5Rm9yO1xuXG4vLyBQdWJsaWMgQVBJXG5leHBvcnQgaW50ZXJmYWNlIEl0ZXJhYmxlS2V5RGVmaW5pdGlvbnMge1xuICBuYW1lZDoge1xuICAgIFtwcm9wOiBzdHJpbmddOiBLZXlGb3I7XG4gIH07XG5cbiAgZGVmYXVsdDogVW5rbm93bktleUZvcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGtleUZvcihwYXRoOiBzdHJpbmcsIGRlZmluaXRpb25zOiBJdGVyYWJsZUtleURlZmluaXRpb25zKSB7XG4gIGlmIChwYXRoIGluIGRlZmluaXRpb25zLm5hbWVkKSB7XG4gICAgcmV0dXJuIGRlZmluaXRpb25zLm5hbWVkW3BhdGhdO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBkZWZpbml0aW9ucy5kZWZhdWx0O1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBJdGVyYWJsZUltcGxcbiAgaW1wbGVtZW50c1xuICAgIEFic3RyYWN0SXRlcmFibGU8XG4gICAgICB1bmtub3duLFxuICAgICAgdW5rbm93bixcbiAgICAgIEl0ZXJhdGlvbkl0ZW08dW5rbm93biwgdW5rbm93bj4sXG4gICAgICBVcGRhdGFibGVSZWZlcmVuY2U8dW5rbm93bj4sXG4gICAgICBVcGRhdGFibGVSZWZlcmVuY2U8dW5rbm93bj5cbiAgICA+IHtcbiAgcHVibGljIHRhZzogVGFnO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVmOiBWZXJzaW9uZWRSZWZlcmVuY2UsIHByaXZhdGUga2V5Rm9yOiBLZXlGb3IpIHtcbiAgICB0aGlzLnRhZyA9IHJlZi50YWc7XG4gICAgdGhpcy5yZWYgPSByZWY7XG4gICAgdGhpcy5rZXlGb3IgPSBrZXlGb3I7XG4gIH1cblxuICBpdGVyYXRlKCk6IE9wYXF1ZUl0ZXJhdG9yIHtcbiAgICBsZXQgeyByZWYsIGtleUZvciB9ID0gdGhpcztcblxuICAgIGxldCBpdGVyYWJsZSA9IHJlZi52YWx1ZSgpIGFzIHsgW1N5bWJvbC5pdGVyYXRvcl06IGFueSB9IHwgbnVsbCB8IGZhbHNlO1xuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoaXRlcmFibGUpKSB7XG4gICAgICByZXR1cm4gbmV3IEFycmF5SXRlcmF0b3IoaXRlcmFibGUsIGtleUZvcik7XG4gICAgfSBlbHNlIGlmIChpdGVyYWJsZSAmJiBpdGVyYWJsZVtTeW1ib2wuaXRlcmF0b3JdKSB7XG4gICAgICByZXR1cm4gbmV3IE5hdGl2ZUl0ZXJhdG9ySXRlcmF0b3IoaXRlcmFibGVbU3ltYm9sLml0ZXJhdG9yXSgpLCBrZXlGb3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IEFycmF5SXRlcmF0b3IoRU1QVFlfQVJSQVksICgpID0+IG51bGwpO1xuICAgIH1cbiAgfVxuXG4gIHZhbHVlUmVmZXJlbmNlRm9yKGl0ZW06IEl0ZXJhdGlvbkl0ZW08dW5rbm93biwgdW5rbm93bj4pOiBVcGRhdGFibGVSZWZlcmVuY2U8dW5rbm93bj4ge1xuICAgIHJldHVybiBuZXcgVXBkYXRhYmxlUmVmZXJlbmNlKGl0ZW0udmFsdWUpO1xuICB9XG5cbiAgdXBkYXRlVmFsdWVSZWZlcmVuY2UoXG4gICAgcmVmZXJlbmNlOiBVcGRhdGFibGVSZWZlcmVuY2U8dW5rbm93bj4sXG4gICAgaXRlbTogSXRlcmF0aW9uSXRlbTx1bmtub3duLCB1bmtub3duPlxuICApIHtcbiAgICByZWZlcmVuY2UuZm9yY2VVcGRhdGUoaXRlbS52YWx1ZSk7XG4gIH1cblxuICBtZW1vUmVmZXJlbmNlRm9yKGl0ZW06IEl0ZXJhdGlvbkl0ZW08dW5rbm93biwgdW5rbm93bj4pOiBVcGRhdGFibGVSZWZlcmVuY2U8dW5rbm93bj4ge1xuICAgIHJldHVybiBuZXcgVXBkYXRhYmxlUmVmZXJlbmNlKGl0ZW0ubWVtbyk7XG4gIH1cblxuICB1cGRhdGVNZW1vUmVmZXJlbmNlKFxuICAgIHJlZmVyZW5jZTogVXBkYXRhYmxlUmVmZXJlbmNlPHVua25vd24+LFxuICAgIGl0ZW06IEl0ZXJhdGlvbkl0ZW08dW5rbm93biwgdW5rbm93bj5cbiAgKSB7XG4gICAgcmVmZXJlbmNlLmZvcmNlVXBkYXRlKGl0ZW0ubWVtbyk7XG4gIH1cbn1cblxuY2xhc3MgTmF0aXZlSXRlcmF0b3JJdGVyYXRvciBpbXBsZW1lbnRzIE9wYXF1ZUl0ZXJhdG9yIHtcbiAgcHJpdmF0ZSBjdXJyZW50OiB7IGtpbmQ6ICdlbXB0eScgfSB8IHsga2luZDogJ2ZpcnN0JzsgdmFsdWU6IHVua25vd24gfSB8IHsga2luZDogJ3Byb2dyZXNzJyB9O1xuICBwcml2YXRlIHBvcyA9IDA7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBpdGVyYXRvcjogSXRlcmF0b3I8dW5rbm93bj4sIHByaXZhdGUga2V5Rm9yOiBLZXlGb3IpIHtcbiAgICBsZXQgZmlyc3QgPSBpdGVyYXRvci5uZXh0KCk7XG5cbiAgICBpZiAoZmlyc3QuZG9uZSA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy5jdXJyZW50ID0geyBraW5kOiAnZW1wdHknIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY3VycmVudCA9IHsga2luZDogJ2ZpcnN0JywgdmFsdWU6IGZpcnN0LnZhbHVlIH07XG4gICAgfVxuICB9XG5cbiAgaXNFbXB0eSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50LmtpbmQgPT09ICdlbXB0eSc7XG4gIH1cblxuICBuZXh0KCk6IE9wdGlvbjxJdGVyYXRpb25JdGVtPHVua25vd24sIG51bWJlcj4+IHtcbiAgICBsZXQgdmFsdWU6IHVua25vd247XG5cbiAgICBsZXQgY3VycmVudCA9IHRoaXMuY3VycmVudDtcbiAgICBpZiAoY3VycmVudC5raW5kID09PSAnZmlyc3QnKSB7XG4gICAgICB0aGlzLmN1cnJlbnQgPSB7IGtpbmQ6ICdwcm9ncmVzcycgfTtcbiAgICAgIHZhbHVlID0gY3VycmVudC52YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IG5leHQgPSB0aGlzLml0ZXJhdG9yLm5leHQoKTtcbiAgICAgIHRoaXMucG9zKys7XG5cbiAgICAgIGlmIChuZXh0LmRvbmUpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZSA9IG5leHQudmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IHsga2V5Rm9yIH0gPSB0aGlzO1xuXG4gICAgbGV0IGtleSA9IGtleUZvcih2YWx1ZSBhcyBEaWN0LCB0aGlzLnBvcyk7XG4gICAgbGV0IG1lbW8gPSB0aGlzLnBvcztcblxuICAgIHJldHVybiB7IGtleSwgdmFsdWUsIG1lbW8gfTtcbiAgfVxufVxuXG5jbGFzcyBBcnJheUl0ZXJhdG9yIGltcGxlbWVudHMgT3BhcXVlSXRlcmF0b3Ige1xuICBwcml2YXRlIGN1cnJlbnQ6IHsga2luZDogJ2VtcHR5JyB9IHwgeyBraW5kOiAnZmlyc3QnOyB2YWx1ZTogdW5rbm93biB9IHwgeyBraW5kOiAncHJvZ3Jlc3MnIH07XG4gIHByaXZhdGUgcG9zID0gMDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGl0ZXJhdG9yOiB1bmtub3duW10sIHByaXZhdGUga2V5Rm9yOiBLZXlGb3IpIHtcbiAgICBpZiAoaXRlcmF0b3IubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLmN1cnJlbnQgPSB7IGtpbmQ6ICdlbXB0eScgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jdXJyZW50ID0geyBraW5kOiAnZmlyc3QnLCB2YWx1ZTogaXRlcmF0b3JbdGhpcy5wb3NdIH07XG4gICAgfVxuICB9XG5cbiAgaXNFbXB0eSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50LmtpbmQgPT09ICdlbXB0eSc7XG4gIH1cblxuICBuZXh0KCk6IE9wdGlvbjxJdGVyYXRpb25JdGVtPHVua25vd24sIG51bWJlcj4+IHtcbiAgICBsZXQgdmFsdWU6IHVua25vd247XG5cbiAgICBsZXQgY3VycmVudCA9IHRoaXMuY3VycmVudDtcbiAgICBpZiAoY3VycmVudC5raW5kID09PSAnZmlyc3QnKSB7XG4gICAgICB0aGlzLmN1cnJlbnQgPSB7IGtpbmQ6ICdwcm9ncmVzcycgfTtcbiAgICAgIHZhbHVlID0gY3VycmVudC52YWx1ZTtcbiAgICB9IGVsc2UgaWYgKHRoaXMucG9zID49IHRoaXMuaXRlcmF0b3IubGVuZ3RoIC0gMSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlID0gdGhpcy5pdGVyYXRvclsrK3RoaXMucG9zXTtcbiAgICB9XG5cbiAgICBsZXQgeyBrZXlGb3IgfSA9IHRoaXM7XG5cbiAgICBsZXQga2V5ID0ga2V5Rm9yKHZhbHVlIGFzIERpY3QsIHRoaXMucG9zKTtcbiAgICBsZXQgbWVtbyA9IHRoaXMucG9zO1xuXG4gICAgcmV0dXJuIHsga2V5LCB2YWx1ZSwgbWVtbyB9O1xuICB9XG59XG4iLCJpbXBvcnQgeyBUYWcsIGNyZWF0ZVVwZGF0YWJsZVRhZywgY29tYmluZSwgdXBkYXRlIH0gZnJvbSAnLi92YWxpZGF0b3JzJztcbmltcG9ydCB7IHByb3BlcnR5IH0gZnJvbSAnLi9wcm9wZXJ0eSc7XG5pbXBvcnQgeyBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlIH0gZnJvbSAnLi9yZWZlcmVuY2UnO1xuaW1wb3J0IHsgcHVzaFRyYWNrRnJhbWUsIHBvcFRyYWNrRnJhbWUgfSBmcm9tICcuL2F1dG90cmFjayc7XG5cbmV4cG9ydCBmdW5jdGlvbiBtYXA8VCwgVT4oXG4gIGlucHV0OiBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPFQ+LFxuICBjYWxsYmFjazogKHZhbHVlOiBUKSA9PiBVXG4pOiBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPFU+IHtcbiAgcmV0dXJuIG5ldyBNYXBSZWZlcmVuY2UoaW5wdXQsIGNhbGxiYWNrKTtcbn1cblxuY2xhc3MgTWFwUmVmZXJlbmNlPFQsIFU+IGltcGxlbWVudHMgVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTxVPiB7XG4gIHJlYWRvbmx5IHRhZzogVGFnO1xuICByZWFkb25seSB1cGRhdGFibGUgPSBjcmVhdGVVcGRhdGFibGVUYWcoKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGlubmVyOiBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPFQ+LCBwcml2YXRlIGNhbGxiYWNrOiAodmFsdWU6IFQpID0+IFUpIHtcbiAgICB0aGlzLnRhZyA9IGNvbWJpbmUoW2lubmVyLnRhZywgdGhpcy51cGRhdGFibGVdKTtcbiAgfVxuXG4gIHZhbHVlKCk6IFUge1xuICAgIGxldCB7IGlubmVyLCBjYWxsYmFjayB9ID0gdGhpcztcblxuICAgIGxldCBvbGQgPSBwdXNoVHJhY2tGcmFtZSgpO1xuICAgIGxldCByZXQgPSBjYWxsYmFjayhpbm5lci52YWx1ZSgpKTtcbiAgICBsZXQgdGFnID0gcG9wVHJhY2tGcmFtZShvbGQpO1xuICAgIHVwZGF0ZSh0aGlzLnVwZGF0YWJsZSwgdGFnKTtcblxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICBnZXQoa2V5OiBzdHJpbmcpOiBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlIHtcbiAgICByZXR1cm4gcHJvcGVydHkodGhpcywga2V5KTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbIl92YWx1ZSIsInZhbHVlIiwiaXNPYmplY3QiLCJkaWN0IiwiX2NvbWJpbmUiLCJfdmFsdWUyIiwiaXNEaWN0IiwiTGlzdE5vZGUiLCJMaW5rZWRMaXN0IiwiRU1QVFlfQVJSQVkiXSwibWFwcGluZ3MiOiI7Ozs7SUFZQSxJQUFNLFNBQ0osT0FBQSxNQUFBLEtBQUEsV0FBQSxHQUFBLE1BQUEsR0FFSTtJQUFBLGtCQUFzQixHQUF0QixHQUE0QixLQUFBLEtBQUEsQ0FBVyxLQUFBLE1BQUEsS0FBZ0IsS0FIN0QsR0FHNkQsRUFBM0IsQ0FBNUI7SUFBQSxDQUhOO0FBU0EsUUFBYSxXQUFOLENBQUE7QUFDUCxRQUFhLFVBQU4sQ0FBQTtBQUNQLFFBQWEsV0FBTixnQkFBQTtJQUVQLElBQUksWUFBSixPQUFBO0FBRUEsSUFBTSxTQUFBLElBQUEsR0FBYztJQUNsQjtJQUNEO0lBRUQ7QUFFQSxRQUFhLFVBQXlCLE9BQS9CLGFBQStCLENBQS9CO0lBZ0JQO0lBRUE7Ozs7Ozs7Ozs7Ozs7O0FBY0EsSUFBTSxTQUFBLEtBQUEsQ0FBQSxJQUFBLEVBQXlCO0lBQzdCLFdBQUEsU0FBQTtJQUNEO0lBRUQ7Ozs7Ozs7Ozs7QUFVQSxJQUFNLFNBQUEsUUFBQSxDQUFBLEdBQUEsRUFBQSxRQUFBLEVBQStDO0lBQ25ELFdBQU8sWUFBWSxJQUFuQixPQUFtQixHQUFuQjtJQUNEO0lBaUJELElBQU0sT0FBc0IsT0FBNUIsVUFBNEIsQ0FBNUI7QUFFQSxRQUFPLHFCQUFBO0FBRVAsUUF1Qk0sa0JBQU47SUFXRSxnQ0FBQSxJQUFBLEVBQXFDO0lBQUE7O0lBVjdCLGFBQUEsUUFBQSxHQUFBLE9BQUE7SUFDQSxhQUFBLFdBQUEsR0FBQSxPQUFBO0lBQ0EsYUFBQSxTQUFBLEdBQUEsT0FBQTtJQUVB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