'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.RuntimeProgramImpl = exports.HeapImpl = exports.RuntimeHeapImpl = undefined;
exports.hydrateHeap = hydrateHeap;
exports.hydrateProgram = hydrateProgram;

var _constants = require('./constants');

var _opcode = require('./opcode');

var _util = require('@glimmer/util');

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

function encodeTableInfo(scopeSize, state) {
    false && (0, _util.assert)(scopeSize > -1 && state > -1, 'Size, scopeSize or state were less than 0');
    false && (0, _util.assert)(state < 1 << 2, 'State is more than 2 bits');
    false && (0, _util.assert)(scopeSize < 1 << 30, 'Scope is more than 30-bits');

    return state | scopeSize << 2;
}
function changeState(info, newState) {
    false && (0, _util.assert)(info > -1 && newState > -1, 'Info or state were less than 0');
    false && (0, _util.assert)(newState < 1 << 2, 'State is more than 2 bits');
    false && (0, _util.assert)(info < 1 << 30, 'Info is more than 30 bits');

    return info | newState << 30;
}
var PAGE_SIZE = 0x100000;
var RuntimeHeapImpl = exports.RuntimeHeapImpl = function () {
    function RuntimeHeapImpl(serializedHeap) {
        _classCallCheck(this, RuntimeHeapImpl);

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
        false && (0, _util.assert)(this.heap[address] !== undefined, 'Access memory out of bounds of the heap');

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
var HeapImpl = exports.HeapImpl = function () {
    function HeapImpl() {
        _classCallCheck(this, HeapImpl);

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
        if (false) {
            var start = this.table[handle];
            var finish = this.offset;
            var instructionSize = finish - start;
            this.table[handle + 2 /* SIZE_OFFSET */] = instructionSize;
        }
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

            false && (0, _util.assert)(this.getbyaddr(address) === 2147483647 /* MAX_SIZE */, 'expected to find a placeholder value at ' + address);

            this.setbyaddr(address, getValue());
        }
    };

    HeapImpl.prototype.patchStdlibs = function patchStdlibs(stdlib) {
        var stdlibs = this.stdlibs;

        for (var i = 0; i < stdlibs.length; i++) {
            var _stdlibs$i = stdlibs[i],
                address = _stdlibs$i[0],
                value = _stdlibs$i[1].value;

            false && (0, _util.assert)(this.getbyaddr(address) === 2147483647 /* MAX_SIZE */, 'expected to find a placeholder value at ' + address);

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
var RuntimeProgramImpl = exports.RuntimeProgramImpl = function () {
    function RuntimeProgramImpl(constants, heap) {
        _classCallCheck(this, RuntimeProgramImpl);

        this.constants = constants;
        this.heap = heap;
        this._opcode = new _opcode.RuntimeOpImpl(this.heap);
    }

    RuntimeProgramImpl.hydrate = function hydrate(artifacts) {
        var heap = new RuntimeHeapImpl(artifacts.heap);
        var constants = new _constants.RuntimeConstantsImpl(artifacts.constants);
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
    var constants = new _constants.RuntimeConstantsImpl(artifacts.constants);
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
    if (false) {
        return table[handle + 2 /* SIZE_OFFSET */];
    } else {
        return -1;
    }
}
function _scopesizeof(table, handle) {
    var info = table[handle + 1 /* INFO_OFFSET */];
    return info >> 2;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3Byb2dyYW0vbGliL3Byb2dyYW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O1FBa0ZNLFcsR0FBQSxXO1FBME9BLGMsR0FBQSxjOztBQWpUTjs7QUFDQTs7QUFDQTs7Ozs7Ozs7QUFrQkEsU0FBQSxlQUFBLENBQUEsU0FBQSxFQUFBLEtBQUEsRUFBeUQ7QUFBQSxhQUN2RCxrQkFBTyxZQUFZLENBQVosQ0FBQSxJQUFrQixRQUFRLENBQWpDLENBQUEsRUFEdUQsMkNBQ3ZELENBRHVEO0FBQUEsYUFFdkQsa0JBQU8sUUFBUSxLQUFmLENBQUEsRUFGdUQsMkJBRXZELENBRnVEO0FBQUEsYUFHdkQsa0JBQU8sWUFBWSxLQUFuQixFQUFBLEVBSHVELDRCQUd2RCxDQUh1RDs7QUFJdkQsV0FBTyxRQUFTLGFBQWhCLENBQUE7QUFDRDtBQUVELFNBQUEsV0FBQSxDQUFBLElBQUEsRUFBQSxRQUFBLEVBQW1EO0FBQUEsYUFDakQsa0JBQU8sT0FBTyxDQUFQLENBQUEsSUFBYSxXQUFXLENBQS9CLENBQUEsRUFEaUQsZ0NBQ2pELENBRGlEO0FBQUEsYUFFakQsa0JBQU8sV0FBVyxLQUFsQixDQUFBLEVBRmlELDJCQUVqRCxDQUZpRDtBQUFBLGFBR2pELGtCQUFPLE9BQU8sS0FBZCxFQUFBLEVBSGlELDJCQUdqRCxDQUhpRDs7QUFLakQsV0FBTyxPQUFRLFlBQWYsRUFBQTtBQUNEO0FBS0QsSUFBTSxZQUFOLFFBQUE7QUFFQSxJQUFBLDRDQUFBLFlBQUE7QUFJRSxhQUFBLGVBQUEsQ0FBQSxjQUFBLEVBQTBDO0FBQUEsd0JBQUEsSUFBQSxFQUFBLGVBQUE7O0FBQUEsWUFBQSxTQUFBLGVBQUEsTUFBQTtBQUFBLFlBQUEsUUFBQSxlQUFBLEtBQUE7O0FBRXhDLGFBQUEsSUFBQSxHQUFZLElBQUEsV0FBQSxDQUFaLE1BQVksQ0FBWjtBQUNBLGFBQUEsS0FBQSxHQUFBLEtBQUE7QUFDRDtBQUVEO0FBQ0E7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QUEsRUFBQSxHQUFBLEVBQTJEO0FBQ3pELFFBQUksSUFBQSxLQUFBLEtBQUosU0FBQSxFQUE2QjtBQUMzQixlQUFPLElBQUEsS0FBQSxDQUFBLEtBQUEsRUFBUCxHQUFPLENBQVA7QUFDRDtBQUVELFFBQUksTUFBTSxJQUFBLFdBQUEsQ0FBVixHQUFVLENBQVY7QUFFQSxXQUFPLFFBQVAsR0FBQSxFQUFBLE9BQUEsRUFBNkI7QUFDM0IsWUFBQSxLQUFBLElBQWEsSUFBYixLQUFhLENBQWI7QUFDRDtBQUVELFdBQUEsR0FBQTtBQUNEO0FBRUQsU0FBQSxPQUFBLENBQUEsS0FBQSxFQUFBLE1BQUEsRUFBK0M7QUFDN0MsUUFBQSxLQUFBLEVBQVc7QUFDVCxlQUFPLE1BQU0sU0FBTixDQUFBLENBQVAsaUJBQU8sQ0FBUDtBQURGLEtBQUEsTUFFTztBQUNMLGVBQU8sQ0FBUCxDQUFBO0FBQ0Q7QUFDRjtBQUVELFNBQUEsWUFBQSxDQUFBLEtBQUEsRUFBQSxNQUFBLEVBQW9EO0FBQ2xELFFBQUksT0FBTyxNQUFNLFNBQU4sQ0FBQSxDQUFYLGlCQUFXLENBQVg7QUFDQSxXQUFPLFFBQVAsQ0FBQTtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQ29tcGlsZVRpbWVIZWFwLFxuICBTZXJpYWxpemVkSGVhcCxcbiAgU1RETGliLFxuICBSdW50aW1lSGVhcCxcbiAgU3RkbGliT3BlcmFuZCxcbiAgUnVudGltZUNvbnN0YW50cyxcbiAgUnVudGltZVByb2dyYW0sXG4gIENvbXBpbGVyQXJ0aWZhY3RzLFxufSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IERFQlVHIH0gZnJvbSAnQGdsaW1tZXIvbG9jYWwtZGVidWctZmxhZ3MnO1xuaW1wb3J0IHsgUnVudGltZUNvbnN0YW50c0ltcGwgfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBSdW50aW1lT3BJbXBsIH0gZnJvbSAnLi9vcGNvZGUnO1xuaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5cbmNvbnN0IGVudW0gVGFibGVTbG90U3RhdGUge1xuICBBbGxvY2F0ZWQsXG4gIEZyZWVkLFxuICBQdXJnZWQsXG4gIFBvaW50ZXIsXG59XG5cbmNvbnN0IGVudW0gU2l6ZSB7XG4gIEVOVFJZX1NJWkUgPSAzLFxuICBJTkZPX09GRlNFVCA9IDEsXG4gIFNJWkVfT0ZGU0VUID0gMixcbiAgTUFYX1NJWkUgPSAwYjExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEsXG4gIFNDT1BFX01BU0sgPSAwYjExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDAsXG4gIFNUQVRFX01BU0sgPSAwYjExLFxufVxuXG5mdW5jdGlvbiBlbmNvZGVUYWJsZUluZm8oc2NvcGVTaXplOiBudW1iZXIsIHN0YXRlOiBudW1iZXIpIHtcbiAgYXNzZXJ0KHNjb3BlU2l6ZSA+IC0xICYmIHN0YXRlID4gLTEsICdTaXplLCBzY29wZVNpemUgb3Igc3RhdGUgd2VyZSBsZXNzIHRoYW4gMCcpO1xuICBhc3NlcnQoc3RhdGUgPCAxIDw8IDIsICdTdGF0ZSBpcyBtb3JlIHRoYW4gMiBiaXRzJyk7XG4gIGFzc2VydChzY29wZVNpemUgPCAxIDw8IDMwLCAnU2NvcGUgaXMgbW9yZSB0aGFuIDMwLWJpdHMnKTtcbiAgcmV0dXJuIHN0YXRlIHwgKHNjb3BlU2l6ZSA8PCAyKTtcbn1cblxuZnVuY3Rpb24gY2hhbmdlU3RhdGUoaW5mbzogbnVtYmVyLCBuZXdTdGF0ZTogbnVtYmVyKSB7XG4gIGFzc2VydChpbmZvID4gLTEgJiYgbmV3U3RhdGUgPiAtMSwgJ0luZm8gb3Igc3RhdGUgd2VyZSBsZXNzIHRoYW4gMCcpO1xuICBhc3NlcnQobmV3U3RhdGUgPCAxIDw8IDIsICdTdGF0ZSBpcyBtb3JlIHRoYW4gMiBiaXRzJyk7XG4gIGFzc2VydChpbmZvIDwgMSA8PCAzMCwgJ0luZm8gaXMgbW9yZSB0aGFuIDMwIGJpdHMnKTtcblxuICByZXR1cm4gaW5mbyB8IChuZXdTdGF0ZSA8PCAzMCk7XG59XG5cbmV4cG9ydCB0eXBlIFBsYWNlaG9sZGVyID0gW251bWJlciwgKCkgPT4gbnVtYmVyXTtcbmV4cG9ydCB0eXBlIFN0ZGxpYlBsYWNlaG9sZGVyID0gW251bWJlciwgU3RkbGliT3BlcmFuZF07XG5cbmNvbnN0IFBBR0VfU0laRSA9IDB4MTAwMDAwO1xuXG5leHBvcnQgY2xhc3MgUnVudGltZUhlYXBJbXBsIGltcGxlbWVudHMgUnVudGltZUhlYXAge1xuICBwcml2YXRlIGhlYXA6IFVpbnQzMkFycmF5O1xuICBwcml2YXRlIHRhYmxlOiBudW1iZXJbXTtcblxuICBjb25zdHJ1Y3RvcihzZXJpYWxpemVkSGVhcDogU2VyaWFsaXplZEhlYXApIHtcbiAgICBsZXQgeyBidWZmZXIsIHRhYmxlIH0gPSBzZXJpYWxpemVkSGVhcDtcbiAgICB0aGlzLmhlYXAgPSBuZXcgVWludDMyQXJyYXkoYnVmZmVyKTtcbiAgICB0aGlzLnRhYmxlID0gdGFibGU7XG4gIH1cblxuICAvLyBJdCBpcyBpbGxlZ2FsIHRvIGNsb3NlIG92ZXIgdGhpcyBhZGRyZXNzLCBhcyBjb21wYWN0aW9uXG4gIC8vIG1heSBtb3ZlIGl0LiBIb3dldmVyLCBpdCBpcyBsZWdhbCB0byB1c2UgdGhpcyBhZGRyZXNzXG4gIC8vIG11bHRpcGxlIHRpbWVzIGJldHdlZW4gY29tcGFjdGlvbnMuXG4gIGdldGFkZHIoaGFuZGxlOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnRhYmxlW2hhbmRsZV07XG4gIH1cblxuICBnZXRieWFkZHIoYWRkcmVzczogbnVtYmVyKTogbnVtYmVyIHtcbiAgICBhc3NlcnQodGhpcy5oZWFwW2FkZHJlc3NdICE9PSB1bmRlZmluZWQsICdBY2Nlc3MgbWVtb3J5IG91dCBvZiBib3VuZHMgb2YgdGhlIGhlYXAnKTtcbiAgICByZXR1cm4gdGhpcy5oZWFwW2FkZHJlc3NdO1xuICB9XG5cbiAgc2l6ZW9mKGhhbmRsZTogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gc2l6ZW9mKHRoaXMudGFibGUsIGhhbmRsZSk7XG4gIH1cblxuICBzY29wZXNpemVvZihoYW5kbGU6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIHNjb3Blc2l6ZW9mKHRoaXMudGFibGUsIGhhbmRsZSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGh5ZHJhdGVIZWFwKHNlcmlhbGl6ZWRIZWFwOiBTZXJpYWxpemVkSGVhcCk6IFJ1bnRpbWVIZWFwIHtcbiAgcmV0dXJuIG5ldyBSdW50aW1lSGVhcEltcGwoc2VyaWFsaXplZEhlYXApO1xufVxuXG4vKipcbiAqIFRoZSBIZWFwIGlzIHJlc3BvbnNpYmxlIGZvciBkeW5hbWljYWxseSBhbGxvY2F0aW5nXG4gKiBtZW1vcnkgaW4gd2hpY2ggd2UgcmVhZC93cml0ZSB0aGUgVk0ncyBpbnN0cnVjdGlvbnNcbiAqIGZyb20vdG8uIFdoZW4gd2UgbWFsbG9jIHdlIHBhc3Mgb3V0IGEgVk1IYW5kbGUsIHdoaWNoXG4gKiBpcyB1c2VkIGFzIGFuIGluZGlyZWN0IHdheSBvZiBhY2Nlc3NpbmcgdGhlIG1lbW9yeSBkdXJpbmdcbiAqIGV4ZWN1dGlvbiBvZiB0aGUgVk0uIEludGVybmFsbHkgd2UgdHJhY2sgdGhlIGRpZmZlcmVudFxuICogcmVnaW9ucyBvZiB0aGUgbWVtb3J5IGluIGFuIGludCBhcnJheSBrbm93biBhcyB0aGUgdGFibGUuXG4gKlxuICogVGhlIHRhYmxlIDMyLWJpdCBhbGlnbmVkIGFuZCBoYXMgdGhlIGZvbGxvd2luZyBsYXlvdXQ6XG4gKlxuICogfCAuLi4gfCBocCAodTMyKSB8ICAgICAgIGluZm8gKHUzMikgICB8IHNpemUgKHUzMikgfFxuICogfCAuLi4gfCAgSGFuZGxlICB8IFNjb3BlIFNpemUgfCBTdGF0ZSB8IFNpemUgICAgICAgfFxuICogfCAuLi4gfCAzMmJpdHMgICB8IDMwYml0cyAgICAgfCAyYml0cyB8IDMyYml0ICAgICAgfFxuICpcbiAqIFdpdGggdGhpcyBpbmZvcm1hdGlvbiB3ZSBlZmZlY3RpdmVseSBoYXZlIHRoZSBhYmlsaXR5IHRvXG4gKiBjb250cm9sIHdoZW4gd2Ugd2FudCB0byBmcmVlIG1lbW9yeS4gVGhhdCBiZWluZyBzYWlkIHlvdVxuICogY2FuIG5vdCBmcmVlIGR1cmluZyBleGVjdXRpb24gYXMgcmF3IGFkZHJlc3MgYXJlIG9ubHlcbiAqIHZhbGlkIGR1cmluZyB0aGUgZXhlY3V0aW9uLiBUaGlzIG1lYW5zIHlvdSBjYW5ub3QgY2xvc2VcbiAqIG92ZXIgdGhlbSBhcyB5b3Ugd2lsbCBoYXZlIGEgYmFkIG1lbW9yeSBhY2Nlc3MgZXhjZXB0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgSGVhcEltcGwgaW1wbGVtZW50cyBDb21waWxlVGltZUhlYXAsIFJ1bnRpbWVIZWFwIHtcbiAgcHJpdmF0ZSBoZWFwOiBVaW50MzJBcnJheTtcbiAgcHJpdmF0ZSBwbGFjZWhvbGRlcnM6IFBsYWNlaG9sZGVyW10gPSBbXTtcbiAgcHJpdmF0ZSBzdGRsaWJzOiBTdGRsaWJQbGFjZWhvbGRlcltdID0gW107XG4gIHByaXZhdGUgdGFibGU6IG51bWJlcltdO1xuICBwcml2YXRlIG9mZnNldCA9IDA7XG4gIHByaXZhdGUgaGFuZGxlID0gMDtcbiAgcHJpdmF0ZSBjYXBhY2l0eSA9IFBBR0VfU0laRTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmhlYXAgPSBuZXcgVWludDMyQXJyYXkoUEFHRV9TSVpFKTtcbiAgICB0aGlzLnRhYmxlID0gW107XG4gIH1cblxuICBwdXNoKGl0ZW06IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuc2l6ZUNoZWNrKCk7XG4gICAgdGhpcy5oZWFwW3RoaXMub2Zmc2V0KytdID0gaXRlbTtcbiAgfVxuXG4gIHByaXZhdGUgc2l6ZUNoZWNrKCkge1xuICAgIGlmICh0aGlzLmNhcGFjaXR5ID09PSAwKSB7XG4gICAgICBsZXQgaGVhcCA9IHNsaWNlKHRoaXMuaGVhcCwgMCwgdGhpcy5vZmZzZXQpO1xuICAgICAgdGhpcy5oZWFwID0gbmV3IFVpbnQzMkFycmF5KGhlYXAubGVuZ3RoICsgUEFHRV9TSVpFKTtcbiAgICAgIHRoaXMuaGVhcC5zZXQoaGVhcCwgMCk7XG4gICAgICB0aGlzLmNhcGFjaXR5ID0gUEFHRV9TSVpFO1xuICAgIH1cbiAgICB0aGlzLmNhcGFjaXR5LS07XG4gIH1cblxuICBnZXRieWFkZHIoYWRkcmVzczogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5oZWFwW2FkZHJlc3NdO1xuICB9XG5cbiAgc2V0YnlhZGRyKGFkZHJlc3M6IG51bWJlciwgdmFsdWU6IG51bWJlcikge1xuICAgIHRoaXMuaGVhcFthZGRyZXNzXSA9IHZhbHVlO1xuICB9XG5cbiAgbWFsbG9jKCk6IG51bWJlciB7XG4gICAgLy8gcHVzaCBvZmZzZXQsIGluZm8sIHNpemVcbiAgICB0aGlzLnRhYmxlLnB1c2godGhpcy5vZmZzZXQsIDAsIDApO1xuICAgIGxldCBoYW5kbGUgPSB0aGlzLmhhbmRsZTtcbiAgICB0aGlzLmhhbmRsZSArPSBTaXplLkVOVFJZX1NJWkU7XG4gICAgcmV0dXJuIGhhbmRsZTtcbiAgfVxuXG4gIGZpbmlzaE1hbGxvYyhoYW5kbGU6IG51bWJlciwgc2NvcGVTaXplOiBudW1iZXIpOiB2b2lkIHtcbiAgICBpZiAoREVCVUcpIHtcbiAgICAgIGxldCBzdGFydCA9IHRoaXMudGFibGVbaGFuZGxlXTtcbiAgICAgIGxldCBmaW5pc2ggPSB0aGlzLm9mZnNldDtcbiAgICAgIGxldCBpbnN0cnVjdGlvblNpemUgPSBmaW5pc2ggLSBzdGFydDtcbiAgICAgIHRoaXMudGFibGVbaGFuZGxlICsgU2l6ZS5TSVpFX09GRlNFVF0gPSBpbnN0cnVjdGlvblNpemU7XG4gICAgfVxuICAgIHRoaXMudGFibGVbaGFuZGxlICsgU2l6ZS5JTkZPX09GRlNFVF0gPSBlbmNvZGVUYWJsZUluZm8oc2NvcGVTaXplLCBUYWJsZVNsb3RTdGF0ZS5BbGxvY2F0ZWQpO1xuICB9XG5cbiAgc2l6ZSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLm9mZnNldDtcbiAgfVxuXG4gIC8vIEl0IGlzIGlsbGVnYWwgdG8gY2xvc2Ugb3ZlciB0aGlzIGFkZHJlc3MsIGFzIGNvbXBhY3Rpb25cbiAgLy8gbWF5IG1vdmUgaXQuIEhvd2V2ZXIsIGl0IGlzIGxlZ2FsIHRvIHVzZSB0aGlzIGFkZHJlc3NcbiAgLy8gbXVsdGlwbGUgdGltZXMgYmV0d2VlbiBjb21wYWN0aW9ucy5cbiAgZ2V0YWRkcihoYW5kbGU6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMudGFibGVbaGFuZGxlXTtcbiAgfVxuXG4gIGdldGhhbmRsZShhZGRyZXNzOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHRoaXMudGFibGUucHVzaChhZGRyZXNzLCBlbmNvZGVUYWJsZUluZm8oMCwgVGFibGVTbG90U3RhdGUuUG9pbnRlciksIDApO1xuICAgIGxldCBoYW5kbGUgPSB0aGlzLmhhbmRsZTtcbiAgICB0aGlzLmhhbmRsZSArPSBTaXplLkVOVFJZX1NJWkU7XG4gICAgcmV0dXJuIGhhbmRsZTtcbiAgfVxuXG4gIHNpemVvZihoYW5kbGU6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIHNpemVvZih0aGlzLnRhYmxlLCBoYW5kbGUpO1xuICB9XG5cbiAgc2NvcGVzaXplb2YoaGFuZGxlOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiBzY29wZXNpemVvZih0aGlzLnRhYmxlLCBoYW5kbGUpO1xuICB9XG5cbiAgZnJlZShoYW5kbGU6IG51bWJlcik6IHZvaWQge1xuICAgIGxldCBpbmZvID0gdGhpcy50YWJsZVtoYW5kbGUgKyBTaXplLklORk9fT0ZGU0VUXTtcbiAgICB0aGlzLnRhYmxlW2hhbmRsZSArIFNpemUuSU5GT19PRkZTRVRdID0gY2hhbmdlU3RhdGUoaW5mbywgVGFibGVTbG90U3RhdGUuRnJlZWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBoZWFwIHVzZXMgdGhlIFtNYXJrLUNvbXBhY3QgQWxnb3JpdGhtXShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9NYXJrLWNvbXBhY3RfYWxnb3JpdGhtKSB0byBzaGlmdFxuICAgKiByZWFjaGFibGUgbWVtb3J5IHRvIHRoZSBib3R0b20gb2YgdGhlIGhlYXAgYW5kIGZyZWVhYmxlXG4gICAqIG1lbW9yeSB0byB0aGUgdG9wIG9mIHRoZSBoZWFwLiBXaGVuIHdlIGhhdmUgc2hpZnRlZCBhbGxcbiAgICogdGhlIHJlYWNoYWJsZSBtZW1vcnkgdG8gdGhlIHRvcCBvZiB0aGUgaGVhcCwgd2UgbW92ZSB0aGVcbiAgICogb2Zmc2V0IHRvIHRoZSBuZXh0IGZyZWUgcG9zaXRpb24uXG4gICAqL1xuICBjb21wYWN0KCk6IHZvaWQge1xuICAgIGxldCBjb21wYWN0ZWRTaXplID0gMDtcbiAgICBsZXQge1xuICAgICAgdGFibGUsXG4gICAgICB0YWJsZTogeyBsZW5ndGggfSxcbiAgICAgIGhlYXAsXG4gICAgfSA9IHRoaXM7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSArPSBTaXplLkVOVFJZX1NJWkUpIHtcbiAgICAgIGxldCBvZmZzZXQgPSB0YWJsZVtpXTtcbiAgICAgIGxldCBpbmZvID0gdGFibGVbaSArIFNpemUuSU5GT19PRkZTRVRdO1xuICAgICAgLy8gQHRzLWlnbm9yZSAodGhpcyB3aG9sZSBmdW5jdGlvbiBpcyBjdXJyZW50bHkgdW51c2VkKVxuICAgICAgbGV0IHNpemUgPSBpbmZvICYgU2l6ZS5TSVpFX01BU0s7XG4gICAgICBsZXQgc3RhdGUgPSBpbmZvICYgKFNpemUuU1RBVEVfTUFTSyA+PiAzMCk7XG5cbiAgICAgIGlmIChzdGF0ZSA9PT0gVGFibGVTbG90U3RhdGUuUHVyZ2VkKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gVGFibGVTbG90U3RhdGUuRnJlZWQpIHtcbiAgICAgICAgLy8gdHJhbnNpdGlvbiB0byBcImFscmVhZHkgZnJlZWRcIiBha2EgXCJwdXJnZWRcIlxuICAgICAgICAvLyBhIGdvb2QgaW1wcm92ZW1lbnQgd291bGQgYmUgdG8gcmV1c2VcbiAgICAgICAgLy8gdGhlc2Ugc2xvdHNcbiAgICAgICAgdGFibGVbaSArIFNpemUuSU5GT19PRkZTRVRdID0gY2hhbmdlU3RhdGUoaW5mbywgVGFibGVTbG90U3RhdGUuUHVyZ2VkKTtcbiAgICAgICAgY29tcGFjdGVkU2l6ZSArPSBzaXplO1xuICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gVGFibGVTbG90U3RhdGUuQWxsb2NhdGVkKSB7XG4gICAgICAgIGZvciAobGV0IGogPSBvZmZzZXQ7IGogPD0gaSArIHNpemU7IGorKykge1xuICAgICAgICAgIGhlYXBbaiAtIGNvbXBhY3RlZFNpemVdID0gaGVhcFtqXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRhYmxlW2ldID0gb2Zmc2V0IC0gY29tcGFjdGVkU2l6ZTtcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IFRhYmxlU2xvdFN0YXRlLlBvaW50ZXIpIHtcbiAgICAgICAgdGFibGVbaV0gPSBvZmZzZXQgLSBjb21wYWN0ZWRTaXplO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMub2Zmc2V0ID0gdGhpcy5vZmZzZXQgLSBjb21wYWN0ZWRTaXplO1xuICB9XG5cbiAgcHVzaFBsYWNlaG9sZGVyKHZhbHVlRnVuYzogKCkgPT4gbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5zaXplQ2hlY2soKTtcbiAgICBsZXQgYWRkcmVzcyA9IHRoaXMub2Zmc2V0Kys7XG4gICAgdGhpcy5oZWFwW2FkZHJlc3NdID0gU2l6ZS5NQVhfU0laRTtcbiAgICB0aGlzLnBsYWNlaG9sZGVycy5wdXNoKFthZGRyZXNzLCB2YWx1ZUZ1bmNdKTtcbiAgfVxuXG4gIHB1c2hTdGRsaWIob3BlcmFuZDogU3RkbGliT3BlcmFuZCk6IHZvaWQge1xuICAgIHRoaXMuc2l6ZUNoZWNrKCk7XG4gICAgbGV0IGFkZHJlc3MgPSB0aGlzLm9mZnNldCsrO1xuICAgIHRoaXMuaGVhcFthZGRyZXNzXSA9IFNpemUuTUFYX1NJWkU7XG4gICAgdGhpcy5zdGRsaWJzLnB1c2goW2FkZHJlc3MsIG9wZXJhbmRdKTtcbiAgfVxuXG4gIHByaXZhdGUgcGF0Y2hQbGFjZWhvbGRlcnMoKSB7XG4gICAgbGV0IHsgcGxhY2Vob2xkZXJzIH0gPSB0aGlzO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwbGFjZWhvbGRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBbYWRkcmVzcywgZ2V0VmFsdWVdID0gcGxhY2Vob2xkZXJzW2ldO1xuXG4gICAgICBhc3NlcnQoXG4gICAgICAgIHRoaXMuZ2V0YnlhZGRyKGFkZHJlc3MpID09PSBTaXplLk1BWF9TSVpFLFxuICAgICAgICBgZXhwZWN0ZWQgdG8gZmluZCBhIHBsYWNlaG9sZGVyIHZhbHVlIGF0ICR7YWRkcmVzc31gXG4gICAgICApO1xuICAgICAgdGhpcy5zZXRieWFkZHIoYWRkcmVzcywgZ2V0VmFsdWUoKSk7XG4gICAgfVxuICB9XG5cbiAgcGF0Y2hTdGRsaWJzKHN0ZGxpYjogU1RETGliKTogdm9pZCB7XG4gICAgbGV0IHsgc3RkbGlicyB9ID0gdGhpcztcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RkbGlicy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IFthZGRyZXNzLCB7IHZhbHVlIH1dID0gc3RkbGlic1tpXTtcblxuICAgICAgYXNzZXJ0KFxuICAgICAgICB0aGlzLmdldGJ5YWRkcihhZGRyZXNzKSA9PT0gU2l6ZS5NQVhfU0laRSxcbiAgICAgICAgYGV4cGVjdGVkIHRvIGZpbmQgYSBwbGFjZWhvbGRlciB2YWx1ZSBhdCAke2FkZHJlc3N9YFxuICAgICAgKTtcbiAgICAgIHRoaXMuc2V0YnlhZGRyKGFkZHJlc3MsIHN0ZGxpYlt2YWx1ZV0pO1xuICAgIH1cblxuICAgIHRoaXMuc3RkbGlicyA9IFtdO1xuICB9XG5cbiAgY2FwdHVyZShzdGRsaWI6IFNURExpYiwgb2Zmc2V0ID0gdGhpcy5vZmZzZXQpOiBTZXJpYWxpemVkSGVhcCB7XG4gICAgdGhpcy5wYXRjaFBsYWNlaG9sZGVycygpO1xuICAgIHRoaXMucGF0Y2hTdGRsaWJzKHN0ZGxpYik7XG5cbiAgICAvLyBPbmx5IGNhbGxlZCBpbiBlYWdlciBtb2RlXG4gICAgbGV0IGJ1ZmZlciA9IHNsaWNlKHRoaXMuaGVhcCwgMCwgb2Zmc2V0KS5idWZmZXI7XG4gICAgcmV0dXJuIHtcbiAgICAgIGhhbmRsZTogdGhpcy5oYW5kbGUsXG4gICAgICB0YWJsZTogdGhpcy50YWJsZSxcbiAgICAgIGJ1ZmZlcjogYnVmZmVyIGFzIEFycmF5QnVmZmVyLFxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJ1bnRpbWVQcm9ncmFtSW1wbCBpbXBsZW1lbnRzIFJ1bnRpbWVQcm9ncmFtIHtcbiAgW2tleTogbnVtYmVyXTogbmV2ZXI7XG5cbiAgc3RhdGljIGh5ZHJhdGUoYXJ0aWZhY3RzOiBDb21waWxlckFydGlmYWN0cykge1xuICAgIGxldCBoZWFwID0gbmV3IFJ1bnRpbWVIZWFwSW1wbChhcnRpZmFjdHMuaGVhcCk7XG4gICAgbGV0IGNvbnN0YW50cyA9IG5ldyBSdW50aW1lQ29uc3RhbnRzSW1wbChhcnRpZmFjdHMuY29uc3RhbnRzKTtcblxuICAgIHJldHVybiBuZXcgUnVudGltZVByb2dyYW1JbXBsKGNvbnN0YW50cywgaGVhcCk7XG4gIH1cblxuICBwcml2YXRlIF9vcGNvZGU6IFJ1bnRpbWVPcEltcGw7XG5cbiAgY29uc3RydWN0b3IocHVibGljIGNvbnN0YW50czogUnVudGltZUNvbnN0YW50cywgcHVibGljIGhlYXA6IFJ1bnRpbWVIZWFwKSB7XG4gICAgdGhpcy5fb3Bjb2RlID0gbmV3IFJ1bnRpbWVPcEltcGwodGhpcy5oZWFwKTtcbiAgfVxuXG4gIG9wY29kZShvZmZzZXQ6IG51bWJlcik6IFJ1bnRpbWVPcEltcGwge1xuICAgIHRoaXMuX29wY29kZS5vZmZzZXQgPSBvZmZzZXQ7XG4gICAgcmV0dXJuIHRoaXMuX29wY29kZTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaHlkcmF0ZVByb2dyYW0oYXJ0aWZhY3RzOiBDb21waWxlckFydGlmYWN0cyk6IFJ1bnRpbWVQcm9ncmFtIHtcbiAgbGV0IGhlYXAgPSBuZXcgUnVudGltZUhlYXBJbXBsKGFydGlmYWN0cy5oZWFwKTtcbiAgbGV0IGNvbnN0YW50cyA9IG5ldyBSdW50aW1lQ29uc3RhbnRzSW1wbChhcnRpZmFjdHMuY29uc3RhbnRzKTtcblxuICByZXR1cm4gbmV3IFJ1bnRpbWVQcm9ncmFtSW1wbChjb25zdGFudHMsIGhlYXApO1xufVxuXG5mdW5jdGlvbiBzbGljZShhcnI6IFVpbnQzMkFycmF5LCBzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcik6IFVpbnQzMkFycmF5IHtcbiAgaWYgKGFyci5zbGljZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGFyci5zbGljZShzdGFydCwgZW5kKTtcbiAgfVxuXG4gIGxldCByZXQgPSBuZXcgVWludDMyQXJyYXkoZW5kKTtcblxuICBmb3IgKDsgc3RhcnQgPCBlbmQ7IHN0YXJ0KyspIHtcbiAgICByZXRbc3RhcnRdID0gYXJyW3N0YXJ0XTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59XG5cbmZ1bmN0aW9uIHNpemVvZih0YWJsZTogbnVtYmVyW10sIGhhbmRsZTogbnVtYmVyKSB7XG4gIGlmIChERUJVRykge1xuICAgIHJldHVybiB0YWJsZVtoYW5kbGUgKyBTaXplLlNJWkVfT0ZGU0VUXTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gLTE7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2NvcGVzaXplb2YodGFibGU6IG51bWJlcltdLCBoYW5kbGU6IG51bWJlcikge1xuICBsZXQgaW5mbyA9IHRhYmxlW2hhbmRsZSArIFNpemUuSU5GT19PRkZTRVRdO1xuICByZXR1cm4gaW5mbyA+PiAyO1xufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==