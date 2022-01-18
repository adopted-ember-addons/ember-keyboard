var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { dict, EMPTY_ARRAY } from '@glimmer/util';
import { combineTagged } from '@glimmer/reference';
import { CONSTANT_TAG } from '@glimmer/reference';
import { PrimitiveReference, UNDEFINED_REFERENCE } from '../references';

import { REGISTERS } from '../symbols';
import { $sp } from '@glimmer/vm';
/*
  The calling convention is:

  * 0-N block arguments at the bottom
  * 0-N positional arguments next (left-to-right)
  * 0-N named arguments next
*/
export var VMArgumentsImpl = function () {
    function VMArgumentsImpl() {
        _classCallCheck(this, VMArgumentsImpl);

        this.stack = null;
        this.positional = new PositionalArgumentsImpl();
        this.named = new NamedArgumentsImpl();
        this.blocks = new BlockArgumentsImpl();
    }

    VMArgumentsImpl.prototype.empty = function empty(stack) {
        var base = stack[REGISTERS][$sp] + 1;
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
        var namedBase = stack[REGISTERS][$sp] - namedCount + 1;
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
            stack[REGISTERS][$sp] += offset;
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
            return combineTagged([this.positional, this.named]);
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
export var PositionalArgumentsImpl = function () {
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
        this._tag = CONSTANT_TAG;
        this._references = EMPTY_ARRAY;
    };

    PositionalArgumentsImpl.prototype.setup = function setup(stack, base, length) {
        this.stack = stack;
        this.base = base;
        this.length = length;
        if (length === 0) {
            this._tag = CONSTANT_TAG;
            this._references = EMPTY_ARRAY;
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
            return UNDEFINED_REFERENCE;
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
                tag = this._tag = combineTagged(this.references);
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
export var CapturedPositionalArgumentsImpl = function () {
    function CapturedPositionalArgumentsImpl(tag, references) {
        var length = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : references.length;

        _classCallCheck(this, CapturedPositionalArgumentsImpl);

        this.tag = tag;
        this.references = references;
        this.length = length;
    }

    CapturedPositionalArgumentsImpl.empty = function empty() {
        return new CapturedPositionalArgumentsImpl(CONSTANT_TAG, EMPTY_ARRAY, 0);
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
            return PrimitiveReference.create(length);
        } else {
            var idx = parseInt(name, 10);
            if (idx < 0 || idx >= length) {
                return UNDEFINED_REFERENCE;
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
export var NamedArgumentsImpl = function () {
    function NamedArgumentsImpl() {
        _classCallCheck(this, NamedArgumentsImpl);

        this.base = 0;
        this.length = 0;
        this._references = null;
        this._names = EMPTY_ARRAY;
        this._atNames = EMPTY_ARRAY;
    }

    NamedArgumentsImpl.prototype.empty = function empty(stack, base) {
        this.stack = stack;
        this.base = base;
        this.length = 0;
        this._references = EMPTY_ARRAY;
        this._names = EMPTY_ARRAY;
        this._atNames = EMPTY_ARRAY;
    };

    NamedArgumentsImpl.prototype.setup = function setup(stack, base, length, names, atNames) {
        this.stack = stack;
        this.base = base;
        this.length = length;
        if (length === 0) {
            this._references = EMPTY_ARRAY;
            this._names = EMPTY_ARRAY;
            this._atNames = EMPTY_ARRAY;
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
            return UNDEFINED_REFERENCE;
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
            return combineTagged(this.references);
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
export var CapturedNamedArgumentsImpl = function () {
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
            return UNDEFINED_REFERENCE;
        } else {
            return references[idx];
        }
    };

    CapturedNamedArgumentsImpl.prototype.value = function value() {
        var names = this.names,
            references = this.references;

        var out = dict();
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

                map = this._map = dict();
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
export var BlockArgumentsImpl = function () {
    function BlockArgumentsImpl() {
        _classCallCheck(this, BlockArgumentsImpl);

        this.internalValues = null;
        this.internalTag = null;
        this.names = EMPTY_ARRAY;
        this.length = 0;
        this.base = 0;
    }

    BlockArgumentsImpl.prototype.empty = function empty(stack, base) {
        this.stack = stack;
        this.names = EMPTY_ARRAY;
        this.base = base;
        this.length = 0;
        this.internalTag = CONSTANT_TAG;
        this.internalValues = EMPTY_ARRAY;
    };

    BlockArgumentsImpl.prototype.setup = function setup(stack, base, length, names) {
        this.stack = stack;
        this.names = names;
        this.base = base;
        this.length = length;
        if (length === 0) {
            this.internalTag = CONSTANT_TAG;
            this.internalValues = EMPTY_ARRAY;
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

export var CapturedArgumentsImpl = function () {
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
var EMPTY_NAMED = new CapturedNamedArgumentsImpl(CONSTANT_TAG, EMPTY_ARRAY, EMPTY_ARRAY);
var EMPTY_POSITIONAL = new CapturedPositionalArgumentsImpl(CONSTANT_TAG, EMPTY_ARRAY);
export var EMPTY_ARGS = new CapturedArgumentsImpl(CONSTANT_TAG, EMPTY_POSITIONAL, EMPTY_NAMED, 0);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL3ZtL2FyZ3VtZW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQ0EsU0FBQSxJQUFBLEVBQUEsV0FBQSxRQUFBLGVBQUE7QUFDQSxTQUFBLGFBQUEsUUFBQSxvQkFBQTtBQW1CQSxTQUFBLFlBQUEsUUFBQSxvQkFBQTtBQUNBLFNBQUEsa0JBQUEsRUFBQSxtQkFBQSxRQUFBLGVBQUE7O0FBT0EsU0FBQSxTQUFBLFFBQUEsWUFBQTtBQUNBLFNBQUEsR0FBQSxRQUFBLGFBQUE7QUFFQTs7Ozs7OztBQVFBLFdBQU0sZUFBTjtBQUFBLCtCQUFBO0FBQUE7O0FBQ1UsYUFBQSxLQUFBLEdBQUEsSUFBQTtBQUNELGFBQUEsVUFBQSxHQUFhLElBQWIsdUJBQWEsRUFBYjtBQUNBLGFBQUEsS0FBQSxHQUFRLElBQVIsa0JBQVEsRUFBUjtBQUNBLGFBQUEsTUFBQSxHQUFTLElBQVQsa0JBQVMsRUFBVDtBQTJGUjs7QUEvRkQsOEJBTUUsS0FORixrQkFNRSxLQU5GLEVBTThCO0FBQzFCLFlBQUksT0FBTyxNQUFBLFNBQUEsRUFBQSxHQUFBLElBQVgsQ0FBQTtBQUVBLGFBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLEVBQUEsSUFBQTtBQUNBLGFBQUEsVUFBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLEVBQUEsSUFBQTtBQUNBLGFBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLEVBQUEsSUFBQTtBQUVBLGVBQUEsSUFBQTtBQUNELEtBZEg7O0FBQUEsOEJBZ0JFLEtBaEJGLGtCQWdCRSxLQWhCRixFQWdCRSxLQWhCRixFQWdCRSxVQWhCRixFQWdCRSxlQWhCRixFQWdCRSxPQWhCRixFQXFCb0I7QUFFaEIsYUFBQSxLQUFBLEdBQUEsS0FBQTtBQUVBOzs7Ozs7O0FBUUEsWUFBSSxRQUFRLEtBQVosS0FBQTtBQUNBLFlBQUksYUFBYSxNQUFqQixNQUFBO0FBQ0EsWUFBSSxZ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QUFFQSxZQUFJLFFBQVEsQ0FBWixDQUFBLEVBQWdCLE9BQUEsSUFBQTtBQUVoQixlQUFPLENBQ0wsS0FBQSxNQUFBLENBQVksTUFBQSxDQUFBLEdBRFAsQ0FDTCxDQURLLEVBRUwsS0FBQSxNQUFBLENBQVksTUFBQSxDQUFBLEdBRlAsQ0FFTCxDQUZLLEVBR0wsS0FBQSxNQUFBLENBQVksTUFIZCxDQUdFLENBSEssQ0FBUDtBQUtELEs7Ozs7O0FBR0gsV0FBTSxxQkFBTjtBQUNFLG1DQUFBLEdBQUEsRUFBQSxVQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFJdUI7QUFBQTs7QUFIZCxhQUFBLEdBQUEsR0FBQSxHQUFBO0FBQ0EsYUFBQSxVQUFBLEdBQUEsVUFBQTtBQUNBLGFBQUEsS0FBQSxHQUFBLEtBQUE7QUFDQSxhQUFBLE1BQUEsR0FBQSxNQUFBO0FBQ0w7O0FBTk4sb0NBUUUsS0FSRixvQkFRTztBQUNILGVBQU87QUFDTCxtQkFBTyxLQUFBLEtBQUEsQ0FERixLQUNFLEVBREY7QUFFTCx3QkFBWSxLQUFBLFVBQUEsQ0FBQSxLQUFBO0FBRlAsU0FBUDtBQUlELEtBYkg7O0FBQUE7QUFBQTtBQWdCQSxJQUFNLGNBQWMsSUFBQSwwQkFBQSxDQUFBLFlBQUEsRUFBQSxXQUFBLEVBQXBCLFdBQW9CLENBQXBCO0FBQ0EsSUFBTSxtQkFBbUIsSUFBQSwrQkFBQSxDQUFBLFlBQUEsRUFBekIsV0FBeUIsQ0FBekI7QUFDQSxPQUFPLElBQU0sYUFBYSxJQUFBLHFCQUFBLENBQUEsWUFBQSxFQUFBLGdCQUFBLEVBQUEsV0FBQSxFQUFuQixDQUFtQixDQUFuQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEV2YWx1YXRpb25TdGFjayB9IGZyb20gJy4vc3RhY2snO1xuaW1wb3J0IHsgZGljdCwgRU1QVFlfQVJSQVkgfSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCB7IGNvbWJpbmVUYWdnZWQgfSBmcm9tICdAZ2xpbW1lci9yZWZlcmVuY2UnO1xuaW1wb3J0IHtcbiAgRGljdCxcbiAgT3B0aW9uLFxuICB1bnNhZmUsXG4gIEJsb2NrU3ltYm9sVGFibGUsXG4gIFZNQXJndW1lbnRzLFxuICBDYXB0dXJlZEFyZ3VtZW50cyxcbiAgUG9zaXRpb25hbEFyZ3VtZW50cyxcbiAgQ2FwdHVyZWRQb3NpdGlvbmFsQXJndW1lbnRzLFxuICBOYW1lZEFyZ3VtZW50cyxcbiAgQ2FwdHVyZWROYW1lZEFyZ3VtZW50cyxcbiAgSml0T3JBb3RCbG9jayxcbiAgQmxvY2tWYWx1ZSxcbiAgU2NvcGVCbG9jayxcbiAgQ2FwdHVyZWRCbG9ja0FyZ3VtZW50cyxcbiAgU2NvcGUsXG4gIEJsb2NrQXJndW1lbnRzLFxufSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IFRhZywgVmVyc2lvbmVkUGF0aFJlZmVyZW5jZSwgQ09OU1RBTlRfVEFHIH0gZnJvbSAnQGdsaW1tZXIvcmVmZXJlbmNlJztcbmltcG9ydCB7IFByaW1pdGl2ZVJlZmVyZW5jZSwgVU5ERUZJTkVEX1JFRkVSRU5DRSB9IGZyb20gJy4uL3JlZmVyZW5jZXMnO1xuaW1wb3J0IHsgQ2hlY2tCbG9ja1N5bWJvbFRhYmxlLCBjaGVjaywgQ2hlY2tIYW5kbGUsIENoZWNrT3B0aW9uLCBDaGVja09yIH0gZnJvbSAnQGdsaW1tZXIvZGVidWcnO1xuaW1wb3J0IHtcbiAgQ2hlY2tQYXRoUmVmZXJlbmNlLFxuICBDaGVja0NvbXBpbGFibGVCbG9jayxcbiAgQ2hlY2tTY29wZSxcbn0gZnJvbSAnLi4vY29tcGlsZWQvb3Bjb2Rlcy8tZGVidWctc3RyaXAnO1xuaW1wb3J0IHsgUkVHSVNURVJTIH0gZnJvbSAnLi4vc3ltYm9scyc7XG5pbXBvcnQgeyAkc3AgfSBmcm9tICdAZ2xpbW1lci92bSc7XG5cbi8qXG4gIFRoZSBjYWxsaW5nIGNvbnZlbnRpb24gaXM6XG5cbiAgKiAwLU4gYmxvY2sgYXJndW1lbnRzIGF0IHRoZSBib3R0b21cbiAgKiAwLU4gcG9zaXRpb25hbCBhcmd1bWVudHMgbmV4dCAobGVmdC10by1yaWdodClcbiAgKiAwLU4gbmFtZWQgYXJndW1lbnRzIG5leHRcbiovXG5cbmV4cG9ydCBjbGFzcyBWTUFyZ3VtZW50c0ltcGwgaW1wbGVtZW50cyBWTUFyZ3VtZW50cyB7XG4gIHByaXZhdGUgc3RhY2s6IE9wdGlvbjxFdmFsdWF0aW9uU3RhY2s+ID0gbnVsbDtcbiAgcHVibGljIHBvc2l0aW9uYWwgPSBuZXcgUG9zaXRpb25hbEFyZ3VtZW50c0ltcGwoKTtcbiAgcHVibGljIG5hbWVkID0gbmV3IE5hbWVkQXJndW1lbnRzSW1wbCgpO1xuICBwdWJsaWMgYmxvY2tzID0gbmV3IEJsb2NrQXJndW1lbnRzSW1wbCgpO1xuXG4gIGVtcHR5KHN0YWNrOiBFdmFsdWF0aW9uU3RhY2spOiB0aGlzIHtcbiAgICBsZXQgYmFzZSA9IHN0YWNrW1JFR0lTVEVSU11bJHNwXSArIDE7XG5cbiAgICB0aGlzLm5hbWVkLmVtcHR5KHN0YWNrLCBiYXNlKTtcbiAgICB0aGlzLnBvc2l0aW9uYWwuZW1wdHkoc3RhY2ssIGJhc2UpO1xuICAgIHRoaXMuYmxvY2tzLmVtcHR5KHN0YWNrLCBiYXNlKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc2V0dXAoXG4gICAgc3RhY2s6IEV2YWx1YXRpb25TdGFjayxcbiAgICBuYW1lczogc3RyaW5nW10sXG4gICAgYmxvY2tOYW1lczogc3RyaW5nW10sXG4gICAgcG9zaXRpb25hbENvdW50OiBudW1iZXIsXG4gICAgYXROYW1lczogYm9vbGVhblxuICApIHtcbiAgICB0aGlzLnN0YWNrID0gc3RhY2s7XG5cbiAgICAvKlxuICAgICAgICAgICB8IC4uLiB8IGJsb2NrcyAgICAgIHwgcG9zaXRpb25hbCAgfCBuYW1lZCB8XG4gICAgICAgICAgIHwgLi4uIHwgYjAgICAgYjEgICAgfCBwMCBwMSBwMiBwMyB8IG4wIG4xIHxcbiAgICAgaW5kZXggfCAuLi4gfCA0LzUvNiA3LzgvOSB8IDEwIDExIDEyIDEzIHwgMTQgMTUgfFxuICAgICAgICAgICAgICAgICAgIF4gICAgICAgICAgICAgXiAgICAgICAgICAgICBeICBeXG4gICAgICAgICAgICAgICAgIGJiYXNlICAgICAgICAgcGJhc2UgICAgICAgbmJhc2UgIHNwXG4gICAgKi9cblxuICAgIGxldCBuYW1lZCA9IHRoaXMubmFtZWQ7XG4gICAgbGV0IG5hbWVkQ291bnQgPSBuYW1lcy5sZW5ndGg7XG4gICAgbGV0IG5hbWVkQmFzZSA9IHN0YWNrW1JFR0lTVEVSU11bJHNwXSAtIG5hbWVkQ291bnQgKyAxO1xuXG4gICAgbmFtZWQuc2V0dXAoc3RhY2ssIG5hbWVkQmFzZSwgbmFtZWRDb3VudCwgbmFtZXMsIGF0TmFtZXMpO1xuXG4gICAgbGV0IHBvc2l0aW9uYWwgPSB0aGlzLnBvc2l0aW9uYWw7XG4gICAgbGV0IHBvc2l0aW9uYWxCYXNlID0gbmFtZWRCYXNlIC0gcG9zaXRpb25hbENvdW50O1xuXG4gICAgcG9zaXRpb25hbC5zZXR1cChzdGFjaywgcG9zaXRpb25hbEJhc2UsIHBvc2l0aW9uYWxDb3VudCk7XG5cbiAgICBsZXQgYmxvY2tzID0gdGhpcy5ibG9ja3M7XG4gICAgbGV0IGJsb2Nrc0NvdW50ID0gYmxvY2tOYW1lcy5sZW5ndGg7XG4gICAgbGV0IGJsb2Nrc0Jhc2UgPSBwb3NpdGlvbmFsQmFzZSAtIGJsb2Nrc0NvdW50ICogMztcblxuICAgIGJsb2Nrcy5zZXR1cChzdGFjaywgYmxvY2tzQmFzZSwgYmxvY2tzQ291bnQsIGJsb2NrTmFtZXMpO1xuICB9XG5cbiAgZ2V0IHRhZygpOiBUYWcge1xuICAgIHJldHVybiBjb21iaW5lVGFnZ2VkKFt0aGlzLnBvc2l0aW9uYWwsIHRoaXMubmFtZWRdKTtcbiAgfVxuXG4gIGdldCBiYXNlKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuYmxvY2tzLmJhc2U7XG4gIH1cblxuICBnZXQgbGVuZ3RoKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMucG9zaXRpb25hbC5sZW5ndGggKyB0aGlzLm5hbWVkLmxlbmd0aCArIHRoaXMuYmxvY2tzLmxlbmd0aCAqIDM7XG4gIH1cblxuICBhdDxUIGV4dGVuZHMgVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTx1bmtub3duPj4ocG9zOiBudW1iZXIpOiBUIHtcbiAgICByZXR1cm4gdGhpcy5wb3NpdGlvbmFsLmF0PFQ+KHBvcyk7XG4gIH1cblxuICByZWFsbG9jKG9mZnNldDogbnVtYmVyKSB7XG4gICAgbGV0IHsgc3RhY2sgfSA9IHRoaXM7XG4gICAgaWYgKG9mZnNldCA+IDAgJiYgc3RhY2sgIT09IG51bGwpIHtcbiAgICAgIGxldCB7IHBvc2l0aW9uYWwsIG5hbWVkIH0gPSB0aGlzO1xuICAgICAgbGV0IG5ld0Jhc2UgPSBwb3NpdGlvbmFsLmJhc2UgKyBvZmZzZXQ7XG4gICAgICBsZXQgbGVuZ3RoID0gcG9zaXRpb25hbC5sZW5ndGggKyBuYW1lZC5sZW5ndGg7XG5cbiAgICAgIGZvciAobGV0IGkgPSBsZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBzdGFjay5jb3B5KGkgKyBwb3NpdGlvbmFsLmJhc2UsIGkgKyBuZXdCYXNlKTtcbiAgICAgIH1cblxuICAgICAgcG9zaXRpb25hbC5iYXNlICs9IG9mZnNldDtcbiAgICAgIG5hbWVkLmJhc2UgKz0gb2Zmc2V0O1xuICAgICAgc3RhY2tbUkVHSVNURVJTXVskc3BdICs9IG9mZnNldDtcbiAgICB9XG4gIH1cblxuICBjYXB0dXJlKCk6IENhcHR1cmVkQXJndW1lbnRzIHtcbiAgICBsZXQgcG9zaXRpb25hbCA9IHRoaXMucG9zaXRpb25hbC5sZW5ndGggPT09IDAgPyBFTVBUWV9QT1NJVElPTkFMIDogdGhpcy5wb3NpdGlvbmFsLmNhcHR1cmUoKTtcbiAgICBsZXQgbmFtZWQgPSB0aGlzLm5hbWVkLmxlbmd0aCA9PT0gMCA/IEVNUFRZX05BTUVEIDogdGhpcy5uYW1lZC5jYXB0dXJlKCk7XG5cbiAgICByZXR1cm4gbmV3IENhcHR1cmVkQXJndW1lbnRzSW1wbCh0aGlzLnRhZywgcG9zaXRpb25hbCwgbmFtZWQsIHRoaXMubGVuZ3RoKTtcbiAgfVxuXG4gIGNsZWFyKCk6IHZvaWQge1xuICAgIGxldCB7IHN0YWNrLCBsZW5ndGggfSA9IHRoaXM7XG4gICAgaWYgKGxlbmd0aCA+IDAgJiYgc3RhY2sgIT09IG51bGwpIHN0YWNrLnBvcChsZW5ndGgpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBQb3NpdGlvbmFsQXJndW1lbnRzSW1wbCBpbXBsZW1lbnRzIFBvc2l0aW9uYWxBcmd1bWVudHMge1xuICBwdWJsaWMgYmFzZSA9IDA7XG4gIHB1YmxpYyBsZW5ndGggPSAwO1xuXG4gIHByaXZhdGUgc3RhY2s6IEV2YWx1YXRpb25TdGFjayA9IG51bGwgYXMgYW55O1xuXG4gIHByaXZhdGUgX3RhZzogT3B0aW9uPFRhZz4gPSBudWxsO1xuICBwcml2YXRlIF9yZWZlcmVuY2VzOiBPcHRpb248VmVyc2lvbmVkUGF0aFJlZmVyZW5jZTx1bmtub3duPltdPiA9IG51bGw7XG5cbiAgZW1wdHkoc3RhY2s6IEV2YWx1YXRpb25TdGFjaywgYmFzZTogbnVtYmVyKSB7XG4gICAgdGhpcy5zdGFjayA9IHN0YWNrO1xuICAgIHRoaXMuYmFzZSA9IGJhc2U7XG4gICAgdGhpcy5sZW5ndGggPSAwO1xuXG4gICAgdGhpcy5fdGFnID0gQ09OU1RBTlRfVEFHO1xuICAgIHRoaXMuX3JlZmVyZW5jZXMgPSBFTVBUWV9BUlJBWTtcbiAgfVxuXG4gIHNldHVwKHN0YWNrOiBFdmFsdWF0aW9uU3RhY2ssIGJhc2U6IG51bWJlciwgbGVuZ3RoOiBudW1iZXIpIHtcbiAgICB0aGlzLnN0YWNrID0gc3RhY2s7XG4gICAgdGhpcy5iYXNlID0gYmFzZTtcbiAgICB0aGlzLmxlbmd0aCA9IGxlbmd0aDtcblxuICAgIGlmIChsZW5ndGggPT09IDApIHtcbiAgICAgIHRoaXMuX3RhZyA9IENPTlNUQU5UX1RBRztcbiAgICAgIHRoaXMuX3JlZmVyZW5jZXMgPSBFTVBUWV9BUlJBWTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fdGFnID0gbnVsbDtcbiAgICAgIHRoaXMuX3JlZmVyZW5jZXMgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGdldCB0YWcoKTogVGFnIHtcbiAgICBsZXQgdGFnID0gdGhpcy5fdGFnO1xuXG4gICAgaWYgKCF0YWcpIHtcbiAgICAgIHRhZyA9IHRoaXMuX3RhZyA9IGNvbWJpbmVUYWdnZWQodGhpcy5yZWZlcmVuY2VzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGFnO1xuICB9XG5cbiAgYXQ8VCBleHRlbmRzIFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8dW5rbm93bj4+KHBvc2l0aW9uOiBudW1iZXIpOiBUIHtcbiAgICBsZXQgeyBiYXNlLCBsZW5ndGgsIHN0YWNrIH0gPSB0aGlzO1xuXG4gICAgaWYgKHBvc2l0aW9uIDwgMCB8fCBwb3NpdGlvbiA+PSBsZW5ndGgpIHtcbiAgICAgIHJldHVybiAoVU5ERUZJTkVEX1JFRkVSRU5DRSBhcyB1bnNhZmUpIGFzIFQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNoZWNrKHN0YWNrLmdldChwb3NpdGlvbiwgYmFzZSksIENoZWNrUGF0aFJlZmVyZW5jZSkgYXMgVDtcbiAgfVxuXG4gIGNhcHR1cmUoKTogQ2FwdHVyZWRQb3NpdGlvbmFsQXJndW1lbnRzSW1wbCB7XG4gICAgcmV0dXJuIG5ldyBDYXB0dXJlZFBvc2l0aW9uYWxBcmd1bWVudHNJbXBsKHRoaXMudGFnLCB0aGlzLnJlZmVyZW5jZXMpO1xuICB9XG5cbiAgcHJlcGVuZChvdGhlcjogQ2FwdHVyZWRQb3NpdGlvbmFsQXJndW1lbnRzKSB7XG4gICAgbGV0IGFkZGl0aW9ucyA9IG90aGVyLmxlbmd0aDtcblxuICAgIGlmIChhZGRpdGlvbnMgPiAwKSB7XG4gICAgICBsZXQgeyBiYXNlLCBsZW5ndGgsIHN0YWNrIH0gPSB0aGlzO1xuXG4gICAgICB0aGlzLmJhc2UgPSBiYXNlID0gYmFzZSAtIGFkZGl0aW9ucztcbiAgICAgIHRoaXMubGVuZ3RoID0gbGVuZ3RoICsgYWRkaXRpb25zO1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFkZGl0aW9uczsgaSsrKSB7XG4gICAgICAgIHN0YWNrLnNldChvdGhlci5hdChpKSwgaSwgYmFzZSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3RhZyA9IG51bGw7XG4gICAgICB0aGlzLl9yZWZlcmVuY2VzID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdldCByZWZlcmVuY2VzKCk6IFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8dW5rbm93bj5bXSB7XG4gICAgbGV0IHJlZmVyZW5jZXMgPSB0aGlzLl9yZWZlcmVuY2VzO1xuXG4gICAgaWYgKCFyZWZlcmVuY2VzKSB7XG4gICAgICBsZXQgeyBzdGFjaywgYmFzZSwgbGVuZ3RoIH0gPSB0aGlzO1xuICAgICAgcmVmZXJlbmNlcyA9IHRoaXMuX3JlZmVyZW5jZXMgPSBzdGFjay5zbGljZUFycmF5PFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8dW5rbm93bj4+KFxuICAgICAgICBiYXNlLFxuICAgICAgICBiYXNlICsgbGVuZ3RoXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiByZWZlcmVuY2VzO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDYXB0dXJlZFBvc2l0aW9uYWxBcmd1bWVudHNJbXBsIGltcGxlbWVudHMgQ2FwdHVyZWRQb3NpdGlvbmFsQXJndW1lbnRzIHtcbiAgc3RhdGljIGVtcHR5KCk6IENhcHR1cmVkUG9zaXRpb25hbEFyZ3VtZW50cyB7XG4gICAgcmV0dXJuIG5ldyBDYXB0dXJlZFBvc2l0aW9uYWxBcmd1bWVudHNJbXBsKENPTlNUQU5UX1RBRywgRU1QVFlfQVJSQVksIDApO1xuICB9XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHRhZzogVGFnLFxuICAgIHB1YmxpYyByZWZlcmVuY2VzOiBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPHVua25vd24+W10sXG4gICAgcHVibGljIGxlbmd0aCA9IHJlZmVyZW5jZXMubGVuZ3RoXG4gICkge31cblxuICBhdDxUIGV4dGVuZHMgVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTx1bmtub3duPj4ocG9zaXRpb246IG51bWJlcik6IFQge1xuICAgIHJldHVybiB0aGlzLnJlZmVyZW5jZXNbcG9zaXRpb25dIGFzIFQ7XG4gIH1cblxuICB2YWx1ZSgpOiB1bmtub3duW10ge1xuICAgIHJldHVybiB0aGlzLnJlZmVyZW5jZXMubWFwKHRoaXMudmFsdWVPZik7XG4gIH1cblxuICBnZXQobmFtZTogc3RyaW5nKTogVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTx1bmtub3duPiB7XG4gICAgbGV0IHsgcmVmZXJlbmNlcywgbGVuZ3RoIH0gPSB0aGlzO1xuXG4gICAgaWYgKG5hbWUgPT09ICdsZW5ndGgnKSB7XG4gICAgICByZXR1cm4gUHJpbWl0aXZlUmVmZXJlbmNlLmNyZWF0ZShsZW5ndGgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgaWR4ID0gcGFyc2VJbnQobmFtZSwgMTApO1xuXG4gICAgICBpZiAoaWR4IDwgMCB8fCBpZHggPj0gbGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBVTkRFRklORURfUkVGRVJFTkNFO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHJlZmVyZW5jZXNbaWR4XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHZhbHVlT2YodGhpczogdm9pZCwgcmVmZXJlbmNlOiBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPHVua25vd24+KTogdW5rbm93biB7XG4gICAgcmV0dXJuIHJlZmVyZW5jZS52YWx1ZSgpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBOYW1lZEFyZ3VtZW50c0ltcGwgaW1wbGVtZW50cyBOYW1lZEFyZ3VtZW50cyB7XG4gIHB1YmxpYyBiYXNlID0gMDtcbiAgcHVibGljIGxlbmd0aCA9IDA7XG5cbiAgcHJpdmF0ZSBzdGFjayE6IEV2YWx1YXRpb25TdGFjaztcblxuICBwcml2YXRlIF9yZWZlcmVuY2VzOiBPcHRpb248VmVyc2lvbmVkUGF0aFJlZmVyZW5jZTx1bmtub3duPltdPiA9IG51bGw7XG5cbiAgcHJpdmF0ZSBfbmFtZXM6IE9wdGlvbjxzdHJpbmdbXT4gPSBFTVBUWV9BUlJBWTtcbiAgcHJpdmF0ZSBfYXROYW1lczogT3B0aW9uPHN0cmluZ1tdPiA9IEVNUFRZX0FSUkFZO1xuXG4gIGVtcHR5KHN0YWNrOiBFdmFsdWF0aW9uU3RhY2ssIGJhc2U6IG51bWJlcikge1xuICAgIHRoaXMuc3RhY2sgPSBzdGFjaztcbiAgICB0aGlzLmJhc2UgPSBiYXNlO1xuICAgIHRoaXMubGVuZ3RoID0gMDtcblxuICAgIHRoaXMuX3JlZmVyZW5jZXMgPSBFTVBUWV9BUlJBWTtcbiAgICB0aGlzLl9uYW1lcyA9IEVNUFRZX0FSUkFZO1xuICAgIHRoaXMuX2F0TmFtZXMgPSBFTVBUWV9BUlJBWTtcbiAgfVxuXG4gIHNldHVwKHN0YWNrOiBFdmFsdWF0aW9uU3RhY2ssIGJhc2U6IG51bWJlciwgbGVuZ3RoOiBudW1iZXIsIG5hbWVzOiBzdHJpbmdbXSwgYXROYW1lczogYm9vbGVhbikge1xuICAgIHRoaXMuc3RhY2sgPSBzdGFjaztcbiAgICB0aGlzLmJhc2UgPSBiYXNlO1xuICAgIHRoaXMubGVuZ3RoID0gbGVuZ3RoO1xuXG4gICAgaWYgKGxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy5fcmVmZXJlbmNlcyA9IEVNUFRZX0FSUkFZO1xuICAgICAgdGhpcy5fbmFtZXMgPSBFTVBUWV9BUlJBWTtcbiAgICAgIHRoaXMuX2F0TmFtZXMgPSBFTVBUWV9BUlJBWTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fcmVmZXJlbmNlcyA9IG51bGw7XG5cbiAgICAgIGlmIChhdE5hbWVzKSB7XG4gICAgICAgIHRoaXMuX25hbWVzID0gbnVsbDtcbiAgICAgICAgdGhpcy5fYXROYW1lcyA9IG5hbWVzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fbmFtZXMgPSBuYW1lcztcbiAgICAgICAgdGhpcy5fYXROYW1lcyA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0IHRhZygpOiBUYWcge1xuICAgIHJldHVybiBjb21iaW5lVGFnZ2VkKHRoaXMucmVmZXJlbmNlcyk7XG4gIH1cblxuICBnZXQgbmFtZXMoKTogc3RyaW5nW10ge1xuICAgIGxldCBuYW1lcyA9IHRoaXMuX25hbWVzO1xuXG4gICAgaWYgKCFuYW1lcykge1xuICAgICAgbmFtZXMgPSB0aGlzLl9uYW1lcyA9IHRoaXMuX2F0TmFtZXMhLm1hcCh0aGlzLnRvU3ludGhldGljTmFtZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5hbWVzITtcbiAgfVxuXG4gIGdldCBhdE5hbWVzKCk6IHN0cmluZ1tdIHtcbiAgICBsZXQgYXROYW1lcyA9IHRoaXMuX2F0TmFtZXM7XG5cbiAgICBpZiAoIWF0TmFtZXMpIHtcbiAgICAgIGF0TmFtZXMgPSB0aGlzLl9hdE5hbWVzID0gdGhpcy5fbmFtZXMhLm1hcCh0aGlzLnRvQXROYW1lKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXROYW1lcyE7XG4gIH1cblxuICBoYXMobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMubmFtZXMuaW5kZXhPZihuYW1lKSAhPT0gLTE7XG4gIH1cblxuICBnZXQ8VCBleHRlbmRzIFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8dW5rbm93bj4+KG5hbWU6IHN0cmluZywgYXROYW1lcyA9IGZhbHNlKTogVCB7XG4gICAgbGV0IHsgYmFzZSwgc3RhY2sgfSA9IHRoaXM7XG5cbiAgICBsZXQgbmFtZXMgPSBhdE5hbWVzID8gdGhpcy5hdE5hbWVzIDogdGhpcy5uYW1lcztcblxuICAgIGxldCBpZHggPSBuYW1lcy5pbmRleE9mKG5hbWUpO1xuXG4gICAgaWYgKGlkeCA9PT0gLTEpIHtcbiAgICAgIHJldHVybiAoVU5ERUZJTkVEX1JFRkVSRU5DRSBhcyB1bnNhZmUpIGFzIFQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0YWNrLmdldDxUPihpZHgsIGJhc2UpO1xuICB9XG5cbiAgY2FwdHVyZSgpOiBDYXB0dXJlZE5hbWVkQXJndW1lbnRzIHtcbiAgICByZXR1cm4gbmV3IENhcHR1cmVkTmFtZWRBcmd1bWVudHNJbXBsKHRoaXMudGFnLCB0aGlzLm5hbWVzLCB0aGlzLnJlZmVyZW5jZXMpO1xuICB9XG5cbiAgbWVyZ2Uob3RoZXI6IENhcHR1cmVkTmFtZWRBcmd1bWVudHMpIHtcbiAgICBsZXQgeyBsZW5ndGg6IGV4dHJhcyB9ID0gb3RoZXI7XG5cbiAgICBpZiAoZXh0cmFzID4gMCkge1xuICAgICAgbGV0IHsgbmFtZXMsIGxlbmd0aCwgc3RhY2sgfSA9IHRoaXM7XG4gICAgICBsZXQgeyBuYW1lczogZXh0cmFOYW1lcyB9ID0gb3RoZXI7XG5cbiAgICAgIGlmIChPYmplY3QuaXNGcm96ZW4obmFtZXMpICYmIG5hbWVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBuYW1lcyA9IFtdO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGV4dHJhczsgaSsrKSB7XG4gICAgICAgIGxldCBuYW1lID0gZXh0cmFOYW1lc1tpXTtcbiAgICAgICAgbGV0IGlkeCA9IG5hbWVzLmluZGV4T2YobmFtZSk7XG5cbiAgICAgICAgaWYgKGlkeCA9PT0gLTEpIHtcbiAgICAgICAgICBsZW5ndGggPSBuYW1lcy5wdXNoKG5hbWUpO1xuICAgICAgICAgIHN0YWNrLnB1c2gob3RoZXIucmVmZXJlbmNlc1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5sZW5ndGggPSBsZW5ndGg7XG4gICAgICB0aGlzLl9yZWZlcmVuY2VzID0gbnVsbDtcbiAgICAgIHRoaXMuX25hbWVzID0gbmFtZXM7XG4gICAgICB0aGlzLl9hdE5hbWVzID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdldCByZWZlcmVuY2VzKCk6IFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8dW5rbm93bj5bXSB7XG4gICAgbGV0IHJlZmVyZW5jZXMgPSB0aGlzLl9yZWZlcmVuY2VzO1xuXG4gICAgaWYgKCFyZWZlcmVuY2VzKSB7XG4gICAgICBsZXQgeyBiYXNlLCBsZW5ndGgsIHN0YWNrIH0gPSB0aGlzO1xuICAgICAgcmVmZXJlbmNlcyA9IHRoaXMuX3JlZmVyZW5jZXMgPSBzdGFjay5zbGljZUFycmF5PFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8dW5rbm93bj4+KFxuICAgICAgICBiYXNlLFxuICAgICAgICBiYXNlICsgbGVuZ3RoXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiByZWZlcmVuY2VzO1xuICB9XG5cbiAgcHJpdmF0ZSB0b1N5bnRoZXRpY05hbWUodGhpczogdm9pZCwgbmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbmFtZS5zbGljZSgxKTtcbiAgfVxuXG4gIHByaXZhdGUgdG9BdE5hbWUodGhpczogdm9pZCwgbmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYEAke25hbWV9YDtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ2FwdHVyZWROYW1lZEFyZ3VtZW50c0ltcGwgaW1wbGVtZW50cyBDYXB0dXJlZE5hbWVkQXJndW1lbnRzIHtcbiAgcHVibGljIGxlbmd0aDogbnVtYmVyO1xuICBwcml2YXRlIF9tYXA6IE9wdGlvbjxEaWN0PFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8dW5rbm93bj4+PjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgdGFnOiBUYWcsXG4gICAgcHVibGljIG5hbWVzOiBzdHJpbmdbXSxcbiAgICBwdWJsaWMgcmVmZXJlbmNlczogVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTx1bmtub3duPltdXG4gICkge1xuICAgIHRoaXMubGVuZ3RoID0gbmFtZXMubGVuZ3RoO1xuICAgIHRoaXMuX21hcCA9IG51bGw7XG4gIH1cblxuICBnZXQgbWFwKCkge1xuICAgIGxldCBtYXAgPSB0aGlzLl9tYXA7XG5cbiAgICBpZiAoIW1hcCkge1xuICAgICAgbGV0IHsgbmFtZXMsIHJlZmVyZW5jZXMgfSA9IHRoaXM7XG4gICAgICBtYXAgPSB0aGlzLl9tYXAgPSBkaWN0PFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8dW5rbm93bj4+KCk7XG5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGV0IG5hbWUgPSBuYW1lc1tpXTtcbiAgICAgICAgbWFwIVtuYW1lXSA9IHJlZmVyZW5jZXNbaV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1hcDtcbiAgfVxuXG4gIGhhcyhuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5uYW1lcy5pbmRleE9mKG5hbWUpICE9PSAtMTtcbiAgfVxuXG4gIGdldDxUIGV4dGVuZHMgVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTx1bmtub3duPj4obmFtZTogc3RyaW5nKTogVCB7XG4gICAgbGV0IHsgbmFtZXMsIHJlZmVyZW5jZXMgfSA9IHRoaXM7XG4gICAgbGV0IGlkeCA9IG5hbWVzLmluZGV4T2YobmFtZSk7XG5cbiAgICBpZiAoaWR4ID09PSAtMSkge1xuICAgICAgcmV0dXJuIChVTkRFRklORURfUkVGRVJFTkNFIGFzIHVuc2FmZSkgYXMgVDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHJlZmVyZW5jZXNbaWR4XSBhcyBUO1xuICAgIH1cbiAgfVxuXG4gIHZhbHVlKCk6IERpY3Q8dW5rbm93bj4ge1xuICAgIGxldCB7IG5hbWVzLCByZWZlcmVuY2VzIH0gPSB0aGlzO1xuICAgIGxldCBvdXQgPSBkaWN0PHVua25vd24+KCk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgbmFtZSA9IG5hbWVzW2ldO1xuICAgICAgb3V0W25hbWVdID0gcmVmZXJlbmNlc1tpXS52YWx1ZSgpO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEJsb2NrQXJndW1lbnRzSW1wbDxDIGV4dGVuZHMgSml0T3JBb3RCbG9jaz4gaW1wbGVtZW50cyBCbG9ja0FyZ3VtZW50czxDPiB7XG4gIHByaXZhdGUgc3RhY2shOiBFdmFsdWF0aW9uU3RhY2s7XG4gIHByaXZhdGUgaW50ZXJuYWxWYWx1ZXM6IE9wdGlvbjxudW1iZXJbXT4gPSBudWxsO1xuXG4gIHB1YmxpYyBpbnRlcm5hbFRhZzogT3B0aW9uPFRhZz4gPSBudWxsO1xuICBwdWJsaWMgbmFtZXM6IHN0cmluZ1tdID0gRU1QVFlfQVJSQVk7XG5cbiAgcHVibGljIGxlbmd0aCA9IDA7XG4gIHB1YmxpYyBiYXNlID0gMDtcblxuICBlbXB0eShzdGFjazogRXZhbHVhdGlvblN0YWNrLCBiYXNlOiBudW1iZXIpIHtcbiAgICB0aGlzLnN0YWNrID0gc3RhY2s7XG4gICAgdGhpcy5uYW1lcyA9IEVNUFRZX0FSUkFZO1xuICAgIHRoaXMuYmFzZSA9IGJhc2U7XG4gICAgdGhpcy5sZW5ndGggPSAwO1xuXG4gICAgdGhpcy5pbnRlcm5hbFRhZyA9IENPTlNUQU5UX1RBRztcbiAgICB0aGlzLmludGVybmFsVmFsdWVzID0gRU1QVFlfQVJSQVk7XG4gIH1cblxuICBzZXR1cChzdGFjazogRXZhbHVhdGlvblN0YWNrLCBiYXNlOiBudW1iZXIsIGxlbmd0aDogbnVtYmVyLCBuYW1lczogc3RyaW5nW10pIHtcbiAgICB0aGlzLnN0YWNrID0gc3RhY2s7XG4gICAgdGhpcy5uYW1lcyA9IG5hbWVzO1xuICAgIHRoaXMuYmFzZSA9IGJhc2U7XG4gICAgdGhpcy5sZW5ndGggPSBsZW5ndGg7XG5cbiAgICBpZiAobGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLmludGVybmFsVGFnID0gQ09OU1RBTlRfVEFHO1xuICAgICAgdGhpcy5pbnRlcm5hbFZhbHVlcyA9IEVNUFRZX0FSUkFZO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmludGVybmFsVGFnID0gbnVsbDtcbiAgICAgIHRoaXMuaW50ZXJuYWxWYWx1ZXMgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGdldCB2YWx1ZXMoKTogQmxvY2tWYWx1ZVtdIHtcbiAgICBsZXQgdmFsdWVzID0gdGhpcy5pbnRlcm5hbFZhbHVlcztcblxuICAgIGlmICghdmFsdWVzKSB7XG4gICAgICBsZXQgeyBiYXNlLCBsZW5ndGgsIHN0YWNrIH0gPSB0aGlzO1xuICAgICAgdmFsdWVzID0gdGhpcy5pbnRlcm5hbFZhbHVlcyA9IHN0YWNrLnNsaWNlQXJyYXk8bnVtYmVyPihiYXNlLCBiYXNlICsgbGVuZ3RoICogMyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbHVlcztcbiAgfVxuXG4gIGhhcyhuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5uYW1lcyEuaW5kZXhPZihuYW1lKSAhPT0gLTE7XG4gIH1cblxuICBnZXQobmFtZTogc3RyaW5nKTogT3B0aW9uPFNjb3BlQmxvY2s8Qz4+IHtcbiAgICBsZXQgeyBiYXNlLCBzdGFjaywgbmFtZXMgfSA9IHRoaXM7XG5cbiAgICBsZXQgaWR4ID0gbmFtZXMhLmluZGV4T2YobmFtZSk7XG5cbiAgICBpZiAobmFtZXMhLmluZGV4T2YobmFtZSkgPT09IC0xKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBsZXQgdGFibGUgPSBjaGVjayhzdGFjay5nZXQoaWR4ICogMywgYmFzZSksIENoZWNrT3B0aW9uKENoZWNrQmxvY2tTeW1ib2xUYWJsZSkpO1xuICAgIGxldCBzY29wZSA9IGNoZWNrKHN0YWNrLmdldChpZHggKiAzICsgMSwgYmFzZSksIENoZWNrT3B0aW9uKENoZWNrU2NvcGUpKTtcbiAgICBsZXQgaGFuZGxlID0gY2hlY2soXG4gICAgICBzdGFjay5nZXQoaWR4ICogMyArIDIsIGJhc2UpLFxuICAgICAgQ2hlY2tPcHRpb24oQ2hlY2tPcihDaGVja0hhbmRsZSwgQ2hlY2tDb21waWxhYmxlQmxvY2spKVxuICAgICk7XG5cbiAgICByZXR1cm4gaGFuZGxlID09PSBudWxsID8gbnVsbCA6IChbaGFuZGxlLCBzY29wZSEsIHRhYmxlIV0gYXMgU2NvcGVCbG9jazxDPik7XG4gIH1cblxuICBjYXB0dXJlKCk6IENhcHR1cmVkQmxvY2tBcmd1bWVudHMge1xuICAgIHJldHVybiBuZXcgQ2FwdHVyZWRCbG9ja0FyZ3VtZW50c0ltcGwodGhpcy5uYW1lcywgdGhpcy52YWx1ZXMpO1xuICB9XG59XG5cbmNsYXNzIENhcHR1cmVkQmxvY2tBcmd1bWVudHNJbXBsIGltcGxlbWVudHMgQ2FwdHVyZWRCbG9ja0FyZ3VtZW50cyB7XG4gIHB1YmxpYyBsZW5ndGg6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgbmFtZXM6IHN0cmluZ1tdLCBwdWJsaWMgdmFsdWVzOiBCbG9ja1ZhbHVlW10pIHtcbiAgICB0aGlzLmxlbmd0aCA9IG5hbWVzLmxlbmd0aDtcbiAgfVxuXG4gIGhhcyhuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5uYW1lcy5pbmRleE9mKG5hbWUpICE9PSAtMTtcbiAgfVxuXG4gIGdldChuYW1lOiBzdHJpbmcpOiBPcHRpb248U2NvcGVCbG9jaz4ge1xuICAgIGxldCBpZHggPSB0aGlzLm5hbWVzLmluZGV4T2YobmFtZSk7XG5cbiAgICBpZiAoaWR4ID09PSAtMSkgcmV0dXJuIG51bGw7XG5cbiAgICByZXR1cm4gW1xuICAgICAgdGhpcy52YWx1ZXNbaWR4ICogMyArIDJdIGFzIG51bWJlcixcbiAgICAgIHRoaXMudmFsdWVzW2lkeCAqIDMgKyAxXSBhcyBTY29wZTxKaXRPckFvdEJsb2NrPixcbiAgICAgIHRoaXMudmFsdWVzW2lkeCAqIDNdIGFzIEJsb2NrU3ltYm9sVGFibGUsXG4gICAgXTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ2FwdHVyZWRBcmd1bWVudHNJbXBsIGltcGxlbWVudHMgQ2FwdHVyZWRBcmd1bWVudHMge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgdGFnOiBUYWcsXG4gICAgcHVibGljIHBvc2l0aW9uYWw6IENhcHR1cmVkUG9zaXRpb25hbEFyZ3VtZW50cyxcbiAgICBwdWJsaWMgbmFtZWQ6IENhcHR1cmVkTmFtZWRBcmd1bWVudHMsXG4gICAgcHVibGljIGxlbmd0aDogbnVtYmVyXG4gICkge31cblxuICB2YWx1ZSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZWQ6IHRoaXMubmFtZWQudmFsdWUoKSxcbiAgICAgIHBvc2l0aW9uYWw6IHRoaXMucG9zaXRpb25hbC52YWx1ZSgpLFxuICAgIH07XG4gIH1cbn1cblxuY29uc3QgRU1QVFlfTkFNRUQgPSBuZXcgQ2FwdHVyZWROYW1lZEFyZ3VtZW50c0ltcGwoQ09OU1RBTlRfVEFHLCBFTVBUWV9BUlJBWSwgRU1QVFlfQVJSQVkpO1xuY29uc3QgRU1QVFlfUE9TSVRJT05BTCA9IG5ldyBDYXB0dXJlZFBvc2l0aW9uYWxBcmd1bWVudHNJbXBsKENPTlNUQU5UX1RBRywgRU1QVFlfQVJSQVkpO1xuZXhwb3J0IGNvbnN0IEVNUFRZX0FSR1MgPSBuZXcgQ2FwdHVyZWRBcmd1bWVudHNJbXBsKENPTlNUQU5UX1RBRywgRU1QVFlfUE9TSVRJT05BTCwgRU1QVFlfTkFNRUQsIDApO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==