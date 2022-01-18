
import { RuntimeConstantsImpl } from './constants';
import { RuntimeOpImpl } from './opcode';
import { assert } from '@glimmer/util';
function encodeTableInfo(scopeSize, state) {
    (false && assert(scopeSize > -1 && state > -1, 'Size, scopeSize or state were less than 0'));
    (false && assert(state < 1 << 2, 'State is more than 2 bits'));
    (false && assert(scopeSize < 1 << 30, 'Scope is more than 30-bits'));

    return state | scopeSize << 2;
}
function changeState(info, newState) {
    (false && assert(info > -1 && newState > -1, 'Info or state were less than 0'));
    (false && assert(newState < 1 << 2, 'State is more than 2 bits'));
    (false && assert(info < 1 << 30, 'Info is more than 30 bits'));

    return info | newState << 30;
}
const PAGE_SIZE = 0x100000;
export class RuntimeHeapImpl {
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
        (false && assert(this.heap[address] !== undefined, 'Access memory out of bounds of the heap'));

        return this.heap[address];
    }
    sizeof(handle) {
        return sizeof(this.table, handle);
    }
    scopesizeof(handle) {
        return scopesizeof(this.table, handle);
    }
}
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
export class HeapImpl {
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
            (false && assert(this.getbyaddr(address) === 2147483647 /* MAX_SIZE */, `expected to find a placeholder value at ${address}`));

            this.setbyaddr(address, getValue());
        }
    }
    patchStdlibs(stdlib) {
        let { stdlibs } = this;
        for (let i = 0; i < stdlibs.length; i++) {
            let [address, { value }] = stdlibs[i];
            (false && assert(this.getbyaddr(address) === 2147483647 /* MAX_SIZE */, `expected to find a placeholder value at ${address}`));

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
export class RuntimeProgramImpl {
    constructor(constants, heap) {
        this.constants = constants;
        this.heap = heap;
        this._opcode = new RuntimeOpImpl(this.heap);
    }
    static hydrate(artifacts) {
        let heap = new RuntimeHeapImpl(artifacts.heap);
        let constants = new RuntimeConstantsImpl(artifacts.constants);
        return new RuntimeProgramImpl(constants, heap);
    }
    opcode(offset) {
        this._opcode.offset = offset;
        return this._opcode;
    }
}
export function hydrateProgram(artifacts) {
    let heap = new RuntimeHeapImpl(artifacts.heap);
    let constants = new RuntimeConstantsImpl(artifacts.constants);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3Byb2dyYW0vbGliL3Byb2dyYW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQVdBLFNBQVMsb0JBQVQsUUFBcUMsYUFBckM7QUFDQSxTQUFTLGFBQVQsUUFBOEIsVUFBOUI7QUFDQSxTQUFTLE1BQVQsUUFBdUIsZUFBdkI7QUFrQkEsU0FBUyxlQUFULENBQXlCLFNBQXpCLEVBQTRDLEtBQTVDLEVBQXlEO0FBQUEsY0FDdkQsT0FBTyxZQUFZLENBQUMsQ0FBYixJQUFrQixRQUFRLENBQUMsQ0FBbEMsRUFBcUMsMkNBQXJDLENBRHVEO0FBQUEsY0FFdkQsT0FBTyxRQUFRLEtBQUssQ0FBcEIsRUFBdUIsMkJBQXZCLENBRnVEO0FBQUEsY0FHdkQsT0FBTyxZQUFZLEtBQUssRUFBeEIsRUFBNEIsNEJBQTVCLENBSHVEOztBQUl2RCxXQUFPLFFBQVMsYUFBYSxDQUE3QjtBQUNEO0FBRUQsU0FBUyxXQUFULENBQXFCLElBQXJCLEVBQW1DLFFBQW5DLEVBQW1EO0FBQUEsY0FDakQsT0FBTyxPQUFPLENBQUMsQ0FBUixJQUFhLFdBQVcsQ0FBQyxDQUFoQyxFQUFtQyxnQ0FBbkMsQ0FEaUQ7QUFBQSxjQUVqRCxPQUFPLFdBQVcsS0FBSyxDQUF2QixFQUEwQiwyQkFBMUIsQ0FGaUQ7QUFBQSxjQUdqRCxPQUFPLE9BQU8sS0FBSyxFQUFuQixFQUF1QiwyQkFBdkIsQ0FIaUQ7O0FBS2pELFdBQU8sT0FBUSxZQUFZLEVBQTNCO0FBQ0Q7QUFLRCxNQUFNLFlBQVksUUFBbEI7QUFFQSxPQUFNLE1BQU8sZUFBUCxDQUFzQjtBQUkxQixnQkFBWSxjQUFaLEVBQTBDO0FBQ3hDLFlBQUksRUFBRSxNQUFGLEVBQVUsS0FBVixLQUFvQixjQUF4QjtBQUNBLGFBQUssSUFBTCxHQUFZLElBQUksV0FBSixDQUFnQixNQUFoQixDQUFaO0FBQ0EsYUFBSyxLQUFMLEdBQWEsS0FBYjtBQUNEO0FBRUQ7QUFDQTtBQUNBO0FBQ0Es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akMsRUFBK0M7QUFDN0MsZUFBVztBQUNULGVBQU8sTUFBTSxTQUFNLENBQVosQ0FBWSxpQkFBWixDQUFQO0FBQ0QsS0FGRCxNQUVPO0FBQ0wsZUFBTyxDQUFDLENBQVI7QUFDRDtBQUNGO0FBRUQsU0FBUyxXQUFULENBQXFCLEtBQXJCLEVBQXNDLE1BQXRDLEVBQW9EO0FBQ2xELFFBQUksT0FBTyxNQUFNLFNBQU0sQ0FBWixDQUFZLGlCQUFaLENBQVg7QUFDQSxXQUFPLFFBQVEsQ0FBZjtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQ29tcGlsZVRpbWVIZWFwLFxuICBTZXJpYWxpemVkSGVhcCxcbiAgU1RETGliLFxuICBSdW50aW1lSGVhcCxcbiAgU3RkbGliT3BlcmFuZCxcbiAgUnVudGltZUNvbnN0YW50cyxcbiAgUnVudGltZVByb2dyYW0sXG4gIENvbXBpbGVyQXJ0aWZhY3RzLFxufSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IERFQlVHIH0gZnJvbSAnQGdsaW1tZXIvbG9jYWwtZGVidWctZmxhZ3MnO1xuaW1wb3J0IHsgUnVudGltZUNvbnN0YW50c0ltcGwgfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBSdW50aW1lT3BJbXBsIH0gZnJvbSAnLi9vcGNvZGUnO1xuaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5cbmNvbnN0IGVudW0gVGFibGVTbG90U3RhdGUge1xuICBBbGxvY2F0ZWQsXG4gIEZyZWVkLFxuICBQdXJnZWQsXG4gIFBvaW50ZXIsXG59XG5cbmNvbnN0IGVudW0gU2l6ZSB7XG4gIEVOVFJZX1NJWkUgPSAzLFxuICBJTkZPX09GRlNFVCA9IDEsXG4gIFNJWkVfT0ZGU0VUID0gMixcbiAgTUFYX1NJWkUgPSAwYjExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEsXG4gIFNDT1BFX01BU0sgPSAwYjExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDAsXG4gIFNUQVRFX01BU0sgPSAwYjExLFxufVxuXG5mdW5jdGlvbiBlbmNvZGVUYWJsZUluZm8oc2NvcGVTaXplOiBudW1iZXIsIHN0YXRlOiBudW1iZXIpIHtcbiAgYXNzZXJ0KHNjb3BlU2l6ZSA+IC0xICYmIHN0YXRlID4gLTEsICdTaXplLCBzY29wZVNpemUgb3Igc3RhdGUgd2VyZSBsZXNzIHRoYW4gMCcpO1xuICBhc3NlcnQoc3RhdGUgPCAxIDw8IDIsICdTdGF0ZSBpcyBtb3JlIHRoYW4gMiBiaXRzJyk7XG4gIGFzc2VydChzY29wZVNpemUgPCAxIDw8IDMwLCAnU2NvcGUgaXMgbW9yZSB0aGFuIDMwLWJpdHMnKTtcbiAgcmV0dXJuIHN0YXRlIHwgKHNjb3BlU2l6ZSA8PCAyKTtcbn1cblxuZnVuY3Rpb24gY2hhbmdlU3RhdGUoaW5mbzogbnVtYmVyLCBuZXdTdGF0ZTogbnVtYmVyKSB7XG4gIGFzc2VydChpbmZvID4gLTEgJiYgbmV3U3RhdGUgPiAtMSwgJ0luZm8gb3Igc3RhdGUgd2VyZSBsZXNzIHRoYW4gMCcpO1xuICBhc3NlcnQobmV3U3RhdGUgPCAxIDw8IDIsICdTdGF0ZSBpcyBtb3JlIHRoYW4gMiBiaXRzJyk7XG4gIGFzc2VydChpbmZvIDwgMSA8PCAzMCwgJ0luZm8gaXMgbW9yZSB0aGFuIDMwIGJpdHMnKTtcblxuICByZXR1cm4gaW5mbyB8IChuZXdTdGF0ZSA8PCAzMCk7XG59XG5cbmV4cG9ydCB0eXBlIFBsYWNlaG9sZGVyID0gW251bWJlciwgKCkgPT4gbnVtYmVyXTtcbmV4cG9ydCB0eXBlIFN0ZGxpYlBsYWNlaG9sZGVyID0gW251bWJlciwgU3RkbGliT3BlcmFuZF07XG5cbmNvbnN0IFBBR0VfU0laRSA9IDB4MTAwMDAwO1xuXG5leHBvcnQgY2xhc3MgUnVudGltZUhlYXBJbXBsIGltcGxlbWVudHMgUnVudGltZUhlYXAge1xuICBwcml2YXRlIGhlYXA6IFVpbnQzMkFycmF5O1xuICBwcml2YXRlIHRhYmxlOiBudW1iZXJbXTtcblxuICBjb25zdHJ1Y3RvcihzZXJpYWxpemVkSGVhcDogU2VyaWFsaXplZEhlYXApIHtcbiAgICBsZXQgeyBidWZmZXIsIHRhYmxlIH0gPSBzZXJpYWxpemVkSGVhcDtcbiAgICB0aGlzLmhlYXAgPSBuZXcgVWludDMyQXJyYXkoYnVmZmVyKTtcbiAgICB0aGlzLnRhYmxlID0gdGFibGU7XG4gIH1cblxuICAvLyBJdCBpcyBpbGxlZ2FsIHRvIGNsb3NlIG92ZXIgdGhpcyBhZGRyZXNzLCBhcyBjb21wYWN0aW9uXG4gIC8vIG1heSBtb3ZlIGl0LiBIb3dldmVyLCBpdCBpcyBsZWdhbCB0byB1c2UgdGhpcyBhZGRyZXNzXG4gIC8vIG11bHRpcGxlIHRpbWVzIGJldHdlZW4gY29tcGFjdGlvbnMuXG4gIGdldGFkZHIoaGFuZGxlOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnRhYmxlW2hhbmRsZV07XG4gIH1cblxuICBnZXRieWFkZHIoYWRkcmVzczogbnVtYmVyKTogbnVtYmVyIHtcbiAgICBhc3NlcnQodGhpcy5oZWFwW2FkZHJlc3NdICE9PSB1bmRlZmluZWQsICdBY2Nlc3MgbWVtb3J5IG91dCBvZiBib3VuZHMgb2YgdGhlIGhlYXAnKTtcbiAgICByZXR1cm4gdGhpcy5oZWFwW2FkZHJlc3NdO1xuICB9XG5cbiAgc2l6ZW9mKGhhbmRsZTogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gc2l6ZW9mKHRoaXMudGFibGUsIGhhbmRsZSk7XG4gIH1cblxuICBzY29wZXNpemVvZihoYW5kbGU6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIHNjb3Blc2l6ZW9mKHRoaXMudGFibGUsIGhhbmRsZSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGh5ZHJhdGVIZWFwKHNlcmlhbGl6ZWRIZWFwOiBTZXJpYWxpemVkSGVhcCk6IFJ1bnRpbWVIZWFwIHtcbiAgcmV0dXJuIG5ldyBSdW50aW1lSGVhcEltcGwoc2VyaWFsaXplZEhlYXApO1xufVxuXG4vKipcbiAqIFRoZSBIZWFwIGlzIHJlc3BvbnNpYmxlIGZvciBkeW5hbWljYWxseSBhbGxvY2F0aW5nXG4gKiBtZW1vcnkgaW4gd2hpY2ggd2UgcmVhZC93cml0ZSB0aGUgVk0ncyBpbnN0cnVjdGlvbnNcbiAqIGZyb20vdG8uIFdoZW4gd2UgbWFsbG9jIHdlIHBhc3Mgb3V0IGEgVk1IYW5kbGUsIHdoaWNoXG4gKiBpcyB1c2VkIGFzIGFuIGluZGlyZWN0IHdheSBvZiBhY2Nlc3NpbmcgdGhlIG1lbW9yeSBkdXJpbmdcbiAqIGV4ZWN1dGlvbiBvZiB0aGUgVk0uIEludGVybmFsbHkgd2UgdHJhY2sgdGhlIGRpZmZlcmVudFxuICogcmVnaW9ucyBvZiB0aGUgbWVtb3J5IGluIGFuIGludCBhcnJheSBrbm93biBhcyB0aGUgdGFibGUuXG4gKlxuICogVGhlIHRhYmxlIDMyLWJpdCBhbGlnbmVkIGFuZCBoYXMgdGhlIGZvbGxvd2luZyBsYXlvdXQ6XG4gKlxuICogfCAuLi4gfCBocCAodTMyKSB8ICAgICAgIGluZm8gKHUzMikgICB8IHNpemUgKHUzMikgfFxuICogfCAuLi4gfCAgSGFuZGxlICB8IFNjb3BlIFNpemUgfCBTdGF0ZSB8IFNpemUgICAgICAgfFxuICogfCAuLi4gfCAzMmJpdHMgICB8IDMwYml0cyAgICAgfCAyYml0cyB8IDMyYml0ICAgICAgfFxuICpcbiAqIFdpdGggdGhpcyBpbmZvcm1hdGlvbiB3ZSBlZmZlY3RpdmVseSBoYXZlIHRoZSBhYmlsaXR5IHRvXG4gKiBjb250cm9sIHdoZW4gd2Ugd2FudCB0byBmcmVlIG1lbW9yeS4gVGhhdCBiZWluZyBzYWlkIHlvdVxuICogY2FuIG5vdCBmcmVlIGR1cmluZyBleGVjdXRpb24gYXMgcmF3IGFkZHJlc3MgYXJlIG9ubHlcbiAqIHZhbGlkIGR1cmluZyB0aGUgZXhlY3V0aW9uLiBUaGlzIG1lYW5zIHlvdSBjYW5ub3QgY2xvc2VcbiAqIG92ZXIgdGhlbSBhcyB5b3Ugd2lsbCBoYXZlIGEgYmFkIG1lbW9yeSBhY2Nlc3MgZXhjZXB0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgSGVhcEltcGwgaW1wbGVtZW50cyBDb21waWxlVGltZUhlYXAsIFJ1bnRpbWVIZWFwIHtcbiAgcHJpdmF0ZSBoZWFwOiBVaW50MzJBcnJheTtcbiAgcHJpdmF0ZSBwbGFjZWhvbGRlcnM6IFBsYWNlaG9sZGVyW10gPSBbXTtcbiAgcHJpdmF0ZSBzdGRsaWJzOiBTdGRsaWJQbGFjZWhvbGRlcltdID0gW107XG4gIHByaXZhdGUgdGFibGU6IG51bWJlcltdO1xuICBwcml2YXRlIG9mZnNldCA9IDA7XG4gIHByaXZhdGUgaGFuZGxlID0gMDtcbiAgcHJpdmF0ZSBjYXBhY2l0eSA9IFBBR0VfU0laRTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmhlYXAgPSBuZXcgVWludDMyQXJyYXkoUEFHRV9TSVpFKTtcbiAgICB0aGlzLnRhYmxlID0gW107XG4gIH1cblxuICBwdXNoKGl0ZW06IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuc2l6ZUNoZWNrKCk7XG4gICAgdGhpcy5oZWFwW3RoaXMub2Zmc2V0KytdID0gaXRlbTtcbiAgfVxuXG4gIHByaXZhdGUgc2l6ZUNoZWNrKCkge1xuICAgIGlmICh0aGlzLmNhcGFjaXR5ID09PSAwKSB7XG4gICAgICBsZXQgaGVhcCA9IHNsaWNlKHRoaXMuaGVhcCwgMCwgdGhpcy5vZmZzZXQpO1xuICAgICAgdGhpcy5oZWFwID0gbmV3IFVpbnQzMkFycmF5KGhlYXAubGVuZ3RoICsgUEFHRV9TSVpFKTtcbiAgICAgIHRoaXMuaGVhcC5zZXQoaGVhcCwgMCk7XG4gICAgICB0aGlzLmNhcGFjaXR5ID0gUEFHRV9TSVpFO1xuICAgIH1cbiAgICB0aGlzLmNhcGFjaXR5LS07XG4gIH1cblxuICBnZXRieWFkZHIoYWRkcmVzczogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5oZWFwW2FkZHJlc3NdO1xuICB9XG5cbiAgc2V0YnlhZGRyKGFkZHJlc3M6IG51bWJlciwgdmFsdWU6IG51bWJlcikge1xuICAgIHRoaXMuaGVhcFthZGRyZXNzXSA9IHZhbHVlO1xuICB9XG5cbiAgbWFsbG9jKCk6IG51bWJlciB7XG4gICAgLy8gcHVzaCBvZmZzZXQsIGluZm8sIHNpemVcbiAgICB0aGlzLnRhYmxlLnB1c2godGhpcy5vZmZzZXQsIDAsIDApO1xuICAgIGxldCBoYW5kbGUgPSB0aGlzLmhhbmRsZTtcbiAgICB0aGlzLmhhbmRsZSArPSBTaXplLkVOVFJZX1NJWkU7XG4gICAgcmV0dXJuIGhhbmRsZTtcbiAgfVxuXG4gIGZpbmlzaE1hbGxvYyhoYW5kbGU6IG51bWJlciwgc2NvcGVTaXplOiBudW1iZXIpOiB2b2lkIHtcbiAgICBpZiAoREVCVUcpIHtcbiAgICAgIGxldCBzdGFydCA9IHRoaXMudGFibGVbaGFuZGxlXTtcbiAgICAgIGxldCBmaW5pc2ggPSB0aGlzLm9mZnNldDtcbiAgICAgIGxldCBpbnN0cnVjdGlvblNpemUgPSBmaW5pc2ggLSBzdGFydDtcbiAgICAgIHRoaXMudGFibGVbaGFuZGxlICsgU2l6ZS5TSVpFX09GRlNFVF0gPSBpbnN0cnVjdGlvblNpemU7XG4gICAgfVxuICAgIHRoaXMudGFibGVbaGFuZGxlICsgU2l6ZS5JTkZPX09GRlNFVF0gPSBlbmNvZGVUYWJsZUluZm8oc2NvcGVTaXplLCBUYWJsZVNsb3RTdGF0ZS5BbGxvY2F0ZWQpO1xuICB9XG5cbiAgc2l6ZSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLm9mZnNldDtcbiAgfVxuXG4gIC8vIEl0IGlzIGlsbGVnYWwgdG8gY2xvc2Ugb3ZlciB0aGlzIGFkZHJlc3MsIGFzIGNvbXBhY3Rpb25cbiAgLy8gbWF5IG1vdmUgaXQuIEhvd2V2ZXIsIGl0IGlzIGxlZ2FsIHRvIHVzZSB0aGlzIGFkZHJlc3NcbiAgLy8gbXVsdGlwbGUgdGltZXMgYmV0d2VlbiBjb21wYWN0aW9ucy5cbiAgZ2V0YWRkcihoYW5kbGU6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMudGFibGVbaGFuZGxlXTtcbiAgfVxuXG4gIGdldGhhbmRsZShhZGRyZXNzOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHRoaXMudGFibGUucHVzaChhZGRyZXNzLCBlbmNvZGVUYWJsZUluZm8oMCwgVGFibGVTbG90U3RhdGUuUG9pbnRlciksIDApO1xuICAgIGxldCBoYW5kbGUgPSB0aGlzLmhhbmRsZTtcbiAgICB0aGlzLmhhbmRsZSArPSBTaXplLkVOVFJZX1NJWkU7XG4gICAgcmV0dXJuIGhhbmRsZTtcbiAgfVxuXG4gIHNpemVvZihoYW5kbGU6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIHNpemVvZih0aGlzLnRhYmxlLCBoYW5kbGUpO1xuICB9XG5cbiAgc2NvcGVzaXplb2YoaGFuZGxlOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiBzY29wZXNpemVvZih0aGlzLnRhYmxlLCBoYW5kbGUpO1xuICB9XG5cbiAgZnJlZShoYW5kbGU6IG51bWJlcik6IHZvaWQge1xuICAgIGxldCBpbmZvID0gdGhpcy50YWJsZVtoYW5kbGUgKyBTaXplLklORk9fT0ZGU0VUXTtcbiAgICB0aGlzLnRhYmxlW2hhbmRsZSArIFNpemUuSU5GT19PRkZTRVRdID0gY2hhbmdlU3RhdGUoaW5mbywgVGFibGVTbG90U3RhdGUuRnJlZWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBoZWFwIHVzZXMgdGhlIFtNYXJrLUNvbXBhY3QgQWxnb3JpdGhtXShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9NYXJrLWNvbXBhY3RfYWxnb3JpdGhtKSB0byBzaGlmdFxuICAgKiByZWFjaGFibGUgbWVtb3J5IHRvIHRoZSBib3R0b20gb2YgdGhlIGhlYXAgYW5kIGZyZWVhYmxlXG4gICAqIG1lbW9yeSB0byB0aGUgdG9wIG9mIHRoZSBoZWFwLiBXaGVuIHdlIGhhdmUgc2hpZnRlZCBhbGxcbiAgICogdGhlIHJlYWNoYWJsZSBtZW1vcnkgdG8gdGhlIHRvcCBvZiB0aGUgaGVhcCwgd2UgbW92ZSB0aGVcbiAgICogb2Zmc2V0IHRvIHRoZSBuZXh0IGZyZWUgcG9zaXRpb24uXG4gICAqL1xuICBjb21wYWN0KCk6IHZvaWQge1xuICAgIGxldCBjb21wYWN0ZWRTaXplID0gMDtcbiAgICBsZXQge1xuICAgICAgdGFibGUsXG4gICAgICB0YWJsZTogeyBsZW5ndGggfSxcbiAgICAgIGhlYXAsXG4gICAgfSA9IHRoaXM7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSArPSBTaXplLkVOVFJZX1NJWkUpIHtcbiAgICAgIGxldCBvZmZzZXQgPSB0YWJsZVtpXTtcbiAgICAgIGxldCBpbmZvID0gdGFibGVbaSArIFNpemUuSU5GT19PRkZTRVRdO1xuICAgICAgLy8gQHRzLWlnbm9yZSAodGhpcyB3aG9sZSBmdW5jdGlvbiBpcyBjdXJyZW50bHkgdW51c2VkKVxuICAgICAgbGV0IHNpemUgPSBpbmZvICYgU2l6ZS5TSVpFX01BU0s7XG4gICAgICBsZXQgc3RhdGUgPSBpbmZvICYgKFNpemUuU1RBVEVfTUFTSyA+PiAzMCk7XG5cbiAgICAgIGlmIChzdGF0ZSA9PT0gVGFibGVTbG90U3RhdGUuUHVyZ2VkKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gVGFibGVTbG90U3RhdGUuRnJlZWQpIHtcbiAgICAgICAgLy8gdHJhbnNpdGlvbiB0byBcImFscmVhZHkgZnJlZWRcIiBha2EgXCJwdXJnZWRcIlxuICAgICAgICAvLyBhIGdvb2QgaW1wcm92ZW1lbnQgd291bGQgYmUgdG8gcmV1c2VcbiAgICAgICAgLy8gdGhlc2Ugc2xvdHNcbiAgICAgICAgdGFibGVbaSArIFNpemUuSU5GT19PRkZTRVRdID0gY2hhbmdlU3RhdGUoaW5mbywgVGFibGVTbG90U3RhdGUuUHVyZ2VkKTtcbiAgICAgICAgY29tcGFjdGVkU2l6ZSArPSBzaXplO1xuICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gVGFibGVTbG90U3RhdGUuQWxsb2NhdGVkKSB7XG4gICAgICAgIGZvciAobGV0IGogPSBvZmZzZXQ7IGogPD0gaSArIHNpemU7IGorKykge1xuICAgICAgICAgIGhlYXBbaiAtIGNvbXBhY3RlZFNpemVdID0gaGVhcFtqXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRhYmxlW2ldID0gb2Zmc2V0IC0gY29tcGFjdGVkU2l6ZTtcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IFRhYmxlU2xvdFN0YXRlLlBvaW50ZXIpIHtcbiAgICAgICAgdGFibGVbaV0gPSBvZmZzZXQgLSBjb21wYWN0ZWRTaXplO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMub2Zmc2V0ID0gdGhpcy5vZmZzZXQgLSBjb21wYWN0ZWRTaXplO1xuICB9XG5cbiAgcHVzaFBsYWNlaG9sZGVyKHZhbHVlRnVuYzogKCkgPT4gbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5zaXplQ2hlY2soKTtcbiAgICBsZXQgYWRkcmVzcyA9IHRoaXMub2Zmc2V0Kys7XG4gICAgdGhpcy5oZWFwW2FkZHJlc3NdID0gU2l6ZS5NQVhfU0laRTtcbiAgICB0aGlzLnBsYWNlaG9sZGVycy5wdXNoKFthZGRyZXNzLCB2YWx1ZUZ1bmNdKTtcbiAgfVxuXG4gIHB1c2hTdGRsaWIob3BlcmFuZDogU3RkbGliT3BlcmFuZCk6IHZvaWQge1xuICAgIHRoaXMuc2l6ZUNoZWNrKCk7XG4gICAgbGV0IGFkZHJlc3MgPSB0aGlzLm9mZnNldCsrO1xuICAgIHRoaXMuaGVhcFthZGRyZXNzXSA9IFNpemUuTUFYX1NJWkU7XG4gICAgdGhpcy5zdGRsaWJzLnB1c2goW2FkZHJlc3MsIG9wZXJhbmRdKTtcbiAgfVxuXG4gIHByaXZhdGUgcGF0Y2hQbGFjZWhvbGRlcnMoKSB7XG4gICAgbGV0IHsgcGxhY2Vob2xkZXJzIH0gPSB0aGlzO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwbGFjZWhvbGRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBbYWRkcmVzcywgZ2V0VmFsdWVdID0gcGxhY2Vob2xkZXJzW2ldO1xuXG4gICAgICBhc3NlcnQoXG4gICAgICAgIHRoaXMuZ2V0YnlhZGRyKGFkZHJlc3MpID09PSBTaXplLk1BWF9TSVpFLFxuICAgICAgICBgZXhwZWN0ZWQgdG8gZmluZCBhIHBsYWNlaG9sZGVyIHZhbHVlIGF0ICR7YWRkcmVzc31gXG4gICAgICApO1xuICAgICAgdGhpcy5zZXRieWFkZHIoYWRkcmVzcywgZ2V0VmFsdWUoKSk7XG4gICAgfVxuICB9XG5cbiAgcGF0Y2hTdGRsaWJzKHN0ZGxpYjogU1RETGliKTogdm9pZCB7XG4gICAgbGV0IHsgc3RkbGlicyB9ID0gdGhpcztcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RkbGlicy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IFthZGRyZXNzLCB7IHZhbHVlIH1dID0gc3RkbGlic1tpXTtcblxuICAgICAgYXNzZXJ0KFxuICAgICAgICB0aGlzLmdldGJ5YWRkcihhZGRyZXNzKSA9PT0gU2l6ZS5NQVhfU0laRSxcbiAgICAgICAgYGV4cGVjdGVkIHRvIGZpbmQgYSBwbGFjZWhvbGRlciB2YWx1ZSBhdCAke2FkZHJlc3N9YFxuICAgICAgKTtcbiAgICAgIHRoaXMuc2V0YnlhZGRyKGFkZHJlc3MsIHN0ZGxpYlt2YWx1ZV0pO1xuICAgIH1cblxuICAgIHRoaXMuc3RkbGlicyA9IFtdO1xuICB9XG5cbiAgY2FwdHVyZShzdGRsaWI6IFNURExpYiwgb2Zmc2V0ID0gdGhpcy5vZmZzZXQpOiBTZXJpYWxpemVkSGVhcCB7XG4gICAgdGhpcy5wYXRjaFBsYWNlaG9sZGVycygpO1xuICAgIHRoaXMucGF0Y2hTdGRsaWJzKHN0ZGxpYik7XG5cbiAgICAvLyBPbmx5IGNhbGxlZCBpbiBlYWdlciBtb2RlXG4gICAgbGV0IGJ1ZmZlciA9IHNsaWNlKHRoaXMuaGVhcCwgMCwgb2Zmc2V0KS5idWZmZXI7XG4gICAgcmV0dXJuIHtcbiAgICAgIGhhbmRsZTogdGhpcy5oYW5kbGUsXG4gICAgICB0YWJsZTogdGhpcy50YWJsZSxcbiAgICAgIGJ1ZmZlcjogYnVmZmVyIGFzIEFycmF5QnVmZmVyLFxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJ1bnRpbWVQcm9ncmFtSW1wbCBpbXBsZW1lbnRzIFJ1bnRpbWVQcm9ncmFtIHtcbiAgW2tleTogbnVtYmVyXTogbmV2ZXI7XG5cbiAgc3RhdGljIGh5ZHJhdGUoYXJ0aWZhY3RzOiBDb21waWxlckFydGlmYWN0cykge1xuICAgIGxldCBoZWFwID0gbmV3IFJ1bnRpbWVIZWFwSW1wbChhcnRpZmFjdHMuaGVhcCk7XG4gICAgbGV0IGNvbnN0YW50cyA9IG5ldyBSdW50aW1lQ29uc3RhbnRzSW1wbChhcnRpZmFjdHMuY29uc3RhbnRzKTtcblxuICAgIHJldHVybiBuZXcgUnVudGltZVByb2dyYW1JbXBsKGNvbnN0YW50cywgaGVhcCk7XG4gIH1cblxuICBwcml2YXRlIF9vcGNvZGU6IFJ1bnRpbWVPcEltcGw7XG5cbiAgY29uc3RydWN0b3IocHVibGljIGNvbnN0YW50czogUnVudGltZUNvbnN0YW50cywgcHVibGljIGhlYXA6IFJ1bnRpbWVIZWFwKSB7XG4gICAgdGhpcy5fb3Bjb2RlID0gbmV3IFJ1bnRpbWVPcEltcGwodGhpcy5oZWFwKTtcbiAgfVxuXG4gIG9wY29kZShvZmZzZXQ6IG51bWJlcik6IFJ1bnRpbWVPcEltcGwge1xuICAgIHRoaXMuX29wY29kZS5vZmZzZXQgPSBvZmZzZXQ7XG4gICAgcmV0dXJuIHRoaXMuX29wY29kZTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaHlkcmF0ZVByb2dyYW0oYXJ0aWZhY3RzOiBDb21waWxlckFydGlmYWN0cyk6IFJ1bnRpbWVQcm9ncmFtIHtcbiAgbGV0IGhlYXAgPSBuZXcgUnVudGltZUhlYXBJbXBsKGFydGlmYWN0cy5oZWFwKTtcbiAgbGV0IGNvbnN0YW50cyA9IG5ldyBSdW50aW1lQ29uc3RhbnRzSW1wbChhcnRpZmFjdHMuY29uc3RhbnRzKTtcblxuICByZXR1cm4gbmV3IFJ1bnRpbWVQcm9ncmFtSW1wbChjb25zdGFudHMsIGhlYXApO1xufVxuXG5mdW5jdGlvbiBzbGljZShhcnI6IFVpbnQzMkFycmF5LCBzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcik6IFVpbnQzMkFycmF5IHtcbiAgaWYgKGFyci5zbGljZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGFyci5zbGljZShzdGFydCwgZW5kKTtcbiAgfVxuXG4gIGxldCByZXQgPSBuZXcgVWludDMyQXJyYXkoZW5kKTtcblxuICBmb3IgKDsgc3RhcnQgPCBlbmQ7IHN0YXJ0KyspIHtcbiAgICByZXRbc3RhcnRdID0gYXJyW3N0YXJ0XTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59XG5cbmZ1bmN0aW9uIHNpemVvZih0YWJsZTogbnVtYmVyW10sIGhhbmRsZTogbnVtYmVyKSB7XG4gIGlmIChERUJVRykge1xuICAgIHJldHVybiB0YWJsZVtoYW5kbGUgKyBTaXplLlNJWkVfT0ZGU0VUXTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gLTE7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2NvcGVzaXplb2YodGFibGU6IG51bWJlcltdLCBoYW5kbGU6IG51bWJlcikge1xuICBsZXQgaW5mbyA9IHRhYmxlW2hhbmRsZSArIFNpemUuSU5GT19PRkZTRVRdO1xuICByZXR1cm4gaW5mbyA+PiAyO1xufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==