function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { initializeGuid, fillNulls, assert } from '@glimmer/util';

import { $pc, $sp, $ra, $fp } from '@glimmer/vm';
// these import bindings will be stripped from build

import { DESTRUCTOR_STACK, INNER_VM, STACKS } from './symbols';
import { CURSOR_STACK } from './vm/element-builder';
import { isScopeReference } from './environment';
export var AppendOpcodes = function () {
    function AppendOpcodes() {
        _classCallCheck(this, AppendOpcodes);

        this.evaluateOpcode = fillNulls(90 /* Size */).slice();
    }

    AppendOpcodes.prototype.add = function add(name, evaluate) {
        var kind = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'syscall';

        this.evaluateOpcode[name] = {
            syscall: kind !== 'machine',
            evaluate: evaluate
        };
    };

    AppendOpcodes.prototype.debugBefore = function debugBefore(vm, opcode) {
        var params = undefined;
        var opName = undefined;
        if (false) {
            var _console;

            var pos = vm[INNER_VM].fetchRegister($pc) - opcode.size;

            // console.log(`${typePos(vm['pc'])}.`);
            var _ref = [];
            opName = _ref[0];
            params = _ref[1];
            console.log(pos + '. ');
            var debugParams = [];
            for (var prop in params) {
                debugParams.push(prop, '=', params[prop]);
            }
            (_console = console).log.apply(_console, debugParams);
        }
        var sp = void 0;
        if (false) {
            sp = vm.fetchValue($sp);
        }

        return {
            sp: sp,
            pc: vm.fetchValue($pc),
            name: opName,
            params: params,
            type: opcode.type,
            isMachine: opcode.isMachine,
            size: opcode.size,
            state: undefined
        };
    };

    AppendOpcodes.prototype.debugAfter = function debugAfter(vm, pre) {
        var sp = pre.sp,
            type = pre.type,
            isMachine = pre.isMachine,
            pc = pre.pc;

        if (false) {
            var meta = type;
            var actualChange = vm.fetchValue($sp) - sp;
            if (meta && meta.check && typeof meta.stackChange === 'number' && meta.stackChange !== actualChange) {
                throw new Error('Error in ' + pre.name + ':\n\n' + pc + '. ' + '\n\nStack changed by ' + actualChange + ', expected ' + meta.stackChange);
            }
            console.log('%c -> pc: %d, ra: %d, fp: %d, sp: %d, s0: %O, s1: %O, t0: %O, t1: %O, v0: %O', 'color: orange', vm[INNER_VM].registers[$pc], vm[INNER_VM].registers[$ra], vm[INNER_VM].registers[$fp], vm[INNER_VM].registers[$sp], vm['s0'], vm['s1'], vm['t0'], vm['t1'], vm['v0']);
            console.log('%c -> eval stack', 'color: red', vm.stack.toArray());
            console.log('%c -> block stack', 'color: magenta', vm.elements().debugBlocks());
            console.log('%c -> destructor stack', 'color: violet', vm[DESTRUCTOR_STACK].toArray());
            if (vm[STACKS].scope.current === null) {
                console.log('%c -> scope', 'color: green', 'null');
            } else {
                console.log('%c -> scope', 'color: green', vm.scope().slots.map(function (s) {
                    return isScopeReference(s) ? s.value() : s;
                }));
            }
            console.log('%c -> elements', 'color: blue', vm.elements()[CURSOR_STACK].current.element);
            console.log('%c -> constructing', 'color: aqua', vm.elements()['constructing']);
        }
    };

    AppendOpcodes.prototype.evaluate = function evaluate(vm, opcode, type) {
        var operation = this.evaluateOpcode[type];
        if (operation.syscall) {
            false && assert(!opcode.isMachine, 'BUG: Mismatch between operation.syscall (' + operation.syscall + ') and opcode.isMachine (' + opcode.isMachine + ') for ' + opcode.type);

            operation.evaluate(vm, opcode);
        } else {
            false && assert(opcode.isMachine, 'BUG: Mismatch between operation.syscall (' + operation.syscall + ') and opcode.isMachine (' + opcode.isMachine + ') for ' + opcode.type);

            operation.evaluate(vm[INNER_VM], opcode);
        }
    };

    return AppendOpcodes;
}();
export var APPEND_OPCODES = new AppendOpcodes();
export var AbstractOpcode = function AbstractOpcode() {
    _classCallCheck(this, AbstractOpcode);

    initializeGuid(this);
};
export var UpdatingOpcode = function (_AbstractOpcode) {
    _inherits(UpdatingOpcode, _AbstractOpcode);

    function UpdatingOpcode() {
        _classCallCheck(this, UpdatingOpcode);

        var _this = _possibleConstructorReturn(this, _AbstractOpcode.apply(this, arguments));

        _this.next = null;
        _this.prev = null;
        return _this;
    }

    return UpdatingOpcode;
}(AbstractOpcode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL29wY29kZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFFQSxTQUFBLGNBQUEsRUFBQSxTQUFBLEVBQUEsTUFBQSxRQUFBLGVBQUE7O0FBRUEsU0FBQSxHQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxHQUFBLFFBQUEsYUFBQTtBQUlBOztBQUVBLFNBQUEsZ0JBQUEsRUFBQSxRQUFBLEVBQUEsTUFBQSxRQUFBLFdBQUE7QUFFQSxTQUFBLFlBQUEsUUFBQSxzQkFBQTtBQUNBLFNBQUEsZ0JBQUEsUUFBQSxlQUFBO0FBa0NBLFdBQU0sYUFBTjtBQUFBLDZCQUFBO0FBQUE7O0FBQ1UsYUFBQSxjQUFBLEdBQTZCLFVBQUEsRUFBQSxDQUFBLFVBQUEsRUFBN0IsS0FBNkIsRUFBN0I7QUE0SFQ7O0FBN0hELDRCQU1FLEdBTkYsZ0JBTUUsSUFORixFQU1FLFFBTkYsRUFTb0I7QUFBQSxZQUFoQixJQUFnQix1RUFIbEIsU0FHa0I7O0FBRWhCLGFBQUEsY0FBQSxDQUFBLElBQUEsSUFBc0M7QUFDcEMscUJBQVMsU0FEMkIsU0FBQTtBQUVwQztBQUZvQyxTQUF0QztBQUlELEtBZkg7O0FBQUEsNEJBaUJFLFdBakJGLHdCQWlCRSxFQWpCRixFQWlCRSxNQWpCRixFQWlCc0Q7QUFDbEQsWUFBSSxTQUFKLFNBQUE7QUFDQSxZQUFJLFNBQUosU0FBQTtBQUVBLFlBQUEsS0FBQSxFQUFXO0FBQUE7O0FBQ1QsZ0JBQUksTUFBTSxHQUFBLFFBQUEsRUFBQSxhQUFBLENBQUEsR0FBQSxJQUFrQyxPQUE1QyxJQUFBOztBQUlBO0FBTFMsdUJBR1QsRUFIUztBQUdULGtCQUhTO0FBR1Qsa0JBSFM7QUFNVCxvQkFBQSxHQUFBLENBQUEsR0FBQTtBQUVBLGdCQUFJLGNBQUosRUFBQTtBQUNBLGlCQUFLLElBQUwsSUFBQSxJQUFBLE1BQUEsRUFBeUI7QUFDdkIsNEJBQUEsSUFBQSxD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NEdFLEVBNUdGLEVBNEdFLE1BNUdGLEVBNEdFLElBNUdGLEVBNEdpRTtBQUM3RCxZQUFJLFlBQVksS0FBQSxjQUFBLENBQWhCLElBQWdCLENBQWhCO0FBRUEsWUFBSSxVQUFKLE9BQUEsRUFBdUI7QUFBQSxxQkFDckIsT0FDRSxDQUFDLE9BREgsU0FBQSxnREFFOEMsVUFBVSxPQUZ4RCxnQ0FFMEYsT0FBTyxTQUZqRyxjQUVtSCxPQUg5RixJQUNyQixDQURxQjs7QUFLckIsc0JBQUEsUUFBQSxDQUFBLEVBQUEsRUFBQSxNQUFBO0FBTEYsU0FBQSxNQU1PO0FBQUEscUJBQ0wsT0FDRSxPQURGLFNBQUEsZ0RBRThDLFVBQVUsT0FGeEQsZ0NBRTBGLE9BQU8sU0FGakcsY0FFbUgsT0FIOUcsSUFDTCxDQURLOztBQUtMLHNCQUFBLFFBQUEsQ0FBbUIsR0FBbkIsUUFBbUIsQ0FBbkIsRUFBQSxNQUFBO0FBQ0Q7QUFDRixLQTVISDs7QUFBQTtBQUFBO0FBK0hBLE9BQU8sSUFBTSxpQkFBaUIsSUFBdkIsYUFBdUIsRUFBdkI7QUFFUCxXQUFNLGNBQU4sR0FJRSwwQkFBQTtBQUFBOztBQUNFLG1CQUFBLElBQUE7QUFDRCxDQU5IO0FBU0EsV0FBTSxjQUFOO0FBQUE7O0FBQUEsOEJBQUE7QUFBQTs7QUFBQSxxRCxzQ0FBQTs7QUFHRSxjQUFBLElBQUEsR0FBQSxJQUFBO0FBQ0EsY0FBQSxJQUFBLEdBQUEsSUFBQTtBQUpGO0FBT0M7O0FBUEQ7QUFBQSxFQUFNLGNBQU4iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBMb3dMZXZlbFZNLCBWTSwgVXBkYXRpbmdWTSB9IGZyb20gJy4vdm0nO1xuXG5pbXBvcnQgeyBPcHRpb24sIFNsaWNlIGFzIExpc3RTbGljZSwgaW5pdGlhbGl6ZUd1aWQsIGZpbGxOdWxscywgYXNzZXJ0IH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQgeyByZWNvcmRTdGFja1NpemUsIG9wY29kZU1ldGFkYXRhIH0gZnJvbSAnQGdsaW1tZXIvZGVidWcnO1xuaW1wb3J0IHsgJHBjLCAkc3AsICRyYSwgJGZwIH0gZnJvbSAnQGdsaW1tZXIvdm0nO1xuaW1wb3J0IHsgVGFnIH0gZnJvbSAnQGdsaW1tZXIvcmVmZXJlbmNlJztcbmltcG9ydCB7IFJ1bnRpbWVPcCwgT3AsIEppdE9yQW90QmxvY2ssIE1heWJlLCBEaWN0IH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBERUJVRywgREVWTU9ERSB9IGZyb20gJ0BnbGltbWVyL2xvY2FsLWRlYnVnLWZsYWdzJztcbi8vIHRoZXNlIGltcG9ydCBiaW5kaW5ncyB3aWxsIGJlIHN0cmlwcGVkIGZyb20gYnVpbGRcbmltcG9ydCB7IGRlYnVnLCBsb2dPcGNvZGUgfSBmcm9tICdAZ2xpbW1lci9vcGNvZGUtY29tcGlsZXInO1xuaW1wb3J0IHsgREVTVFJVQ1RPUl9TVEFDSywgSU5ORVJfVk0sIENPTlNUQU5UUywgU1RBQ0tTIH0gZnJvbSAnLi9zeW1ib2xzJztcbmltcG9ydCB7IEludGVybmFsVk0sIEludGVybmFsSml0Vk0gfSBmcm9tICcuL3ZtL2FwcGVuZCc7XG5pbXBvcnQgeyBDVVJTT1JfU1RBQ0sgfSBmcm9tICcuL3ZtL2VsZW1lbnQtYnVpbGRlcic7XG5pbXBvcnQgeyBpc1Njb3BlUmVmZXJlbmNlIH0gZnJvbSAnLi9lbnZpcm9ubWVudCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgT3Bjb2RlSlNPTiB7XG4gIHR5cGU6IG51bWJlciB8IHN0cmluZztcbiAgZ3VpZD86IE9wdGlvbjxudW1iZXI+O1xuICBkZW9wdGVkPzogYm9vbGVhbjtcbiAgYXJncz86IHN0cmluZ1tdO1xuICBkZXRhaWxzPzogRGljdDxPcHRpb248c3RyaW5nPj47XG4gIGNoaWxkcmVuPzogT3Bjb2RlSlNPTltdO1xufVxuXG5leHBvcnQgdHlwZSBPcGVyYW5kMSA9IG51bWJlcjtcbmV4cG9ydCB0eXBlIE9wZXJhbmQyID0gbnVtYmVyO1xuZXhwb3J0IHR5cGUgT3BlcmFuZDMgPSBudW1iZXI7XG5cbmV4cG9ydCB0eXBlIFN5c2NhbGwgPSAodm06IEludGVybmFsVk08Sml0T3JBb3RCbG9jaz4sIG9wY29kZTogUnVudGltZU9wKSA9PiB2b2lkO1xuZXhwb3J0IHR5cGUgSml0U3lzY2FsbCA9ICh2bTogSW50ZXJuYWxKaXRWTSwgb3Bjb2RlOiBSdW50aW1lT3ApID0+IHZvaWQ7XG5leHBvcnQgdHlwZSBNYWNoaW5lT3Bjb2RlID0gKHZtOiBMb3dMZXZlbFZNLCBvcGNvZGU6IFJ1bnRpbWVPcCkgPT4gdm9pZDtcblxuZXhwb3J0IHR5cGUgRXZhbHVhdGUgPVxuICB8IHsgc3lzY2FsbDogdHJ1ZTsgZXZhbHVhdGU6IFN5c2NhbGwgfVxuICB8IHsgc3lzY2FsbDogZmFsc2U7IGV2YWx1YXRlOiBNYWNoaW5lT3Bjb2RlIH07XG5cbmV4cG9ydCB0eXBlIERlYnVnU3RhdGUgPSB7XG4gIHBjOiBudW1iZXI7XG4gIHNwOiBudW1iZXI7XG4gIHR5cGU6IG51bWJlcjtcbiAgaXNNYWNoaW5lOiAwIHwgMTtcbiAgc2l6ZTogbnVtYmVyO1xuICBwYXJhbXM/OiBNYXliZTxEaWN0PjtcbiAgbmFtZT86IHN0cmluZztcbiAgc3RhdGU6IHVua25vd247XG59O1xuXG5leHBvcnQgY2xhc3MgQXBwZW5kT3Bjb2RlcyB7XG4gIHByaXZhdGUgZXZhbHVhdGVPcGNvZGU6IEV2YWx1YXRlW10gPSBmaWxsTnVsbHM8RXZhbHVhdGU+KE9wLlNpemUpLnNsaWNlKCk7XG5cbiAgYWRkPE5hbWUgZXh0ZW5kcyBPcD4obmFtZTogTmFtZSwgZXZhbHVhdGU6IFN5c2NhbGwpOiB2b2lkO1xuICBhZGQ8TmFtZSBleHRlbmRzIE9wPihuYW1lOiBOYW1lLCBldmFsdWF0ZTogTWFjaGluZU9wY29kZSwga2luZDogJ21hY2hpbmUnKTogdm9pZDtcbiAgYWRkPE5hbWUgZXh0ZW5kcyBPcD4obmFtZTogTmFtZSwgZXZhbHVhdGU6IEppdFN5c2NhbGwsIGtpbmQ6ICdqaXQnKTogdm9pZDtcbiAgYWRkPE5hbWUgZXh0ZW5kcyBPcD4oXG4gICAgbmFtZTogTmFtZSxcbiAgICBldmFsdWF0ZTogU3lzY2FsbCB8IEppdFN5c2NhbGwgfCBNYWNoaW5lT3Bjb2RlLFxuICAgIGtpbmQgPSAnc3lzY2FsbCdcbiAgKTogdm9pZCB7XG4gICAgdGhpcy5ldmFsdWF0ZU9wY29kZVtuYW1lIGFzIG51bWJlcl0gPSB7XG4gICAgICBzeXNjYWxsOiBraW5kICE9PSAnbWFjaGluZScsXG4gICAgICBldmFsdWF0ZSxcbiAgICB9IGFzIEV2YWx1YXRlO1xuICB9XG5cbiAgZGVidWdCZWZvcmUodm06IFZNPEppdE9yQW90QmxvY2s+LCBvcGNvZGU6IFJ1bnRpbWVPcCk6IERlYnVnU3RhdGUge1xuICAgIGxldCBwYXJhbXM6IE1heWJlPERpY3Q+ID0gdW5kZWZpbmVkO1xuICAgIGxldCBvcE5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICAgIGlmIChERUJVRykge1xuICAgICAgbGV0IHBvcyA9IHZtW0lOTkVSX1ZNXS5mZXRjaFJlZ2lzdGVyKCRwYykgLSBvcGNvZGUuc2l6ZTtcblxuICAgICAgW29wTmFtZSwgcGFyYW1zXSA9IGRlYnVnKHZtW0NPTlNUQU5UU10sIHZtLnJ1bnRpbWUucmVzb2x2ZXIsIG9wY29kZSwgb3Bjb2RlLmlzTWFjaGluZSk7XG5cbiAgICAgIC8vIGNvbnNvbGUubG9nKGAke3R5cGVQb3Modm1bJ3BjJ10pfS5gKTtcbiAgICAgIGNvbnNvbGUubG9nKGAke3Bvc30uICR7bG9nT3Bjb2RlKG9wTmFtZSwgcGFyYW1zKX1gKTtcblxuICAgICAgbGV0IGRlYnVnUGFyYW1zID0gW107XG4gICAgICBmb3IgKGxldCBwcm9wIGluIHBhcmFtcykge1xuICAgICAgICBkZWJ1Z1BhcmFtcy5wdXNoKHByb3AsICc9JywgcGFyYW1zW3Byb3BdKTtcbiAgICAgIH1cblxuICAgICAgY29uc29sZS5sb2coLi4uZGVidWdQYXJhbXMpO1xuICAgIH1cblxuICAgIGxldCBzcDogbnVtYmVyO1xuXG4gICAgaWYgKERFVk1PREUpIHtcbiAgICAgIHNwID0gdm0uZmV0Y2hWYWx1ZSgkc3ApO1xuICAgIH1cblxuICAgIHJlY29yZFN0YWNrU2l6ZSh2bS5mZXRjaFZhbHVlKCRzcCkpO1xuICAgIHJldHVybiB7XG4gICAgICBzcDogc3AhLFxuICAgICAgcGM6IHZtLmZldGNoVmFsdWUoJHBjKSxcbiAgICAgIG5hbWU6IG9wTmFtZSxcbiAgICAgIHBhcmFtcyxcbiAgICAgIHR5cGU6IG9wY29kZS50eXBlLFxuICAgICAgaXNNYWNoaW5lOiBvcGNvZGUuaXNNYWNoaW5lLFxuICAgICAgc2l6ZTogb3Bjb2RlLnNpemUsXG4gICAgICBzdGF0ZTogdW5kZWZpbmVkLFxuICAgIH07XG4gIH1cblxuICBkZWJ1Z0FmdGVyKHZtOiBWTTxKaXRPckFvdEJsb2NrPiwgcHJlOiBEZWJ1Z1N0YXRlKSB7XG4gICAgbGV0IHsgc3AsIHR5cGUsIGlzTWFjaGluZSwgcGMgfSA9IHByZTtcblxuICAgIGlmIChERUJVRykge1xuICAgICAgbGV0IG1ldGEgPSBvcGNvZGVNZXRhZGF0YSh0eXBlLCBpc01hY2hpbmUpO1xuICAgICAgbGV0IGFjdHVhbENoYW5nZSA9IHZtLmZldGNoVmFsdWUoJHNwKSAtIHNwITtcbiAgICAgIGlmIChcbiAgICAgICAgbWV0YSAmJlxuICAgICAgICBtZXRhLmNoZWNrICYmXG4gICAgICAgIHR5cGVvZiBtZXRhLnN0YWNrQ2hhbmdlISA9PT0gJ251bWJlcicgJiZcbiAgICAgICAgbWV0YS5zdGFja0NoYW5nZSEgIT09IGFjdHVhbENoYW5nZVxuICAgICAgKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgRXJyb3IgaW4gJHtwcmUubmFtZX06XFxuXFxuJHtwY30uICR7bG9nT3Bjb2RlKFxuICAgICAgICAgICAgcHJlLm5hbWUhLFxuICAgICAgICAgICAgcHJlLnBhcmFtcyFcbiAgICAgICAgICApfVxcblxcblN0YWNrIGNoYW5nZWQgYnkgJHthY3R1YWxDaGFuZ2V9LCBleHBlY3RlZCAke21ldGEuc3RhY2tDaGFuZ2UhfWBcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICclYyAtPiBwYzogJWQsIHJhOiAlZCwgZnA6ICVkLCBzcDogJWQsIHMwOiAlTywgczE6ICVPLCB0MDogJU8sIHQxOiAlTywgdjA6ICVPJyxcbiAgICAgICAgJ2NvbG9yOiBvcmFuZ2UnLFxuICAgICAgICB2bVtJTk5FUl9WTV0ucmVnaXN0ZXJzWyRwY10sXG4gICAgICAgIHZtW0lOTkVSX1ZNXS5yZWdpc3RlcnNbJHJhXSxcbiAgICAgICAgdm1bSU5ORVJfVk1dLnJlZ2lzdGVyc1skZnBdLFxuICAgICAgICB2bVtJTk5FUl9WTV0ucmVnaXN0ZXJzWyRzcF0sXG4gICAgICAgIHZtWydzMCddLFxuICAgICAgICB2bVsnczEnXSxcbiAgICAgICAgdm1bJ3QwJ10sXG4gICAgICAgIHZtWyd0MSddLFxuICAgICAgICB2bVsndjAnXVxuICAgICAgKTtcbiAgICAgIGNvbnNvbGUubG9nKCclYyAtPiBldmFsIHN0YWNrJywgJ2NvbG9yOiByZWQnLCB2bS5zdGFjay50b0FycmF5KCkpO1xuICAgICAgY29uc29sZS5sb2coJyVjIC0+IGJsb2NrIHN0YWNrJywgJ2NvbG9yOiBtYWdlbnRhJywgdm0uZWxlbWVudHMoKS5kZWJ1Z0Jsb2NrcygpKTtcbiAgICAgIGNvbnNvbGUubG9nKCclYyAtPiBkZXN0cnVjdG9yIHN0YWNrJywgJ2NvbG9yOiB2aW9sZXQnLCB2bVtERVNUUlVDVE9SX1NUQUNLXS50b0FycmF5KCkpO1xuICAgICAgaWYgKHZtW1NUQUNLU10uc2NvcGUuY3VycmVudCA9PT0gbnVsbCkge1xuICAgICAgICBjb25zb2xlLmxvZygnJWMgLT4gc2NvcGUnLCAnY29sb3I6IGdyZWVuJywgJ251bGwnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICclYyAtPiBzY29wZScsXG4gICAgICAgICAgJ2NvbG9yOiBncmVlbicsXG4gICAgICAgICAgdm0uc2NvcGUoKS5zbG90cy5tYXAocyA9PiAoaXNTY29wZVJlZmVyZW5jZShzKSA/IHMudmFsdWUoKSA6IHMpKVxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICBjb25zb2xlLmxvZygnJWMgLT4gZWxlbWVudHMnLCAnY29sb3I6IGJsdWUnLCB2bS5lbGVtZW50cygpW0NVUlNPUl9TVEFDS10uY3VycmVudCEuZWxlbWVudCk7XG5cbiAgICAgIGNvbnNvbGUubG9nKCclYyAtPiBjb25zdHJ1Y3RpbmcnLCAnY29sb3I6IGFxdWEnLCB2bS5lbGVtZW50cygpWydjb25zdHJ1Y3RpbmcnXSk7XG4gICAgfVxuICB9XG5cbiAgZXZhbHVhdGUodm06IFZNPEppdE9yQW90QmxvY2s+LCBvcGNvZGU6IFJ1bnRpbWVPcCwgdHlwZTogbnVtYmVyKSB7XG4gICAgbGV0IG9wZXJhdGlvbiA9IHRoaXMuZXZhbHVhdGVPcGNvZGVbdHlwZV07XG5cbiAgICBpZiAob3BlcmF0aW9uLnN5c2NhbGwpIHtcbiAgICAgIGFzc2VydChcbiAgICAgICAgIW9wY29kZS5pc01hY2hpbmUsXG4gICAgICAgIGBCVUc6IE1pc21hdGNoIGJldHdlZW4gb3BlcmF0aW9uLnN5c2NhbGwgKCR7b3BlcmF0aW9uLnN5c2NhbGx9KSBhbmQgb3Bjb2RlLmlzTWFjaGluZSAoJHtvcGNvZGUuaXNNYWNoaW5lfSkgZm9yICR7b3Bjb2RlLnR5cGV9YFxuICAgICAgKTtcbiAgICAgIG9wZXJhdGlvbi5ldmFsdWF0ZSh2bSwgb3Bjb2RlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXNzZXJ0KFxuICAgICAgICBvcGNvZGUuaXNNYWNoaW5lLFxuICAgICAgICBgQlVHOiBNaXNtYXRjaCBiZXR3ZWVuIG9wZXJhdGlvbi5zeXNjYWxsICgke29wZXJhdGlvbi5zeXNjYWxsfSkgYW5kIG9wY29kZS5pc01hY2hpbmUgKCR7b3Bjb2RlLmlzTWFjaGluZX0pIGZvciAke29wY29kZS50eXBlfWBcbiAgICAgICk7XG4gICAgICBvcGVyYXRpb24uZXZhbHVhdGUodm1bSU5ORVJfVk1dLCBvcGNvZGUpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY29uc3QgQVBQRU5EX09QQ09ERVMgPSBuZXcgQXBwZW5kT3Bjb2RlcygpO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQWJzdHJhY3RPcGNvZGUge1xuICBwdWJsaWMgYWJzdHJhY3QgdHlwZTogc3RyaW5nO1xuICBwdWJsaWMgX2d1aWQhOiBudW1iZXI7IC8vIFNldCBieSBpbml0aWFsaXplR3VpZCgpIGluIHRoZSBjb25zdHJ1Y3RvclxuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGluaXRpYWxpemVHdWlkKHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBVcGRhdGluZ09wY29kZSBleHRlbmRzIEFic3RyYWN0T3Bjb2RlIHtcbiAgcHVibGljIGFic3RyYWN0IHRhZzogVGFnO1xuXG4gIG5leHQ6IE9wdGlvbjxVcGRhdGluZ09wY29kZT4gPSBudWxsO1xuICBwcmV2OiBPcHRpb248VXBkYXRpbmdPcGNvZGU+ID0gbnVsbDtcblxuICBhYnN0cmFjdCBldmFsdWF0ZSh2bTogVXBkYXRpbmdWTSk6IHZvaWQ7XG59XG5cbmV4cG9ydCB0eXBlIFVwZGF0aW5nT3BTZXEgPSBMaXN0U2xpY2U8VXBkYXRpbmdPcGNvZGU+O1xuIl0sInNvdXJjZVJvb3QiOiIifQ==