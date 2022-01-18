define('@glimmer/program', ['exports', '@glimmer/util'], function (exports, util) { 'use strict';

    function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var UNRESOLVED = {};
    var WELL_KNOWN_EMPTY_ARRAY_POSITION = 0;
    var WELL_KNOW_EMPTY_ARRAY = Object.freeze([]);

    var WriteOnlyConstants = function () {
        function WriteOnlyConstants() {
            _classCallCheck(this, WriteOnlyConstants);

            // `0` means NULL
            this.strings = [];
            this.arrays = [WELL_KNOW_EMPTY_ARRAY];
            this.tables = [];
            this.handles = [];
            this.resolved = [];
            this.numbers = [];
            this.others = [];
        }

        WriteOnlyConstants.prototype.other = function other(_other) {
            return this.others.push(_other) - 1;
        };

        WriteOnlyConstants.prototype.string = function string(value) {
            var index = this.strings.indexOf(value);
            if (index > -1) {
                return index;
            }
            return this.strings.push(value) - 1;
        };

        WriteOnlyConstants.prototype.stringArray = function stringArray(strings) {
            var _strings = new Array(strings.length);
            for (var i = 0; i < strings.length; i++) {
                _strings[i] = this.string(strings[i]);
            }
            return this.array(_strings);
        };

        WriteOnlyConstants.prototype.array = function array(values) {
            if (values.length === 0) {
                return WELL_KNOWN_EMPTY_ARRAY_POSITION;
            }
            var index = this.arrays.indexOf(values);
            if (index > -1) {
                return index;
            }
            return this.arrays.push(values) - 1;
        };

        WriteOnlyConstants.prototype.templateMeta = function templateMeta(value) {
            var str = JSON.stringify(value);
            var index = this.strings.indexOf(str);
            if (index > -1) {
                return index;
            }
            return this.strings.push(str) - 1;
        };

        WriteOnlyConstants.prototype.number = function number(_number) {
            var index = this.numbers.indexOf(_number);
            if (index > -1) {
                return index;
            }
            return this.numbers.push(_number) - 1;
        };

        WriteOnlyConstants.prototype.toPool = function toPool() {
            return {
                strings: this.strings,
                arrays: this.arrays,
                handles: this.handles,
                numbers: this.numbers
            };
        };

        return WriteOnlyConstants;
    }();

    var RuntimeConstantsImpl = function () {
        function RuntimeConstantsImpl(pool) {
            _classCallCheck(this, RuntimeConstantsImpl);

            this.strings = pool.strings;
            this.arrays = pool.arrays;
            this.handles = pool.handles;
            this.numbers = pool.numbers;
            this.others = [];
        }

        RuntimeConstantsImpl.prototype.getString = function getString(value) {
            return this.strings[value];
        };

        RuntimeConstantsImpl.prototype.getNumber = function getNumber(value) {
            return this.numbers[value];
        };

        RuntimeConstantsImpl.prototype.getStringArray = function getStringArray(value) {
            var names = this.getArray(value);
            var _names = new Array(names.length);
            for (var i = 0; i < names.length; i++) {
                var n = names[i];
                _names[i] = this.getString(n);
            }
            return _names;
        };

        RuntimeConstantsImpl.prototype.getArray = function getArray(value) {
            return this.arrays[value];
        };

        RuntimeConstantsImpl.prototype.getTemplateMeta = function getTemplateMeta(s) {
            return JSON.parse(this.strings[s]);
        };

        RuntimeConstantsImpl.prototype.getOther = function getOther(value) {
            return this.others[value];
        };

        return RuntimeConstantsImpl;
    }();
    var Constants = function (_WriteOnlyConstants) {
        _inherits(Constants, _WriteOnlyConstants);

        function Constants(pool) {
            _classCallCheck(this, Constants);

            var _this = _possibleConstructorReturn(this, _WriteOnlyConstants.call(this));

            if (pool) {
                _this.strings = pool.strings;
                _this.arrays = pool.arrays;
                _this.handles = pool.handles;
                _this.resolved = _this.handles.map(function () {
                    return UNRESOLVED;
                });
                _this.numbers = pool.numbers;
            }
            _this.others = [];
            return _this;
        }

        Constants.prototype.getNumber = function getNumber(value) {
            return this.numbers[value];
        };

        Constants.prototype.getString = function getString(value) {
            return this.strings[value];
        };

        Constants.prototype.getStringArray = function getStringArray(value) {
            var names = this.getArray(value);
            var _names = new Array(names.length);
            for (var i = 0; i < names.length; i++) {
                var n = names[i];
                _names[i] = this.getString(n);
            }
            return _names;
        };

        Constants.prototype.getArray = function getArray(value) {
            return this.arrays[value];
        };

        Constants.prototype.getTemplateMeta = function getTemplateMeta(s) {
            return JSON.parse(this.strings[s]);
        };

        Constants.prototype.getOther = function getOther(value) {
            return this.others[value];
        };

        return Constants;
    }(WriteOnlyConstants);

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var RuntimeOpImpl = function () {
        function RuntimeOpImpl(heap) {
            _classCallCheck$1(this, RuntimeOpImpl);

            this.heap = heap;
            this.offset = 0;
        }

        _createClass(RuntimeOpImpl, [{
            key: "size",
            get: function get() {
                var rawType = this.heap.getbyaddr(this.offset);
                return ((rawType & 768 /* OPERAND_LEN_MASK */) >> 8 /* ARG_SHIFT */) + 1;
            }
        }, {
            key: "isMachine",
            get: function get() {
                var rawType = this.heap.getbyaddr(this.offset);
                return rawType & 1024 /* MACHINE_MASK */ ? 1 : 0;
            }
        }, {
            key: "type",
            get: function get() {
                return this.heap.getbyaddr(this.offset) & 255 /* TYPE_MASK */;
            }
        }, {
            key: "op1",
            get: function get() {
                return this.heap.getbyaddr(this.offset + 1);
            }
        }, {
            key: "op2",
            get: function get() {
                return this.heap.getbyaddr(this.offset + 2);
            }
        }, {
            key: "op3",
            get: function get() {
                return this.heap.getbyaddr(this.offset + 3);
            }
        }]);

        return RuntimeOpImpl;
    }();

    function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    function encodeTableInfo(scopeSize, state) {

        return state | scopeSize << 2;
    }
    function changeState(info, newState) {

        return info | newState << 30;
    }
    var PAGE_SIZE = 0x100000;
    var RuntimeHeapImpl = function () {
        function RuntimeHeapImpl(serializedHeap) {
            _classCallCheck$2(this, RuntimeHeapImpl);

            var buffer = serializedHeap.buffer,
                table = serializedHeap.table;

            this.heap = new Uint32Array(buffer);
            this.table = table;
        }
        // It is illegal to close over this address, as compaction
        // may move it. However, it is legal to use this address
        // multiple times between compactions.


        RuntimeHeapImpl.prototype.getaddr = function getaddr(handle) {
            return this.table[handle];
        };

        RuntimeHeapImpl.prototype.getbyaddr = function getbyaddr(address) {

            return this.heap[address];
        };

        RuntimeHeapImpl.prototype.sizeof = function sizeof(handle) {
            return _sizeof(this.table, handle);
        };

        RuntimeHeapImpl.prototype.scopesizeof = function scopesizeof(handle) {
            return _scopesizeof(this.table, handle);
        };

        return RuntimeHeapImpl;
    }();
    function hydrateHeap(serializedHeap) {
        return new RuntimeHeapImpl(serializedHeap);
    }
    /**
     * The Heap is responsible for dynamically allocating
     * memory in which we read/write the VM's instructions
     * from/to. When we malloc we pass out a VMHandle, which
     * is used as an indirect way of accessing the memory during
     * execution of the VM. Internally we track the different
     * regions of the memory in an int array known as the table.
     *
     * The table 32-bit aligned and has the following layout:
     *
     * | ... | hp (u32) |       info (u32)   | size (u32) |
     * | ... |  Handle  | Scope Size | State | Size       |
     * | ... | 32bits   | 30bits     | 2bits | 32bit      |
     *
     * With this information we effectively have the ability to
     * control when we want to free memory. That being said you
     * can not free during execution as raw address are only
     * valid during the execution. This means you cannot close
     * over them as you will have a bad memory access exception.
     */
    var HeapImpl = function () {
        function HeapImpl() {
            _classCallCheck$2(this, HeapImpl);

            this.placeholders = [];
            this.stdlibs = [];
            this.offset = 0;
            this.handle = 0;
            this.capacity = PAGE_SIZE;
            this.heap = new Uint32Array(PAGE_SIZE);
            this.table = [];
        }

        HeapImpl.prototype.push = function push(item) {
            this.sizeCheck();
            this.heap[this.offset++] = item;
        };

        HeapImpl.prototype.sizeCheck = function sizeCheck() {
            if (this.capacity === 0) {
                var heap = slice(this.heap, 0, this.offset);
                this.heap = new Uint32Array(heap.length + PAGE_SIZE);
                this.heap.set(heap, 0);
                this.capacity = PAGE_SIZE;
            }
            this.capacity--;
        };

        HeapImpl.prototype.getbyaddr = function getbyaddr(address) {
            return this.heap[address];
        };

        HeapImpl.prototype.setbyaddr = function setbyaddr(address, value) {
            this.heap[address] = value;
        };

        HeapImpl.prototype.malloc = function malloc() {
            // push offset, info, size
            this.table.push(this.offset, 0, 0);
            var handle = this.handle;
            this.handle += 3 /* ENTRY_SIZE */;
            return handle;
        };

        HeapImpl.prototype.finishMalloc = function finishMalloc(handle, scopeSize) {
            
            this.table[handle + 1 /* INFO_OFFSET */] = encodeTableInfo(scopeSize, 0 /* Allocated */);
        };

        HeapImpl.prototype.size = function size() {
            return this.offset;
        };
        // It is illegal to close over this address, as compaction
        // may move it. However, it is legal to use this address
        // multiple times between compactions.


        HeapImpl.prototype.getaddr = function getaddr(handle) {
            return this.table[handle];
        };

        HeapImpl.prototype.gethandle = function gethandle(address) {
            this.table.push(address, encodeTableInfo(0, 3 /* Pointer */), 0);
            var handle = this.handle;
            this.handle += 3 /* ENTRY_SIZE */;
            return handle;
        };

        HeapImpl.prototype.sizeof = function sizeof(handle) {
            return _sizeof(this.table, handle);
        };

        HeapImpl.prototype.scopesizeof = function scopesizeof(handle) {
            return _scopesizeof(this.table, handle);
        };

        HeapImpl.prototype.free = function free(handle) {
            var info = this.table[handle + 1 /* INFO_OFFSET */];
            this.table[handle + 1 /* INFO_OFFSET */] = changeState(info, 1 /* Freed */);
        };
        /**
         * The heap uses the [Mark-Compact Algorithm](https://en.wikipedia.org/wiki/Mark-compact_algorithm) to shift
         * reachable memory to the bottom of the heap and freeable
         * memory to the top of the heap. When we have shifted all
         * the reachable memory to the top of the heap, we move the
         * offset to the next free position.
         */


        HeapImpl.prototype.compact = function compact() {
            var compactedSize = 0;
            var table = this.table,
                length = this.table.length,
                heap = this.heap;

            for (var i = 0; i < length; i += 3 /* ENTRY_SIZE */) {
                var offset = table[i];
                var info = table[i + 1 /* INFO_OFFSET */];
                // @ts-ignore (this whole function is currently unused)
                var size = info & Size.SIZE_MASK;
                var state = info & 3 /* STATE_MASK */ >> 30;
                if (state === 2 /* Purged */) {
                        continue;
                    } else if (state === 1 /* Freed */) {
                        // transition to "already freed" aka "purged"
                        // a good improvement would be to reuse
                        // these slots
                        table[i + 1 /* INFO_OFFSET */] = changeState(info, 2 /* Purged */);
                        compactedSize += size;
                    } else if (state === 0 /* Allocated */) {
                        for (var j = offset; j <= i + size; j++) {
                            heap[j - compactedSize] = heap[j];
                        }
                        table[i] = offset - compactedSize;
                    } else if (state === 3 /* Pointer */) {
                        table[i] = offset - compactedSize;
                    }
            }
            this.offset = this.offset - compactedSize;
        };

        HeapImpl.prototype.pushPlaceholder = function pushPlaceholder(valueFunc) {
            this.sizeCheck();
            var address = this.offset++;
            this.heap[address] = 2147483647 /* MAX_SIZE */;
            this.placeholders.push([address, valueFunc]);
        };

        HeapImpl.prototype.pushStdlib = function pushStdlib(operand) {
            this.sizeCheck();
            var address = this.offset++;
            this.heap[address] = 2147483647 /* MAX_SIZE */;
            this.stdlibs.push([address, operand]);
        };

        HeapImpl.prototype.patchPlaceholders = function patchPlaceholders() {
            var placeholders = this.placeholders;

            for (var i = 0; i < placeholders.length; i++) {
                var _placeholders$i = placeholders[i],
                    address = _placeholders$i[0],
                    getValue = _placeholders$i[1];

                this.setbyaddr(address, getValue());
            }
        };

        HeapImpl.prototype.patchStdlibs = function patchStdlibs(stdlib) {
            var stdlibs = this.stdlibs;

            for (var i = 0; i < stdlibs.length; i++) {
                var _stdlibs$i = stdlibs[i],
                    address = _stdlibs$i[0],
                    value = _stdlibs$i[1].value;

                this.setbyaddr(address, stdlib[value]);
            }
            this.stdlibs = [];
        };

        HeapImpl.prototype.capture = function capture(stdlib) {
            var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.offset;

            this.patchPlaceholders();
            this.patchStdlibs(stdlib);
            // Only called in eager mode
            var buffer = slice(this.heap, 0, offset).buffer;
            return {
                handle: this.handle,
                table: this.table,
                buffer: buffer
            };
        };

        return HeapImpl;
    }();
    var RuntimeProgramImpl = function () {
        function RuntimeProgramImpl(constants, heap) {
            _classCallCheck$2(this, RuntimeProgramImpl);

            this.constants = constants;
            this.heap = heap;
            this._opcode = new RuntimeOpImpl(this.heap);
        }

        RuntimeProgramImpl.hydrate = function hydrate(artifacts) {
            var heap = new RuntimeHeapImpl(artifacts.heap);
            var constants = new RuntimeConstantsImpl(artifacts.constants);
            return new RuntimeProgramImpl(constants, heap);
        };

        RuntimeProgramImpl.prototype.opcode = function opcode(offset) {
            this._opcode.offset = offset;
            return this._opcode;
        };

        return RuntimeProgramImpl;
    }();
    function hydrateProgram(artifacts) {
        var heap = new RuntimeHeapImpl(artifacts.heap);
        var constants = new RuntimeConstantsImpl(artifacts.constants);
        return new RuntimeProgramImpl(constants, heap);
    }
    function slice(arr, start, end) {
        if (arr.slice !== undefined) {
            return arr.slice(start, end);
        }
        var ret = new Uint32Array(end);
        for (; start < end; start++) {
            ret[start] = arr[start];
        }
        return ret;
    }
    function _sizeof(table, handle) {
        {
            return -1;
        }
    }
    function _scopesizeof(table, handle) {
        var info = table[handle + 1 /* INFO_OFFSET */];
        return info >> 2;
    }

    function patchStdlibs(program) {
        program.heap.patchStdlibs(program.stdlib);
    }
    function programArtifacts(program) {
        var heap = program.heap.capture(program.stdlib);
        var constants = program.constants.toPool();
        return { heap: heap, constants: constants };
    }
    function artifacts(syntax) {
        return programArtifacts(syntax.program);
    }

    exports.WELL_KNOWN_EMPTY_ARRAY_POSITION = WELL_KNOWN_EMPTY_ARRAY_POSITION;
    exports.WriteOnlyConstants = WriteOnlyConstants;
    exports.RuntimeConstantsImpl = RuntimeConstantsImpl;
    exports.Constants = Constants;
    exports.RuntimeHeapImpl = RuntimeHeapImpl;
    exports.hydrateHeap = hydrateHeap;
    exports.HeapImpl = HeapImpl;
    exports.RuntimeProgramImpl = RuntimeProgramImpl;
    exports.hydrateProgram = hydrateProgram;
    exports.RuntimeOpImpl = RuntimeOpImpl;
    exports.patchStdlibs = patchStdlibs;
    exports.programArtifacts = programArtifacts;
    exports.artifacts = artifacts;

    Object.defineProperty(exports, '__esModule', { value: true });

});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xpbW1lci1wcm9ncmFtLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci9wcm9ncmFtL2xpYi9jb25zdGFudHMudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci9wcm9ncmFtL2xpYi9vcGNvZGUudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci9wcm9ncmFtL2xpYi9wcm9ncmFtLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvcHJvZ3JhbS9saWIvaGVscGVycy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBTeW1ib2xUYWJsZSxcbiAgQ29tcGlsZVRpbWVDb25zdGFudHMsXG4gIEVNUFRZX0FSUkFZLFxuICBDb25zdGFudFBvb2wsXG4gIFJ1bnRpbWVDb25zdGFudHMsXG59IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuXG5jb25zdCBVTlJFU09MVkVEID0ge307XG5cbmV4cG9ydCBjb25zdCBXRUxMX0tOT1dOX0VNUFRZX0FSUkFZX1BPU0lUSU9OID0gMDtcbmNvbnN0IFdFTExfS05PV19FTVBUWV9BUlJBWSA9IE9iamVjdC5mcmVlemUoW10pO1xuXG5leHBvcnQgY2xhc3MgV3JpdGVPbmx5Q29uc3RhbnRzIGltcGxlbWVudHMgQ29tcGlsZVRpbWVDb25zdGFudHMge1xuICAvLyBgMGAgbWVhbnMgTlVMTFxuXG4gIHByb3RlY3RlZCBzdHJpbmdzOiBzdHJpbmdbXSA9IFtdO1xuICBwcm90ZWN0ZWQgYXJyYXlzOiBudW1iZXJbXVtdIHwgRU1QVFlfQVJSQVkgPSBbV0VMTF9LTk9XX0VNUFRZX0FSUkFZXTtcbiAgcHJvdGVjdGVkIHRhYmxlczogU3ltYm9sVGFibGVbXSA9IFtdO1xuICBwcm90ZWN0ZWQgaGFuZGxlczogbnVtYmVyW10gPSBbXTtcbiAgcHJvdGVjdGVkIHJlc29sdmVkOiB1bmtub3duW10gPSBbXTtcbiAgcHJvdGVjdGVkIG51bWJlcnM6IG51bWJlcltdID0gW107XG4gIHByb3RlY3RlZCBvdGhlcnM6IHVua25vd25bXSA9IFtdO1xuXG4gIG90aGVyKG90aGVyOiB1bmtub3duKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5vdGhlcnMucHVzaChvdGhlcikgLSAxO1xuICB9XG5cbiAgc3RyaW5nKHZhbHVlOiBzdHJpbmcpOiBudW1iZXIge1xuICAgIGxldCBpbmRleCA9IHRoaXMuc3RyaW5ncy5pbmRleE9mKHZhbHVlKTtcblxuICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICByZXR1cm4gaW5kZXg7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuc3RyaW5ncy5wdXNoKHZhbHVlKSAtIDE7XG4gIH1cblxuICBzdHJpbmdBcnJheShzdHJpbmdzOiBzdHJpbmdbXSk6IG51bWJlciB7XG4gICAgbGV0IF9zdHJpbmdzOiBudW1iZXJbXSA9IG5ldyBBcnJheShzdHJpbmdzLmxlbmd0aCk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0cmluZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIF9zdHJpbmdzW2ldID0gdGhpcy5zdHJpbmcoc3RyaW5nc1tpXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuYXJyYXkoX3N0cmluZ3MpO1xuICB9XG5cbiAgYXJyYXkodmFsdWVzOiBudW1iZXJbXSk6IG51bWJlciB7XG4gICAgaWYgKHZhbHVlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBXRUxMX0tOT1dOX0VNUFRZX0FSUkFZX1BPU0lUSU9OO1xuICAgIH1cblxuICAgIGxldCBpbmRleCA9ICh0aGlzLmFycmF5cyBhcyBudW1iZXJbXVtdKS5pbmRleE9mKHZhbHVlcyk7XG5cbiAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgcmV0dXJuIGluZGV4O1xuICAgIH1cblxuICAgIHJldHVybiAodGhpcy5hcnJheXMgYXMgbnVtYmVyW11bXSkucHVzaCh2YWx1ZXMpIC0gMTtcbiAgfVxuXG4gIHRlbXBsYXRlTWV0YSh2YWx1ZTogdW5rbm93bik6IG51bWJlciB7XG4gICAgbGV0IHN0ciA9IEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICBsZXQgaW5kZXggPSB0aGlzLnN0cmluZ3MuaW5kZXhPZihzdHIpO1xuICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICByZXR1cm4gaW5kZXg7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuc3RyaW5ncy5wdXNoKHN0cikgLSAxO1xuICB9XG5cbiAgbnVtYmVyKG51bWJlcjogbnVtYmVyKTogbnVtYmVyIHtcbiAgICBsZXQgaW5kZXggPSB0aGlzLm51bWJlcnMuaW5kZXhPZihudW1iZXIpO1xuXG4gICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgIHJldHVybiBpbmRleDtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5udW1iZXJzLnB1c2gobnVtYmVyKSAtIDE7XG4gIH1cblxuICB0b1Bvb2woKTogQ29uc3RhbnRQb29sIHtcbiAgICByZXR1cm4ge1xuICAgICAgc3RyaW5nczogdGhpcy5zdHJpbmdzLFxuICAgICAgYXJyYXlzOiB0aGlzLmFycmF5cyxcbiAgICAgIGhhbmRsZXM6IHRoaXMuaGFuZGxlcyxcbiAgICAgIG51bWJlcnM6IHRoaXMubnVtYmVycyxcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSdW50aW1lQ29uc3RhbnRzSW1wbCBpbXBsZW1lbnRzIFJ1bnRpbWVDb25zdGFudHMge1xuICBwcm90ZWN0ZWQgc3RyaW5nczogc3RyaW5nW107XG4gIHByb3RlY3RlZCBhcnJheXM6IG51bWJlcltdW10gfCBFTVBUWV9BUlJBWTtcbiAgcHJvdGVjdGVkIGhhbmRsZXM6IG51bWJlcltdO1xuICBwcm90ZWN0ZWQgbnVtYmVyczogbnVtYmVyW107XG4gIHByb3RlY3RlZCBvdGhlcnM6IHVua25vd25bXTtcblxuICBjb25zdHJ1Y3Rvcihwb29sOiBDb25zdGFudFBvb2wpIHtcbiAgICB0aGlzLnN0cmluZ3MgPSBwb29sLnN0cmluZ3M7XG4gICAgdGhpcy5hcnJheXMgPSBwb29sLmFycmF5cztcbiAgICB0aGlzLmhhbmRsZXMgPSBwb29sLmhhbmRsZXM7XG4gICAgdGhpcy5udW1iZXJzID0gcG9vbC5udW1iZXJzO1xuICAgIHRoaXMub3RoZXJzID0gW107XG4gIH1cblxuICBnZXRTdHJpbmcodmFsdWU6IG51bWJlcik6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuc3RyaW5nc1t2YWx1ZV07XG4gIH1cblxuICBnZXROdW1iZXIodmFsdWU6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMubnVtYmVyc1t2YWx1ZV07XG4gIH1cblxuICBnZXRTdHJpbmdBcnJheSh2YWx1ZTogbnVtYmVyKTogc3RyaW5nW10ge1xuICAgIGxldCBuYW1lcyA9IHRoaXMuZ2V0QXJyYXkodmFsdWUpO1xuICAgIGxldCBfbmFtZXM6IHN0cmluZ1tdID0gbmV3IEFycmF5KG5hbWVzLmxlbmd0aCk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgbiA9IG5hbWVzW2ldO1xuICAgICAgX25hbWVzW2ldID0gdGhpcy5nZXRTdHJpbmcobik7XG4gICAgfVxuXG4gICAgcmV0dXJuIF9uYW1lcztcbiAgfVxuXG4gIGdldEFycmF5KHZhbHVlOiBudW1iZXIpOiBudW1iZXJbXSB7XG4gICAgcmV0dXJuICh0aGlzLmFycmF5cyBhcyBudW1iZXJbXVtdKVt2YWx1ZV07XG4gIH1cblxuICBnZXRUZW1wbGF0ZU1ldGE8VD4oczogbnVtYmVyKTogVCB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UodGhpcy5zdHJpbmdzW3NdKSBhcyBUO1xuICB9XG5cbiAgZ2V0T3RoZXI8VD4odmFsdWU6IG51bWJlcik6IFQge1xuICAgIHJldHVybiB0aGlzLm90aGVyc1t2YWx1ZV0gYXMgVDtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ29uc3RhbnRzIGV4dGVuZHMgV3JpdGVPbmx5Q29uc3RhbnRzIGltcGxlbWVudHMgUnVudGltZUNvbnN0YW50cyB7XG4gIGNvbnN0cnVjdG9yKHBvb2w/OiBDb25zdGFudFBvb2wpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgaWYgKHBvb2wpIHtcbiAgICAgIHRoaXMuc3RyaW5ncyA9IHBvb2wuc3RyaW5ncztcbiAgICAgIHRoaXMuYXJyYXlzID0gcG9vbC5hcnJheXM7XG4gICAgICB0aGlzLmhhbmRsZXMgPSBwb29sLmhhbmRsZXM7XG4gICAgICB0aGlzLnJlc29sdmVkID0gdGhpcy5oYW5kbGVzLm1hcCgoKSA9PiBVTlJFU09MVkVEKTtcbiAgICAgIHRoaXMubnVtYmVycyA9IHBvb2wubnVtYmVycztcbiAgICB9XG5cbiAgICB0aGlzLm90aGVycyA9IFtdO1xuICB9XG5cbiAgZ2V0TnVtYmVyKHZhbHVlOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLm51bWJlcnNbdmFsdWVdO1xuICB9XG5cbiAgZ2V0U3RyaW5nKHZhbHVlOiBudW1iZXIpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnN0cmluZ3NbdmFsdWVdO1xuICB9XG5cbiAgZ2V0U3RyaW5nQXJyYXkodmFsdWU6IG51bWJlcik6IHN0cmluZ1tdIHtcbiAgICBsZXQgbmFtZXMgPSB0aGlzLmdldEFycmF5KHZhbHVlKTtcbiAgICBsZXQgX25hbWVzOiBzdHJpbmdbXSA9IG5ldyBBcnJheShuYW1lcy5sZW5ndGgpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IG4gPSBuYW1lc1tpXTtcbiAgICAgIF9uYW1lc1tpXSA9IHRoaXMuZ2V0U3RyaW5nKG4pO1xuICAgIH1cblxuICAgIHJldHVybiBfbmFtZXM7XG4gIH1cblxuICBnZXRBcnJheSh2YWx1ZTogbnVtYmVyKTogbnVtYmVyW10ge1xuICAgIHJldHVybiAodGhpcy5hcnJheXMgYXMgbnVtYmVyW11bXSlbdmFsdWVdO1xuICB9XG5cbiAgZ2V0VGVtcGxhdGVNZXRhPFQ+KHM6IG51bWJlcik6IFQge1xuICAgIHJldHVybiBKU09OLnBhcnNlKHRoaXMuc3RyaW5nc1tzXSkgYXMgVDtcbiAgfVxuXG4gIGdldE90aGVyPFQ+KHZhbHVlOiBudW1iZXIpOiBUIHtcbiAgICByZXR1cm4gdGhpcy5vdGhlcnNbdmFsdWVdIGFzIFQ7XG4gIH1cbn1cbiIsImltcG9ydCB7IE9wY29kZVNpemUsIFJ1bnRpbWVPcCwgT3Bjb2RlSGVhcCB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuXG5leHBvcnQgY2xhc3MgUnVudGltZU9wSW1wbCBpbXBsZW1lbnRzIFJ1bnRpbWVPcCB7XG4gIHB1YmxpYyBvZmZzZXQgPSAwO1xuICBjb25zdHJ1Y3RvcihyZWFkb25seSBoZWFwOiBPcGNvZGVIZWFwKSB7fVxuXG4gIGdldCBzaXplKCkge1xuICAgIGxldCByYXdUeXBlID0gdGhpcy5oZWFwLmdldGJ5YWRkcih0aGlzLm9mZnNldCk7XG4gICAgcmV0dXJuICgocmF3VHlwZSAmIE9wY29kZVNpemUuT1BFUkFORF9MRU5fTUFTSykgPj4gT3Bjb2RlU2l6ZS5BUkdfU0hJRlQpICsgMTtcbiAgfVxuXG4gIGdldCBpc01hY2hpbmUoKTogMCB8IDEge1xuICAgIGxldCByYXdUeXBlID0gdGhpcy5oZWFwLmdldGJ5YWRkcih0aGlzLm9mZnNldCk7XG4gICAgcmV0dXJuIHJhd1R5cGUgJiBPcGNvZGVTaXplLk1BQ0hJTkVfTUFTSyA/IDEgOiAwO1xuICB9XG5cbiAgZ2V0IHR5cGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuaGVhcC5nZXRieWFkZHIodGhpcy5vZmZzZXQpICYgT3Bjb2RlU2l6ZS5UWVBFX01BU0s7XG4gIH1cblxuICBnZXQgb3AxKCkge1xuICAgIHJldHVybiB0aGlzLmhlYXAuZ2V0YnlhZGRyKHRoaXMub2Zmc2V0ICsgMSk7XG4gIH1cblxuICBnZXQgb3AyKCkge1xuICAgIHJldHVybiB0aGlzLmhlYXAuZ2V0YnlhZGRyKHRoaXMub2Zmc2V0ICsgMik7XG4gIH1cblxuICBnZXQgb3AzKCkge1xuICAgIHJldHVybiB0aGlzLmhlYXAuZ2V0YnlhZGRyKHRoaXMub2Zmc2V0ICsgMyk7XG4gIH1cbn1cbiIsImltcG9ydCB7XG4gIENvbXBpbGVUaW1lSGVhcCxcbiAgU2VyaWFsaXplZEhlYXAsXG4gIFNURExpYixcbiAgUnVudGltZUhlYXAsXG4gIFN0ZGxpYk9wZXJhbmQsXG4gIFJ1bnRpbWVDb25zdGFudHMsXG4gIFJ1bnRpbWVQcm9ncmFtLFxuICBDb21waWxlckFydGlmYWN0cyxcbn0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBERUJVRyB9IGZyb20gJ0BnbGltbWVyL2xvY2FsLWRlYnVnLWZsYWdzJztcbmltcG9ydCB7IFJ1bnRpbWVDb25zdGFudHNJbXBsIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHsgUnVudGltZU9wSW1wbCB9IGZyb20gJy4vb3Bjb2RlJztcbmltcG9ydCB7IGFzc2VydCB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuXG5jb25zdCBlbnVtIFRhYmxlU2xvdFN0YXRlIHtcbiAgQWxsb2NhdGVkLFxuICBGcmVlZCxcbiAgUHVyZ2VkLFxuICBQb2ludGVyLFxufVxuXG5jb25zdCBlbnVtIFNpemUge1xuICBFTlRSWV9TSVpFID0gMyxcbiAgSU5GT19PRkZTRVQgPSAxLFxuICBTSVpFX09GRlNFVCA9IDIsXG4gIE1BWF9TSVpFID0gMGIxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExLFxuICBTQ09QRV9NQVNLID0gMGIxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAwLFxuICBTVEFURV9NQVNLID0gMGIxMSxcbn1cblxuZnVuY3Rpb24gZW5jb2RlVGFibGVJbmZvKHNjb3BlU2l6ZTogbnVtYmVyLCBzdGF0ZTogbnVtYmVyKSB7XG4gIGFzc2VydChzY29wZVNpemUgPiAtMSAmJiBzdGF0ZSA+IC0xLCAnU2l6ZSwgc2NvcGVTaXplIG9yIHN0YXRlIHdlcmUgbGVzcyB0aGFuIDAnKTtcbiAgYXNzZXJ0KHN0YXRlIDwgMSA8PCAyLCAnU3RhdGUgaXMgbW9yZSB0aGFuIDIgYml0cycpO1xuICBhc3NlcnQoc2NvcGVTaXplIDwgMSA8PCAzMCwgJ1Njb3BlIGlzIG1vcmUgdGhhbiAzMC1iaXRzJyk7XG4gIHJldHVybiBzdGF0ZSB8IChzY29wZVNpemUgPDwgMik7XG59XG5cbmZ1bmN0aW9uIGNoYW5nZVN0YXRlKGluZm86IG51bWJlciwgbmV3U3RhdGU6IG51bWJlcikge1xuICBhc3NlcnQoaW5mbyA+IC0xICYmIG5ld1N0YXRlID4gLTEsICdJbmZvIG9yIHN0YXRlIHdlcmUgbGVzcyB0aGFuIDAnKTtcbiAgYXNzZXJ0KG5ld1N0YXRlIDwgMSA8PCAyLCAnU3RhdGUgaXMgbW9yZSB0aGFuIDIgYml0cycpO1xuICBhc3NlcnQoaW5mbyA8IDEgPDwgMzAsICdJbmZvIGlzIG1vcmUgdGhhbiAzMCBiaXRzJyk7XG5cbiAgcmV0dXJuIGluZm8gfCAobmV3U3RhdGUgPDwgMzApO1xufVxuXG5leHBvcnQgdHlwZSBQbGFjZWhvbGRlciA9IFtudW1iZXIsICgpID0+IG51bWJlcl07XG5leHBvcnQgdHlwZSBTdGRsaWJQbGFjZWhvbGRlciA9IFtudW1iZXIsIFN0ZGxpYk9wZXJhbmRdO1xuXG5jb25zdCBQQUdFX1NJWkUgPSAweDEwMDAwMDtcblxuZXhwb3J0IGNsYXNzIFJ1bnRpbWVIZWFwSW1wbCBpbXBsZW1lbnRzIFJ1bnRpbWVIZWFwIHtcbiAgcHJpdmF0ZSBoZWFwOiBVaW50MzJBcnJheTtcbiAgcHJpdmF0ZSB0YWJsZTogbnVtYmVyW107XG5cbiAgY29uc3RydWN0b3Ioc2VyaWFsaXplZEhlYXA6IFNlcmlhbGl6ZWRIZWFwKSB7XG4gICAgbGV0IHsgYnVmZmVyLCB0YWJsZSB9ID0gc2VyaWFsaXplZEhlYXA7XG4gICAgdGhpcy5oZWFwID0gbmV3IFVpbnQzMkFycmF5KGJ1ZmZlcik7XG4gICAgdGhpcy50YWJsZSA9IHRhYmxlO1xuICB9XG5cbiAgLy8gSXQgaXMgaWxsZWdhbCB0byBjbG9zZSBvdmVyIHRoaXMgYWRkcmVzcywgYXMgY29tcGFjdGlvblxuICAvLyBtYXkgbW92ZSBpdC4gSG93ZXZlciwgaXQgaXMgbGVnYWwgdG8gdXNlIHRoaXMgYWRkcmVzc1xuICAvLyBtdWx0aXBsZSB0aW1lcyBiZXR3ZWVuIGNvbXBhY3Rpb25zLlxuICBnZXRhZGRyKGhhbmRsZTogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy50YWJsZVtoYW5kbGVdO1xuICB9XG5cbiAgZ2V0YnlhZGRyKGFkZHJlc3M6IG51bWJlcik6IG51bWJlciB7XG4gICAgYXNzZXJ0KHRoaXMuaGVhcFthZGRyZXNzXSAhPT0gdW5kZWZpbmVkLCAnQWNjZXNzIG1lbW9yeSBvdXQgb2YgYm91bmRzIG9mIHRoZSBoZWFwJyk7XG4gICAgcmV0dXJuIHRoaXMuaGVhcFthZGRyZXNzXTtcbiAgfVxuXG4gIHNpemVvZihoYW5kbGU6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIHNpemVvZih0aGlzLnRhYmxlLCBoYW5kbGUpO1xuICB9XG5cbiAgc2NvcGVzaXplb2YoaGFuZGxlOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiBzY29wZXNpemVvZih0aGlzLnRhYmxlLCBoYW5kbGUpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoeWRyYXRlSGVhcChzZXJpYWxpemVkSGVhcDogU2VyaWFsaXplZEhlYXApOiBSdW50aW1lSGVhcCB7XG4gIHJldHVybiBuZXcgUnVudGltZUhlYXBJbXBsKHNlcmlhbGl6ZWRIZWFwKTtcbn1cblxuLyoqXG4gKiBUaGUgSGVhcCBpcyByZXNwb25zaWJsZSBmb3IgZHluYW1pY2FsbHkgYWxsb2NhdGluZ1xuICogbWVtb3J5IGluIHdoaWNoIHdlIHJlYWQvd3JpdGUgdGhlIFZNJ3MgaW5zdHJ1Y3Rpb25zXG4gKiBmcm9tL3RvLiBXaGVuIHdlIG1hbGxvYyB3ZSBwYXNzIG91dCBhIFZNSGFuZGxlLCB3aGljaFxuICogaXMgdXNlZCBhcyBhbiBpbmRpcmVjdCB3YXkgb2YgYWNjZXNzaW5nIHRoZSBtZW1vcnkgZHVyaW5nXG4gKiBleGVjdXRpb24gb2YgdGhlIFZNLiBJbnRlcm5hbGx5IHdlIHRyYWNrIHRoZSBkaWZmZXJlbnRcbiAqIHJlZ2lvbnMgb2YgdGhlIG1lbW9yeSBpbiBhbiBpbnQgYXJyYXkga25vd24gYXMgdGhlIHRhYmxlLlxuICpcbiAqIFRoZSB0YWJsZSAzMi1iaXQgYWxpZ25lZCBhbmQgaGFzIHRoZSBmb2xsb3dpbmcgbGF5b3V0OlxuICpcbiAqIHwgLi4uIHwgaHAgKHUzMikgfCAgICAgICBpbmZvICh1MzIpICAgfCBzaXplICh1MzIpIHxcbiAqIHwgLi4uIHwgIEhhbmRsZSAgfCBTY29wZSBTaXplIHwgU3RhdGUgfCBTaXplICAgICAgIHxcbiAqIHwgLi4uIHwgMzJiaXRzICAgfCAzMGJpdHMgICAgIHwgMmJpdHMgfCAzMmJpdCAgICAgIHxcbiAqXG4gKiBXaXRoIHRoaXMgaW5mb3JtYXRpb24gd2UgZWZmZWN0aXZlbHkgaGF2ZSB0aGUgYWJpbGl0eSB0b1xuICogY29udHJvbCB3aGVuIHdlIHdhbnQgdG8gZnJlZSBtZW1vcnkuIFRoYXQgYmVpbmcgc2FpZCB5b3VcbiAqIGNhbiBub3QgZnJlZSBkdXJpbmcgZXhlY3V0aW9uIGFzIHJhdyBhZGRyZXNzIGFyZSBvbmx5XG4gKiB2YWxpZCBkdXJpbmcgdGhlIGV4ZWN1dGlvbi4gVGhpcyBtZWFucyB5b3UgY2Fubm90IGNsb3NlXG4gKiBvdmVyIHRoZW0gYXMgeW91IHdpbGwgaGF2ZSBhIGJhZCBtZW1vcnkgYWNjZXNzIGV4Y2VwdGlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIEhlYXBJbXBsIGltcGxlbWVudHMgQ29tcGlsZVRpbWVIZWFwLCBSdW50aW1lSGVhcCB7XG4gIHByaXZhdGUgaGVhcDogVWludDMyQXJyYXk7XG4gIHByaXZhdGUgcGxhY2Vob2xkZXJzOiBQbGFjZWhvbGRlcltdID0gW107XG4gIHByaXZhdGUgc3RkbGliczogU3RkbGliUGxhY2Vob2xkZXJbXSA9IFtdO1xuICBwcml2YXRlIHRhYmxlOiBudW1iZXJbXTtcbiAgcHJpdmF0ZSBvZmZzZXQgPSAwO1xuICBwcml2YXRlIGhhbmRsZSA9IDA7XG4gIHByaXZhdGUgY2FwYWNpdHkgPSBQQUdFX1NJWkU7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5oZWFwID0gbmV3IFVpbnQzMkFycmF5KFBBR0VfU0laRSk7XG4gICAgdGhpcy50YWJsZSA9IFtdO1xuICB9XG5cbiAgcHVzaChpdGVtOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLnNpemVDaGVjaygpO1xuICAgIHRoaXMuaGVhcFt0aGlzLm9mZnNldCsrXSA9IGl0ZW07XG4gIH1cblxuICBwcml2YXRlIHNpemVDaGVjaygpIHtcbiAgICBpZiAodGhpcy5jYXBhY2l0eSA9PT0gMCkge1xuICAgICAgbGV0IGhlYXAgPSBzbGljZSh0aGlzLmhlYXAsIDAsIHRoaXMub2Zmc2V0KTtcbiAgICAgIHRoaXMuaGVhcCA9IG5ldyBVaW50MzJBcnJheShoZWFwLmxlbmd0aCArIFBBR0VfU0laRSk7XG4gICAgICB0aGlzLmhlYXAuc2V0KGhlYXAsIDApO1xuICAgICAgdGhpcy5jYXBhY2l0eSA9IFBBR0VfU0laRTtcbiAgICB9XG4gICAgdGhpcy5jYXBhY2l0eS0tO1xuICB9XG5cbiAgZ2V0YnlhZGRyKGFkZHJlc3M6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuaGVhcFthZGRyZXNzXTtcbiAgfVxuXG4gIHNldGJ5YWRkcihhZGRyZXNzOiBudW1iZXIsIHZhbHVlOiBudW1iZXIpIHtcbiAgICB0aGlzLmhlYXBbYWRkcmVzc10gPSB2YWx1ZTtcbiAgfVxuXG4gIG1hbGxvYygpOiBudW1iZXIge1xuICAgIC8vIHB1c2ggb2Zmc2V0LCBpbmZvLCBzaXplXG4gICAgdGhpcy50YWJsZS5wdXNoKHRoaXMub2Zmc2V0LCAwLCAwKTtcbiAgICBsZXQgaGFuZGxlID0gdGhpcy5oYW5kbGU7XG4gICAgdGhpcy5oYW5kbGUgKz0gU2l6ZS5FTlRSWV9TSVpFO1xuICAgIHJldHVybiBoYW5kbGU7XG4gIH1cblxuICBmaW5pc2hNYWxsb2MoaGFuZGxlOiBudW1iZXIsIHNjb3BlU2l6ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgaWYgKERFQlVHKSB7XG4gICAgICBsZXQgc3RhcnQgPSB0aGlzLnRhYmxlW2hhbmRsZV07XG4gICAgICBsZXQgZmluaXNoID0gdGhpcy5vZmZzZXQ7XG4gICAgICBsZXQgaW5zdHJ1Y3Rpb25TaXplID0gZmluaXNoIC0gc3RhcnQ7XG4gICAgICB0aGlzLnRhYmxlW2hhbmRsZSArIFNpemUuU0laRV9PRkZTRVRdID0gaW5zdHJ1Y3Rpb25TaXplO1xuICAgIH1cbiAgICB0aGlzLnRhYmxlW2hhbmRsZSArIFNpemUuSU5GT19PRkZTRVRdID0gZW5jb2RlVGFibGVJbmZvKHNjb3BlU2l6ZSwgVGFibGVTbG90U3RhdGUuQWxsb2NhdGVkKTtcbiAgfVxuXG4gIHNpemUoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5vZmZzZXQ7XG4gIH1cblxuICAvLyBJdCBpcyBpbGxlZ2FsIHRvIGNsb3NlIG92ZXIgdGhpcyBhZGRyZXNzLCBhcyBjb21wYWN0aW9uXG4gIC8vIG1heSBtb3ZlIGl0LiBIb3dldmVyLCBpdCBpcyBsZWdhbCB0byB1c2UgdGhpcyBhZGRyZXNzXG4gIC8vIG11bHRpcGxlIHRpbWVzIGJldHdlZW4gY29tcGFjdGlvbnMuXG4gIGdldGFkZHIoaGFuZGxlOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnRhYmxlW2hhbmRsZV07XG4gIH1cblxuICBnZXRoYW5kbGUoYWRkcmVzczogbnVtYmVyKTogbnVtYmVyIHtcbiAgICB0aGlzLnRhYmxlLnB1c2goYWRkcmVzcywgZW5jb2RlVGFibGVJbmZvKDAsIFRhYmxlU2xvdFN0YXRlLlBvaW50ZXIpLCAwKTtcbiAgICBsZXQgaGFuZGxlID0gdGhpcy5oYW5kbGU7XG4gICAgdGhpcy5oYW5kbGUgKz0gU2l6ZS5FTlRSWV9TSVpFO1xuICAgIHJldHVybiBoYW5kbGU7XG4gIH1cblxuICBzaXplb2YoaGFuZGxlOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiBzaXplb2YodGhpcy50YWJsZSwgaGFuZGxlKTtcbiAgfVxuXG4gIHNjb3Blc2l6ZW9mKGhhbmRsZTogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gc2NvcGVzaXplb2YodGhpcy50YWJsZSwgaGFuZGxlKTtcbiAgfVxuXG4gIGZyZWUoaGFuZGxlOiBudW1iZXIpOiB2b2lkIHtcbiAgICBsZXQgaW5mbyA9IHRoaXMudGFibGVbaGFuZGxlICsgU2l6ZS5JTkZPX09GRlNFVF07XG4gICAgdGhpcy50YWJsZVtoYW5kbGUgKyBTaXplLklORk9fT0ZGU0VUXSA9IGNoYW5nZVN0YXRlKGluZm8sIFRhYmxlU2xvdFN0YXRlLkZyZWVkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgaGVhcCB1c2VzIHRoZSBbTWFyay1Db21wYWN0IEFsZ29yaXRobV0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTWFyay1jb21wYWN0X2FsZ29yaXRobSkgdG8gc2hpZnRcbiAgICogcmVhY2hhYmxlIG1lbW9yeSB0byB0aGUgYm90dG9tIG9mIHRoZSBoZWFwIGFuZCBmcmVlYWJsZVxuICAgKiBtZW1vcnkgdG8gdGhlIHRvcCBvZiB0aGUgaGVhcC4gV2hlbiB3ZSBoYXZlIHNoaWZ0ZWQgYWxsXG4gICAqIHRoZSByZWFjaGFibGUgbWVtb3J5IHRvIHRoZSB0b3Agb2YgdGhlIGhlYXAsIHdlIG1vdmUgdGhlXG4gICAqIG9mZnNldCB0byB0aGUgbmV4dCBmcmVlIHBvc2l0aW9uLlxuICAgKi9cbiAgY29tcGFjdCgpOiB2b2lkIHtcbiAgICBsZXQgY29tcGFjdGVkU2l6ZSA9IDA7XG4gICAgbGV0IHtcbiAgICAgIHRhYmxlLFxuICAgICAgdGFibGU6IHsgbGVuZ3RoIH0sXG4gICAgICBoZWFwLFxuICAgIH0gPSB0aGlzO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkgKz0gU2l6ZS5FTlRSWV9TSVpFKSB7XG4gICAgICBsZXQgb2Zmc2V0ID0gdGFibGVbaV07XG4gICAgICBsZXQgaW5mbyA9IHRhYmxlW2kgKyBTaXplLklORk9fT0ZGU0VUXTtcbiAgICAgIC8vIEB0cy1pZ25vcmUgKHRoaXMgd2hvbGUgZnVuY3Rpb24gaXMgY3VycmVudGx5IHVudXNlZClcbiAgICAgIGxldCBzaXplID0gaW5mbyAmIFNpemUuU0laRV9NQVNLO1xuICAgICAgbGV0IHN0YXRlID0gaW5mbyAmIChTaXplLlNUQVRFX01BU0sgPj4gMzApO1xuXG4gICAgICBpZiAoc3RhdGUgPT09IFRhYmxlU2xvdFN0YXRlLlB1cmdlZCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IFRhYmxlU2xvdFN0YXRlLkZyZWVkKSB7XG4gICAgICAgIC8vIHRyYW5zaXRpb24gdG8gXCJhbHJlYWR5IGZyZWVkXCIgYWthIFwicHVyZ2VkXCJcbiAgICAgICAgLy8gYSBnb29kIGltcHJvdmVtZW50IHdvdWxkIGJlIHRvIHJldXNlXG4gICAgICAgIC8vIHRoZXNlIHNsb3RzXG4gICAgICAgIHRhYmxlW2kgKyBTaXplLklORk9fT0ZGU0VUXSA9IGNoYW5nZVN0YXRlKGluZm8sIFRhYmxlU2xvdFN0YXRlLlB1cmdlZCk7XG4gICAgICAgIGNvbXBhY3RlZFNpemUgKz0gc2l6ZTtcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IFRhYmxlU2xvdFN0YXRlLkFsbG9jYXRlZCkge1xuICAgICAgICBmb3IgKGxldCBqID0gb2Zmc2V0OyBqIDw9IGkgKyBzaXplOyBqKyspIHtcbiAgICAgICAgICBoZWFwW2ogLSBjb21wYWN0ZWRTaXplXSA9IGhlYXBbal07XG4gICAgICAgIH1cblxuICAgICAgICB0YWJsZVtpXSA9IG9mZnNldCAtIGNvbXBhY3RlZFNpemU7XG4gICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBUYWJsZVNsb3RTdGF0ZS5Qb2ludGVyKSB7XG4gICAgICAgIHRhYmxlW2ldID0gb2Zmc2V0IC0gY29tcGFjdGVkU2l6ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLm9mZnNldCA9IHRoaXMub2Zmc2V0IC0gY29tcGFjdGVkU2l6ZTtcbiAgfVxuXG4gIHB1c2hQbGFjZWhvbGRlcih2YWx1ZUZ1bmM6ICgpID0+IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuc2l6ZUNoZWNrKCk7XG4gICAgbGV0IGFkZHJlc3MgPSB0aGlzLm9mZnNldCsrO1xuICAgIHRoaXMuaGVhcFthZGRyZXNzXSA9IFNpemUuTUFYX1NJWkU7XG4gICAgdGhpcy5wbGFjZWhvbGRlcnMucHVzaChbYWRkcmVzcywgdmFsdWVGdW5jXSk7XG4gIH1cblxuICBwdXNoU3RkbGliKG9wZXJhbmQ6IFN0ZGxpYk9wZXJhbmQpOiB2b2lkIHtcbiAgICB0aGlzLnNpemVDaGVjaygpO1xuICAgIGxldCBhZGRyZXNzID0gdGhpcy5vZmZzZXQrKztcbiAgICB0aGlzLmhlYXBbYWRkcmVzc10gPSBTaXplLk1BWF9TSVpFO1xuICAgIHRoaXMuc3RkbGlicy5wdXNoKFthZGRyZXNzLCBvcGVyYW5kXSk7XG4gIH1cblxuICBwcml2YXRlIHBhdGNoUGxhY2Vob2xkZXJzKCkge1xuICAgIGxldCB7IHBsYWNlaG9sZGVycyB9ID0gdGhpcztcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGxhY2Vob2xkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgW2FkZHJlc3MsIGdldFZhbHVlXSA9IHBsYWNlaG9sZGVyc1tpXTtcblxuICAgICAgYXNzZXJ0KFxuICAgICAgICB0aGlzLmdldGJ5YWRkcihhZGRyZXNzKSA9PT0gU2l6ZS5NQVhfU0laRSxcbiAgICAgICAgYGV4cGVjdGVkIHRvIGZpbmQgYSBwbGFjZWhvbGRlciB2YWx1ZSBhdCAke2FkZHJlc3N9YFxuICAgICAgKTtcbiAgICAgIHRoaXMuc2V0YnlhZGRyKGFkZHJlc3MsIGdldFZhbHVlKCkpO1xuICAgIH1cbiAgfVxuXG4gIHBhdGNoU3RkbGlicyhzdGRsaWI6IFNURExpYik6IHZvaWQge1xuICAgIGxldCB7IHN0ZGxpYnMgfSA9IHRoaXM7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0ZGxpYnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBbYWRkcmVzcywgeyB2YWx1ZSB9XSA9IHN0ZGxpYnNbaV07XG5cbiAgICAgIGFzc2VydChcbiAgICAgICAgdGhpcy5nZXRieWFkZHIoYWRkcmVzcykgPT09IFNpemUuTUFYX1NJWkUsXG4gICAgICAgIGBleHBlY3RlZCB0byBmaW5kIGEgcGxhY2Vob2xkZXIgdmFsdWUgYXQgJHthZGRyZXNzfWBcbiAgICAgICk7XG4gICAgICB0aGlzLnNldGJ5YWRkcihhZGRyZXNzLCBzdGRsaWJbdmFsdWVdKTtcbiAgICB9XG5cbiAgICB0aGlzLnN0ZGxpYnMgPSBbXTtcbiAgfVxuXG4gIGNhcHR1cmUoc3RkbGliOiBTVERMaWIsIG9mZnNldCA9IHRoaXMub2Zmc2V0KTogU2VyaWFsaXplZEhlYXAge1xuICAgIHRoaXMucGF0Y2hQbGFjZWhvbGRlcnMoKTtcbiAgICB0aGlzLnBhdGNoU3RkbGlicyhzdGRsaWIpO1xuXG4gICAgLy8gT25seSBjYWxsZWQgaW4gZWFnZXIgbW9kZVxuICAgIGxldCBidWZmZXIgPSBzbGljZSh0aGlzLmhlYXAsIDAsIG9mZnNldCkuYnVmZmVyO1xuICAgIHJldHVybiB7XG4gICAgICBoYW5kbGU6IHRoaXMuaGFuZGxlLFxuICAgICAgdGFibGU6IHRoaXMudGFibGUsXG4gICAgICBidWZmZXI6IGJ1ZmZlciBhcyBBcnJheUJ1ZmZlcixcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSdW50aW1lUHJvZ3JhbUltcGwgaW1wbGVtZW50cyBSdW50aW1lUHJvZ3JhbSB7XG4gIFtrZXk6IG51bWJlcl06IG5ldmVyO1xuXG4gIHN0YXRpYyBoeWRyYXRlKGFydGlmYWN0czogQ29tcGlsZXJBcnRpZmFjdHMpIHtcbiAgICBsZXQgaGVhcCA9IG5ldyBSdW50aW1lSGVhcEltcGwoYXJ0aWZhY3RzLmhlYXApO1xuICAgIGxldCBjb25zdGFudHMgPSBuZXcgUnVudGltZUNvbnN0YW50c0ltcGwoYXJ0aWZhY3RzLmNvbnN0YW50cyk7XG5cbiAgICByZXR1cm4gbmV3IFJ1bnRpbWVQcm9ncmFtSW1wbChjb25zdGFudHMsIGhlYXApO1xuICB9XG5cbiAgcHJpdmF0ZSBfb3Bjb2RlOiBSdW50aW1lT3BJbXBsO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBjb25zdGFudHM6IFJ1bnRpbWVDb25zdGFudHMsIHB1YmxpYyBoZWFwOiBSdW50aW1lSGVhcCkge1xuICAgIHRoaXMuX29wY29kZSA9IG5ldyBSdW50aW1lT3BJbXBsKHRoaXMuaGVhcCk7XG4gIH1cblxuICBvcGNvZGUob2Zmc2V0OiBudW1iZXIpOiBSdW50aW1lT3BJbXBsIHtcbiAgICB0aGlzLl9vcGNvZGUub2Zmc2V0ID0gb2Zmc2V0O1xuICAgIHJldHVybiB0aGlzLl9vcGNvZGU7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGh5ZHJhdGVQcm9ncmFtKGFydGlmYWN0czogQ29tcGlsZXJBcnRpZmFjdHMpOiBSdW50aW1lUHJvZ3JhbSB7XG4gIGxldCBoZWFwID0gbmV3IFJ1bnRpbWVIZWFwSW1wbChhcnRpZmFjdHMuaGVhcCk7XG4gIGxldCBjb25zdGFudHMgPSBuZXcgUnVudGltZUNvbnN0YW50c0ltcGwoYXJ0aWZhY3RzLmNvbnN0YW50cyk7XG5cbiAgcmV0dXJuIG5ldyBSdW50aW1lUHJvZ3JhbUltcGwoY29uc3RhbnRzLCBoZWFwKTtcbn1cblxuZnVuY3Rpb24gc2xpY2UoYXJyOiBVaW50MzJBcnJheSwgc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIpOiBVaW50MzJBcnJheSB7XG4gIGlmIChhcnIuc2xpY2UgIT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBhcnIuc2xpY2Uoc3RhcnQsIGVuZCk7XG4gIH1cblxuICBsZXQgcmV0ID0gbmV3IFVpbnQzMkFycmF5KGVuZCk7XG5cbiAgZm9yICg7IHN0YXJ0IDwgZW5kOyBzdGFydCsrKSB7XG4gICAgcmV0W3N0YXJ0XSA9IGFycltzdGFydF07XG4gIH1cblxuICByZXR1cm4gcmV0O1xufVxuXG5mdW5jdGlvbiBzaXplb2YodGFibGU6IG51bWJlcltdLCBoYW5kbGU6IG51bWJlcikge1xuICBpZiAoREVCVUcpIHtcbiAgICByZXR1cm4gdGFibGVbaGFuZGxlICsgU2l6ZS5TSVpFX09GRlNFVF07XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIC0xO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNjb3Blc2l6ZW9mKHRhYmxlOiBudW1iZXJbXSwgaGFuZGxlOiBudW1iZXIpIHtcbiAgbGV0IGluZm8gPSB0YWJsZVtoYW5kbGUgKyBTaXplLklORk9fT0ZGU0VUXTtcbiAgcmV0dXJuIGluZm8gPj4gMjtcbn1cbiIsImltcG9ydCB7XG4gIFdob2xlUHJvZ3JhbUNvbXBpbGF0aW9uQ29udGV4dCxcbiAgQ29tcGlsZXJBcnRpZmFjdHMsXG4gIFN5bnRheENvbXBpbGF0aW9uQ29udGV4dCxcbn0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXRjaFN0ZGxpYnMocHJvZ3JhbTogV2hvbGVQcm9ncmFtQ29tcGlsYXRpb25Db250ZXh0KSB7XG4gIHByb2dyYW0uaGVhcC5wYXRjaFN0ZGxpYnMocHJvZ3JhbS5zdGRsaWIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvZ3JhbUFydGlmYWN0cyhwcm9ncmFtOiBXaG9sZVByb2dyYW1Db21waWxhdGlvbkNvbnRleHQpOiBDb21waWxlckFydGlmYWN0cyB7XG4gIGxldCBoZWFwID0gcHJvZ3JhbS5oZWFwLmNhcHR1cmUocHJvZ3JhbS5zdGRsaWIpO1xuICBsZXQgY29uc3RhbnRzID0gcHJvZ3JhbS5jb25zdGFudHMudG9Qb29sKCk7XG5cbiAgcmV0dXJuIHsgaGVhcCwgY29uc3RhbnRzIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcnRpZmFjdHMoc3ludGF4OiBTeW50YXhDb21waWxhdGlvbkNvbnRleHQpOiBDb21waWxlckFydGlmYWN0cyB7XG4gIHJldHVybiBwcm9ncmFtQXJ0aWZhY3RzKHN5bnRheC5wcm9ncmFtKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7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