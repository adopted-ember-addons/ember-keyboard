import { CompileTimeHeap, SerializedHeap, STDLib, RuntimeHeap, StdlibOperand, RuntimeConstants, RuntimeProgram, CompilerArtifacts } from '@glimmer/interfaces';
import { RuntimeOpImpl } from './opcode';
export declare type Placeholder = [number, () => number];
export declare type StdlibPlaceholder = [number, StdlibOperand];
export declare class RuntimeHeapImpl implements RuntimeHeap {
    private heap;
    private table;
    constructor(serializedHeap: SerializedHeap);
    getaddr(handle: number): number;
    getbyaddr(address: number): number;
    sizeof(handle: number): number;
    scopesizeof(handle: number): number;
}
export declare function hydrateHeap(serializedHeap: SerializedHeap): RuntimeHeap;
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
export declare class HeapImpl implements CompileTimeHeap, RuntimeHeap {
    private heap;
    private placeholders;
    private stdlibs;
    private table;
    private offset;
    private handle;
    private capacity;
    constructor();
    push(item: number): void;
    private sizeCheck;
    getbyaddr(address: number): number;
    setbyaddr(address: number, value: number): void;
    malloc(): number;
    finishMalloc(handle: number, scopeSize: number): void;
    size(): number;
    getaddr(handle: number): number;
    gethandle(address: number): number;
    sizeof(handle: number): number;
    scopesizeof(handle: number): number;
    free(handle: number): void;
    /**
     * The heap uses the [Mark-Compact Algorithm](https://en.wikipedia.org/wiki/Mark-compact_algorithm) to shift
     * reachable memory to the bottom of the heap and freeable
     * memory to the top of the heap. When we have shifted all
     * the reachable memory to the top of the heap, we move the
     * offset to the next free position.
     */
    compact(): void;
    pushPlaceholder(valueFunc: () => number): void;
    pushStdlib(operand: StdlibOperand): void;
    private patchPlaceholders;
    patchStdlibs(stdlib: STDLib): void;
    capture(stdlib: STDLib, offset?: number): SerializedHeap;
}
export declare class RuntimeProgramImpl implements RuntimeProgram {
    constants: RuntimeConstants;
    heap: RuntimeHeap;
    [key: number]: never;
    static hydrate(artifacts: CompilerArtifacts): RuntimeProgramImpl;
    private _opcode;
    constructor(constants: RuntimeConstants, heap: RuntimeHeap);
    opcode(offset: number): RuntimeOpImpl;
}
export declare function hydrateProgram(artifacts: CompilerArtifacts): RuntimeProgram;
//# sourceMappingURL=program.d.ts.map