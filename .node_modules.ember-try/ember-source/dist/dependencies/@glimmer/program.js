import { constants } from '@glimmer/util';
const WELL_KNOWN_EMPTY_ARRAY = Object.freeze([]);
const STARTER_CONSTANTS = constants(WELL_KNOWN_EMPTY_ARRAY);
const WELL_KNOWN_EMPTY_ARRAY_POSITION = STARTER_CONSTANTS.indexOf(WELL_KNOWN_EMPTY_ARRAY);

class WriteOnlyConstants {
  constructor() {
    // `0` means NULL
    this.values = STARTER_CONSTANTS.slice();
    this.indexMap = new Map(this.values.map((value, index) => [value, index]));
  }

  value(value) {
    let indexMap = this.indexMap;
    let index = indexMap.get(value);

    if (index === undefined) {
      index = this.values.push(value) - 1;
      indexMap.set(value, index);
    }

    return index;
  }

  array(values) {
    if (values.length === 0) {
      return WELL_KNOWN_EMPTY_ARRAY_POSITION;
    }

    let handles = new Array(values.length);

    for (let i = 0; i < values.length; i++) {
      handles[i] = this.value(values[i]);
    }

    return this.value(handles);
  }

  serializable(value) {
    let str = JSON.stringify(value);
    return this.value(str);
  }

  toPool() {
    return this.values;
  }

}

class RuntimeConstantsImpl {
  constructor(pool) {
    this.values = pool;
  }

  getValue(handle) {
    return this.values[handle];
  }

  getArray(value) {
    let handles = this.getValue(value);
    let reified = new Array(handles.length);

    for (let i = 0; i < handles.length; i++) {
      let n = handles[i];
      reified[i] = this.getValue(n);
    }

    return reified;
  }

  getSerializable(s) {
    return JSON.parse(this.values[s]);
  }

}

class JitConstants extends WriteOnlyConstants {
  constructor() {
    super(...arguments);
    this.reifiedArrs = {
      [WELL_KNOWN_EMPTY_ARRAY_POSITION]: WELL_KNOWN_EMPTY_ARRAY
    };
  }

  templateMeta(meta) {
    return this.value(meta);
  }

  getValue(index) {
    return this.values[index];
  }

  getArray(index) {
    let reifiedArrs = this.reifiedArrs;
    let reified = reifiedArrs[index];

    if (reified === undefined) {
      let names = this.getValue(index);
      reified = new Array(names.length);

      for (let i = 0; i < names.length; i++) {
        reified[i] = this.getValue(names[i]);
      }

      reifiedArrs[index] = reified;
    }

    return reified;
  }

  getSerializable(s) {
    return JSON.parse(this.getValue(s));
  }

}

class RuntimeOpImpl {
  constructor(heap) {
    this.heap = heap;
    this.offset = 0;
  }

  get size() {
    let rawType = this.heap.getbyaddr(this.offset);
    return ((rawType & 768
    /* OPERAND_LEN_MASK */
    ) >> 8
    /* ARG_SHIFT */
    ) + 1;
  }

  get isMachine() {
    let rawType = this.heap.getbyaddr(this.offset);
    return rawType & 1024
    /* MACHINE_MASK */
    ? 1 : 0;
  }

  get type() {
    return this.heap.getbyaddr(this.offset) & 255
    /* TYPE_MASK */
    ;
  }

  get op1() {
    return this.heap.getbyaddr(this.offset + 1);
  }

  get op2() {
    return this.heap.getbyaddr(this.offset + 2);
  }

  get op3() {
    return this.heap.getbyaddr(this.offset + 3);
  }

}

function encodeTableInfo(scopeSize, state) {
  return state | scopeSize << 2;
}

function changeState(info, newState) {
  return info | newState << 30;
}

const PAGE_SIZE = 0x100000;

class RuntimeHeapImpl {
  constructor(serializedHeap) {
    let {
      buffer,
      table
    } = serializedHeap;
    this.heap = new Int32Array(buffer);
    this.table = table;
  } // It is illegal to close over this address, as compaction
  // may move it. However, it is legal to use this address
  // multiple times between compactions.


  getaddr(handle) {
    return this.table[handle];
  }

  getbyaddr(address) {
    return this.heap[address];
  }

  sizeof(handle) {
    return sizeof(this.table, handle);
  }

  scopesizeof(handle) {
    return scopesizeof(this.table, handle);
  }

}

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
    this.heap = new Int32Array(PAGE_SIZE);
    this.table = [];
  }

  push(item) {
    this.sizeCheck();
    this.heap[this.offset++] = item;
  }

  sizeCheck() {
    if (this.capacity === 0) {
      let heap = slice(this.heap, 0, this.offset);
      this.heap = new Int32Array(heap.length + PAGE_SIZE);
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
    this.handle += 3
    /* ENTRY_SIZE */
    ;
    return handle;
  }

  finishMalloc(handle, scopeSize) {
    this.table[handle + 1
    /* INFO_OFFSET */
    ] = encodeTableInfo(scopeSize, 0
    /* Allocated */
    );
  }

  size() {
    return this.offset;
  } // It is illegal to close over this address, as compaction
  // may move it. However, it is legal to use this address
  // multiple times between compactions.


  getaddr(handle) {
    return this.table[handle];
  }

  gethandle(address) {
    this.table.push(address, encodeTableInfo(0, 3
    /* Pointer */
    ), 0);
    let handle = this.handle;
    this.handle += 3
    /* ENTRY_SIZE */
    ;
    return handle;
  }

  sizeof(handle) {
    return sizeof(this.table, handle);
  }

  scopesizeof(handle) {
    return scopesizeof(this.table, handle);
  }

  free(handle) {
    let info = this.table[handle + 1
    /* INFO_OFFSET */
    ];
    this.table[handle + 1
    /* INFO_OFFSET */
    ] = changeState(info, 1
    /* Freed */
    );
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
    let {
      table,
      table: {
        length
      },
      heap
    } = this;

    for (let i = 0; i < length; i += 3
    /* ENTRY_SIZE */
    ) {
      let offset = table[i];
      let info = table[i + 1
      /* INFO_OFFSET */
      ]; // @ts-ignore (this whole function is currently unused)

      let size = info & Size.SIZE_MASK;
      let state = info & 3
      /* STATE_MASK */
      >> 30;

      if (state === 2
      /* Purged */
      ) {
          continue;
        } else if (state === 1
      /* Freed */
      ) {
          // transition to "already freed" aka "purged"
          // a good improvement would be to reuse
          // these slots
          table[i + 1
          /* INFO_OFFSET */
          ] = changeState(info, 2
          /* Purged */
          );
          compactedSize += size;
        } else if (state === 0
      /* Allocated */
      ) {
          for (let j = offset; j <= i + size; j++) {
            heap[j - compactedSize] = heap[j];
          }

          table[i] = offset - compactedSize;
        } else if (state === 3
      /* Pointer */
      ) {
          table[i] = offset - compactedSize;
        }
    }

    this.offset = this.offset - compactedSize;
  }

  pushPlaceholder(valueFunc) {
    this.sizeCheck();
    let address = this.offset++;
    this.heap[address] = 2147483647
    /* MAX_SIZE */
    ;
    this.placeholders.push([address, valueFunc]);
  }

  pushStdlib(operand) {
    this.sizeCheck();
    let address = this.offset++;
    this.heap[address] = 2147483647
    /* MAX_SIZE */
    ;
    this.stdlibs.push([address, operand]);
  }

  patchPlaceholders() {
    let {
      placeholders
    } = this;

    for (let i = 0; i < placeholders.length; i++) {
      let [address, getValue] = placeholders[i];
      this.setbyaddr(address, getValue());
    }
  }

  patchStdlibs(stdlib) {
    let {
      stdlibs
    } = this;

    for (let i = 0; i < stdlibs.length; i++) {
      let [address, {
        value
      }] = stdlibs[i];
      this.setbyaddr(address, stdlib[value]);
    }

    this.stdlibs = [];
  }

  capture(stdlib, offset = this.offset) {
    this.patchPlaceholders();
    this.patchStdlibs(stdlib); // Only called in eager mode

    let buffer = slice(this.heap, 0, offset).buffer;
    return {
      handle: this.handle,
      table: this.table,
      buffer: buffer
    };
  }

}

class RuntimeProgramImpl {
  constructor(constants$$1, heap) {
    this.constants = constants$$1;
    this.heap = heap;
    this._opcode = new RuntimeOpImpl(this.heap);
  }

  static hydrate(artifacts) {
    let heap = new RuntimeHeapImpl(artifacts.heap);
    let constants$$1 = new RuntimeConstantsImpl(artifacts.constants);
    return new RuntimeProgramImpl(constants$$1, heap);
  }

  opcode(offset) {
    this._opcode.offset = offset;
    return this._opcode;
  }

}

function hydrateProgram(artifacts) {
  let heap = new RuntimeHeapImpl(artifacts.heap);
  let constants$$1 = new RuntimeConstantsImpl(artifacts.constants);
  return new RuntimeProgramImpl(constants$$1, heap);
}

function slice(arr, start, end) {
  if (arr.slice !== undefined) {
    return arr.slice(start, end);
  }

  let ret = new Int32Array(end);

  for (; start < end; start++) {
    ret[start] = arr[start];
  }

  return ret;
}

function sizeof(table, handle) {
  {
    return -1;
  }
}

function scopesizeof(table, handle) {
  let info = table[handle + 1
  /* INFO_OFFSET */
  ];
  return info >> 2;
}

function patchStdlibs(program) {
  program.heap.patchStdlibs(program.stdlib);
}

function programArtifacts(program) {
  let heap = program.heap.capture(program.stdlib);
  let constants$$1 = program.constants.toPool();
  return {
    heap,
    constants: constants$$1
  };
}

function artifacts(syntax) {
  return programArtifacts(syntax.program);
}

export { WriteOnlyConstants, RuntimeConstantsImpl, JitConstants, RuntimeHeapImpl, hydrateHeap, HeapImpl, RuntimeProgramImpl, hydrateProgram, RuntimeOpImpl, patchStdlibs, programArtifacts, artifacts };