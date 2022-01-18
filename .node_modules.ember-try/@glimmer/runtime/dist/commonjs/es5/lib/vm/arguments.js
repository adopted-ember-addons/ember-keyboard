"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.EMPTY_ARGS = exports.CapturedArgumentsImpl = exports.BlockArgumentsImpl = exports.CapturedNamedArgumentsImpl = exports.NamedArgumentsImpl = exports.CapturedPositionalArgumentsImpl = exports.PositionalArgumentsImpl = exports.VMArgumentsImpl = undefined;

var _util = require("@glimmer/util");

var _reference = require("@glimmer/reference");

var _references = require("../references");

var _symbols = require("../symbols");

var _vm = require("@glimmer/vm");

var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
        }
    }return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
}();

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

/*
  The calling convention is:

  * 0-N block arguments at the bottom
  * 0-N positional arguments next (left-to-right)
  * 0-N named arguments next
*/
var VMArgumentsImpl = exports.VMArgumentsImpl = function () {
    function VMArgumentsImpl() {
        _classCallCheck(this, VMArgumentsImpl);

        this.stack = null;
        this.positional = new PositionalArgumentsImpl();
        this.named = new NamedArgumentsImpl();
        this.blocks = new BlockArgumentsImpl();
    }

    VMArgumentsImpl.prototype.empty = function empty(stack) {
        var base = stack[_symbols.REGISTERS][_vm.$sp] + 1;
        this.named.empty(stack, base);
        this.positional.empty(stack, base);
        this.blocks.empty(stack, base);
        return this;
    };

    VMArgumentsImpl.prototype.setup = function setup(stack, names, blockNames, positionalCount, atNames) {
        this.stack = stack;
        /*
               | ... | blocks      | positional  | named |
               | ... | b0    b1    | p0 p1 p2 p3 | n0 n1 |
         index | ... | 4/5/6 7/8/9 | 10 11 12 13 | 14 15 |
                       ^             ^             ^  ^
                     bbase         pbase       nbase  sp
        */
        var named = this.named;
        var namedCount = names.length;
        var namedBase = stack[_symbols.REGISTERS][_vm.$sp] - namedCount + 1;
        named.setup(stack, namedBase, namedCount, names, atNames);
        var positional = this.positional;
        var positionalBase = namedBase - positionalCount;
        positional.setup(stack, positionalBase, positionalCount);
        var blocks = this.blocks;
        var blocksCount = blockNames.length;
        var blocksBase = positionalBase - blocksCount * 3;
        blocks.setup(stack, blocksBase, blocksCount, blockNames);
    };

    VMArgumentsImpl.prototype.at = function at(pos) {
        return this.positional.at(pos);
    };

    VMArgumentsImpl.prototype.realloc = function realloc(offset) {
        var stack = this.stack;

        if (offset > 0 && stack !== null) {
            var positional = this.positional,
                named = this.named;

            var newBase = positional.base + offset;
            var length = positional.length + named.length;
            for (var i = length - 1; i >= 0; i--) {
                stack.copy(i + positional.base, i + newBase);
            }
            positional.base += offset;
            named.base += offset;
            stack[_symbols.REGISTERS][_vm.$sp] += offset;
        }
    };

    VMArgumentsImpl.prototype.capture = function capture() {
        var positional = this.positional.length === 0 ? EMPTY_POSITIONAL : this.positional.capture();
        var named = this.named.length === 0 ? EMPTY_NAMED : this.named.capture();
        return new CapturedArgumentsImpl(this.tag, positional, named, this.length);
    };

    VMArgumentsImpl.prototype.clear = function clear() {
        var stack = this.stack,
            length = this.length;

        if (length > 0 && stack !== null) stack.pop(length);
    };

    _createClass(VMArgumentsImpl, [{
        key: 'tag',
        get: function get() {
            return (0, _reference.combineTagged)([this.positional, this.named]);
        }
    }, {
        key: 'base',
        get: function get() {
            return this.blocks.base;
        }
    }, {
        key: 'length',
        get: function get() {
            return this.positional.length + this.named.length + this.blocks.length * 3;
        }
    }]);

    return VMArgumentsImpl;
}();
var PositionalArgumentsImpl = exports.PositionalArgumentsImpl = function () {
    function PositionalArgumentsImpl() {
        _classCallCheck(this, PositionalArgumentsImpl);

        this.base = 0;
        this.length = 0;
        this.stack = null;
        this._tag = null;
        this._references = null;
    }

    PositionalArgumentsImpl.prototype.empty = function empty(stack, base) {
        this.stack = stack;
        this.base = base;
        this.length = 0;
        this._tag = _reference.CONSTANT_TAG;
        this._references = _util.EMPTY_ARRAY;
    };

    PositionalArgumentsImpl.prototype.setup = function setup(stack, base, length) {
        this.stack = stack;
        this.base = base;
        this.length = length;
        if (length === 0) {
            this._tag = _reference.CONSTANT_TAG;
            this._references = _util.EMPTY_ARRAY;
        } else {
            this._tag = null;
            this._references = null;
        }
    };

    PositionalArgumentsImpl.prototype.at = function at(position) {
        var base = this.base,
            length = this.length,
            stack = this.stack;

        if (position < 0 || position >= length) {
            return _references.UNDEFINED_REFERENCE;
        }
        return stack.get(position, base);
    };

    PositionalArgumentsImpl.prototype.capture = function capture() {
        return new CapturedPositionalArgumentsImpl(this.tag, this.references);
    };

    PositionalArgumentsImpl.prototype.prepend = function prepend(other) {
        var additions = other.length;
        if (additions > 0) {
            var base = this.base,
                length = this.length,
                stack = this.stack;

            this.base = base = base - additions;
            this.length = length + additions;
            for (var i = 0; i < additions; i++) {
                stack.set(other.at(i), i, base);
            }
            this._tag = null;
            this._references = null;
        }
    };

    _createClass(PositionalArgumentsImpl, [{
        key: 'tag',
        get: function get() {
            var tag = this._tag;
            if (!tag) {
                tag = this._tag = (0, _reference.combineTagged)(this.references);
            }
            return tag;
        }
    }, {
        key: 'references',
        get: function get() {
            var references = this._references;
            if (!references) {
                var stack = this.stack,
                    base = this.base,
                    length = this.length;

                references = this._references = stack.sliceArray(base, base + length);
            }
            return references;
        }
    }]);

    return PositionalArgumentsImpl;
}();
var CapturedPositionalArgumentsImpl = exports.CapturedPositionalArgumentsImpl = function () {
    function CapturedPositionalArgumentsImpl(tag, references) {
        var length = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : references.length;

        _classCallCheck(this, CapturedPositionalArgumentsImpl);

        this.tag = tag;
        this.references = references;
        this.length = length;
    }

    CapturedPositionalArgumentsImpl.empty = function empty() {
        return new CapturedPositionalArgumentsImpl(_reference.CONSTANT_TAG, _util.EMPTY_ARRAY, 0);
    };

    CapturedPositionalArgumentsImpl.prototype.at = function at(position) {
        return this.references[position];
    };

    CapturedPositionalArgumentsImpl.prototype.value = function value() {
        return this.references.map(this.valueOf);
    };

    CapturedPositionalArgumentsImpl.prototype.get = function get(name) {
        var references = this.references,
            length = this.length;

        if (name === 'length') {
            return _references.PrimitiveReference.create(length);
        } else {
            var idx = parseInt(name, 10);
            if (idx < 0 || idx >= length) {
                return _references.UNDEFINED_REFERENCE;
            } else {
                return references[idx];
            }
        }
    };

    CapturedPositionalArgumentsImpl.prototype.valueOf = function valueOf(reference) {
        return reference.value();
    };

    return CapturedPositionalArgumentsImpl;
}();
var NamedArgumentsImpl = exports.NamedArgumentsImpl = function () {
    function NamedArgumentsImpl() {
        _classCallCheck(this, NamedArgumentsImpl);

        this.base = 0;
        this.length = 0;
        this._references = null;
        this._names = _util.EMPTY_ARRAY;
        this._atNames = _util.EMPTY_ARRAY;
    }

    NamedArgumentsImpl.prototype.empty = function empty(stack, base) {
        this.stack = stack;
        this.base = base;
        this.length = 0;
        this._references = _util.EMPTY_ARRAY;
        this._names = _util.EMPTY_ARRAY;
        this._atNames = _util.EMPTY_ARRAY;
    };

    NamedArgumentsImpl.prototype.setup = function setup(stack, base, length, names, atNames) {
        this.stack = stack;
        this.base = base;
        this.length = length;
        if (length === 0) {
            this._references = _util.EMPTY_ARRAY;
            this._names = _util.EMPTY_ARRAY;
            this._atNames = _util.EMPTY_ARRAY;
        } else {
            this._references = null;
            if (atNames) {
                this._names = null;
                this._atNames = names;
            } else {
                this._names = names;
                this._atNames = null;
            }
        }
    };

    NamedArgumentsImpl.prototype.has = function has(name) {
        return this.names.indexOf(name) !== -1;
    };

    NamedArgumentsImpl.prototype.get = function get(name) {
        var atNames = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var base = this.base,
            stack = this.stack;

        var names = atNames ? this.atNames : this.names;
        var idx = names.indexOf(name);
        if (idx === -1) {
            return _references.UNDEFINED_REFERENCE;
        }
        return stack.get(idx, base);
    };

    NamedArgumentsImpl.prototype.capture = function capture() {
        return new CapturedNamedArgumentsImpl(this.tag, this.names, this.references);
    };

    NamedArgumentsImpl.prototype.merge = function merge(other) {
        var extras = other.length;

        if (extras > 0) {
            var names = this.names,
                length = this.length,
                stack = this.stack;
            var extraNames = other.names;

            if (Object.isFrozen(names) && names.length === 0) {
                names = [];
            }
            for (var i = 0; i < extras; i++) {
                var name = extraNames[i];
                var idx = names.indexOf(name);
                if (idx === -1) {
                    length = names.push(name);
                    stack.push(other.references[i]);
                }
            }
            this.length = length;
            this._references = null;
            this._names = names;
            this._atNames = null;
        }
    };

    NamedArgumentsImpl.prototype.toSyntheticName = function toSyntheticName(name) {
        return name.slice(1);
    };

    NamedArgumentsImpl.prototype.toAtName = function toAtName(name) {
        return '@' + name;
    };

    _createClass(NamedArgumentsImpl, [{
        key: 'tag',
        get: function get() {
            return (0, _reference.combineTagged)(this.references);
        }
    }, {
        key: 'names',
        get: function get() {
            var names = this._names;
            if (!names) {
                names = this._names = this._atNames.map(this.toSyntheticName);
            }
            return names;
        }
    }, {
        key: 'atNames',
        get: function get() {
            var atNames = this._atNames;
            if (!atNames) {
                atNames = this._atNames = this._names.map(this.toAtName);
            }
            return atNames;
        }
    }, {
        key: 'references',
        get: function get() {
            var references = this._references;
            if (!references) {
                var base = this.base,
                    length = this.length,
                    stack = this.stack;

                references = this._references = stack.sliceArray(base, base + length);
            }
            return references;
        }
    }]);

    return NamedArgumentsImpl;
}();
var CapturedNamedArgumentsImpl = exports.CapturedNamedArgumentsImpl = function () {
    function CapturedNamedArgumentsImpl(tag, names, references) {
        _classCallCheck(this, CapturedNamedArgumentsImpl);

        this.tag = tag;
        this.names = names;
        this.references = references;
        this.length = names.length;
        this._map = null;
    }

    CapturedNamedArgumentsImpl.prototype.has = function has(name) {
        return this.names.indexOf(name) !== -1;
    };

    CapturedNamedArgumentsImpl.prototype.get = function get(name) {
        var names = this.names,
            references = this.references;

        var idx = names.indexOf(name);
        if (idx === -1) {
            return _references.UNDEFINED_REFERENCE;
        } else {
            return references[idx];
        }
    };

    CapturedNamedArgumentsImpl.prototype.value = function value() {
        var names = this.names,
            references = this.references;

        var out = (0, _util.dict)();
        for (var i = 0; i < names.length; i++) {
            var name = names[i];
            out[name] = references[i].value();
        }
        return out;
    };

    _createClass(CapturedNamedArgumentsImpl, [{
        key: 'map',
        get: function get() {
            var map = this._map;
            if (!map) {
                var names = this.names,
                    references = this.references;

                map = this._map = (0, _util.dict)();
                for (var i = 0; i < names.length; i++) {
                    var name = names[i];
                    map[name] = references[i];
                }
            }
            return map;
        }
    }]);

    return CapturedNamedArgumentsImpl;
}();
var BlockArgumentsImpl = exports.BlockArgumentsImpl = function () {
    function BlockArgumentsImpl() {
        _classCallCheck(this, BlockArgumentsImpl);

        this.internalValues = null;
        this.internalTag = null;
        this.names = _util.EMPTY_ARRAY;
        this.length = 0;
        this.base = 0;
    }

    BlockArgumentsImpl.prototype.empty = function empty(stack, base) {
        this.stack = stack;
        this.names = _util.EMPTY_ARRAY;
        this.base = base;
        this.length = 0;
        this.internalTag = _reference.CONSTANT_TAG;
        this.internalValues = _util.EMPTY_ARRAY;
    };

    BlockArgumentsImpl.prototype.setup = function setup(stack, base, length, names) {
        this.stack = stack;
        this.names = names;
        this.base = base;
        this.length = length;
        if (length === 0) {
            this.internalTag = _reference.CONSTANT_TAG;
            this.internalValues = _util.EMPTY_ARRAY;
        } else {
            this.internalTag = null;
            this.internalValues = null;
        }
    };

    BlockArgumentsImpl.prototype.has = function has(name) {
        return this.names.indexOf(name) !== -1;
    };

    BlockArgumentsImpl.prototype.get = function get(name) {
        var base = this.base,
            stack = this.stack,
            names = this.names;

        var idx = names.indexOf(name);
        if (names.indexOf(name) === -1) {
            return null;
        }
        var table = stack.get(idx * 3, base);
        var scope = stack.get(idx * 3 + 1, base);
        var handle = stack.get(idx * 3 + 2, base);
        return handle === null ? null : [handle, scope, table];
    };

    BlockArgumentsImpl.prototype.capture = function capture() {
        return new CapturedBlockArgumentsImpl(this.names, this.values);
    };

    _createClass(BlockArgumentsImpl, [{
        key: 'values',
        get: function get() {
            var values = this.internalValues;
            if (!values) {
                var base = this.base,
                    length = this.length,
                    stack = this.stack;

                values = this.internalValues = stack.sliceArray(base, base + length * 3);
            }
            return values;
        }
    }]);

    return BlockArgumentsImpl;
}();

var CapturedBlockArgumentsImpl = function () {
    function CapturedBlockArgumentsImpl(names, values) {
        _classCallCheck(this, CapturedBlockArgumentsImpl);

        this.names = names;
        this.values = values;
        this.length = names.length;
    }

    CapturedBlockArgumentsImpl.prototype.has = function has(name) {
        return this.names.indexOf(name) !== -1;
    };

    CapturedBlockArgumentsImpl.prototype.get = function get(name) {
        var idx = this.names.indexOf(name);
        if (idx === -1) return null;
        return [this.values[idx * 3 + 2], this.values[idx * 3 + 1], this.values[idx * 3]];
    };

    return CapturedBlockArgumentsImpl;
}();

var CapturedArgumentsImpl = exports.CapturedArgumentsImpl = function () {
    function CapturedArgumentsImpl(tag, positional, named, length) {
        _classCallCheck(this, CapturedArgumentsImpl);

        this.tag = tag;
        this.positional = positional;
        this.named = named;
        this.length = length;
    }

    CapturedArgumentsImpl.prototype.value = function value() {
        return {
            named: this.named.value(),
            positional: this.positional.value()
        };
    };

    return CapturedArgumentsImpl;
}();
var EMPTY_NAMED = new CapturedNamedArgumentsImpl(_reference.CONSTANT_TAG, _util.EMPTY_ARRAY, _util.EMPTY_ARRAY);
var EMPTY_POSITIONAL = new CapturedPositionalArgumentsImpl(_reference.CONSTANT_TAG, _util.EMPTY_ARRAY);
var EMPTY_ARGS = exports.EMPTY_ARGS = new CapturedArgumentsImpl(_reference.CONSTANT_TAG, EMPTY_POSITIONAL, EMPTY_NAMED, 0);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL3ZtL2FyZ3VtZW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQ0E7O0FBQ0E7O0FBb0JBOztBQU9BOztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQTs7Ozs7OztBQVFBLElBQUEsNENBQUEsWUFBQTtBQUFBLGFBQUEsZUFBQSxHQUFBO0FBQUEsd0JBQUEsSUFBQSxFQUFBLGVBQUE7O0FBQ1UsYUFBQSxLQUFBLEdBQUEsSUFBQTtBQUNELGFBQUEsVUFBQSxHQUFhLElBQWIsdUJBQWEsRUFBYjtBQUNBLGFBQUEsS0FBQSxHQUFRLElBQVIsa0JBQVEsRUFBUjtBQUNBLGFBQUEsTUFBQSxHQUFTLElBQVQsa0JBQVMsRUFBVDtBQTJGUjs7QUEvRkQsb0JBQUEsU0FBQSxDQUFBLEtBQUEsR0FBQSxTQUFBLEtBQUEsQ0FBQSxLQUFBLEVBTThCO0FBQzFCLFlBQUksT0FBTyxNQUFBLGtCQUFBLEVBQUEsT0FBQSxJQUFYLENBQUE7QUFFQSxhQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxFQUFBLElBQUE7QUFDQSxhQUFBLFVBQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxFQUFBLElBQUE7QUFDQSxhQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxFQUFBLElBQUE7QUFFQSxlQUFBLElBQUE7QUFiSixLQUFBOztBQUFBLG9CQUFBLFNBQUEsQ0FBQSxLQUFBLEdBQUEsU0FBQSxLQUFBLENBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxVQUFBLEVBQUEsZUFBQSxFQUFBLE9BQUEsRUFxQm9CO0FBRWhCLGFBQUEsS0FBQSxHQUFBLEtBQUE7QUFFQTs7Ozs7OztBQVFBLFlBQUksUUFBUSxLQUFaLEtBQUE7QUFDQSxZQUFJLGFBQWEsTUFBakIsTUFBQTtBQUNBLFlBQUksWUFBWSxNQUFBLGtCQUFBLEVBQUEsT0FBQSxJQUFBLFVBQUEsR0FBaEIsQ0FBQTtBQUVBLGNB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QUFhLElBQUEscUJBQUEsQ0FBQSx1QkFBQSxFQUFBLGdCQUFBLEVBQUEsV0FBQSxFQUFuQixDQUFtQixDQUFuQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEV2YWx1YXRpb25TdGFjayB9IGZyb20gJy4vc3RhY2snO1xuaW1wb3J0IHsgZGljdCwgRU1QVFlfQVJSQVkgfSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCB7IGNvbWJpbmVUYWdnZWQgfSBmcm9tICdAZ2xpbW1lci9yZWZlcmVuY2UnO1xuaW1wb3J0IHtcbiAgRGljdCxcbiAgT3B0aW9uLFxuICB1bnNhZmUsXG4gIEJsb2NrU3ltYm9sVGFibGUsXG4gIFZNQXJndW1lbnRzLFxuICBDYXB0dXJlZEFyZ3VtZW50cyxcbiAgUG9zaXRpb25hbEFyZ3VtZW50cyxcbiAgQ2FwdHVyZWRQb3NpdGlvbmFsQXJndW1lbnRzLFxuICBOYW1lZEFyZ3VtZW50cyxcbiAgQ2FwdHVyZWROYW1lZEFyZ3VtZW50cyxcbiAgSml0T3JBb3RCbG9jayxcbiAgQmxvY2tWYWx1ZSxcbiAgU2NvcGVCbG9jayxcbiAgQ2FwdHVyZWRCbG9ja0FyZ3VtZW50cyxcbiAgU2NvcGUsXG4gIEJsb2NrQXJndW1lbnRzLFxufSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IFRhZywgVmVyc2lvbmVkUGF0aFJlZmVyZW5jZSwgQ09OU1RBTlRfVEFHIH0gZnJvbSAnQGdsaW1tZXIvcmVmZXJlbmNlJztcbmltcG9ydCB7IFByaW1pdGl2ZVJlZmVyZW5jZSwgVU5ERUZJTkVEX1JFRkVSRU5DRSB9IGZyb20gJy4uL3JlZmVyZW5jZXMnO1xuaW1wb3J0IHsgQ2hlY2tCbG9ja1N5bWJvbFRhYmxlLCBjaGVjaywgQ2hlY2tIYW5kbGUsIENoZWNrT3B0aW9uLCBDaGVja09yIH0gZnJvbSAnQGdsaW1tZXIvZGVidWcnO1xuaW1wb3J0IHtcbiAgQ2hlY2tQYXRoUmVmZXJlbmNlLFxuICBDaGVja0NvbXBpbGFibGVCbG9jayxcbiAgQ2hlY2tTY29wZSxcbn0gZnJvbSAnLi4vY29tcGlsZWQvb3Bjb2Rlcy8tZGVidWctc3RyaXAnO1xuaW1wb3J0IHsgUkVHSVNURVJTIH0gZnJvbSAnLi4vc3ltYm9scyc7XG5pbXBvcnQgeyAkc3AgfSBmcm9tICdAZ2xpbW1lci92bSc7XG5cbi8qXG4gIFRoZSBjYWxsaW5nIGNvbnZlbnRpb24gaXM6XG5cbiAgKiAwLU4gYmxvY2sgYXJndW1lbnRzIGF0IHRoZSBib3R0b21cbiAgKiAwLU4gcG9zaXRpb25hbCBhcmd1bWVudHMgbmV4dCAobGVmdC10by1yaWdodClcbiAgKiAwLU4gbmFtZWQgYXJndW1lbnRzIG5leHRcbiovXG5cbmV4cG9ydCBjbGFzcyBWTUFyZ3VtZW50c0ltcGwgaW1wbGVtZW50cyBWTUFyZ3VtZW50cyB7XG4gIHByaXZhdGUgc3RhY2s6IE9wdGlvbjxFdmFsdWF0aW9uU3RhY2s+ID0gbnVsbDtcbiAgcHVibGljIHBvc2l0aW9uYWwgPSBuZXcgUG9zaXRpb25hbEFyZ3VtZW50c0ltcGwoKTtcbiAgcHVibGljIG5hbWVkID0gbmV3IE5hbWVkQXJndW1lbnRzSW1wbCgpO1xuICBwdWJsaWMgYmxvY2tzID0gbmV3IEJsb2NrQXJndW1lbnRzSW1wbCgpO1xuXG4gIGVtcHR5KHN0YWNrOiBFdmFsdWF0aW9uU3RhY2spOiB0aGlzIHtcbiAgICBsZXQgYmFzZSA9IHN0YWNrW1JFR0lTVEVSU11bJHNwXSArIDE7XG5cbiAgICB0aGlzLm5hbWVkLmVtcHR5KHN0YWNrLCBiYXNlKTtcbiAgICB0aGlzLnBvc2l0aW9uYWwuZW1wdHkoc3RhY2ssIGJhc2UpO1xuICAgIHRoaXMuYmxvY2tzLmVtcHR5KHN0YWNrLCBiYXNlKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc2V0dXAoXG4gICAgc3RhY2s6IEV2YWx1YXRpb25TdGFjayxcbiAgICBuYW1lczogc3RyaW5nW10sXG4gICAgYmxvY2tOYW1lczogc3RyaW5nW10sXG4gICAgcG9zaXRpb25hbENvdW50OiBudW1iZXIsXG4gICAgYXROYW1lczogYm9vbGVhblxuICApIHtcbiAgICB0aGlzLnN0YWNrID0gc3RhY2s7XG5cbiAgICAvKlxuICAgICAgICAgICB8IC4uLiB8IGJsb2NrcyAgICAgIHwgcG9zaXRpb25hbCAgfCBuYW1lZCB8XG4gICAgICAgICAgIHwgLi4uIHwgYjAgICAgYjEgICAgfCBwMCBwMSBwMiBwMyB8IG4wIG4xIHxcbiAgICAgaW5kZXggfCAuLi4gfCA0LzUvNiA3LzgvOSB8IDEwIDExIDEyIDEzIHwgMTQgMTUgfFxuICAgICAgICAgICAgICAgICAgIF4gICAgICAgICAgICAgXiAgICAgICAgICAgICBeICBeXG4gICAgICAgICAgICAgICAgIGJiYXNlICAgICAgICAgcGJhc2UgICAgICAgbmJhc2UgIHNwXG4gICAgKi9cblxuICAgIGxldCBuYW1lZCA9IHRoaXMubmFtZWQ7XG4gICAgbGV0IG5hbWVkQ291bnQgPSBuYW1lcy5sZW5ndGg7XG4gICAgbGV0IG5hbWVkQmFzZSA9IHN0YWNrW1JFR0lTVEVSU11bJHNwXSAtIG5hbWVkQ291bnQgKyAxO1xuXG4gICAgbmFtZWQuc2V0dXAoc3RhY2ssIG5hbWVkQmFzZSwgbmFtZWRDb3VudCwgbmFtZXMsIGF0TmFtZXMpO1xuXG4gICAgbGV0IHBvc2l0aW9uYWwgPSB0aGlzLnBvc2l0aW9uYWw7XG4gICAgbGV0IHBvc2l0aW9uYWxCYXNlID0gbmFtZWRCYXNlIC0gcG9zaXRpb25hbENvdW50O1xuXG4gICAgcG9zaXRpb25hbC5zZXR1cChzdGFjaywgcG9zaXRpb25hbEJhc2UsIHBvc2l0aW9uYWxDb3VudCk7XG5cbiAgICBsZXQgYmxvY2tzID0gdGhpcy5ibG9ja3M7XG4gICAgbGV0IGJsb2Nrc0NvdW50ID0gYmxvY2tOYW1lcy5sZW5ndGg7XG4gICAgbGV0IGJsb2Nrc0Jhc2UgPSBwb3NpdGlvbmFsQmFzZSAtIGJsb2Nrc0NvdW50ICogMztcblxuICAgIGJsb2Nrcy5zZXR1cChzdGFjaywgYmxvY2tzQmFzZSwgYmxvY2tzQ291bnQsIGJsb2NrTmFtZXMpO1xuICB9XG5cbiAgZ2V0IHRhZygpOiBUYWcge1xuICAgIHJldHVybiBjb21iaW5lVGFnZ2VkKFt0aGlzLnBvc2l0aW9uYWwsIHRoaXMubmFtZWRdKTtcbiAgfVxuXG4gIGdldCBiYXNlKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuYmxvY2tzLmJhc2U7XG4gIH1cblxuICBnZXQgbGVuZ3RoKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMucG9zaXRpb25hbC5sZW5ndGggKyB0aGlzLm5hbWVkLmxlbmd0aCArIHRoaXMuYmxvY2tzLmxlbmd0aCAqIDM7XG4gIH1cblxuICBhdDxUIGV4dGVuZHMgVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTx1bmtub3duPj4ocG9zOiBudW1iZXIpOiBUIHtcbiAgICByZXR1cm4gdGhpcy5wb3NpdGlvbmFsLmF0PFQ+KHBvcyk7XG4gIH1cblxuICByZWFsbG9jKG9mZnNldDogbnVtYmVyKSB7XG4gICAgbGV0IHsgc3RhY2sgfSA9IHRoaXM7XG4gICAgaWYgKG9mZnNldCA+IDAgJiYgc3RhY2sgIT09IG51bGwpIHtcbiAgICAgIGxldCB7IHBvc2l0aW9uYWwsIG5hbWVkIH0gPSB0aGlzO1xuICAgICAgbGV0IG5ld0Jhc2UgPSBwb3NpdGlvbmFsLmJhc2UgKyBvZmZzZXQ7XG4gICAgICBsZXQgbGVuZ3RoID0gcG9zaXRpb25hbC5sZW5ndGggKyBuYW1lZC5sZW5ndGg7XG5cbiAgICAgIGZvciAobGV0IGkgPSBsZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBzdGFjay5jb3B5KGkgKyBwb3NpdGlvbmFsLmJhc2UsIGkgKyBuZXdCYXNlKTtcbiAgICAgIH1cblxuICAgICAgcG9zaXRpb25hbC5iYXNlICs9IG9mZnNldDtcbiAgICAgIG5hbWVkLmJhc2UgKz0gb2Zmc2V0O1xuICAgICAgc3RhY2tbUkVHSVNURVJTXVskc3BdICs9IG9mZnNldDtcbiAgICB9XG4gIH1cblxuICBjYXB0dXJlKCk6IENhcHR1cmVkQXJndW1lbnRzIHtcbiAgICBsZXQgcG9zaXRpb25hbCA9IHRoaXMucG9zaXRpb25hbC5sZW5ndGggPT09IDAgPyBFTVBUWV9QT1NJVElPTkFMIDogdGhpcy5wb3NpdGlvbmFsLmNhcHR1cmUoKTtcbiAgICBsZXQgbmFtZWQgPSB0aGlzLm5hbWVkLmxlbmd0aCA9PT0gMCA/IEVNUFRZX05BTUVEIDogdGhpcy5uYW1lZC5jYXB0dXJlKCk7XG5cbiAgICByZXR1cm4gbmV3IENhcHR1cmVkQXJndW1lbnRzSW1wbCh0aGlzLnRhZywgcG9zaXRpb25hbCwgbmFtZWQsIHRoaXMubGVuZ3RoKTtcbiAgfVxuXG4gIGNsZWFyKCk6IHZvaWQge1xuICAgIGxldCB7IHN0YWNrLCBsZW5ndGggfSA9IHRoaXM7XG4gICAgaWYgKGxlbmd0aCA+IDAgJiYgc3RhY2sgIT09IG51bGwpIHN0YWNrLnBvcChsZW5ndGgpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBQb3NpdGlvbmFsQXJndW1lbnRzSW1wbCBpbXBsZW1lbnRzIFBvc2l0aW9uYWxBcmd1bWVudHMge1xuICBwdWJsaWMgYmFzZSA9IDA7XG4gIHB1YmxpYyBsZW5ndGggPSAwO1xuXG4gIHByaXZhdGUgc3RhY2s6IEV2YWx1YXRpb25TdGFjayA9IG51bGwgYXMgYW55O1xuXG4gIHByaXZhdGUgX3RhZzogT3B0aW9uPFRhZz4gPSBudWxsO1xuICBwcml2YXRlIF9yZWZlcmVuY2VzOiBPcHRpb248VmVyc2lvbmVkUGF0aFJlZmVyZW5jZTx1bmtub3duPltdPiA9IG51bGw7XG5cbiAgZW1wdHkoc3RhY2s6IEV2YWx1YXRpb25TdGFjaywgYmFzZTogbnVtYmVyKSB7XG4gICAgdGhpcy5zdGFjayA9IHN0YWNrO1xuICAgIHRoaXMuYmFzZSA9IGJhc2U7XG4gICAgdGhpcy5sZW5ndGggPSAwO1xuXG4gICAgdGhpcy5fdGFnID0gQ09OU1RBTlRfVEFHO1xuICAgIHRoaXMuX3JlZmVyZW5jZXMgPSBFTVBUWV9BUlJBWTtcbiAgfVxuXG4gIHNldHVwKHN0YWNrOiBFdmFsdWF0aW9uU3RhY2ssIGJhc2U6IG51bWJlciwgbGVuZ3RoOiBudW1iZXIpIHtcbiAgICB0aGlzLnN0YWNrID0gc3RhY2s7XG4gICAgdGhpcy5iYXNlID0gYmFzZTtcbiAgICB0aGlzLmxlbmd0aCA9IGxlbmd0aDtcblxuICAgIGlmIChsZW5ndGggPT09IDApIHtcbiAgICAgIHRoaXMuX3RhZyA9IENPTlNUQU5UX1RBRztcbiAgICAgIHRoaXMuX3JlZmVyZW5jZXMgPSBFTVBUWV9BUlJBWTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fdGFnID0gbnVsbDtcbiAgICAgIHRoaXMuX3JlZmVyZW5jZXMgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGdldCB0YWcoKTogVGFnIHtcbiAgICBsZXQgdGFnID0gdGhpcy5fdGFnO1xuXG4gICAgaWYgKCF0YWcpIHtcbiAgICAgIHRhZyA9IHRoaXMuX3RhZyA9IGNvbWJpbmVUYWdnZWQodGhpcy5yZWZlcmVuY2VzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGFnO1xuICB9XG5cbiAgYXQ8VCBleHRlbmRzIFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8dW5rbm93bj4+KHBvc2l0aW9uOiBudW1iZXIpOiBUIHtcbiAgICBsZXQgeyBiYXNlLCBsZW5ndGgsIHN0YWNrIH0gPSB0aGlzO1xuXG4gICAgaWYgKHBvc2l0aW9uIDwgMCB8fCBwb3NpdGlvbiA+PSBsZW5ndGgpIHtcbiAgICAgIHJldHVybiAoVU5ERUZJTkVEX1JFRkVSRU5DRSBhcyB1bnNhZmUpIGFzIFQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNoZWNrKHN0YWNrLmdldChwb3NpdGlvbiwgYmFzZSksIENoZWNrUGF0aFJlZmVyZW5jZSkgYXMgVDtcbiAgfVxuXG4gIGNhcHR1cmUoKTogQ2FwdHVyZWRQb3NpdGlvbmFsQXJndW1lbnRzSW1wbCB7XG4gICAgcmV0dXJuIG5ldyBDYXB0dXJlZFBvc2l0aW9uYWxBcmd1bWVudHNJbXBsKHRoaXMudGFnLCB0aGlzLnJlZmVyZW5jZXMpO1xuICB9XG5cbiAgcHJlcGVuZChvdGhlcjogQ2FwdHVyZWRQb3NpdGlvbmFsQXJndW1lbnRzKSB7XG4gICAgbGV0IGFkZGl0aW9ucyA9IG90aGVyLmxlbmd0aDtcblxuICAgIGlmIChhZGRpdGlvbnMgPiAwKSB7XG4gICAgICBsZXQgeyBiYXNlLCBsZW5ndGgsIHN0YWNrIH0gPSB0aGlzO1xuXG4gICAgICB0aGlzLmJhc2UgPSBiYXNlID0gYmFzZSAtIGFkZGl0aW9ucztcbiAgICAgIHRoaXMubGVuZ3RoID0gbGVuZ3RoICsgYWRkaXRpb25zO1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFkZGl0aW9uczsgaSsrKSB7XG4gICAgICAgIHN0YWNrLnNldChvdGhlci5hdChpKSwgaSwgYmFzZSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3RhZyA9IG51bGw7XG4gICAgICB0aGlzLl9yZWZlcmVuY2VzID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdldCByZWZlcmVuY2VzKCk6IFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8dW5rbm93bj5bXSB7XG4gICAgbGV0IHJlZmVyZW5jZXMgPSB0aGlzLl9yZWZlcmVuY2VzO1xuXG4gICAgaWYgKCFyZWZlcmVuY2VzKSB7XG4gICAgICBsZXQgeyBzdGFjaywgYmFzZSwgbGVuZ3RoIH0gPSB0aGlzO1xuICAgICAgcmVmZXJlbmNlcyA9IHRoaXMuX3JlZmVyZW5jZXMgPSBzdGFjay5zbGljZUFycmF5PFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8dW5rbm93bj4+KFxuICAgICAgICBiYXNlLFxuICAgICAgICBiYXNlICsgbGVuZ3RoXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiByZWZlcmVuY2VzO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDYXB0dXJlZFBvc2l0aW9uYWxBcmd1bWVudHNJbXBsIGltcGxlbWVudHMgQ2FwdHVyZWRQb3NpdGlvbmFsQXJndW1lbnRzIHtcbiAgc3RhdGljIGVtcHR5KCk6IENhcHR1cmVkUG9zaXRpb25hbEFyZ3VtZW50cyB7XG4gICAgcmV0dXJuIG5ldyBDYXB0dXJlZFBvc2l0aW9uYWxBcmd1bWVudHNJbXBsKENPTlNUQU5UX1RBRywgRU1QVFlfQVJSQVksIDApO1xuICB9XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHRhZzogVGFnLFxuICAgIHB1YmxpYyByZWZlcmVuY2VzOiBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPHVua25vd24+W10sXG4gICAgcHVibGljIGxlbmd0aCA9IHJlZmVyZW5jZXMubGVuZ3RoXG4gICkge31cblxuICBhdDxUIGV4dGVuZHMgVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTx1bmtub3duPj4ocG9zaXRpb246IG51bWJlcik6IFQge1xuICAgIHJldHVybiB0aGlzLnJlZmVyZW5jZXNbcG9zaXRpb25dIGFzIFQ7XG4gIH1cblxuICB2YWx1ZSgpOiB1bmtub3duW10ge1xuICAgIHJldHVybiB0aGlzLnJlZmVyZW5jZXMubWFwKHRoaXMudmFsdWVPZik7XG4gIH1cblxuICBnZXQobmFtZTogc3RyaW5nKTogVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTx1bmtub3duPiB7XG4gICAgbGV0IHsgcmVmZXJlbmNlcywgbGVuZ3RoIH0gPSB0aGlzO1xuXG4gICAgaWYgKG5hbWUgPT09ICdsZW5ndGgnKSB7XG4gICAgICByZXR1cm4gUHJpbWl0aXZlUmVmZXJlbmNlLmNyZWF0ZShsZW5ndGgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgaWR4ID0gcGFyc2VJbnQobmFtZSwgMTApO1xuXG4gICAgICBpZiAoaWR4IDwgMCB8fCBpZHggPj0gbGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBVTkRFRklORURfUkVGRVJFTkNFO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHJlZmVyZW5jZXNbaWR4XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHZhbHVlT2YodGhpczogdm9pZCwgcmVmZXJlbmNlOiBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPHVua25vd24+KTogdW5rbm93biB7XG4gICAgcmV0dXJuIHJlZmVyZW5jZS52YWx1ZSgpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBOYW1lZEFyZ3VtZW50c0ltcGwgaW1wbGVtZW50cyBOYW1lZEFyZ3VtZW50cyB7XG4gIHB1YmxpYyBiYXNlID0gMDtcbiAgcHVibGljIGxlbmd0aCA9IDA7XG5cbiAgcHJpdmF0ZSBzdGFjayE6IEV2YWx1YXRpb25TdGFjaztcblxuICBwcml2YXRlIF9yZWZlcmVuY2VzOiBPcHRpb248VmVyc2lvbmVkUGF0aFJlZmVyZW5jZTx1bmtub3duPltdPiA9IG51bGw7XG5cbiAgcHJpdmF0ZSBfbmFtZXM6IE9wdGlvbjxzdHJpbmdbXT4gPSBFTVBUWV9BUlJBWTtcbiAgcHJpdmF0ZSBfYXROYW1lczogT3B0aW9uPHN0cmluZ1tdPiA9IEVNUFRZX0FSUkFZO1xuXG4gIGVtcHR5KHN0YWNrOiBFdmFsdWF0aW9uU3RhY2ssIGJhc2U6IG51bWJlcikge1xuICAgIHRoaXMuc3RhY2sgPSBzdGFjaztcbiAgICB0aGlzLmJhc2UgPSBiYXNlO1xuICAgIHRoaXMubGVuZ3RoID0gMDtcblxuICAgIHRoaXMuX3JlZmVyZW5jZXMgPSBFTVBUWV9BUlJBWTtcbiAgICB0aGlzLl9uYW1lcyA9IEVNUFRZX0FSUkFZO1xuICAgIHRoaXMuX2F0TmFtZXMgPSBFTVBUWV9BUlJBWTtcbiAgfVxuXG4gIHNldHVwKHN0YWNrOiBFdmFsdWF0aW9uU3RhY2ssIGJhc2U6IG51bWJlciwgbGVuZ3RoOiBudW1iZXIsIG5hbWVzOiBzdHJpbmdbXSwgYXROYW1lczogYm9vbGVhbikge1xuICAgIHRoaXMuc3RhY2sgPSBzdGFjaztcbiAgICB0aGlzLmJhc2UgPSBiYXNlO1xuICAgIHRoaXMubGVuZ3RoID0gbGVuZ3RoO1xuXG4gICAgaWYgKGxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy5fcmVmZXJlbmNlcyA9IEVNUFRZX0FSUkFZO1xuICAgICAgdGhpcy5fbmFtZXMgPSBFTVBUWV9BUlJBWTtcbiAgICAgIHRoaXMuX2F0TmFtZXMgPSBFTVBUWV9BUlJBWTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fcmVmZXJlbmNlcyA9IG51bGw7XG5cbiAgICAgIGlmIChhdE5hbWVzKSB7XG4gICAgICAgIHRoaXMuX25hbWVzID0gbnVsbDtcbiAgICAgICAgdGhpcy5fYXROYW1lcyA9IG5hbWVzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fbmFtZXMgPSBuYW1lcztcbiAgICAgICAgdGhpcy5fYXROYW1lcyA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0IHRhZygpOiBUYWcge1xuICAgIHJldHVybiBjb21iaW5lVGFnZ2VkKHRoaXMucmVmZXJlbmNlcyk7XG4gIH1cblxuICBnZXQgbmFtZXMoKTogc3RyaW5nW10ge1xuICAgIGxldCBuYW1lcyA9IHRoaXMuX25hbWVzO1xuXG4gICAgaWYgKCFuYW1lcykge1xuICAgICAgbmFtZXMgPSB0aGlzLl9uYW1lcyA9IHRoaXMuX2F0TmFtZXMhLm1hcCh0aGlzLnRvU3ludGhldGljTmFtZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5hbWVzITtcbiAgfVxuXG4gIGdldCBhdE5hbWVzKCk6IHN0cmluZ1tdIHtcbiAgICBsZXQgYXROYW1lcyA9IHRoaXMuX2F0TmFtZXM7XG5cbiAgICBpZiAoIWF0TmFtZXMpIHtcbiAgICAgIGF0TmFtZXMgPSB0aGlzLl9hdE5hbWVzID0gdGhpcy5fbmFtZXMhLm1hcCh0aGlzLnRvQXROYW1lKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXROYW1lcyE7XG4gIH1cblxuICBoYXMobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMubmFtZXMuaW5kZXhPZihuYW1lKSAhPT0gLTE7XG4gIH1cblxuICBnZXQ8VCBleHRlbmRzIFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8dW5rbm93bj4+KG5hbWU6IHN0cmluZywgYXROYW1lcyA9IGZhbHNlKTogVCB7XG4gICAgbGV0IHsgYmFzZSwgc3RhY2sgfSA9IHRoaXM7XG5cbiAgICBsZXQgbmFtZXMgPSBhdE5hbWVzID8gdGhpcy5hdE5hbWVzIDogdGhpcy5uYW1lcztcblxuICAgIGxldCBpZHggPSBuYW1lcy5pbmRleE9mKG5hbWUpO1xuXG4gICAgaWYgKGlkeCA9PT0gLTEpIHtcbiAgICAgIHJldHVybiAoVU5ERUZJTkVEX1JFRkVSRU5DRSBhcyB1bnNhZmUpIGFzIFQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0YWNrLmdldDxUPihpZHgsIGJhc2UpO1xuICB9XG5cbiAgY2FwdHVyZSgpOiBDYXB0dXJlZE5hbWVkQXJndW1lbnRzIHtcbiAgICByZXR1cm4gbmV3IENhcHR1cmVkTmFtZWRBcmd1bWVudHNJbXBsKHRoaXMudGFnLCB0aGlzLm5hbWVzLCB0aGlzLnJlZmVyZW5jZXMpO1xuICB9XG5cbiAgbWVyZ2Uob3RoZXI6IENhcHR1cmVkTmFtZWRBcmd1bWVudHMpIHtcbiAgICBsZXQgeyBsZW5ndGg6IGV4dHJhcyB9ID0gb3RoZXI7XG5cbiAgICBpZiAoZXh0cmFzID4gMCkge1xuICAgICAgbGV0IHsgbmFtZXMsIGxlbmd0aCwgc3RhY2sgfSA9IHRoaXM7XG4gICAgICBsZXQgeyBuYW1lczogZXh0cmFOYW1lcyB9ID0gb3RoZXI7XG5cbiAgICAgIGlmIChPYmplY3QuaXNGcm96ZW4obmFtZXMpICYmIG5hbWVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBuYW1lcyA9IFtdO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGV4dHJhczsgaSsrKSB7XG4gICAgICAgIGxldCBuYW1lID0gZXh0cmFOYW1lc1tpXTtcbiAgICAgICAgbGV0IGlkeCA9IG5hbWVzLmluZGV4T2YobmFtZSk7XG5cbiAgICAgICAgaWYgKGlkeCA9PT0gLTEpIHtcbiAgICAgICAgICBsZW5ndGggPSBuYW1lcy5wdXNoKG5hbWUpO1xuICAgICAgICAgIHN0YWNrLnB1c2gob3RoZXIucmVmZXJlbmNlc1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5sZW5ndGggPSBsZW5ndGg7XG4gICAgICB0aGlzLl9yZWZlcmVuY2VzID0gbnVsbDtcbiAgICAgIHRoaXMuX25hbWVzID0gbmFtZXM7XG4gICAgICB0aGlzLl9hdE5hbWVzID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdldCByZWZlcmVuY2VzKCk6IFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8dW5rbm93bj5bXSB7XG4gICAgbGV0IHJlZmVyZW5jZXMgPSB0aGlzLl9yZWZlcmVuY2VzO1xuXG4gICAgaWYgKCFyZWZlcmVuY2VzKSB7XG4gICAgICBsZXQgeyBiYXNlLCBsZW5ndGgsIHN0YWNrIH0gPSB0aGlzO1xuICAgICAgcmVmZXJlbmNlcyA9IHRoaXMuX3JlZmVyZW5jZXMgPSBzdGFjay5zbGljZUFycmF5PFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8dW5rbm93bj4+KFxuICAgICAgICBiYXNlLFxuICAgICAgICBiYXNlICsgbGVuZ3RoXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiByZWZlcmVuY2VzO1xuICB9XG5cbiAgcHJpdmF0ZSB0b1N5bnRoZXRpY05hbWUodGhpczogdm9pZCwgbmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbmFtZS5zbGljZSgxKTtcbiAgfVxuXG4gIHByaXZhdGUgdG9BdE5hbWUodGhpczogdm9pZCwgbmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYEAke25hbWV9YDtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ2FwdHVyZWROYW1lZEFyZ3VtZW50c0ltcGwgaW1wbGVtZW50cyBDYXB0dXJlZE5hbWVkQXJndW1lbnRzIHtcbiAgcHVibGljIGxlbmd0aDogbnVtYmVyO1xuICBwcml2YXRlIF9tYXA6IE9wdGlvbjxEaWN0PFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8dW5rbm93bj4+PjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgdGFnOiBUYWcsXG4gICAgcHVibGljIG5hbWVzOiBzdHJpbmdbXSxcbiAgICBwdWJsaWMgcmVmZXJlbmNlczogVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTx1bmtub3duPltdXG4gICkge1xuICAgIHRoaXMubGVuZ3RoID0gbmFtZXMubGVuZ3RoO1xuICAgIHRoaXMuX21hcCA9IG51bGw7XG4gIH1cblxuICBnZXQgbWFwKCkge1xuICAgIGxldCBtYXAgPSB0aGlzLl9tYXA7XG5cbiAgICBpZiAoIW1hcCkge1xuICAgICAgbGV0IHsgbmFtZXMsIHJlZmVyZW5jZXMgfSA9IHRoaXM7XG4gICAgICBtYXAgPSB0aGlzLl9tYXAgPSBkaWN0PFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8dW5rbm93bj4+KCk7XG5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGV0IG5hbWUgPSBuYW1lc1tpXTtcbiAgICAgICAgbWFwIVtuYW1lXSA9IHJlZmVyZW5jZXNbaV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1hcDtcbiAgfVxuXG4gIGhhcyhuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5uYW1lcy5pbmRleE9mKG5hbWUpICE9PSAtMTtcbiAgfVxuXG4gIGdldDxUIGV4dGVuZHMgVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTx1bmtub3duPj4obmFtZTogc3RyaW5nKTogVCB7XG4gICAgbGV0IHsgbmFtZXMsIHJlZmVyZW5jZXMgfSA9IHRoaXM7XG4gICAgbGV0IGlkeCA9IG5hbWVzLmluZGV4T2YobmFtZSk7XG5cbiAgICBpZiAoaWR4ID09PSAtMSkge1xuICAgICAgcmV0dXJuIChVTkRFRklORURfUkVGRVJFTkNFIGFzIHVuc2FmZSkgYXMgVDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHJlZmVyZW5jZXNbaWR4XSBhcyBUO1xuICAgIH1cbiAgfVxuXG4gIHZhbHVlKCk6IERpY3Q8dW5rbm93bj4ge1xuICAgIGxldCB7IG5hbWVzLCByZWZlcmVuY2VzIH0gPSB0aGlzO1xuICAgIGxldCBvdXQgPSBkaWN0PHVua25vd24+KCk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgbmFtZSA9IG5hbWVzW2ldO1xuICAgICAgb3V0W25hbWVdID0gcmVmZXJlbmNlc1tpXS52YWx1ZSgpO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEJsb2NrQXJndW1lbnRzSW1wbDxDIGV4dGVuZHMgSml0T3JBb3RCbG9jaz4gaW1wbGVtZW50cyBCbG9ja0FyZ3VtZW50czxDPiB7XG4gIHByaXZhdGUgc3RhY2shOiBFdmFsdWF0aW9uU3RhY2s7XG4gIHByaXZhdGUgaW50ZXJuYWxWYWx1ZXM6IE9wdGlvbjxudW1iZXJbXT4gPSBudWxsO1xuXG4gIHB1YmxpYyBpbnRlcm5hbFRhZzogT3B0aW9uPFRhZz4gPSBudWxsO1xuICBwdWJsaWMgbmFtZXM6IHN0cmluZ1tdID0gRU1QVFlfQVJSQVk7XG5cbiAgcHVibGljIGxlbmd0aCA9IDA7XG4gIHB1YmxpYyBiYXNlID0gMDtcblxuICBlbXB0eShzdGFjazogRXZhbHVhdGlvblN0YWNrLCBiYXNlOiBudW1iZXIpIHtcbiAgICB0aGlzLnN0YWNrID0gc3RhY2s7XG4gICAgdGhpcy5uYW1lcyA9IEVNUFRZX0FSUkFZO1xuICAgIHRoaXMuYmFzZSA9IGJhc2U7XG4gICAgdGhpcy5sZW5ndGggPSAwO1xuXG4gICAgdGhpcy5pbnRlcm5hbFRhZyA9IENPTlNUQU5UX1RBRztcbiAgICB0aGlzLmludGVybmFsVmFsdWVzID0gRU1QVFlfQVJSQVk7XG4gIH1cblxuICBzZXR1cChzdGFjazogRXZhbHVhdGlvblN0YWNrLCBiYXNlOiBudW1iZXIsIGxlbmd0aDogbnVtYmVyLCBuYW1lczogc3RyaW5nW10pIHtcbiAgICB0aGlzLnN0YWNrID0gc3RhY2s7XG4gICAgdGhpcy5uYW1lcyA9IG5hbWVzO1xuICAgIHRoaXMuYmFzZSA9IGJhc2U7XG4gICAgdGhpcy5sZW5ndGggPSBsZW5ndGg7XG5cbiAgICBpZiAobGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLmludGVybmFsVGFnID0gQ09OU1RBTlRfVEFHO1xuICAgICAgdGhpcy5pbnRlcm5hbFZhbHVlcyA9IEVNUFRZX0FSUkFZO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmludGVybmFsVGFnID0gbnVsbDtcbiAgICAgIHRoaXMuaW50ZXJuYWxWYWx1ZXMgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGdldCB2YWx1ZXMoKTogQmxvY2tWYWx1ZVtdIHtcbiAgICBsZXQgdmFsdWVzID0gdGhpcy5pbnRlcm5hbFZhbHVlcztcblxuICAgIGlmICghdmFsdWVzKSB7XG4gICAgICBsZXQgeyBiYXNlLCBsZW5ndGgsIHN0YWNrIH0gPSB0aGlzO1xuICAgICAgdmFsdWVzID0gdGhpcy5pbnRlcm5hbFZhbHVlcyA9IHN0YWNrLnNsaWNlQXJyYXk8bnVtYmVyPihiYXNlLCBiYXNlICsgbGVuZ3RoICogMyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbHVlcztcbiAgfVxuXG4gIGhhcyhuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5uYW1lcyEuaW5kZXhPZihuYW1lKSAhPT0gLTE7XG4gIH1cblxuICBnZXQobmFtZTogc3RyaW5nKTogT3B0aW9uPFNjb3BlQmxvY2s8Qz4+IHtcbiAgICBsZXQgeyBiYXNlLCBzdGFjaywgbmFtZXMgfSA9IHRoaXM7XG5cbiAgICBsZXQgaWR4ID0gbmFtZXMhLmluZGV4T2YobmFtZSk7XG5cbiAgICBpZiAobmFtZXMhLmluZGV4T2YobmFtZSkgPT09IC0xKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBsZXQgdGFibGUgPSBjaGVjayhzdGFjay5nZXQoaWR4ICogMywgYmFzZSksIENoZWNrT3B0aW9uKENoZWNrQmxvY2tTeW1ib2xUYWJsZSkpO1xuICAgIGxldCBzY29wZSA9IGNoZWNrKHN0YWNrLmdldChpZHggKiAzICsgMSwgYmFzZSksIENoZWNrT3B0aW9uKENoZWNrU2NvcGUpKTtcbiAgICBsZXQgaGFuZGxlID0gY2hlY2soXG4gICAgICBzdGFjay5nZXQoaWR4ICogMyArIDIsIGJhc2UpLFxuICAgICAgQ2hlY2tPcHRpb24oQ2hlY2tPcihDaGVja0hhbmRsZSwgQ2hlY2tDb21waWxhYmxlQmxvY2spKVxuICAgICk7XG5cbiAgICByZXR1cm4gaGFuZGxlID09PSBudWxsID8gbnVsbCA6IChbaGFuZGxlLCBzY29wZSEsIHRhYmxlIV0gYXMgU2NvcGVCbG9jazxDPik7XG4gIH1cblxuICBjYXB0dXJlKCk6IENhcHR1cmVkQmxvY2tBcmd1bWVudHMge1xuICAgIHJldHVybiBuZXcgQ2FwdHVyZWRCbG9ja0FyZ3VtZW50c0ltcGwodGhpcy5uYW1lcywgdGhpcy52YWx1ZXMpO1xuICB9XG59XG5cbmNsYXNzIENhcHR1cmVkQmxvY2tBcmd1bWVudHNJbXBsIGltcGxlbWVudHMgQ2FwdHVyZWRCbG9ja0FyZ3VtZW50cyB7XG4gIHB1YmxpYyBsZW5ndGg6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgbmFtZXM6IHN0cmluZ1tdLCBwdWJsaWMgdmFsdWVzOiBCbG9ja1ZhbHVlW10pIHtcbiAgICB0aGlzLmxlbmd0aCA9IG5hbWVzLmxlbmd0aDtcbiAgfVxuXG4gIGhhcyhuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5uYW1lcy5pbmRleE9mKG5hbWUpICE9PSAtMTtcbiAgfVxuXG4gIGdldChuYW1lOiBzdHJpbmcpOiBPcHRpb248U2NvcGVCbG9jaz4ge1xuICAgIGxldCBpZHggPSB0aGlzLm5hbWVzLmluZGV4T2YobmFtZSk7XG5cbiAgICBpZiAoaWR4ID09PSAtMSkgcmV0dXJuIG51bGw7XG5cbiAgICByZXR1cm4gW1xuICAgICAgdGhpcy52YWx1ZXNbaWR4ICogMyArIDJdIGFzIG51bWJlcixcbiAgICAgIHRoaXMudmFsdWVzW2lkeCAqIDMgKyAxXSBhcyBTY29wZTxKaXRPckFvdEJsb2NrPixcbiAgICAgIHRoaXMudmFsdWVzW2lkeCAqIDNdIGFzIEJsb2NrU3ltYm9sVGFibGUsXG4gICAgXTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ2FwdHVyZWRBcmd1bWVudHNJbXBsIGltcGxlbWVudHMgQ2FwdHVyZWRBcmd1bWVudHMge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgdGFnOiBUYWcsXG4gICAgcHVibGljIHBvc2l0aW9uYWw6IENhcHR1cmVkUG9zaXRpb25hbEFyZ3VtZW50cyxcbiAgICBwdWJsaWMgbmFtZWQ6IENhcHR1cmVkTmFtZWRBcmd1bWVudHMsXG4gICAgcHVibGljIGxlbmd0aDogbnVtYmVyXG4gICkge31cblxuICB2YWx1ZSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZWQ6IHRoaXMubmFtZWQudmFsdWUoKSxcbiAgICAgIHBvc2l0aW9uYWw6IHRoaXMucG9zaXRpb25hbC52YWx1ZSgpLFxuICAgIH07XG4gIH1cbn1cblxuY29uc3QgRU1QVFlfTkFNRUQgPSBuZXcgQ2FwdHVyZWROYW1lZEFyZ3VtZW50c0ltcGwoQ09OU1RBTlRfVEFHLCBFTVBUWV9BUlJBWSwgRU1QVFlfQVJSQVkpO1xuY29uc3QgRU1QVFlfUE9TSVRJT05BTCA9IG5ldyBDYXB0dXJlZFBvc2l0aW9uYWxBcmd1bWVudHNJbXBsKENPTlNUQU5UX1RBRywgRU1QVFlfQVJSQVkpO1xuZXhwb3J0IGNvbnN0IEVNUFRZX0FSR1MgPSBuZXcgQ2FwdHVyZWRBcmd1bWVudHNJbXBsKENPTlNUQU5UX1RBRywgRU1QVFlfUE9TSVRJT05BTCwgRU1QVFlfTkFNRUQsIDApO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==