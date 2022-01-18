'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.setDebuggerCallback = setDebuggerCallback;
exports.resetDebuggerCallback = resetDebuggerCallback;

var _util = require('@glimmer/util');

var _opcodes = require('../../opcodes');

var _symbols2 = require('../../symbols');

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

function debugCallback(context, get) {
    console.info('Use `context`, and `get(<path>)` to debug this template.');
    // for example...
    // eslint-disable-next-line no-unused-expressions
    context === get('this');
    // eslint-disable-next-line no-debugger
    debugger;
}
var callback = debugCallback;
// For testing purposes
function setDebuggerCallback(cb) {
    callback = cb;
}
function resetDebuggerCallback() {
    callback = debugCallback;
}

var ScopeInspector = function () {
    function ScopeInspector(scope, symbols, evalInfo) {
        _classCallCheck(this, ScopeInspector);

        this.scope = scope;
        this.locals = (0, _util.dict)();
        for (var i = 0; i < evalInfo.length; i++) {
            var slot = evalInfo[i];
            var name = symbols[slot - 1];
            var ref = scope.getSymbol(slot);
            this.locals[name] = ref;
        }
    }

    ScopeInspector.prototype.get = function get(path) {
        var scope = this.scope,
            locals = this.locals;

        var parts = path.split('.');

        var _path$split = path.split('.'),
            head = _path$split[0],
            tail = _path$split.slice(1);

        var evalScope = scope.getEvalScope();
        var ref = void 0;
        if (head === 'this') {
            ref = scope.getSelf();
        } else if (locals[head]) {
            ref = locals[head];
        } else if (head.indexOf('@') === 0 && evalScope[head]) {
            ref = evalScope[head];
        } else {
            ref = this.scope.getSelf();
            tail = parts;
        }
        return tail.reduce(function (r, part) {
            return r.get(part);
        }, ref);
    };

    return ScopeInspector;
}();

_opcodes.APPEND_OPCODES.add(105 /* Debugger */, function (vm, _ref) {
    var _symbols = _ref.op1,
        _evalInfo = _ref.op2;

    var symbols = vm[_symbols2.CONSTANTS].getStringArray(_symbols);
    var evalInfo = vm[_symbols2.CONSTANTS].getArray(_evalInfo);
    var inspector = new ScopeInspector(vm.scope(), symbols, evalInfo);
    callback(vm.getSelf().value(), function (path) {
        return inspector.get(path).value();
    });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2NvbXBpbGVkL29wY29kZXMvZGVidWdnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7UUF3Qk0sbUIsR0FBQSxtQjtRQUlBLHFCLEdBQUEscUI7O0FBMUJOOztBQUNBOztBQUNBOzs7Ozs7OztBQU1BLFNBQUEsYUFBQSxDQUFBLE9BQUEsRUFBQSxHQUFBLEVBQXNEO0FBQ3BELFlBQUEsSUFBQSxDQUFBLDBEQUFBO0FBRUE7QUFDQTtBQUNBLGdCQUFZLElBQVosTUFBWSxDQUFaO0FBRUE7QUFDQTtBQUNEO0FBRUQsSUFBSSxXQUFKLGFBQUE7QUFFQTtBQUNNLFNBQUEsbUJBQUEsQ0FBQSxFQUFBLEVBQStDO0FBQ25ELGVBQUEsRUFBQTtBQUNEO0FBRUssU0FBQSxxQkFBQSxHQUErQjtBQUNuQyxlQUFBLGFBQUE7QUFDRDs7SUFFRCxpQjtBQUdFLGFBQUEsY0FBQSxDQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsUUFBQSxFQUEwRTtBQUFBLHdCQUFBLElBQUEsRUFBQSxjQUFBOztBQUF0RCxhQUFBLEtBQUEsR0FBQSxLQUFBO0FBRlosYUFBQSxNQUFBLEdBQUEsaUJBQUE7QUFHTixhQUFLLElBQUksSUFBVCxDQUFBLEVBQWdCLElBQUksU0FBcEIsTUFBQSxFQUFBLEdBQUEsRUFBMEM7QUFDeEMsZ0JBQUksT0FBTyxTQUFYLENBQVcsQ0FBWDtBQUNBLGdCQUFJLE9BQU8sUUFBUSxPQUFuQixDQUFXLENBQVg7QUFDQSxnQkFBSSxNQUFNLE1BQUEsU0FBQSxDQUFWLElBQVUsQ0FBVjtBQUNBLGlCQUFBLE1BQUEsQ0FBQSxJQUFBLElBQUEsR0FBQTtBQUNEO0FBQ0Y7OzZCQUVELEcsZ0JBQUEsSSxFQUFnQjtBQUFBLFlBQUEsUUFBQSxLQUFBLEtBQUE7QUFBQSxZQUFBLFNBQUEsS0FBQSxNQUFBOztBQUVkLFlBQUksUUFBUSxLQUFBLEtBQUEsQ0FBWixHQUFZLENBQVo7O0FBRmMsWUFBQSxjQUdRLEtBQUEsS0FBQSxDQUhSLEdBR1EsQ0FIUjtBQUFBLFlBQUEsT0FBQSxZQUFBLENBQUEsQ0FBQTtBQUFBLFlBQUEsT0FBQSxZQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7O0FBS2QsWUFBSSxZQUFZLE1BQWhCLFlBQWdCLEVBQWhCO0FBQ0EsWUFBQSxNQUFBLEtBQUEsQ0FBQTtBQUVBLFlBQUksU0FBSixNQUFBLEVBQXFCO0FBQ25CLGtCQUFNLE1BQU4sT0FBTSxFQUFOO0FBREYsU0FBQSxNQUVPLElBQUksT0FBSixJQUFJLENBQUosRUFBa0I7QUFDdkIsa0JBQU0sT0FBTixJQUFNLENBQU47QUFESyxTQUFBLE1BRUEsSUFBSSxLQUFBLE9BQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxJQUEyQixVQUEvQixJQUErQixDQUEvQixFQUFnRDtBQUNyRCxrQkFBTSxVQUFOLElBQU0sQ0FBTjtBQURLLFNBQUEsTUFFQTtBQUNMLGtCQUFNLEtBQUEsS0FBQSxDQUFOLE9BQU0sRUFBTjtBQUNBLG1CQUFBLEtBQUE7QUFDRDtBQUVELGVBQU8sS0FBQSxNQUFBLENBQVksVUFBQSxDQUFBLEVBQUEsSUFBQSxFQUFBO0FBQUEsbUJBQWEsRUFBQSxHQUFBLENBQXpCLElBQXlCLENBQWI7QUFBWixTQUFBLEVBQVAsR0FBTyxDQUFQOzs7Ozs7QUFJSix3QkFBQSxHQUFBLENBQUEsR0FBQSxDQUFBLGNBQUEsRUFBZ0MsVUFBQSxFQUFBLEVBQUEsSUFBQSxFQUEwQztBQUFBLFFBQXJDLFdBQXFDLEtBQW5DLEdBQW1DO0FBQUEsUUFBMUMsWUFBMEMsS0FBcEIsR0FBb0I7O0FBQ3hFLFFBQUksVUFBVSxHQUFBLG1CQUFBLEVBQUEsY0FBQSxDQUFkLFFBQWMsQ0FBZDtBQUNBLFFBQUksV0FBVyxHQUFBLG1CQUFBLEVBQUEsUUFBQSxDQUFmLFNBQWUsQ0FBZjtBQUNBLFFBQUksWUFBWSxJQUFBLGNBQUEsQ0FBbUIsR0FBbkIsS0FBbUIsRUFBbkIsRUFBQSxPQUFBLEVBQWhCLFFBQWdCLENBQWhCO0FBQ0EsYUFBUyxHQUFBLE9BQUEsR0FBVCxLQUFTLEVBQVQsRUFBK0IsVUFBQSxJQUFBLEVBQUE7QUFBQSxlQUFRLFVBQUEsR0FBQSxDQUFBLElBQUEsRUFBdkMsS0FBdUMsRUFBUjtBQUEvQixLQUFBO0FBSkYsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE9wLCBKaXRPckFvdEJsb2NrLCBTY29wZSB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgVmVyc2lvbmVkUGF0aFJlZmVyZW5jZSB9IGZyb20gJ0BnbGltbWVyL3JlZmVyZW5jZSc7XG5pbXBvcnQgeyBkaWN0IH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQgeyBBUFBFTkRfT1BDT0RFUyB9IGZyb20gJy4uLy4uL29wY29kZXMnO1xuaW1wb3J0IHsgQ09OU1RBTlRTIH0gZnJvbSAnLi4vLi4vc3ltYm9scyc7XG5cbmV4cG9ydCB0eXBlIERlYnVnR2V0ID0gKHBhdGg6IHN0cmluZykgPT4gdW5rbm93bjtcblxuZXhwb3J0IHR5cGUgRGVidWdDYWxsYmFjayA9IChjb250ZXh0OiB1bmtub3duLCBnZXQ6IERlYnVnR2V0KSA9PiB2b2lkO1xuXG5mdW5jdGlvbiBkZWJ1Z0NhbGxiYWNrKGNvbnRleHQ6IHVua25vd24sIGdldDogRGVidWdHZXQpOiB2b2lkIHtcbiAgY29uc29sZS5pbmZvKCdVc2UgYGNvbnRleHRgLCBhbmQgYGdldCg8cGF0aD4pYCB0byBkZWJ1ZyB0aGlzIHRlbXBsYXRlLicpO1xuXG4gIC8vIGZvciBleGFtcGxlLi4uXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bnVzZWQtZXhwcmVzc2lvbnNcbiAgY29udGV4dCA9PT0gZ2V0KCd0aGlzJyk7XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWRlYnVnZ2VyXG4gIGRlYnVnZ2VyO1xufVxuXG5sZXQgY2FsbGJhY2sgPSBkZWJ1Z0NhbGxiYWNrO1xuXG4vLyBGb3IgdGVzdGluZyBwdXJwb3Nlc1xuZXhwb3J0IGZ1bmN0aW9uIHNldERlYnVnZ2VyQ2FsbGJhY2soY2I6IERlYnVnQ2FsbGJhY2spIHtcbiAgY2FsbGJhY2sgPSBjYjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0RGVidWdnZXJDYWxsYmFjaygpIHtcbiAgY2FsbGJhY2sgPSBkZWJ1Z0NhbGxiYWNrO1xufVxuXG5jbGFzcyBTY29wZUluc3BlY3RvcjxDIGV4dGVuZHMgSml0T3JBb3RCbG9jaz4ge1xuICBwcml2YXRlIGxvY2FscyA9IGRpY3Q8VmVyc2lvbmVkUGF0aFJlZmVyZW5jZTx1bmtub3duPj4oKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHNjb3BlOiBTY29wZTxDPiwgc3ltYm9sczogc3RyaW5nW10sIGV2YWxJbmZvOiBudW1iZXJbXSkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZXZhbEluZm8ubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBzbG90ID0gZXZhbEluZm9baV07XG4gICAgICBsZXQgbmFtZSA9IHN5bWJvbHNbc2xvdCAtIDFdO1xuICAgICAgbGV0IHJlZiA9IHNjb3BlLmdldFN5bWJvbChzbG90KTtcbiAgICAgIHRoaXMubG9jYWxzW25hbWVdID0gcmVmO1xuICAgIH1cbiAgfVxuXG4gIGdldChwYXRoOiBzdHJpbmcpOiBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPHVua25vd24+IHtcbiAgICBsZXQgeyBzY29wZSwgbG9jYWxzIH0gPSB0aGlzO1xuICAgIGxldCBwYXJ0cyA9IHBhdGguc3BsaXQoJy4nKTtcbiAgICBsZXQgW2hlYWQsIC4uLnRhaWxdID0gcGF0aC5zcGxpdCgnLicpO1xuXG4gICAgbGV0IGV2YWxTY29wZSA9IHNjb3BlLmdldEV2YWxTY29wZSgpITtcbiAgICBsZXQgcmVmOiBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPHVua25vd24+O1xuXG4gICAgaWYgKGhlYWQgPT09ICd0aGlzJykge1xuICAgICAgcmVmID0gc2NvcGUuZ2V0U2VsZigpO1xuICAgIH0gZWxzZSBpZiAobG9jYWxzW2hlYWRdKSB7XG4gICAgICByZWYgPSBsb2NhbHNbaGVhZF07XG4gICAgfSBlbHNlIGlmIChoZWFkLmluZGV4T2YoJ0AnKSA9PT0gMCAmJiBldmFsU2NvcGVbaGVhZF0pIHtcbiAgICAgIHJlZiA9IGV2YWxTY29wZVtoZWFkXSBhcyBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPHVua25vd24+O1xuICAgIH0gZWxzZSB7XG4gICAgICByZWYgPSB0aGlzLnNjb3BlLmdldFNlbGYoKTtcbiAgICAgIHRhaWwgPSBwYXJ0cztcbiAgICB9XG5cbiAgICByZXR1cm4gdGFpbC5yZWR1Y2UoKHIsIHBhcnQpID0+IHIuZ2V0KHBhcnQpLCByZWYpO1xuICB9XG59XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5EZWJ1Z2dlciwgKHZtLCB7IG9wMTogX3N5bWJvbHMsIG9wMjogX2V2YWxJbmZvIH0pID0+IHtcbiAgbGV0IHN5bWJvbHMgPSB2bVtDT05TVEFOVFNdLmdldFN0cmluZ0FycmF5KF9zeW1ib2xzKTtcbiAgbGV0IGV2YWxJbmZvID0gdm1bQ09OU1RBTlRTXS5nZXRBcnJheShfZXZhbEluZm8pO1xuICBsZXQgaW5zcGVjdG9yID0gbmV3IFNjb3BlSW5zcGVjdG9yKHZtLnNjb3BlKCksIHN5bWJvbHMsIGV2YWxJbmZvKTtcbiAgY2FsbGJhY2sodm0uZ2V0U2VsZigpLnZhbHVlKCksIHBhdGggPT4gaW5zcGVjdG9yLmdldChwYXRoKS52YWx1ZSgpKTtcbn0pO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==