/**
 * Registers
 *
 * For the most part, these follows MIPS naming conventions, however the
 * register numbers are different.
 */
export declare const $pc: MachineRegister.pc;
export declare const $ra: MachineRegister.ra;
export declare const $fp: MachineRegister.fp;
export declare const $sp: MachineRegister.sp;
export declare const $s0: SavedRegister.s0;
export declare const $s1: SavedRegister.s1;
export declare const $t0: TemporaryRegister.t0;
export declare const $t1: TemporaryRegister.t1;
export declare const $v0 = 8;
export declare const enum MachineRegister {
    'pc' = 0,
    'ra' = 1,
    'fp' = 2,
    'sp' = 3
}
export declare function isLowLevelRegister(register: Register | MachineRegister): register is Register & MachineRegister;
export declare enum SavedRegister {
    's0' = 4,
    's1' = 5
}
export declare enum TemporaryRegister {
    't0' = 6,
    't1' = 7
}
export declare type Register = MachineRegister | SavedRegister | TemporaryRegister | typeof $v0;
export declare type SyscallRegister = SavedRegister | TemporaryRegister | typeof $v0;
//# sourceMappingURL=registers.d.ts.map