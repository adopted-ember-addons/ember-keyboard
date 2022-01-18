function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { RuntimeConstantsImpl } from './constants';
import { RuntimeOpImpl } from './opcode';
import { assert } from '@glimmer/util';
function encodeTableInfo(scopeSize, state) {
    false && assert(scopeSize > -1 && state > -1, 'Size, scopeSize or state were less than 0');
    false && assert(state < 1 << 2, 'State is more than 2 bits');
    false && assert(scopeSize < 1 << 30, 'Scope is more than 30-bits');

    return state | scopeSize << 2;
}
function changeState(info, newState) {
    false && assert(info > -1 && newState > -1, 'Info or state were less than 0');
    false && assert(newState < 1 << 2, 'State is more than 2 bits');
    false && assert(info < 1 << 30, 'Info is more than 30 bits');

    return info | newState << 30;
}
var PAGE_SIZE = 0x100000;
export var RuntimeHeapImpl = function () {
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
        false && assert(this.heap[address] !== undefined, 'Access memory out of bounds of the heap');

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
export function hydrateHeap(serializedHeap) {
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
export var HeapImpl = function () {
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

            false && assert(this.getbyaddr(address) === 2147483647 /* MAX_SIZE */, 'expected to find a placeholder value at ' + address);

            this.setbyaddr(address, getValue());
        }
    };

    HeapImpl.prototype.patchStdlibs = function patchStdlibs(stdlib) {
        var stdlibs = this.stdlibs;

        for (var i = 0; i < stdlibs.length; i++) {
            var _stdlibs$i = stdlibs[i],
                address = _stdlibs$i[0],
                value = _stdlibs$i[1].value;

            false && assert(this.getbyaddr(address) === 2147483647 /* MAX_SIZE */, 'expected to find a placeholder value at ' + address);

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
export var RuntimeProgramImpl = function () {
    function RuntimeProgramImpl(constants, heap) {
        _classCallCheck(this, RuntimeProgramImpl);

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
export function hydrateProgram(artifacts) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3Byb2dyYW0vbGliL3Byb2dyYW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFXQSxTQUFBLG9CQUFBLFFBQUEsYUFBQTtBQUNBLFNBQUEsYUFBQSxRQUFBLFVBQUE7QUFDQSxTQUFBLE1BQUEsUUFBQSxlQUFBO0FBa0JBLFNBQUEsZUFBQSxDQUFBLFNBQUEsRUFBQSxLQUFBLEVBQXlEO0FBQUEsYUFDdkQsT0FBTyxZQUFZLENBQVosQ0FBQSxJQUFrQixRQUFRLENBQWpDLENBQUEsRUFEdUQsMkNBQ3ZELENBRHVEO0FBQUEsYUFFdkQsT0FBTyxRQUFRLEtBQWYsQ0FBQSxFQUZ1RCwyQkFFdkQsQ0FGdUQ7QUFBQSxhQUd2RCxPQUFPLFlBQVksS0FBbkIsRUFBQSxFQUh1RCw0QkFHdkQsQ0FIdUQ7O0FBSXZELFdBQU8sUUFBUyxhQUFoQixDQUFBO0FBQ0Q7QUFFRCxTQUFBLFdBQUEsQ0FBQSxJQUFBLEVBQUEsUUFBQSxFQUFtRDtBQUFBLGFBQ2pELE9BQU8sT0FBTyxDQUFQLENBQUEsSUFBYSxXQUFXLENBQS9CLENBQUEsRUFEaUQsZ0NBQ2pELENBRGlEO0FBQUEsYUFFakQsT0FBTyxXQUFXLEtBQWxCLENBQUEsRUFGaUQsMkJBRWpELENBRmlEO0FBQUEsYUFHakQsT0FBTyxPQUFPLEtBQWQsRUFBQSxFQUhpRCwyQkFHakQsQ0FIaUQ7O0FBS2pELFdBQU8sT0FBUSxZQUFmLEVBQUE7QUFDRDtBQUtELElBQU0sWUFBTixRQUFBO0FBRUEsV0FBTSxlQUFOO0FBSUUsNkJBQUEsY0FBQSxFQUEwQztBQUFBOztBQUFBLFlBQ3BDLE1BRG9DLEdBQ3hDLGNBRHdDLENBQ3BDLE1BRG9DO0FBQUEsWUFDcEMsS0FEb0MsR0FDeEMsY0FEd0MsQ0FDcEMsS0FEb0M7O0FBRXhDLGFBQUEsSUFBQSxHQUFZLElBQUEsV0FBQSxDQUFaLE1BQVksQ0FBWjtBQUNBLGFBQUEsS0FBQSxHQUFBLEtBQUE7QUFDRDtBQUVE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O0FBQ0QsS0FuQkg7O0FBQUE7QUFBQTtBQXNCQSxPQUFNLFNBQUEsY0FBQSxDQUFBLFNBQUEsRUFBcUQ7QUFDekQsUUFBSSxPQUFPLElBQUEsZUFBQSxDQUFvQixVQUEvQixJQUFXLENBQVg7QUFDQSxRQUFJLFlBQVksSUFBQSxvQkFBQSxDQUF5QixVQUF6QyxTQUFnQixDQUFoQjtBQUVBLFdBQU8sSUFBQSxrQkFBQSxDQUFBLFNBQUEsRUFBUCxJQUFPLENBQVA7QUFDRDtBQUVELFNBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsR0FBQSxFQUEyRDtBQUN6RCxRQUFJLElBQUEsS0FBQSxLQUFKLFNBQUEsRUFBNkI7QUFDM0IsZUFBTyxJQUFBLEtBQUEsQ0FBQSxLQUFBLEVBQVAsR0FBTyxDQUFQO0FBQ0Q7QUFFRCxRQUFJLE1BQU0sSUFBQSxXQUFBLENBQVYsR0FBVSxDQUFWO0FBRUEsV0FBTyxRQUFQLEdBQUEsRUFBQSxPQUFBLEVBQTZCO0FBQzNCLFlBQUEsS0FBQSxJQUFhLElBQWIsS0FBYSxDQUFiO0FBQ0Q7QUFFRCxXQUFBLEdBQUE7QUFDRDtBQUVELFNBQUEsT0FBQSxDQUFBLEtBQUEsRUFBQSxNQUFBLEVBQStDO0FBQzdDLFFBQUEsS0FBQSxFQUFXO0FBQ1QsZUFBTyxNQUFNLFNBQU4sQ0FBQSxDQUFQLGlCQUFPLENBQVA7QUFERixLQUFBLE1BRU87QUFDTCxlQUFPLENBQVAsQ0FBQTtBQUNEO0FBQ0Y7QUFFRCxTQUFBLFlBQUEsQ0FBQSxLQUFBLEVBQUEsTUFBQSxFQUFvRDtBQUNsRCxRQUFJLE9BQU8sTUFBTSxTQUFOLENBQUEsQ0FBWCxpQkFBVyxDQUFYO0FBQ0EsV0FBTyxRQUFQLENBQUE7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIENvbXBpbGVUaW1lSGVhcCxcbiAgU2VyaWFsaXplZEhlYXAsXG4gIFNURExpYixcbiAgUnVudGltZUhlYXAsXG4gIFN0ZGxpYk9wZXJhbmQsXG4gIFJ1bnRpbWVDb25zdGFudHMsXG4gIFJ1bnRpbWVQcm9ncmFtLFxuICBDb21waWxlckFydGlmYWN0cyxcbn0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBERUJVRyB9IGZyb20gJ0BnbGltbWVyL2xvY2FsLWRlYnVnLWZsYWdzJztcbmltcG9ydCB7IFJ1bnRpbWVDb25zdGFudHNJbXBsIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHsgUnVudGltZU9wSW1wbCB9IGZyb20gJy4vb3Bjb2RlJztcbmltcG9ydCB7IGFzc2VydCB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuXG5jb25zdCBlbnVtIFRhYmxlU2xvdFN0YXRlIHtcbiAgQWxsb2NhdGVkLFxuICBGcmVlZCxcbiAgUHVyZ2VkLFxuICBQb2ludGVyLFxufVxuXG5jb25zdCBlbnVtIFNpemUge1xuICBFTlRSWV9TSVpFID0gMyxcbiAgSU5GT19PRkZTRVQgPSAxLFxuICBTSVpFX09GRlNFVCA9IDIsXG4gIE1BWF9TSVpFID0gMGIxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExLFxuICBTQ09QRV9NQVNLID0gMGIxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAwLFxuICBTVEFURV9NQVNLID0gMGIxMSxcbn1cblxuZnVuY3Rpb24gZW5jb2RlVGFibGVJbmZvKHNjb3BlU2l6ZTogbnVtYmVyLCBzdGF0ZTogbnVtYmVyKSB7XG4gIGFzc2VydChzY29wZVNpemUgPiAtMSAmJiBzdGF0ZSA+IC0xLCAnU2l6ZSwgc2NvcGVTaXplIG9yIHN0YXRlIHdlcmUgbGVzcyB0aGFuIDAnKTtcbiAgYXNzZXJ0KHN0YXRlIDwgMSA8PCAyLCAnU3RhdGUgaXMgbW9yZSB0aGFuIDIgYml0cycpO1xuICBhc3NlcnQoc2NvcGVTaXplIDwgMSA8PCAzMCwgJ1Njb3BlIGlzIG1vcmUgdGhhbiAzMC1iaXRzJyk7XG4gIHJldHVybiBzdGF0ZSB8IChzY29wZVNpemUgPDwgMik7XG59XG5cbmZ1bmN0aW9uIGNoYW5nZVN0YXRlKGluZm86IG51bWJlciwgbmV3U3RhdGU6IG51bWJlcikge1xuICBhc3NlcnQoaW5mbyA+IC0xICYmIG5ld1N0YXRlID4gLTEsICdJbmZvIG9yIHN0YXRlIHdlcmUgbGVzcyB0aGFuIDAnKTtcbiAgYXNzZXJ0KG5ld1N0YXRlIDwgMSA8PCAyLCAnU3RhdGUgaXMgbW9yZSB0aGFuIDIgYml0cycpO1xuICBhc3NlcnQoaW5mbyA8IDEgPDwgMzAsICdJbmZvIGlzIG1vcmUgdGhhbiAzMCBiaXRzJyk7XG5cbiAgcmV0dXJuIGluZm8gfCAobmV3U3RhdGUgPDwgMzApO1xufVxuXG5leHBvcnQgdHlwZSBQbGFjZWhvbGRlciA9IFtudW1iZXIsICgpID0+IG51bWJlcl07XG5leHBvcnQgdHlwZSBTdGRsaWJQbGFjZWhvbGRlciA9IFtudW1iZXIsIFN0ZGxpYk9wZXJhbmRdO1xuXG5jb25zdCBQQUdFX1NJWkUgPSAweDEwMDAwMDtcblxuZXhwb3J0IGNsYXNzIFJ1bnRpbWVIZWFwSW1wbCBpbXBsZW1lbnRzIFJ1bnRpbWVIZWFwIHtcbiAgcHJpdmF0ZSBoZWFwOiBVaW50MzJBcnJheTtcbiAgcHJpdmF0ZSB0YWJsZTogbnVtYmVyW107XG5cbiAgY29uc3RydWN0b3Ioc2VyaWFsaXplZEhlYXA6IFNlcmlhbGl6ZWRIZWFwKSB7XG4gICAgbGV0IHsgYnVmZmVyLCB0YWJsZSB9ID0gc2VyaWFsaXplZEhlYXA7XG4gICAgdGhpcy5oZWFwID0gbmV3IFVpbnQzMkFycmF5KGJ1ZmZlcik7XG4gICAgdGhpcy50YWJsZSA9IHRhYmxlO1xuICB9XG5cbiAgLy8gSXQgaXMgaWxsZWdhbCB0byBjbG9zZSBvdmVyIHRoaXMgYWRkcmVzcywgYXMgY29tcGFjdGlvblxuICAvLyBtYXkgbW92ZSBpdC4gSG93ZXZlciwgaXQgaXMgbGVnYWwgdG8gdXNlIHRoaXMgYWRkcmVzc1xuICAvLyBtdWx0aXBsZSB0aW1lcyBiZXR3ZWVuIGNvbXBhY3Rpb25zLlxuICBnZXRhZGRyKGhhbmRsZTogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy50YWJsZVtoYW5kbGVdO1xuICB9XG5cbiAgZ2V0YnlhZGRyKGFkZHJlc3M6IG51bWJlcik6IG51bWJlciB7XG4gICAgYXNzZXJ0KHRoaXMuaGVhcFthZGRyZXNzXSAhPT0gdW5kZWZpbmVkLCAnQWNjZXNzIG1lbW9yeSBvdXQgb2YgYm91bmRzIG9mIHRoZSBoZWFwJyk7XG4gICAgcmV0dXJuIHRoaXMuaGVhcFthZGRyZXNzXTtcbiAgfVxuXG4gIHNpemVvZihoYW5kbGU6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIHNpemVvZih0aGlzLnRhYmxlLCBoYW5kbGUpO1xuICB9XG5cbiAgc2NvcGVzaXplb2YoaGFuZGxlOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiBzY29wZXNpemVvZih0aGlzLnRhYmxlLCBoYW5kbGUpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoeWRyYXRlSGVhcChzZXJpYWxpemVkSGVhcDogU2VyaWFsaXplZEhlYXApOiBSdW50aW1lSGVhcCB7XG4gIHJldHVybiBuZXcgUnVudGltZUhlYXBJbXBsKHNlcmlhbGl6ZWRIZWFwKTtcbn1cblxuLyoqXG4gKiBUaGUgSGVhcCBpcyByZXNwb25zaWJsZSBmb3IgZHluYW1pY2FsbHkgYWxsb2NhdGluZ1xuICogbWVtb3J5IGluIHdoaWNoIHdlIHJlYWQvd3JpdGUgdGhlIFZNJ3MgaW5zdHJ1Y3Rpb25zXG4gKiBmcm9tL3RvLiBXaGVuIHdlIG1hbGxvYyB3ZSBwYXNzIG91dCBhIFZNSGFuZGxlLCB3aGljaFxuICogaXMgdXNlZCBhcyBhbiBpbmRpcmVjdCB3YXkgb2YgYWNjZXNzaW5nIHRoZSBtZW1vcnkgZHVyaW5nXG4gKiBleGVjdXRpb24gb2YgdGhlIFZNLiBJbnRlcm5hbGx5IHdlIHRyYWNrIHRoZSBkaWZmZXJlbnRcbiAqIHJlZ2lvbnMgb2YgdGhlIG1lbW9yeSBpbiBhbiBpbnQgYXJyYXkga25vd24gYXMgdGhlIHRhYmxlLlxuICpcbiAqIFRoZSB0YWJsZSAzMi1iaXQgYWxpZ25lZCBhbmQgaGFzIHRoZSBmb2xsb3dpbmcgbGF5b3V0OlxuICpcbiAqIHwgLi4uIHwgaHAgKHUzMikgfCAgICAgICBpbmZvICh1MzIpICAgfCBzaXplICh1MzIpIHxcbiAqIHwgLi4uIHwgIEhhbmRsZSAgfCBTY29wZSBTaXplIHwgU3RhdGUgfCBTaXplICAgICAgIHxcbiAqIHwgLi4uIHwgMzJiaXRzICAgfCAzMGJpdHMgICAgIHwgMmJpdHMgfCAzMmJpdCAgICAgIHxcbiAqXG4gKiBXaXRoIHRoaXMgaW5mb3JtYXRpb24gd2UgZWZmZWN0aXZlbHkgaGF2ZSB0aGUgYWJpbGl0eSB0b1xuICogY29udHJvbCB3aGVuIHdlIHdhbnQgdG8gZnJlZSBtZW1vcnkuIFRoYXQgYmVpbmcgc2FpZCB5b3VcbiAqIGNhbiBub3QgZnJlZSBkdXJpbmcgZXhlY3V0aW9uIGFzIHJhdyBhZGRyZXNzIGFyZSBvbmx5XG4gKiB2YWxpZCBkdXJpbmcgdGhlIGV4ZWN1dGlvbi4gVGhpcyBtZWFucyB5b3UgY2Fubm90IGNsb3NlXG4gKiBvdmVyIHRoZW0gYXMgeW91IHdpbGwgaGF2ZSBhIGJhZCBtZW1vcnkgYWNjZXNzIGV4Y2VwdGlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIEhlYXBJbXBsIGltcGxlbWVudHMgQ29tcGlsZVRpbWVIZWFwLCBSdW50aW1lSGVhcCB7XG4gIHByaXZhdGUgaGVhcDogVWludDMyQXJyYXk7XG4gIHByaXZhdGUgcGxhY2Vob2xkZXJzOiBQbGFjZWhvbGRlcltdID0gW107XG4gIHByaXZhdGUgc3RkbGliczogU3RkbGliUGxhY2Vob2xkZXJbXSA9IFtdO1xuICBwcml2YXRlIHRhYmxlOiBudW1iZXJbXTtcbiAgcHJpdmF0ZSBvZmZzZXQgPSAwO1xuICBwcml2YXRlIGhhbmRsZSA9IDA7XG4gIHByaXZhdGUgY2FwYWNpdHkgPSBQQUdFX1NJWkU7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5oZWFwID0gbmV3IFVpbnQzMkFycmF5KFBBR0VfU0laRSk7XG4gICAgdGhpcy50YWJsZSA9IFtdO1xuICB9XG5cbiAgcHVzaChpdGVtOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLnNpemVDaGVjaygpO1xuICAgIHRoaXMuaGVhcFt0aGlzLm9mZnNldCsrXSA9IGl0ZW07XG4gIH1cblxuICBwcml2YXRlIHNpemVDaGVjaygpIHtcbiAgICBpZiAodGhpcy5jYXBhY2l0eSA9PT0gMCkge1xuICAgICAgbGV0IGhlYXAgPSBzbGljZSh0aGlzLmhlYXAsIDAsIHRoaXMub2Zmc2V0KTtcbiAgICAgIHRoaXMuaGVhcCA9IG5ldyBVaW50MzJBcnJheShoZWFwLmxlbmd0aCArIFBBR0VfU0laRSk7XG4gICAgICB0aGlzLmhlYXAuc2V0KGhlYXAsIDApO1xuICAgICAgdGhpcy5jYXBhY2l0eSA9IFBBR0VfU0laRTtcbiAgICB9XG4gICAgdGhpcy5jYXBhY2l0eS0tO1xuICB9XG5cbiAgZ2V0YnlhZGRyKGFkZHJlc3M6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuaGVhcFthZGRyZXNzXTtcbiAgfVxuXG4gIHNldGJ5YWRkcihhZGRyZXNzOiBudW1iZXIsIHZhbHVlOiBudW1iZXIpIHtcbiAgICB0aGlzLmhlYXBbYWRkcmVzc10gPSB2YWx1ZTtcbiAgfVxuXG4gIG1hbGxvYygpOiBudW1iZXIge1xuICAgIC8vIHB1c2ggb2Zmc2V0LCBpbmZvLCBzaXplXG4gICAgdGhpcy50YWJsZS5wdXNoKHRoaXMub2Zmc2V0LCAwLCAwKTtcbiAgICBsZXQgaGFuZGxlID0gdGhpcy5oYW5kbGU7XG4gICAgdGhpcy5oYW5kbGUgKz0gU2l6ZS5FTlRSWV9TSVpFO1xuICAgIHJldHVybiBoYW5kbGU7XG4gIH1cblxuICBmaW5pc2hNYWxsb2MoaGFuZGxlOiBudW1iZXIsIHNjb3BlU2l6ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgaWYgKERFQlVHKSB7XG4gICAgICBsZXQgc3RhcnQgPSB0aGlzLnRhYmxlW2hhbmRsZV07XG4gICAgICBsZXQgZmluaXNoID0gdGhpcy5vZmZzZXQ7XG4gICAgICBsZXQgaW5zdHJ1Y3Rpb25TaXplID0gZmluaXNoIC0gc3RhcnQ7XG4gICAgICB0aGlzLnRhYmxlW2hhbmRsZSArIFNpemUuU0laRV9PRkZTRVRdID0gaW5zdHJ1Y3Rpb25TaXplO1xuICAgIH1cbiAgICB0aGlzLnRhYmxlW2hhbmRsZSArIFNpemUuSU5GT19PRkZTRVRdID0gZW5jb2RlVGFibGVJbmZvKHNjb3BlU2l6ZSwgVGFibGVTbG90U3RhdGUuQWxsb2NhdGVkKTtcbiAgfVxuXG4gIHNpemUoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5vZmZzZXQ7XG4gIH1cblxuICAvLyBJdCBpcyBpbGxlZ2FsIHRvIGNsb3NlIG92ZXIgdGhpcyBhZGRyZXNzLCBhcyBjb21wYWN0aW9uXG4gIC8vIG1heSBtb3ZlIGl0LiBIb3dldmVyLCBpdCBpcyBsZWdhbCB0byB1c2UgdGhpcyBhZGRyZXNzXG4gIC8vIG11bHRpcGxlIHRpbWVzIGJldHdlZW4gY29tcGFjdGlvbnMuXG4gIGdldGFkZHIoaGFuZGxlOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnRhYmxlW2hhbmRsZV07XG4gIH1cblxuICBnZXRoYW5kbGUoYWRkcmVzczogbnVtYmVyKTogbnVtYmVyIHtcbiAgICB0aGlzLnRhYmxlLnB1c2goYWRkcmVzcywgZW5jb2RlVGFibGVJbmZvKDAsIFRhYmxlU2xvdFN0YXRlLlBvaW50ZXIpLCAwKTtcbiAgICBsZXQgaGFuZGxlID0gdGhpcy5oYW5kbGU7XG4gICAgdGhpcy5oYW5kbGUgKz0gU2l6ZS5FTlRSWV9TSVpFO1xuICAgIHJldHVybiBoYW5kbGU7XG4gIH1cblxuICBzaXplb2YoaGFuZGxlOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiBzaXplb2YodGhpcy50YWJsZSwgaGFuZGxlKTtcbiAgfVxuXG4gIHNjb3Blc2l6ZW9mKGhhbmRsZTogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gc2NvcGVzaXplb2YodGhpcy50YWJsZSwgaGFuZGxlKTtcbiAgfVxuXG4gIGZyZWUoaGFuZGxlOiBudW1iZXIpOiB2b2lkIHtcbiAgICBsZXQgaW5mbyA9IHRoaXMudGFibGVbaGFuZGxlICsgU2l6ZS5JTkZPX09GRlNFVF07XG4gICAgdGhpcy50YWJsZVtoYW5kbGUgKyBTaXplLklORk9fT0ZGU0VUXSA9IGNoYW5nZVN0YXRlKGluZm8sIFRhYmxlU2xvdFN0YXRlLkZyZWVkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgaGVhcCB1c2VzIHRoZSBbTWFyay1Db21wYWN0IEFsZ29yaXRobV0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTWFyay1jb21wYWN0X2FsZ29yaXRobSkgdG8gc2hpZnRcbiAgICogcmVhY2hhYmxlIG1lbW9yeSB0byB0aGUgYm90dG9tIG9mIHRoZSBoZWFwIGFuZCBmcmVlYWJsZVxuICAgKiBtZW1vcnkgdG8gdGhlIHRvcCBvZiB0aGUgaGVhcC4gV2hlbiB3ZSBoYXZlIHNoaWZ0ZWQgYWxsXG4gICAqIHRoZSByZWFjaGFibGUgbWVtb3J5IHRvIHRoZSB0b3Agb2YgdGhlIGhlYXAsIHdlIG1vdmUgdGhlXG4gICAqIG9mZnNldCB0byB0aGUgbmV4dCBmcmVlIHBvc2l0aW9uLlxuICAgKi9cbiAgY29tcGFjdCgpOiB2b2lkIHtcbiAgICBsZXQgY29tcGFjdGVkU2l6ZSA9IDA7XG4gICAgbGV0IHtcbiAgICAgIHRhYmxlLFxuICAgICAgdGFibGU6IHsgbGVuZ3RoIH0sXG4gICAgICBoZWFwLFxuICAgIH0gPSB0aGlzO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkgKz0gU2l6ZS5FTlRSWV9TSVpFKSB7XG4gICAgICBsZXQgb2Zmc2V0ID0gdGFibGVbaV07XG4gICAgICBsZXQgaW5mbyA9IHRhYmxlW2kgKyBTaXplLklORk9fT0ZGU0VUXTtcbiAgICAgIC8vIEB0cy1pZ25vcmUgKHRoaXMgd2hvbGUgZnVuY3Rpb24gaXMgY3VycmVudGx5IHVudXNlZClcbiAgICAgIGxldCBzaXplID0gaW5mbyAmIFNpemUuU0laRV9NQVNLO1xuICAgICAgbGV0IHN0YXRlID0gaW5mbyAmIChTaXplLlNUQVRFX01BU0sgPj4gMzApO1xuXG4gICAgICBpZiAoc3RhdGUgPT09IFRhYmxlU2xvdFN0YXRlLlB1cmdlZCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IFRhYmxlU2xvdFN0YXRlLkZyZWVkKSB7XG4gICAgICAgIC8vIHRyYW5zaXRpb24gdG8gXCJhbHJlYWR5IGZyZWVkXCIgYWthIFwicHVyZ2VkXCJcbiAgICAgICAgLy8gYSBnb29kIGltcHJvdmVtZW50IHdvdWxkIGJlIHRvIHJldXNlXG4gICAgICAgIC8vIHRoZXNlIHNsb3RzXG4gICAgICAgIHRhYmxlW2kgKyBTaXplLklORk9fT0ZGU0VUXSA9IGNoYW5nZVN0YXRlKGluZm8sIFRhYmxlU2xvdFN0YXRlLlB1cmdlZCk7XG4gICAgICAgIGNvbXBhY3RlZFNpemUgKz0gc2l6ZTtcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IFRhYmxlU2xvdFN0YXRlLkFsbG9jYXRlZCkge1xuICAgICAgICBmb3IgKGxldCBqID0gb2Zmc2V0OyBqIDw9IGkgKyBzaXplOyBqKyspIHtcbiAgICAgICAgICBoZWFwW2ogLSBjb21wYWN0ZWRTaXplXSA9IGhlYXBbal07XG4gICAgICAgIH1cblxuICAgICAgICB0YWJsZVtpXSA9IG9mZnNldCAtIGNvbXBhY3RlZFNpemU7XG4gICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBUYWJsZVNsb3RTdGF0ZS5Qb2ludGVyKSB7XG4gICAgICAgIHRhYmxlW2ldID0gb2Zmc2V0IC0gY29tcGFjdGVkU2l6ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLm9mZnNldCA9IHRoaXMub2Zmc2V0IC0gY29tcGFjdGVkU2l6ZTtcbiAgfVxuXG4gIHB1c2hQbGFjZWhvbGRlcih2YWx1ZUZ1bmM6ICgpID0+IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuc2l6ZUNoZWNrKCk7XG4gICAgbGV0IGFkZHJlc3MgPSB0aGlzLm9mZnNldCsrO1xuICAgIHRoaXMuaGVhcFthZGRyZXNzXSA9IFNpemUuTUFYX1NJWkU7XG4gICAgdGhpcy5wbGFjZWhvbGRlcnMucHVzaChbYWRkcmVzcywgdmFsdWVGdW5jXSk7XG4gIH1cblxuICBwdXNoU3RkbGliKG9wZXJhbmQ6IFN0ZGxpYk9wZXJhbmQpOiB2b2lkIHtcbiAgICB0aGlzLnNpemVDaGVjaygpO1xuICAgIGxldCBhZGRyZXNzID0gdGhpcy5vZmZzZXQrKztcbiAgICB0aGlzLmhlYXBbYWRkcmVzc10gPSBTaXplLk1BWF9TSVpFO1xuICAgIHRoaXMuc3RkbGlicy5wdXNoKFthZGRyZXNzLCBvcGVyYW5kXSk7XG4gIH1cblxuICBwcml2YXRlIHBhdGNoUGxhY2Vob2xkZXJzKCkge1xuICAgIGxldCB7IHBsYWNlaG9sZGVycyB9ID0gdGhpcztcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGxhY2Vob2xkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgW2FkZHJlc3MsIGdldFZhbHVlXSA9IHBsYWNlaG9sZGVyc1tpXTtcblxuICAgICAgYXNzZXJ0KFxuICAgICAgICB0aGlzLmdldGJ5YWRkcihhZGRyZXNzKSA9PT0gU2l6ZS5NQVhfU0laRSxcbiAgICAgICAgYGV4cGVjdGVkIHRvIGZpbmQgYSBwbGFjZWhvbGRlciB2YWx1ZSBhdCAke2FkZHJlc3N9YFxuICAgICAgKTtcbiAgICAgIHRoaXMuc2V0YnlhZGRyKGFkZHJlc3MsIGdldFZhbHVlKCkpO1xuICAgIH1cbiAgfVxuXG4gIHBhdGNoU3RkbGlicyhzdGRsaWI6IFNURExpYik6IHZvaWQge1xuICAgIGxldCB7IHN0ZGxpYnMgfSA9IHRoaXM7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0ZGxpYnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBbYWRkcmVzcywgeyB2YWx1ZSB9XSA9IHN0ZGxpYnNbaV07XG5cbiAgICAgIGFzc2VydChcbiAgICAgICAgdGhpcy5nZXRieWFkZHIoYWRkcmVzcykgPT09IFNpemUuTUFYX1NJWkUsXG4gICAgICAgIGBleHBlY3RlZCB0byBmaW5kIGEgcGxhY2Vob2xkZXIgdmFsdWUgYXQgJHthZGRyZXNzfWBcbiAgICAgICk7XG4gICAgICB0aGlzLnNldGJ5YWRkcihhZGRyZXNzLCBzdGRsaWJbdmFsdWVdKTtcbiAgICB9XG5cbiAgICB0aGlzLnN0ZGxpYnMgPSBbXTtcbiAgfVxuXG4gIGNhcHR1cmUoc3RkbGliOiBTVERMaWIsIG9mZnNldCA9IHRoaXMub2Zmc2V0KTogU2VyaWFsaXplZEhlYXAge1xuICAgIHRoaXMucGF0Y2hQbGFjZWhvbGRlcnMoKTtcbiAgICB0aGlzLnBhdGNoU3RkbGlicyhzdGRsaWIpO1xuXG4gICAgLy8gT25seSBjYWxsZWQgaW4gZWFnZXIgbW9kZVxuICAgIGxldCBidWZmZXIgPSBzbGljZSh0aGlzLmhlYXAsIDAsIG9mZnNldCkuYnVmZmVyO1xuICAgIHJldHVybiB7XG4gICAgICBoYW5kbGU6IHRoaXMuaGFuZGxlLFxuICAgICAgdGFibGU6IHRoaXMudGFibGUsXG4gICAgICBidWZmZXI6IGJ1ZmZlciBhcyBBcnJheUJ1ZmZlcixcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSdW50aW1lUHJvZ3JhbUltcGwgaW1wbGVtZW50cyBSdW50aW1lUHJvZ3JhbSB7XG4gIFtrZXk6IG51bWJlcl06IG5ldmVyO1xuXG4gIHN0YXRpYyBoeWRyYXRlKGFydGlmYWN0czogQ29tcGlsZXJBcnRpZmFjdHMpIHtcbiAgICBsZXQgaGVhcCA9IG5ldyBSdW50aW1lSGVhcEltcGwoYXJ0aWZhY3RzLmhlYXApO1xuICAgIGxldCBjb25zdGFudHMgPSBuZXcgUnVudGltZUNvbnN0YW50c0ltcGwoYXJ0aWZhY3RzLmNvbnN0YW50cyk7XG5cbiAgICByZXR1cm4gbmV3IFJ1bnRpbWVQcm9ncmFtSW1wbChjb25zdGFudHMsIGhlYXApO1xuICB9XG5cbiAgcHJpdmF0ZSBfb3Bjb2RlOiBSdW50aW1lT3BJbXBsO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBjb25zdGFudHM6IFJ1bnRpbWVDb25zdGFudHMsIHB1YmxpYyBoZWFwOiBSdW50aW1lSGVhcCkge1xuICAgIHRoaXMuX29wY29kZSA9IG5ldyBSdW50aW1lT3BJbXBsKHRoaXMuaGVhcCk7XG4gIH1cblxuICBvcGNvZGUob2Zmc2V0OiBudW1iZXIpOiBSdW50aW1lT3BJbXBsIHtcbiAgICB0aGlzLl9vcGNvZGUub2Zmc2V0ID0gb2Zmc2V0O1xuICAgIHJldHVybiB0aGlzLl9vcGNvZGU7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGh5ZHJhdGVQcm9ncmFtKGFydGlmYWN0czogQ29tcGlsZXJBcnRpZmFjdHMpOiBSdW50aW1lUHJvZ3JhbSB7XG4gIGxldCBoZWFwID0gbmV3IFJ1bnRpbWVIZWFwSW1wbChhcnRpZmFjdHMuaGVhcCk7XG4gIGxldCBjb25zdGFudHMgPSBuZXcgUnVudGltZUNvbnN0YW50c0ltcGwoYXJ0aWZhY3RzLmNvbnN0YW50cyk7XG5cbiAgcmV0dXJuIG5ldyBSdW50aW1lUHJvZ3JhbUltcGwoY29uc3RhbnRzLCBoZWFwKTtcbn1cblxuZnVuY3Rpb24gc2xpY2UoYXJyOiBVaW50MzJBcnJheSwgc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIpOiBVaW50MzJBcnJheSB7XG4gIGlmIChhcnIuc2xpY2UgIT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBhcnIuc2xpY2Uoc3RhcnQsIGVuZCk7XG4gIH1cblxuICBsZXQgcmV0ID0gbmV3IFVpbnQzMkFycmF5KGVuZCk7XG5cbiAgZm9yICg7IHN0YXJ0IDwgZW5kOyBzdGFydCsrKSB7XG4gICAgcmV0W3N0YXJ0XSA9IGFycltzdGFydF07XG4gIH1cblxuICByZXR1cm4gcmV0O1xufVxuXG5mdW5jdGlvbiBzaXplb2YodGFibGU6IG51bWJlcltdLCBoYW5kbGU6IG51bWJlcikge1xuICBpZiAoREVCVUcpIHtcbiAgICByZXR1cm4gdGFibGVbaGFuZGxlICsgU2l6ZS5TSVpFX09GRlNFVF07XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIC0xO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNjb3Blc2l6ZW9mKHRhYmxlOiBudW1iZXJbXSwgaGFuZGxlOiBudW1iZXIpIHtcbiAgbGV0IGluZm8gPSB0YWJsZVtoYW5kbGUgKyBTaXplLklORk9fT0ZGU0VUXTtcbiAgcmV0dXJuIGluZm8gPj4gMjtcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=