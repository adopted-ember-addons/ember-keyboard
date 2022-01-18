"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isLowLevelRegister = isLowLevelRegister;
/**
 * Registers
 *
 * For the most part, these follows MIPS naming conventions, however the
 * register numbers are different.
 */
// $0 or $pc (program counter): pointer into `program` for the next insturction; -1 means exit
var $pc = exports.$pc = 0;
// $1 or $ra (return address): pointer into `program` for the return
var $ra = exports.$ra = 1;
// $2 or $fp (frame pointer): pointer into the `evalStack` for the base of the stack
var $fp = exports.$fp = 2;
// $3 or $sp (stack pointer): pointer into the `evalStack` for the top of the stack
var $sp = exports.$sp = 3;
// $4-$5 or $s0-$s1 (saved): callee saved general-purpose registers
var $s0 = exports.$s0 = 4;
var $s1 = exports.$s1 = 5;
// $6-$7 or $t0-$t1 (temporaries): caller saved general-purpose registers
var $t0 = exports.$t0 = 6;
var $t1 = exports.$t1 = 7;
// $8 or $v0 (return value)
var $v0 = exports.$v0 = 8;
function isLowLevelRegister(register) {
    return register <= $sp;
}
var SavedRegister = exports.SavedRegister = undefined;
(function (SavedRegister) {
    SavedRegister[SavedRegister["s0"] = 4] = "s0";
    SavedRegister[SavedRegister["s1"] = 5] = "s1";
})(SavedRegister || (exports.SavedRegister = SavedRegister = {}));
var TemporaryRegister = exports.TemporaryRegister = undefined;
(function (TemporaryRegister) {
    TemporaryRegister[TemporaryRegister["t0"] = 6] = "t0";
    TemporaryRegister[TemporaryRegister["t1"] = 7] = "t1";
})(TemporaryRegister || (exports.TemporaryRegister = TemporaryRegister = {}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3ZtL2xpYi9yZWdpc3RlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7UUFrQ00sa0IsR0FBQSxrQjs7Ozs7OztBQTNCTjtBQUNPLElBQU0sb0JBQU4sQ0FBQTtBQUNQO0FBQ08sSUFBTSxvQkFBTixDQUFBO0FBQ1A7QUFDTyxJQUFNLG9CQUFOLENBQUE7QUFDUDtBQUNPLElBQU0sb0JBQU4sQ0FBQTtBQUNQO0FBQ08sSUFBTSxvQkFBTixDQUFBO0FBQ0EsSUFBTSxvQkFBTixDQUFBO0FBQ1A7QUFDTyxJQUFNLG9CQUFOLENBQUE7QUFDQSxJQUFNLG9CQUFOLENBQUE7QUFDUDtBQUNPLElBQU0sb0JBQU4sQ0FBQTtBQVlELFNBQUEsa0JBQUEsQ0FBQSxRQUFBLEVBQ2dDO0FBRXBDLFdBQVEsWUFBUixHQUFBO0FBQ0Q7QUFFRCxJQUFBLGlEQUFBO0FBQUEsQ0FBQSxVQUFBLGFBQUEsRUFBeUI7QUFDdkIsa0JBQUEsY0FBQSxJQUFBLElBQUEsQ0FBQSxJQUFBLElBQUE7QUFDQSxrQkFBQSxjQUFBLElBQUEsSUFBQSxDQUFBLElBQUEsSUFBQTtBQUZGLENBQUEsRUFBWSwwQkFBWixhQUFZLEdBQUEsZ0JBQVosRUFBWSxDQUFaO0FBS0EsSUFBQSx5REFBQTtBQUFBLENBQUEsVUFBQSxpQkFBQSxFQUE2QjtBQUMzQixzQkFBQSxrQkFBQSxJQUFBLElBQUEsQ0FBQSxJQUFBLElBQUE7QUFDQSxzQkFBQSxrQkFBQSxJQUFBLElBQUEsQ0FBQSxJQUFBLElBQUE7QUFGRixDQUFBLEVBQVksOEJBQVosaUJBQVksR0FBQSxvQkFBWixFQUFZLENBQVoiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFJlZ2lzdGVyc1xuICpcbiAqIEZvciB0aGUgbW9zdCBwYXJ0LCB0aGVzZSBmb2xsb3dzIE1JUFMgbmFtaW5nIGNvbnZlbnRpb25zLCBob3dldmVyIHRoZVxuICogcmVnaXN0ZXIgbnVtYmVycyBhcmUgZGlmZmVyZW50LlxuICovXG5cbi8vICQwIG9yICRwYyAocHJvZ3JhbSBjb3VudGVyKTogcG9pbnRlciBpbnRvIGBwcm9ncmFtYCBmb3IgdGhlIG5leHQgaW5zdHVyY3Rpb247IC0xIG1lYW5zIGV4aXRcbmV4cG9ydCBjb25zdCAkcGM6IE1hY2hpbmVSZWdpc3Rlci5wYyA9IDA7XG4vLyAkMSBvciAkcmEgKHJldHVybiBhZGRyZXNzKTogcG9pbnRlciBpbnRvIGBwcm9ncmFtYCBmb3IgdGhlIHJldHVyblxuZXhwb3J0IGNvbnN0ICRyYTogTWFjaGluZVJlZ2lzdGVyLnJhID0gMTtcbi8vICQyIG9yICRmcCAoZnJhbWUgcG9pbnRlcik6IHBvaW50ZXIgaW50byB0aGUgYGV2YWxTdGFja2AgZm9yIHRoZSBiYXNlIG9mIHRoZSBzdGFja1xuZXhwb3J0IGNvbnN0ICRmcDogTWFjaGluZVJlZ2lzdGVyLmZwID0gMjtcbi8vICQzIG9yICRzcCAoc3RhY2sgcG9pbnRlcik6IHBvaW50ZXIgaW50byB0aGUgYGV2YWxTdGFja2AgZm9yIHRoZSB0b3Agb2YgdGhlIHN0YWNrXG5leHBvcnQgY29uc3QgJHNwOiBNYWNoaW5lUmVnaXN0ZXIuc3AgPSAzO1xuLy8gJDQtJDUgb3IgJHMwLSRzMSAoc2F2ZWQpOiBjYWxsZWUgc2F2ZWQgZ2VuZXJhbC1wdXJwb3NlIHJlZ2lzdGVyc1xuZXhwb3J0IGNvbnN0ICRzMDogU2F2ZWRSZWdpc3Rlci5zMCA9IDQ7XG5leHBvcnQgY29uc3QgJHMxOiBTYXZlZFJlZ2lzdGVyLnMxID0gNTtcbi8vICQ2LSQ3IG9yICR0MC0kdDEgKHRlbXBvcmFyaWVzKTogY2FsbGVyIHNhdmVkIGdlbmVyYWwtcHVycG9zZSByZWdpc3RlcnNcbmV4cG9ydCBjb25zdCAkdDA6IFRlbXBvcmFyeVJlZ2lzdGVyLnQwID0gNjtcbmV4cG9ydCBjb25zdCAkdDE6IFRlbXBvcmFyeVJlZ2lzdGVyLnQxID0gNztcbi8vICQ4IG9yICR2MCAocmV0dXJuIHZhbHVlKVxuZXhwb3J0IGNvbnN0ICR2MCA9IDg7XG5cbmV4cG9ydCBjb25zdCBlbnVtIE1hY2hpbmVSZWdpc3RlciB7XG4gIC8vIFRoZXNlIG11c3QgYmUgaW4gc3luYyB3aXRoIHRoZSBjb21wdXRlZCB2YWx1ZXNcbiAgLy8gYWJvdmUsIGJ1dCBUeXBlU2NyaXB0IGRvZXNuJ3QgbGlrZSBpdFxuXG4gICdwYycgPSAwLFxuICAncmEnID0gMSxcbiAgJ2ZwJyA9IDIsXG4gICdzcCcgPSAzLFxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNMb3dMZXZlbFJlZ2lzdGVyKFxuICByZWdpc3RlcjogUmVnaXN0ZXIgfCBNYWNoaW5lUmVnaXN0ZXJcbik6IHJlZ2lzdGVyIGlzIFJlZ2lzdGVyICYgTWFjaGluZVJlZ2lzdGVyIHtcbiAgcmV0dXJuIChyZWdpc3RlciBhcyBudW1iZXIpIDw9ICRzcDtcbn1cblxuZXhwb3J0IGVudW0gU2F2ZWRSZWdpc3RlciB7XG4gICdzMCcgPSA0LFxuICAnczEnID0gNSxcbn1cblxuZXhwb3J0IGVudW0gVGVtcG9yYXJ5UmVnaXN0ZXIge1xuICAndDAnID0gNixcbiAgJ3QxJyA9IDcsXG59XG5cbmV4cG9ydCB0eXBlIFJlZ2lzdGVyID0gTWFjaGluZVJlZ2lzdGVyIHwgU2F2ZWRSZWdpc3RlciB8IFRlbXBvcmFyeVJlZ2lzdGVyIHwgdHlwZW9mICR2MDtcbmV4cG9ydCB0eXBlIFN5c2NhbGxSZWdpc3RlciA9IFNhdmVkUmVnaXN0ZXIgfCBUZW1wb3JhcnlSZWdpc3RlciB8IHR5cGVvZiAkdjA7XG4iXSwic291cmNlUm9vdCI6IiJ9