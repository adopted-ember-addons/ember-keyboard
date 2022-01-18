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
const PAGE_SIZE = 0x100000;
class RuntimeHeapImpl {
    constructor(serializedHeap) {
        let { buffer, table } = serializedHeap;
        this.heap = new Uint32Array(buffer);
        this.table = table;
    }
    // It is illegal to close over this address, as compaction
    // may move it. However, it is legal to use this address
    // multiple times between compactions.
    getaddr(handle) {
        return this.table[handle];
    }
    getbyaddr(address) {
        false && (0, _util.assert)(this.heap[address] !== undefined, 'Access memory out of bounds of the heap');

        return this.heap[address];
    }
    sizeof(handle) {
        return sizeof(this.table, handle);
    }
    scopesizeof(handle) {
        return scopesizeof(this.table, handle);
    }
}
exports.RuntimeHeapImpl = RuntimeHeapImpl;
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
class HeapImpl {
    constructor() {
        this.placeholders = [];
        this.stdlibs = [];
        this.offset = 0;
        this.handle = 0;
        this.capacity = PAGE_SIZE;
        this.heap = new Uint32Array(PAGE_SIZE);
        this.table = [];
    }
    push(item) {
        this.sizeCheck();
        this.heap[this.offset++] = item;
    }
    sizeCheck() {
        if (this.capacity === 0) {
            let heap = slice(this.heap, 0, this.offset);
            this.heap = new Uint32Array(heap.length + PAGE_SIZE);
            this.heap.set(heap, 0);
            this.capacity = PAGE_SIZE;
        }
        this.capacity--;
    }
    getbyaddr(address) {
        return this.heap[address];
    }
    setbyaddr(address, value) {
        this.heap[address] = value;
    }
    malloc() {
        // push offset, info, size
        this.table.push(this.offset, 0, 0);
        let handle = this.handle;
        this.handle += 3 /* ENTRY_SIZE */;
        return handle;
    }
    finishMalloc(handle, scopeSize) {
        if (false) {
            let start = this.table[handle];
            let finish = this.offset;
            let instructionSize = finish - start;
            this.table[handle + 2 /* SIZE_OFFSET */] = instructionSize;
        }
        this.table[handle + 1 /* INFO_OFFSET */] = encodeTableInfo(scopeSize, 0 /* Allocated */);
    }
    size() {
        return this.offset;
    }
    // It is illegal to close over this address, as compaction
    // may move it. However, it is legal to use this address
    // multiple times between compactions.
    getaddr(handle) {
        return this.table[handle];
    }
    gethandle(address) {
        this.table.push(address, encodeTableInfo(0, 3 /* Pointer */), 0);
        let handle = this.handle;
        this.handle += 3 /* ENTRY_SIZE */;
        return handle;
    }
    sizeof(handle) {
        return sizeof(this.table, handle);
    }
    scopesizeof(handle) {
        return scopesizeof(this.table, handle);
    }
    free(handle) {
        let info = this.table[handle + 1 /* INFO_OFFSET */];
        this.table[handle + 1 /* INFO_OFFSET */] = changeState(info, 1 /* Freed */);
    }
    /**
     * The heap uses the [Mark-Compact Algorithm](https://en.wikipedia.org/wiki/Mark-compact_algorithm) to shift
     * reachable memory to the bottom of the heap and freeable
     * memory to the top of the heap. When we have shifted all
     * the reachable memory to the top of the heap, we move the
     * offset to the next free position.
     */
    compact() {
        let compactedSize = 0;
        let { table, table: { length }, heap } = this;
        for (let i = 0; i < length; i += 3 /* ENTRY_SIZE */) {
            let offset = table[i];
            let info = table[i + 1 /* INFO_OFFSET */];
            // @ts-ignore (this whole function is currently unused)
            let size = info & Size.SIZE_MASK;
            let state = info & 3 /* STATE_MASK */ >> 30;
            if (state === 2 /* Purged */) {
                    continue;
                } else if (state === 1 /* Freed */) {
                    // transition to "already freed" aka "purged"
                    // a good improvement would be to reuse
                    // these slots
                    table[i + 1 /* INFO_OFFSET */] = changeState(info, 2 /* Purged */);
                    compactedSize += size;
                } else if (state === 0 /* Allocated */) {
                    for (let j = offset; j <= i + size; j++) {
                        heap[j - compactedSize] = heap[j];
                    }
                    table[i] = offset - compactedSize;
                } else if (state === 3 /* Pointer */) {
                    table[i] = offset - compactedSize;
                }
        }
        this.offset = this.offset - compactedSize;
    }
    pushPlaceholder(valueFunc) {
        this.sizeCheck();
        let address = this.offset++;
        this.heap[address] = 2147483647 /* MAX_SIZE */;
        this.placeholders.push([address, valueFunc]);
    }
    pushStdlib(operand) {
        this.sizeCheck();
        let address = this.offset++;
        this.heap[address] = 2147483647 /* MAX_SIZE */;
        this.stdlibs.push([address, operand]);
    }
    patchPlaceholders() {
        let { placeholders } = this;
        for (let i = 0; i < placeholders.length; i++) {
            let [address, getValue] = placeholders[i];
            false && (0, _util.assert)(this.getbyaddr(address) === 2147483647 /* MAX_SIZE */, `expected to find a placeholder value at ${address}`);

            this.setbyaddr(address, getValue());
        }
    }
    patchStdlibs(stdlib) {
        let { stdlibs } = this;
        for (let i = 0; i < stdlibs.length; i++) {
            let [address, { value }] = stdlibs[i];
            false && (0, _util.assert)(this.getbyaddr(address) === 2147483647 /* MAX_SIZE */, `expected to find a placeholder value at ${address}`);

            this.setbyaddr(address, stdlib[value]);
        }
        this.stdlibs = [];
    }
    capture(stdlib, offset = this.offset) {
        this.patchPlaceholders();
        this.patchStdlibs(stdlib);
        // Only called in eager mode
        let buffer = slice(this.heap, 0, offset).buffer;
        return {
            handle: this.handle,
            table: this.table,
            buffer: buffer
        };
    }
}
exports.HeapImpl = HeapImpl;
class RuntimeProgramImpl {
    constructor(constants, heap) {
        this.constants = constants;
        this.heap = heap;
        this._opcode = new _opcode.RuntimeOpImpl(this.heap);
    }
    static hydrate(artifacts) {
        let heap = new RuntimeHeapImpl(artifacts.heap);
        let constants = new _constants.RuntimeConstantsImpl(artifacts.constants);
        return new RuntimeProgramImpl(constants, heap);
    }
    opcode(offset) {
        this._opcode.offset = offset;
        return this._opcode;
    }
}
exports.RuntimeProgramImpl = RuntimeProgramImpl;
function hydrateProgram(artifacts) {
    let heap = new RuntimeHeapImpl(artifacts.heap);
    let constants = new _constants.RuntimeConstantsImpl(artifacts.constants);
    return new RuntimeProgramImpl(constants, heap);
}
function slice(arr, start, end) {
    if (arr.slice !== undefined) {
        return arr.slice(start, end);
    }
    let ret = new Uint32Array(end);
    for (; start < end; start++) {
        ret[start] = arr[start];
    }
    return ret;
}
function sizeof(table, handle) {
    if (false) {
        return table[handle + 2 /* SIZE_OFFSET */];
    } else {
        return -1;
    }
}
function scopesizeof(table, handle) {
    let info = table[handle + 1 /* INFO_OFFSET */];
    return info >> 2;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3Byb2dyYW0vbGliL3Byb2dyYW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O1FBa0ZNLFcsR0FBQSxXO1FBME9BLGMsR0FBQSxjOzs7O0FBaFROOztBQUNBOztBQWtCQSxTQUFBLGVBQUEsQ0FBQSxTQUFBLEVBQUEsS0FBQSxFQUF5RDtBQUFBLGFBQ3ZELGtCQUFPLFlBQVksQ0FBWixDQUFBLElBQWtCLFFBQVEsQ0FBakMsQ0FBQSxFQUR1RCwyQ0FDdkQsQ0FEdUQ7QUFBQSxhQUV2RCxrQkFBTyxRQUFRLEtBQWYsQ0FBQSxFQUZ1RCwyQkFFdkQsQ0FGdUQ7QUFBQSxhQUd2RCxrQkFBTyxZQUFZLEtBQW5CLEVBQUEsRUFIdUQsNEJBR3ZELENBSHVEOztBQUl2RCxXQUFPLFFBQVMsYUFBaEIsQ0FBQTtBQUNEO0FBRUQsU0FBQSxXQUFBLENBQUEsSUFBQSxFQUFBLFFBQUEsRUFBbUQ7QUFBQSxhQUNqRCxrQkFBTyxPQUFPLENBQVAsQ0FBQSxJQUFhLFdBQVcsQ0FBL0IsQ0FBQSxFQURpRCxnQ0FDakQsQ0FEaUQ7QUFBQSxhQUVqRCxrQkFBTyxXQUFXLEtBQWxCLENBQUEsRUFGaUQsMkJBRWpELENBRmlEO0FBQUEsYUFHakQsa0JBQU8sT0FBTyxLQUFkLEVBQUEsRUFIaUQsMkJBR2pELENBSGlEOztBQUtqRCxXQUFPLE9BQVEsWUFBZixFQUFBO0FBQ0Q7QUFLRCxNQUFNLFlBQU4sUUFBQTtBQUVNLE1BQUEsZUFBQSxDQUFzQjtBQUkxQixnQkFBQSxjQUFBLEVBQTBDO0FBQ3hDLFlBQUksRUFBQSxNQUFBLEVBQUEsS0FBQSxLQUFKLGNBQUE7QUFDQSxhQUFBLElBQUEsR0FBWSxJQUFBLFdBQUEsQ0FBWixNQUFZLENBQVo7QUFDQSxhQUFBLEtBQUEsR0FBQSxLQUFBO0FBQ0Q7QUFFRDtBQUNBO0FBQ0E7QUFDQSxZQUFBLE1BQUEsRUFBc0I7QUFDcEIsZUFBTyxLQUFBLEtBQUEsQ0FBUCxNQUFP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RUFBb0Q7QUFDbEQsUUFBSSxPQUFPLE1BQU0sU0FBTixDQUFBLENBQVgsaUJBQVcsQ0FBWDtBQUNBLFdBQU8sUUFBUCxDQUFBO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBDb21waWxlVGltZUhlYXAsXG4gIFNlcmlhbGl6ZWRIZWFwLFxuICBTVERMaWIsXG4gIFJ1bnRpbWVIZWFwLFxuICBTdGRsaWJPcGVyYW5kLFxuICBSdW50aW1lQ29uc3RhbnRzLFxuICBSdW50aW1lUHJvZ3JhbSxcbiAgQ29tcGlsZXJBcnRpZmFjdHMsXG59IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgREVCVUcgfSBmcm9tICdAZ2xpbW1lci9sb2NhbC1kZWJ1Zy1mbGFncyc7XG5pbXBvcnQgeyBSdW50aW1lQ29uc3RhbnRzSW1wbCB9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7IFJ1bnRpbWVPcEltcGwgfSBmcm9tICcuL29wY29kZSc7XG5pbXBvcnQgeyBhc3NlcnQgfSBmcm9tICdAZ2xpbW1lci91dGlsJztcblxuY29uc3QgZW51bSBUYWJsZVNsb3RTdGF0ZSB7XG4gIEFsbG9jYXRlZCxcbiAgRnJlZWQsXG4gIFB1cmdlZCxcbiAgUG9pbnRlcixcbn1cblxuY29uc3QgZW51bSBTaXplIHtcbiAgRU5UUllfU0laRSA9IDMsXG4gIElORk9fT0ZGU0VUID0gMSxcbiAgU0laRV9PRkZTRVQgPSAyLFxuICBNQVhfU0laRSA9IDBiMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMSxcbiAgU0NPUEVfTUFTSyA9IDBiMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMCxcbiAgU1RBVEVfTUFTSyA9IDBiMTEsXG59XG5cbmZ1bmN0aW9uIGVuY29kZVRhYmxlSW5mbyhzY29wZVNpemU6IG51bWJlciwgc3RhdGU6IG51bWJlcikge1xuICBhc3NlcnQoc2NvcGVTaXplID4gLTEgJiYgc3RhdGUgPiAtMSwgJ1NpemUsIHNjb3BlU2l6ZSBvciBzdGF0ZSB3ZXJlIGxlc3MgdGhhbiAwJyk7XG4gIGFzc2VydChzdGF0ZSA8IDEgPDwgMiwgJ1N0YXRlIGlzIG1vcmUgdGhhbiAyIGJpdHMnKTtcbiAgYXNzZXJ0KHNjb3BlU2l6ZSA8IDEgPDwgMzAsICdTY29wZSBpcyBtb3JlIHRoYW4gMzAtYml0cycpO1xuICByZXR1cm4gc3RhdGUgfCAoc2NvcGVTaXplIDw8IDIpO1xufVxuXG5mdW5jdGlvbiBjaGFuZ2VTdGF0ZShpbmZvOiBudW1iZXIsIG5ld1N0YXRlOiBudW1iZXIpIHtcbiAgYXNzZXJ0KGluZm8gPiAtMSAmJiBuZXdTdGF0ZSA+IC0xLCAnSW5mbyBvciBzdGF0ZSB3ZXJlIGxlc3MgdGhhbiAwJyk7XG4gIGFzc2VydChuZXdTdGF0ZSA8IDEgPDwgMiwgJ1N0YXRlIGlzIG1vcmUgdGhhbiAyIGJpdHMnKTtcbiAgYXNzZXJ0KGluZm8gPCAxIDw8IDMwLCAnSW5mbyBpcyBtb3JlIHRoYW4gMzAgYml0cycpO1xuXG4gIHJldHVybiBpbmZvIHwgKG5ld1N0YXRlIDw8IDMwKTtcbn1cblxuZXhwb3J0IHR5cGUgUGxhY2Vob2xkZXIgPSBbbnVtYmVyLCAoKSA9PiBudW1iZXJdO1xuZXhwb3J0IHR5cGUgU3RkbGliUGxhY2Vob2xkZXIgPSBbbnVtYmVyLCBTdGRsaWJPcGVyYW5kXTtcblxuY29uc3QgUEFHRV9TSVpFID0gMHgxMDAwMDA7XG5cbmV4cG9ydCBjbGFzcyBSdW50aW1lSGVhcEltcGwgaW1wbGVtZW50cyBSdW50aW1lSGVhcCB7XG4gIHByaXZhdGUgaGVhcDogVWludDMyQXJyYXk7XG4gIHByaXZhdGUgdGFibGU6IG51bWJlcltdO1xuXG4gIGNvbnN0cnVjdG9yKHNlcmlhbGl6ZWRIZWFwOiBTZXJpYWxpemVkSGVhcCkge1xuICAgIGxldCB7IGJ1ZmZlciwgdGFibGUgfSA9IHNlcmlhbGl6ZWRIZWFwO1xuICAgIHRoaXMuaGVhcCA9IG5ldyBVaW50MzJBcnJheShidWZmZXIpO1xuICAgIHRoaXMudGFibGUgPSB0YWJsZTtcbiAgfVxuXG4gIC8vIEl0IGlzIGlsbGVnYWwgdG8gY2xvc2Ugb3ZlciB0aGlzIGFkZHJlc3MsIGFzIGNvbXBhY3Rpb25cbiAgLy8gbWF5IG1vdmUgaXQuIEhvd2V2ZXIsIGl0IGlzIGxlZ2FsIHRvIHVzZSB0aGlzIGFkZHJlc3NcbiAgLy8gbXVsdGlwbGUgdGltZXMgYmV0d2VlbiBjb21wYWN0aW9ucy5cbiAgZ2V0YWRkcihoYW5kbGU6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMudGFibGVbaGFuZGxlXTtcbiAgfVxuXG4gIGdldGJ5YWRkcihhZGRyZXNzOiBudW1iZXIpOiBudW1iZXIge1xuICAgIGFzc2VydCh0aGlzLmhlYXBbYWRkcmVzc10gIT09IHVuZGVmaW5lZCwgJ0FjY2VzcyBtZW1vcnkgb3V0IG9mIGJvdW5kcyBvZiB0aGUgaGVhcCcpO1xuICAgIHJldHVybiB0aGlzLmhlYXBbYWRkcmVzc107XG4gIH1cblxuICBzaXplb2YoaGFuZGxlOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiBzaXplb2YodGhpcy50YWJsZSwgaGFuZGxlKTtcbiAgfVxuXG4gIHNjb3Blc2l6ZW9mKGhhbmRsZTogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gc2NvcGVzaXplb2YodGhpcy50YWJsZSwgaGFuZGxlKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaHlkcmF0ZUhlYXAoc2VyaWFsaXplZEhlYXA6IFNlcmlhbGl6ZWRIZWFwKTogUnVudGltZUhlYXAge1xuICByZXR1cm4gbmV3IFJ1bnRpbWVIZWFwSW1wbChzZXJpYWxpemVkSGVhcCk7XG59XG5cbi8qKlxuICogVGhlIEhlYXAgaXMgcmVzcG9uc2libGUgZm9yIGR5bmFtaWNhbGx5IGFsbG9jYXRpbmdcbiAqIG1lbW9yeSBpbiB3aGljaCB3ZSByZWFkL3dyaXRlIHRoZSBWTSdzIGluc3RydWN0aW9uc1xuICogZnJvbS90by4gV2hlbiB3ZSBtYWxsb2Mgd2UgcGFzcyBvdXQgYSBWTUhhbmRsZSwgd2hpY2hcbiAqIGlzIHVzZWQgYXMgYW4gaW5kaXJlY3Qgd2F5IG9mIGFjY2Vzc2luZyB0aGUgbWVtb3J5IGR1cmluZ1xuICogZXhlY3V0aW9uIG9mIHRoZSBWTS4gSW50ZXJuYWxseSB3ZSB0cmFjayB0aGUgZGlmZmVyZW50XG4gKiByZWdpb25zIG9mIHRoZSBtZW1vcnkgaW4gYW4gaW50IGFycmF5IGtub3duIGFzIHRoZSB0YWJsZS5cbiAqXG4gKiBUaGUgdGFibGUgMzItYml0IGFsaWduZWQgYW5kIGhhcyB0aGUgZm9sbG93aW5nIGxheW91dDpcbiAqXG4gKiB8IC4uLiB8IGhwICh1MzIpIHwgICAgICAgaW5mbyAodTMyKSAgIHwgc2l6ZSAodTMyKSB8XG4gKiB8IC4uLiB8ICBIYW5kbGUgIHwgU2NvcGUgU2l6ZSB8IFN0YXRlIHwgU2l6ZSAgICAgICB8XG4gKiB8IC4uLiB8IDMyYml0cyAgIHwgMzBiaXRzICAgICB8IDJiaXRzIHwgMzJiaXQgICAgICB8XG4gKlxuICogV2l0aCB0aGlzIGluZm9ybWF0aW9uIHdlIGVmZmVjdGl2ZWx5IGhhdmUgdGhlIGFiaWxpdHkgdG9cbiAqIGNvbnRyb2wgd2hlbiB3ZSB3YW50IHRvIGZyZWUgbWVtb3J5LiBUaGF0IGJlaW5nIHNhaWQgeW91XG4gKiBjYW4gbm90IGZyZWUgZHVyaW5nIGV4ZWN1dGlvbiBhcyByYXcgYWRkcmVzcyBhcmUgb25seVxuICogdmFsaWQgZHVyaW5nIHRoZSBleGVjdXRpb24uIFRoaXMgbWVhbnMgeW91IGNhbm5vdCBjbG9zZVxuICogb3ZlciB0aGVtIGFzIHlvdSB3aWxsIGhhdmUgYSBiYWQgbWVtb3J5IGFjY2VzcyBleGNlcHRpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBIZWFwSW1wbCBpbXBsZW1lbnRzIENvbXBpbGVUaW1lSGVhcCwgUnVudGltZUhlYXAge1xuICBwcml2YXRlIGhlYXA6IFVpbnQzMkFycmF5O1xuICBwcml2YXRlIHBsYWNlaG9sZGVyczogUGxhY2Vob2xkZXJbXSA9IFtdO1xuICBwcml2YXRlIHN0ZGxpYnM6IFN0ZGxpYlBsYWNlaG9sZGVyW10gPSBbXTtcbiAgcHJpdmF0ZSB0YWJsZTogbnVtYmVyW107XG4gIHByaXZhdGUgb2Zmc2V0ID0gMDtcbiAgcHJpdmF0ZSBoYW5kbGUgPSAwO1xuICBwcml2YXRlIGNhcGFjaXR5ID0gUEFHRV9TSVpFO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuaGVhcCA9IG5ldyBVaW50MzJBcnJheShQQUdFX1NJWkUpO1xuICAgIHRoaXMudGFibGUgPSBbXTtcbiAgfVxuXG4gIHB1c2goaXRlbTogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5zaXplQ2hlY2soKTtcbiAgICB0aGlzLmhlYXBbdGhpcy5vZmZzZXQrK10gPSBpdGVtO1xuICB9XG5cbiAgcHJpdmF0ZSBzaXplQ2hlY2soKSB7XG4gICAgaWYgKHRoaXMuY2FwYWNpdHkgPT09IDApIHtcbiAgICAgIGxldCBoZWFwID0gc2xpY2UodGhpcy5oZWFwLCAwLCB0aGlzLm9mZnNldCk7XG4gICAgICB0aGlzLmhlYXAgPSBuZXcgVWludDMyQXJyYXkoaGVhcC5sZW5ndGggKyBQQUdFX1NJWkUpO1xuICAgICAgdGhpcy5oZWFwLnNldChoZWFwLCAwKTtcbiAgICAgIHRoaXMuY2FwYWNpdHkgPSBQQUdFX1NJWkU7XG4gICAgfVxuICAgIHRoaXMuY2FwYWNpdHktLTtcbiAgfVxuXG4gIGdldGJ5YWRkcihhZGRyZXNzOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmhlYXBbYWRkcmVzc107XG4gIH1cblxuICBzZXRieWFkZHIoYWRkcmVzczogbnVtYmVyLCB2YWx1ZTogbnVtYmVyKSB7XG4gICAgdGhpcy5oZWFwW2FkZHJlc3NdID0gdmFsdWU7XG4gIH1cblxuICBtYWxsb2MoKTogbnVtYmVyIHtcbiAgICAvLyBwdXNoIG9mZnNldCwgaW5mbywgc2l6ZVxuICAgIHRoaXMudGFibGUucHVzaCh0aGlzLm9mZnNldCwgMCwgMCk7XG4gICAgbGV0IGhhbmRsZSA9IHRoaXMuaGFuZGxlO1xuICAgIHRoaXMuaGFuZGxlICs9IFNpemUuRU5UUllfU0laRTtcbiAgICByZXR1cm4gaGFuZGxlO1xuICB9XG5cbiAgZmluaXNoTWFsbG9jKGhhbmRsZTogbnVtYmVyLCBzY29wZVNpemU6IG51bWJlcik6IHZvaWQge1xuICAgIGlmIChERUJVRykge1xuICAgICAgbGV0IHN0YXJ0ID0gdGhpcy50YWJsZVtoYW5kbGVdO1xuICAgICAgbGV0IGZpbmlzaCA9IHRoaXMub2Zmc2V0O1xuICAgICAgbGV0IGluc3RydWN0aW9uU2l6ZSA9IGZpbmlzaCAtIHN0YXJ0O1xuICAgICAgdGhpcy50YWJsZVtoYW5kbGUgKyBTaXplLlNJWkVfT0ZGU0VUXSA9IGluc3RydWN0aW9uU2l6ZTtcbiAgICB9XG4gICAgdGhpcy50YWJsZVtoYW5kbGUgKyBTaXplLklORk9fT0ZGU0VUXSA9IGVuY29kZVRhYmxlSW5mbyhzY29wZVNpemUsIFRhYmxlU2xvdFN0YXRlLkFsbG9jYXRlZCk7XG4gIH1cblxuICBzaXplKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMub2Zmc2V0O1xuICB9XG5cbiAgLy8gSXQgaXMgaWxsZWdhbCB0byBjbG9zZSBvdmVyIHRoaXMgYWRkcmVzcywgYXMgY29tcGFjdGlvblxuICAvLyBtYXkgbW92ZSBpdC4gSG93ZXZlciwgaXQgaXMgbGVnYWwgdG8gdXNlIHRoaXMgYWRkcmVzc1xuICAvLyBtdWx0aXBsZSB0aW1lcyBiZXR3ZWVuIGNvbXBhY3Rpb25zLlxuICBnZXRhZGRyKGhhbmRsZTogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy50YWJsZVtoYW5kbGVdO1xuICB9XG5cbiAgZ2V0aGFuZGxlKGFkZHJlc3M6IG51bWJlcik6IG51bWJlciB7XG4gICAgdGhpcy50YWJsZS5wdXNoKGFkZHJlc3MsIGVuY29kZVRhYmxlSW5mbygwLCBUYWJsZVNsb3RTdGF0ZS5Qb2ludGVyKSwgMCk7XG4gICAgbGV0IGhhbmRsZSA9IHRoaXMuaGFuZGxlO1xuICAgIHRoaXMuaGFuZGxlICs9IFNpemUuRU5UUllfU0laRTtcbiAgICByZXR1cm4gaGFuZGxlO1xuICB9XG5cbiAgc2l6ZW9mKGhhbmRsZTogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gc2l6ZW9mKHRoaXMudGFibGUsIGhhbmRsZSk7XG4gIH1cblxuICBzY29wZXNpemVvZihoYW5kbGU6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIHNjb3Blc2l6ZW9mKHRoaXMudGFibGUsIGhhbmRsZSk7XG4gIH1cblxuICBmcmVlKGhhbmRsZTogbnVtYmVyKTogdm9pZCB7XG4gICAgbGV0IGluZm8gPSB0aGlzLnRhYmxlW2hhbmRsZSArIFNpemUuSU5GT19PRkZTRVRdO1xuICAgIHRoaXMudGFibGVbaGFuZGxlICsgU2l6ZS5JTkZPX09GRlNFVF0gPSBjaGFuZ2VTdGF0ZShpbmZvLCBUYWJsZVNsb3RTdGF0ZS5GcmVlZCk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGhlYXAgdXNlcyB0aGUgW01hcmstQ29tcGFjdCBBbGdvcml0aG1dKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL01hcmstY29tcGFjdF9hbGdvcml0aG0pIHRvIHNoaWZ0XG4gICAqIHJlYWNoYWJsZSBtZW1vcnkgdG8gdGhlIGJvdHRvbSBvZiB0aGUgaGVhcCBhbmQgZnJlZWFibGVcbiAgICogbWVtb3J5IHRvIHRoZSB0b3Agb2YgdGhlIGhlYXAuIFdoZW4gd2UgaGF2ZSBzaGlmdGVkIGFsbFxuICAgKiB0aGUgcmVhY2hhYmxlIG1lbW9yeSB0byB0aGUgdG9wIG9mIHRoZSBoZWFwLCB3ZSBtb3ZlIHRoZVxuICAgKiBvZmZzZXQgdG8gdGhlIG5leHQgZnJlZSBwb3NpdGlvbi5cbiAgICovXG4gIGNvbXBhY3QoKTogdm9pZCB7XG4gICAgbGV0IGNvbXBhY3RlZFNpemUgPSAwO1xuICAgIGxldCB7XG4gICAgICB0YWJsZSxcbiAgICAgIHRhYmxlOiB7IGxlbmd0aCB9LFxuICAgICAgaGVhcCxcbiAgICB9ID0gdGhpcztcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IFNpemUuRU5UUllfU0laRSkge1xuICAgICAgbGV0IG9mZnNldCA9IHRhYmxlW2ldO1xuICAgICAgbGV0IGluZm8gPSB0YWJsZVtpICsgU2l6ZS5JTkZPX09GRlNFVF07XG4gICAgICAvLyBAdHMtaWdub3JlICh0aGlzIHdob2xlIGZ1bmN0aW9uIGlzIGN1cnJlbnRseSB1bnVzZWQpXG4gICAgICBsZXQgc2l6ZSA9IGluZm8gJiBTaXplLlNJWkVfTUFTSztcbiAgICAgIGxldCBzdGF0ZSA9IGluZm8gJiAoU2l6ZS5TVEFURV9NQVNLID4+IDMwKTtcblxuICAgICAgaWYgKHN0YXRlID09PSBUYWJsZVNsb3RTdGF0ZS5QdXJnZWQpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBUYWJsZVNsb3RTdGF0ZS5GcmVlZCkge1xuICAgICAgICAvLyB0cmFuc2l0aW9uIHRvIFwiYWxyZWFkeSBmcmVlZFwiIGFrYSBcInB1cmdlZFwiXG4gICAgICAgIC8vIGEgZ29vZCBpbXByb3ZlbWVudCB3b3VsZCBiZSB0byByZXVzZVxuICAgICAgICAvLyB0aGVzZSBzbG90c1xuICAgICAgICB0YWJsZVtpICsgU2l6ZS5JTkZPX09GRlNFVF0gPSBjaGFuZ2VTdGF0ZShpbmZvLCBUYWJsZVNsb3RTdGF0ZS5QdXJnZWQpO1xuICAgICAgICBjb21wYWN0ZWRTaXplICs9IHNpemU7XG4gICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBUYWJsZVNsb3RTdGF0ZS5BbGxvY2F0ZWQpIHtcbiAgICAgICAgZm9yIChsZXQgaiA9IG9mZnNldDsgaiA8PSBpICsgc2l6ZTsgaisrKSB7XG4gICAgICAgICAgaGVhcFtqIC0gY29tcGFjdGVkU2l6ZV0gPSBoZWFwW2pdO1xuICAgICAgICB9XG5cbiAgICAgICAgdGFibGVbaV0gPSBvZmZzZXQgLSBjb21wYWN0ZWRTaXplO1xuICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gVGFibGVTbG90U3RhdGUuUG9pbnRlcikge1xuICAgICAgICB0YWJsZVtpXSA9IG9mZnNldCAtIGNvbXBhY3RlZFNpemU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5vZmZzZXQgPSB0aGlzLm9mZnNldCAtIGNvbXBhY3RlZFNpemU7XG4gIH1cblxuICBwdXNoUGxhY2Vob2xkZXIodmFsdWVGdW5jOiAoKSA9PiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLnNpemVDaGVjaygpO1xuICAgIGxldCBhZGRyZXNzID0gdGhpcy5vZmZzZXQrKztcbiAgICB0aGlzLmhlYXBbYWRkcmVzc10gPSBTaXplLk1BWF9TSVpFO1xuICAgIHRoaXMucGxhY2Vob2xkZXJzLnB1c2goW2FkZHJlc3MsIHZhbHVlRnVuY10pO1xuICB9XG5cbiAgcHVzaFN0ZGxpYihvcGVyYW5kOiBTdGRsaWJPcGVyYW5kKTogdm9pZCB7XG4gICAgdGhpcy5zaXplQ2hlY2soKTtcbiAgICBsZXQgYWRkcmVzcyA9IHRoaXMub2Zmc2V0Kys7XG4gICAgdGhpcy5oZWFwW2FkZHJlc3NdID0gU2l6ZS5NQVhfU0laRTtcbiAgICB0aGlzLnN0ZGxpYnMucHVzaChbYWRkcmVzcywgb3BlcmFuZF0pO1xuICB9XG5cbiAgcHJpdmF0ZSBwYXRjaFBsYWNlaG9sZGVycygpIHtcbiAgICBsZXQgeyBwbGFjZWhvbGRlcnMgfSA9IHRoaXM7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBsYWNlaG9sZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IFthZGRyZXNzLCBnZXRWYWx1ZV0gPSBwbGFjZWhvbGRlcnNbaV07XG5cbiAgICAgIGFzc2VydChcbiAgICAgICAgdGhpcy5nZXRieWFkZHIoYWRkcmVzcykgPT09IFNpemUuTUFYX1NJWkUsXG4gICAgICAgIGBleHBlY3RlZCB0byBmaW5kIGEgcGxhY2Vob2xkZXIgdmFsdWUgYXQgJHthZGRyZXNzfWBcbiAgICAgICk7XG4gICAgICB0aGlzLnNldGJ5YWRkcihhZGRyZXNzLCBnZXRWYWx1ZSgpKTtcbiAgICB9XG4gIH1cblxuICBwYXRjaFN0ZGxpYnMoc3RkbGliOiBTVERMaWIpOiB2b2lkIHtcbiAgICBsZXQgeyBzdGRsaWJzIH0gPSB0aGlzO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdGRsaWJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgW2FkZHJlc3MsIHsgdmFsdWUgfV0gPSBzdGRsaWJzW2ldO1xuXG4gICAgICBhc3NlcnQoXG4gICAgICAgIHRoaXMuZ2V0YnlhZGRyKGFkZHJlc3MpID09PSBTaXplLk1BWF9TSVpFLFxuICAgICAgICBgZXhwZWN0ZWQgdG8gZmluZCBhIHBsYWNlaG9sZGVyIHZhbHVlIGF0ICR7YWRkcmVzc31gXG4gICAgICApO1xuICAgICAgdGhpcy5zZXRieWFkZHIoYWRkcmVzcywgc3RkbGliW3ZhbHVlXSk7XG4gICAgfVxuXG4gICAgdGhpcy5zdGRsaWJzID0gW107XG4gIH1cblxuICBjYXB0dXJlKHN0ZGxpYjogU1RETGliLCBvZmZzZXQgPSB0aGlzLm9mZnNldCk6IFNlcmlhbGl6ZWRIZWFwIHtcbiAgICB0aGlzLnBhdGNoUGxhY2Vob2xkZXJzKCk7XG4gICAgdGhpcy5wYXRjaFN0ZGxpYnMoc3RkbGliKTtcblxuICAgIC8vIE9ubHkgY2FsbGVkIGluIGVhZ2VyIG1vZGVcbiAgICBsZXQgYnVmZmVyID0gc2xpY2UodGhpcy5oZWFwLCAwLCBvZmZzZXQpLmJ1ZmZlcjtcbiAgICByZXR1cm4ge1xuICAgICAgaGFuZGxlOiB0aGlzLmhhbmRsZSxcbiAgICAgIHRhYmxlOiB0aGlzLnRhYmxlLFxuICAgICAgYnVmZmVyOiBidWZmZXIgYXMgQXJyYXlCdWZmZXIsXG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUnVudGltZVByb2dyYW1JbXBsIGltcGxlbWVudHMgUnVudGltZVByb2dyYW0ge1xuICBba2V5OiBudW1iZXJdOiBuZXZlcjtcblxuICBzdGF0aWMgaHlkcmF0ZShhcnRpZmFjdHM6IENvbXBpbGVyQXJ0aWZhY3RzKSB7XG4gICAgbGV0IGhlYXAgPSBuZXcgUnVudGltZUhlYXBJbXBsKGFydGlmYWN0cy5oZWFwKTtcbiAgICBsZXQgY29uc3RhbnRzID0gbmV3IFJ1bnRpbWVDb25zdGFudHNJbXBsKGFydGlmYWN0cy5jb25zdGFudHMpO1xuXG4gICAgcmV0dXJuIG5ldyBSdW50aW1lUHJvZ3JhbUltcGwoY29uc3RhbnRzLCBoZWFwKTtcbiAgfVxuXG4gIHByaXZhdGUgX29wY29kZTogUnVudGltZU9wSW1wbDtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgY29uc3RhbnRzOiBSdW50aW1lQ29uc3RhbnRzLCBwdWJsaWMgaGVhcDogUnVudGltZUhlYXApIHtcbiAgICB0aGlzLl9vcGNvZGUgPSBuZXcgUnVudGltZU9wSW1wbCh0aGlzLmhlYXApO1xuICB9XG5cbiAgb3Bjb2RlKG9mZnNldDogbnVtYmVyKTogUnVudGltZU9wSW1wbCB7XG4gICAgdGhpcy5fb3Bjb2RlLm9mZnNldCA9IG9mZnNldDtcbiAgICByZXR1cm4gdGhpcy5fb3Bjb2RlO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoeWRyYXRlUHJvZ3JhbShhcnRpZmFjdHM6IENvbXBpbGVyQXJ0aWZhY3RzKTogUnVudGltZVByb2dyYW0ge1xuICBsZXQgaGVhcCA9IG5ldyBSdW50aW1lSGVhcEltcGwoYXJ0aWZhY3RzLmhlYXApO1xuICBsZXQgY29uc3RhbnRzID0gbmV3IFJ1bnRpbWVDb25zdGFudHNJbXBsKGFydGlmYWN0cy5jb25zdGFudHMpO1xuXG4gIHJldHVybiBuZXcgUnVudGltZVByb2dyYW1JbXBsKGNvbnN0YW50cywgaGVhcCk7XG59XG5cbmZ1bmN0aW9uIHNsaWNlKGFycjogVWludDMyQXJyYXksIHN0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyKTogVWludDMyQXJyYXkge1xuICBpZiAoYXJyLnNsaWNlICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gYXJyLnNsaWNlKHN0YXJ0LCBlbmQpO1xuICB9XG5cbiAgbGV0IHJldCA9IG5ldyBVaW50MzJBcnJheShlbmQpO1xuXG4gIGZvciAoOyBzdGFydCA8IGVuZDsgc3RhcnQrKykge1xuICAgIHJldFtzdGFydF0gPSBhcnJbc3RhcnRdO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn1cblxuZnVuY3Rpb24gc2l6ZW9mKHRhYmxlOiBudW1iZXJbXSwgaGFuZGxlOiBudW1iZXIpIHtcbiAgaWYgKERFQlVHKSB7XG4gICAgcmV0dXJuIHRhYmxlW2hhbmRsZSArIFNpemUuU0laRV9PRkZTRVRdO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAtMTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzY29wZXNpemVvZih0YWJsZTogbnVtYmVyW10sIGhhbmRsZTogbnVtYmVyKSB7XG4gIGxldCBpbmZvID0gdGFibGVbaGFuZGxlICsgU2l6ZS5JTkZPX09GRlNFVF07XG4gIHJldHVybiBpbmZvID4+IDI7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9