"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.UpdatingOpcode = exports.AbstractOpcode = exports.APPEND_OPCODES = exports.AppendOpcodes = undefined;

var _util = require("@glimmer/util");

var _vm = require("@glimmer/vm");

var _symbols = require("./symbols");

var _elementBuilder = require("./vm/element-builder");

var _environment = require("./environment");

function _defaults(obj, defaults) {
    var keys = Object.getOwnPropertyNames(defaults);for (var i = 0; i < keys.length; i++) {
        var key = keys[i];var value = Object.getOwnPropertyDescriptor(defaults, key);if (value && value.configurable && obj[key] === undefined) {
            Object.defineProperty(obj, key, value);
        }
    }return obj;
}

function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass);
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
// these import bindings will be stripped from build

var AppendOpcodes = exports.AppendOpcodes = function () {
    function AppendOpcodes() {
        _classCallCheck(this, AppendOpcodes);

        this.evaluateOpcode = (0, _util.fillNulls)(90 /* Size */).slice();
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

            var pos = vm[_symbols.INNER_VM].fetchRegister(_vm.$pc) - opcode.size;

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
            sp = vm.fetchValue(_vm.$sp);
        }

        return {
            sp: sp,
            pc: vm.fetchValue(_vm.$pc),
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
            var actualChange = vm.fetchValue(_vm.$sp) - sp;
            if (meta && meta.check && typeof meta.stackChange === 'number' && meta.stackChange !== actualChange) {
                throw new Error('Error in ' + pre.name + ':\n\n' + pc + '. ' + '\n\nStack changed by ' + actualChange + ', expected ' + meta.stackChange);
            }
            console.log('%c -> pc: %d, ra: %d, fp: %d, sp: %d, s0: %O, s1: %O, t0: %O, t1: %O, v0: %O', 'color: orange', vm[_symbols.INNER_VM].registers[_vm.$pc], vm[_symbols.INNER_VM].registers[_vm.$ra], vm[_symbols.INNER_VM].registers[_vm.$fp], vm[_symbols.INNER_VM].registers[_vm.$sp], vm['s0'], vm['s1'], vm['t0'], vm['t1'], vm['v0']);
            console.log('%c -> eval stack', 'color: red', vm.stack.toArray());
            console.log('%c -> block stack', 'color: magenta', vm.elements().debugBlocks());
            console.log('%c -> destructor stack', 'color: violet', vm[_symbols.DESTRUCTOR_STACK].toArray());
            if (vm[_symbols.STACKS].scope.current === null) {
                console.log('%c -> scope', 'color: green', 'null');
            } else {
                console.log('%c -> scope', 'color: green', vm.scope().slots.map(function (s) {
                    return (0, _environment.isScopeReference)(s) ? s.value() : s;
                }));
            }
            console.log('%c -> elements', 'color: blue', vm.elements()[_elementBuilder.CURSOR_STACK].current.element);
            console.log('%c -> constructing', 'color: aqua', vm.elements()['constructing']);
        }
    };

    AppendOpcodes.prototype.evaluate = function evaluate(vm, opcode, type) {
        var operation = this.evaluateOpcode[type];
        if (operation.syscall) {
            false && (0, _util.assert)(!opcode.isMachine, 'BUG: Mismatch between operation.syscall (' + operation.syscall + ') and opcode.isMachine (' + opcode.isMachine + ') for ' + opcode.type);

            operation.evaluate(vm, opcode);
        } else {
            false && (0, _util.assert)(opcode.isMachine, 'BUG: Mismatch between operation.syscall (' + operation.syscall + ') and opcode.isMachine (' + opcode.isMachine + ') for ' + opcode.type);

            operation.evaluate(vm[_symbols.INNER_VM], opcode);
        }
    };

    return AppendOpcodes;
}();
var APPEND_OPCODES = exports.APPEND_OPCODES = new AppendOpcodes();
var AbstractOpcode = exports.AbstractOpcode = function AbstractOpcode() {
    _classCallCheck(this, AbstractOpcode);

    (0, _util.initializeGuid)(this);
};
var UpdatingOpcode = exports.UpdatingOpcode = function (_AbstractOpcode) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL29wY29kZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUVBOztBQUVBOztBQU1BOztBQUVBOztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFMQTs7QUF1Q0EsSUFBQSx3Q0FBQSxZQUFBO0FBQUEsYUFBQSxhQUFBLEdBQUE7QUFBQSx3QkFBQSxJQUFBLEVBQUEsYUFBQTs7QUFDVSxhQUFBLGNBQUEsR0FBNkIscUJBQUEsRUFBQSxDQUFBLFVBQUEsRUFBN0IsS0FBNkIsRUFBN0I7QUE0SFQ7O0FBN0hELGtCQUFBLFNBQUEsQ0FBQSxHQUFBLEdBQUEsU0FBQSxHQUFBLENBQUEsSUFBQSxFQUFBLFFBQUEsRUFTb0I7QUFBQSxZQUFoQixPQUFnQixVQUFBLE1BQUEsR0FBQSxDQUFBLElBQUEsVUFBQSxDQUFBLE1BQUEsU0FBQSxHQUFBLFVBQUEsQ0FBQSxDQUFBLEdBSGxCLFNBR2tCOztBQUVoQixhQUFBLGNBQUEsQ0FBQSxJQUFBLElBQXNDO0FBQ3BDLHFCQUFTLFNBRDJCLFNBQUE7QUFFcEMsc0JBQUE7QUFGb0MsU0FBdEM7QUFYSixLQUFBOztBQUFBLGtCQUFBLFNBQUEsQ0FBQSxXQUFBLEdBQUEsU0FBQSxXQUFBLENBQUEsRUFBQSxFQUFBLE1BQUEsRUFpQnNEO0FBQ2xELFlBQUksU0FBSixTQUFBO0FBQ0EsWUFBSSxTQUFKLFNBQUE7QUFFQSxZQUFBLEtBQUEsRUFBVztBQUFBLGdCQUFBLFFBQUE7O0FBQ1QsZ0JBQUksTUFBTSxHQUFBLGlCQUFBLEVBQUEsYUFBQSxDQUFBLE9BQUEsSUFBa0MsT0FBNUMsSUFBQTs7QUFJQTtBQUxTLGdCQUFBLE9BQUEsRUFBQTtBQUFBLHFCQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQUEscUJBQUEsS0FBQSxDQUFBLENBQUE7QUFNVCxvQkFBQSxHQUFBLENBQUEsTUFBQSxJQUFBO0FBRUEsZ0JBQUksY0FBSixFQUFB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R0UsY0FBQSxJQUFBLEdBQUEsSUFBQTtBQUNBLGNBQUEsSUFBQSxHQUFBLElBQUE7QUFKRixlQUFBLEtBQUE7QUFPQzs7QUFQRCxXQUFBLGNBQUE7QUFBQSxDQUFBLENBQUEsY0FBQSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTG93TGV2ZWxWTSwgVk0sIFVwZGF0aW5nVk0gfSBmcm9tICcuL3ZtJztcblxuaW1wb3J0IHsgT3B0aW9uLCBTbGljZSBhcyBMaXN0U2xpY2UsIGluaXRpYWxpemVHdWlkLCBmaWxsTnVsbHMsIGFzc2VydCB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0IHsgcmVjb3JkU3RhY2tTaXplLCBvcGNvZGVNZXRhZGF0YSB9IGZyb20gJ0BnbGltbWVyL2RlYnVnJztcbmltcG9ydCB7ICRwYywgJHNwLCAkcmEsICRmcCB9IGZyb20gJ0BnbGltbWVyL3ZtJztcbmltcG9ydCB7IFRhZyB9IGZyb20gJ0BnbGltbWVyL3JlZmVyZW5jZSc7XG5pbXBvcnQgeyBSdW50aW1lT3AsIE9wLCBKaXRPckFvdEJsb2NrLCBNYXliZSwgRGljdCB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgREVCVUcsIERFVk1PREUgfSBmcm9tICdAZ2xpbW1lci9sb2NhbC1kZWJ1Zy1mbGFncyc7XG4vLyB0aGVzZSBpbXBvcnQgYmluZGluZ3Mgd2lsbCBiZSBzdHJpcHBlZCBmcm9tIGJ1aWxkXG5pbXBvcnQgeyBkZWJ1ZywgbG9nT3Bjb2RlIH0gZnJvbSAnQGdsaW1tZXIvb3Bjb2RlLWNvbXBpbGVyJztcbmltcG9ydCB7IERFU1RSVUNUT1JfU1RBQ0ssIElOTkVSX1ZNLCBDT05TVEFOVFMsIFNUQUNLUyB9IGZyb20gJy4vc3ltYm9scyc7XG5pbXBvcnQgeyBJbnRlcm5hbFZNLCBJbnRlcm5hbEppdFZNIH0gZnJvbSAnLi92bS9hcHBlbmQnO1xuaW1wb3J0IHsgQ1VSU09SX1NUQUNLIH0gZnJvbSAnLi92bS9lbGVtZW50LWJ1aWxkZXInO1xuaW1wb3J0IHsgaXNTY29wZVJlZmVyZW5jZSB9IGZyb20gJy4vZW52aXJvbm1lbnQnO1xuXG5leHBvcnQgaW50ZXJmYWNlIE9wY29kZUpTT04ge1xuICB0eXBlOiBudW1iZXIgfCBzdHJpbmc7XG4gIGd1aWQ/OiBPcHRpb248bnVtYmVyPjtcbiAgZGVvcHRlZD86IGJvb2xlYW47XG4gIGFyZ3M/OiBzdHJpbmdbXTtcbiAgZGV0YWlscz86IERpY3Q8T3B0aW9uPHN0cmluZz4+O1xuICBjaGlsZHJlbj86IE9wY29kZUpTT05bXTtcbn1cblxuZXhwb3J0IHR5cGUgT3BlcmFuZDEgPSBudW1iZXI7XG5leHBvcnQgdHlwZSBPcGVyYW5kMiA9IG51bWJlcjtcbmV4cG9ydCB0eXBlIE9wZXJhbmQzID0gbnVtYmVyO1xuXG5leHBvcnQgdHlwZSBTeXNjYWxsID0gKHZtOiBJbnRlcm5hbFZNPEppdE9yQW90QmxvY2s+LCBvcGNvZGU6IFJ1bnRpbWVPcCkgPT4gdm9pZDtcbmV4cG9ydCB0eXBlIEppdFN5c2NhbGwgPSAodm06IEludGVybmFsSml0Vk0sIG9wY29kZTogUnVudGltZU9wKSA9PiB2b2lkO1xuZXhwb3J0IHR5cGUgTWFjaGluZU9wY29kZSA9ICh2bTogTG93TGV2ZWxWTSwgb3Bjb2RlOiBSdW50aW1lT3ApID0+IHZvaWQ7XG5cbmV4cG9ydCB0eXBlIEV2YWx1YXRlID1cbiAgfCB7IHN5c2NhbGw6IHRydWU7IGV2YWx1YXRlOiBTeXNjYWxsIH1cbiAgfCB7IHN5c2NhbGw6IGZhbHNlOyBldmFsdWF0ZTogTWFjaGluZU9wY29kZSB9O1xuXG5leHBvcnQgdHlwZSBEZWJ1Z1N0YXRlID0ge1xuICBwYzogbnVtYmVyO1xuICBzcDogbnVtYmVyO1xuICB0eXBlOiBudW1iZXI7XG4gIGlzTWFjaGluZTogMCB8IDE7XG4gIHNpemU6IG51bWJlcjtcbiAgcGFyYW1zPzogTWF5YmU8RGljdD47XG4gIG5hbWU/OiBzdHJpbmc7XG4gIHN0YXRlOiB1bmtub3duO1xufTtcblxuZXhwb3J0IGNsYXNzIEFwcGVuZE9wY29kZXMge1xuICBwcml2YXRlIGV2YWx1YXRlT3Bjb2RlOiBFdmFsdWF0ZVtdID0gZmlsbE51bGxzPEV2YWx1YXRlPihPcC5TaXplKS5zbGljZSgpO1xuXG4gIGFkZDxOYW1lIGV4dGVuZHMgT3A+KG5hbWU6IE5hbWUsIGV2YWx1YXRlOiBTeXNjYWxsKTogdm9pZDtcbiAgYWRkPE5hbWUgZXh0ZW5kcyBPcD4obmFtZTogTmFtZSwgZXZhbHVhdGU6IE1hY2hpbmVPcGNvZGUsIGtpbmQ6ICdtYWNoaW5lJyk6IHZvaWQ7XG4gIGFkZDxOYW1lIGV4dGVuZHMgT3A+KG5hbWU6IE5hbWUsIGV2YWx1YXRlOiBKaXRTeXNjYWxsLCBraW5kOiAnaml0Jyk6IHZvaWQ7XG4gIGFkZDxOYW1lIGV4dGVuZHMgT3A+KFxuICAgIG5hbWU6IE5hbWUsXG4gICAgZXZhbHVhdGU6IFN5c2NhbGwgfCBKaXRTeXNjYWxsIHwgTWFjaGluZU9wY29kZSxcbiAgICBraW5kID0gJ3N5c2NhbGwnXG4gICk6IHZvaWQge1xuICAgIHRoaXMuZXZhbHVhdGVPcGNvZGVbbmFtZSBhcyBudW1iZXJdID0ge1xuICAgICAgc3lzY2FsbDoga2luZCAhPT0gJ21hY2hpbmUnLFxuICAgICAgZXZhbHVhdGUsXG4gICAgfSBhcyBFdmFsdWF0ZTtcbiAgfVxuXG4gIGRlYnVnQmVmb3JlKHZtOiBWTTxKaXRPckFvdEJsb2NrPiwgb3Bjb2RlOiBSdW50aW1lT3ApOiBEZWJ1Z1N0YXRlIHtcbiAgICBsZXQgcGFyYW1zOiBNYXliZTxEaWN0PiA9IHVuZGVmaW5lZDtcbiAgICBsZXQgb3BOYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgICBpZiAoREVCVUcpIHtcbiAgICAgIGxldCBwb3MgPSB2bVtJTk5FUl9WTV0uZmV0Y2hSZWdpc3RlcigkcGMpIC0gb3Bjb2RlLnNpemU7XG5cbiAgICAgIFtvcE5hbWUsIHBhcmFtc10gPSBkZWJ1Zyh2bVtDT05TVEFOVFNdLCB2bS5ydW50aW1lLnJlc29sdmVyLCBvcGNvZGUsIG9wY29kZS5pc01hY2hpbmUpO1xuXG4gICAgICAvLyBjb25zb2xlLmxvZyhgJHt0eXBlUG9zKHZtWydwYyddKX0uYCk7XG4gICAgICBjb25zb2xlLmxvZyhgJHtwb3N9LiAke2xvZ09wY29kZShvcE5hbWUsIHBhcmFtcyl9YCk7XG5cbiAgICAgIGxldCBkZWJ1Z1BhcmFtcyA9IFtdO1xuICAgICAgZm9yIChsZXQgcHJvcCBpbiBwYXJhbXMpIHtcbiAgICAgICAgZGVidWdQYXJhbXMucHVzaChwcm9wLCAnPScsIHBhcmFtc1twcm9wXSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnNvbGUubG9nKC4uLmRlYnVnUGFyYW1zKTtcbiAgICB9XG5cbiAgICBsZXQgc3A6IG51bWJlcjtcblxuICAgIGlmIChERVZNT0RFKSB7XG4gICAgICBzcCA9IHZtLmZldGNoVmFsdWUoJHNwKTtcbiAgICB9XG5cbiAgICByZWNvcmRTdGFja1NpemUodm0uZmV0Y2hWYWx1ZSgkc3ApKTtcbiAgICByZXR1cm4ge1xuICAgICAgc3A6IHNwISxcbiAgICAgIHBjOiB2bS5mZXRjaFZhbHVlKCRwYyksXG4gICAgICBuYW1lOiBvcE5hbWUsXG4gICAgICBwYXJhbXMsXG4gICAgICB0eXBlOiBvcGNvZGUudHlwZSxcbiAgICAgIGlzTWFjaGluZTogb3Bjb2RlLmlzTWFjaGluZSxcbiAgICAgIHNpemU6IG9wY29kZS5zaXplLFxuICAgICAgc3RhdGU6IHVuZGVmaW5lZCxcbiAgICB9O1xuICB9XG5cbiAgZGVidWdBZnRlcih2bTogVk08Sml0T3JBb3RCbG9jaz4sIHByZTogRGVidWdTdGF0ZSkge1xuICAgIGxldCB7IHNwLCB0eXBlLCBpc01hY2hpbmUsIHBjIH0gPSBwcmU7XG5cbiAgICBpZiAoREVCVUcpIHtcbiAgICAgIGxldCBtZXRhID0gb3Bjb2RlTWV0YWRhdGEodHlwZSwgaXNNYWNoaW5lKTtcbiAgICAgIGxldCBhY3R1YWxDaGFuZ2UgPSB2bS5mZXRjaFZhbHVlKCRzcCkgLSBzcCE7XG4gICAgICBpZiAoXG4gICAgICAgIG1ldGEgJiZcbiAgICAgICAgbWV0YS5jaGVjayAmJlxuICAgICAgICB0eXBlb2YgbWV0YS5zdGFja0NoYW5nZSEgPT09ICdudW1iZXInICYmXG4gICAgICAgIG1ldGEuc3RhY2tDaGFuZ2UhICE9PSBhY3R1YWxDaGFuZ2VcbiAgICAgICkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYEVycm9yIGluICR7cHJlLm5hbWV9OlxcblxcbiR7cGN9LiAke2xvZ09wY29kZShcbiAgICAgICAgICAgIHByZS5uYW1lISxcbiAgICAgICAgICAgIHByZS5wYXJhbXMhXG4gICAgICAgICAgKX1cXG5cXG5TdGFjayBjaGFuZ2VkIGJ5ICR7YWN0dWFsQ2hhbmdlfSwgZXhwZWN0ZWQgJHttZXRhLnN0YWNrQ2hhbmdlIX1gXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAnJWMgLT4gcGM6ICVkLCByYTogJWQsIGZwOiAlZCwgc3A6ICVkLCBzMDogJU8sIHMxOiAlTywgdDA6ICVPLCB0MTogJU8sIHYwOiAlTycsXG4gICAgICAgICdjb2xvcjogb3JhbmdlJyxcbiAgICAgICAgdm1bSU5ORVJfVk1dLnJlZ2lzdGVyc1skcGNdLFxuICAgICAgICB2bVtJTk5FUl9WTV0ucmVnaXN0ZXJzWyRyYV0sXG4gICAgICAgIHZtW0lOTkVSX1ZNXS5yZWdpc3RlcnNbJGZwXSxcbiAgICAgICAgdm1bSU5ORVJfVk1dLnJlZ2lzdGVyc1skc3BdLFxuICAgICAgICB2bVsnczAnXSxcbiAgICAgICAgdm1bJ3MxJ10sXG4gICAgICAgIHZtWyd0MCddLFxuICAgICAgICB2bVsndDEnXSxcbiAgICAgICAgdm1bJ3YwJ11cbiAgICAgICk7XG4gICAgICBjb25zb2xlLmxvZygnJWMgLT4gZXZhbCBzdGFjaycsICdjb2xvcjogcmVkJywgdm0uc3RhY2sudG9BcnJheSgpKTtcbiAgICAgIGNvbnNvbGUubG9nKCclYyAtPiBibG9jayBzdGFjaycsICdjb2xvcjogbWFnZW50YScsIHZtLmVsZW1lbnRzKCkuZGVidWdCbG9ja3MoKSk7XG4gICAgICBjb25zb2xlLmxvZygnJWMgLT4gZGVzdHJ1Y3RvciBzdGFjaycsICdjb2xvcjogdmlvbGV0Jywgdm1bREVTVFJVQ1RPUl9TVEFDS10udG9BcnJheSgpKTtcbiAgICAgIGlmICh2bVtTVEFDS1NdLnNjb3BlLmN1cnJlbnQgPT09IG51bGwpIHtcbiAgICAgICAgY29uc29sZS5sb2coJyVjIC0+IHNjb3BlJywgJ2NvbG9yOiBncmVlbicsICdudWxsJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAnJWMgLT4gc2NvcGUnLFxuICAgICAgICAgICdjb2xvcjogZ3JlZW4nLFxuICAgICAgICAgIHZtLnNjb3BlKCkuc2xvdHMubWFwKHMgPT4gKGlzU2NvcGVSZWZlcmVuY2UocykgPyBzLnZhbHVlKCkgOiBzKSlcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgY29uc29sZS5sb2coJyVjIC0+IGVsZW1lbnRzJywgJ2NvbG9yOiBibHVlJywgdm0uZWxlbWVudHMoKVtDVVJTT1JfU1RBQ0tdLmN1cnJlbnQhLmVsZW1lbnQpO1xuXG4gICAgICBjb25zb2xlLmxvZygnJWMgLT4gY29uc3RydWN0aW5nJywgJ2NvbG9yOiBhcXVhJywgdm0uZWxlbWVudHMoKVsnY29uc3RydWN0aW5nJ10pO1xuICAgIH1cbiAgfVxuXG4gIGV2YWx1YXRlKHZtOiBWTTxKaXRPckFvdEJsb2NrPiwgb3Bjb2RlOiBSdW50aW1lT3AsIHR5cGU6IG51bWJlcikge1xuICAgIGxldCBvcGVyYXRpb24gPSB0aGlzLmV2YWx1YXRlT3Bjb2RlW3R5cGVdO1xuXG4gICAgaWYgKG9wZXJhdGlvbi5zeXNjYWxsKSB7XG4gICAgICBhc3NlcnQoXG4gICAgICAgICFvcGNvZGUuaXNNYWNoaW5lLFxuICAgICAgICBgQlVHOiBNaXNtYXRjaCBiZXR3ZWVuIG9wZXJhdGlvbi5zeXNjYWxsICgke29wZXJhdGlvbi5zeXNjYWxsfSkgYW5kIG9wY29kZS5pc01hY2hpbmUgKCR7b3Bjb2RlLmlzTWFjaGluZX0pIGZvciAke29wY29kZS50eXBlfWBcbiAgICAgICk7XG4gICAgICBvcGVyYXRpb24uZXZhbHVhdGUodm0sIG9wY29kZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFzc2VydChcbiAgICAgICAgb3Bjb2RlLmlzTWFjaGluZSxcbiAgICAgICAgYEJVRzogTWlzbWF0Y2ggYmV0d2VlbiBvcGVyYXRpb24uc3lzY2FsbCAoJHtvcGVyYXRpb24uc3lzY2FsbH0pIGFuZCBvcGNvZGUuaXNNYWNoaW5lICgke29wY29kZS5pc01hY2hpbmV9KSBmb3IgJHtvcGNvZGUudHlwZX1gXG4gICAgICApO1xuICAgICAgb3BlcmF0aW9uLmV2YWx1YXRlKHZtW0lOTkVSX1ZNXSwgb3Bjb2RlKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IEFQUEVORF9PUENPREVTID0gbmV3IEFwcGVuZE9wY29kZXMoKTtcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEFic3RyYWN0T3Bjb2RlIHtcbiAgcHVibGljIGFic3RyYWN0IHR5cGU6IHN0cmluZztcbiAgcHVibGljIF9ndWlkITogbnVtYmVyOyAvLyBTZXQgYnkgaW5pdGlhbGl6ZUd1aWQoKSBpbiB0aGUgY29uc3RydWN0b3JcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBpbml0aWFsaXplR3VpZCh0aGlzKTtcbiAgfVxufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVXBkYXRpbmdPcGNvZGUgZXh0ZW5kcyBBYnN0cmFjdE9wY29kZSB7XG4gIHB1YmxpYyBhYnN0cmFjdCB0YWc6IFRhZztcblxuICBuZXh0OiBPcHRpb248VXBkYXRpbmdPcGNvZGU+ID0gbnVsbDtcbiAgcHJldjogT3B0aW9uPFVwZGF0aW5nT3Bjb2RlPiA9IG51bGw7XG5cbiAgYWJzdHJhY3QgZXZhbHVhdGUodm06IFVwZGF0aW5nVk0pOiB2b2lkO1xufVxuXG5leHBvcnQgdHlwZSBVcGRhdGluZ09wU2VxID0gTGlzdFNsaWNlPFVwZGF0aW5nT3Bjb2RlPjtcbiJdLCJzb3VyY2VSb290IjoiIn0=