'use strict';

var _opcodes = require('../../opcodes');

var _util = require('@glimmer/util');

var _symbols2 = require('../../symbols');

_opcodes.APPEND_OPCODES.add(103 /* InvokePartial */, function (vm, _ref) {
    var _meta = _ref.op1,
        _symbols = _ref.op2,
        _evalInfo = _ref.op3;
    var constants = vm[_symbols2.CONSTANTS],
        stack = vm.stack;

    var name = stack.pop().value();
    false && (0, _util.assert)(typeof name === 'string', 'Could not find a partial named "' + String(name) + '"');

    var meta = constants.getTemplateMeta(_meta);
    var outerSymbols = constants.getStringArray(_symbols);
    var evalInfo = constants.getArray(_evalInfo);
    var handle = vm.runtime.resolver.lookupPartial(name, meta);
    false && (0, _util.assert)(handle !== null, 'Could not find a partial named "' + name + '"');

    var definition = vm.runtime.resolver.resolve(handle);

    var _definition$getPartia = definition.getPartial(vm.context),
        symbolTable = _definition$getPartia.symbolTable,
        vmHandle = _definition$getPartia.handle;

    {
        var partialSymbols = symbolTable.symbols;
        var outerScope = vm.scope();
        var partialScope = vm.pushRootScope(partialSymbols.length);
        var evalScope = outerScope.getEvalScope();
        partialScope.bindEvalScope(evalScope);
        partialScope.bindSelf(outerScope.getSelf());
        var locals = Object.create(outerScope.getPartialMap());
        for (var i = 0; i < evalInfo.length; i++) {
            var slot = evalInfo[i];
            var _name = outerSymbols[slot - 1];
            var ref = outerScope.getSymbol(slot);
            locals[_name] = ref;
        }
        if (evalScope) {
            for (var _i = 0; _i < partialSymbols.length; _i++) {
                var _name2 = partialSymbols[_i];
                var symbol = _i + 1;
                var value = evalScope[_name2];
                if (value !== undefined) partialScope.bind(symbol, value);
            }
        }
        partialScope.bindPartialMap(locals);
        vm.pushFrame(); // sp += 2
        vm.call(vmHandle);
    }
}, 'jit');
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2NvbXBpbGVkL29wY29kZXMvcGFydGlhbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBR0E7O0FBSUE7O0FBRUEsd0JBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxtQkFBQSxFQUVFLFVBQUEsRUFBQSxFQUFBLElBQUEsRUFBc0Q7QUFBQSxRQUFqRCxRQUFpRCxLQUEvQyxHQUErQztBQUFBLFFBQWpELFdBQWlELEtBQW5DLEdBQW1DO0FBQUEsUUFBdEQsWUFBc0QsS0FBcEIsR0FBb0I7QUFBQSxRQUFBLFlBQUEsR0FBQSxtQkFBQSxDQUFBO0FBQUEsUUFBQSxRQUFBLEdBQUEsS0FBQTs7QUFHcEQsUUFBSSxPQUFhLE1BQU4sR0FBTSxHQUFqQixLQUFpQixFQUFqQjtBQUhvRCxhQUlwRCxrQkFBTyxPQUFBLElBQUEsS0FBUCxRQUFBLEVBQUEscUNBQW9FLE9BSmhCLElBSWdCLENBQXBFLEdBSm9ELEdBSXBELENBSm9EOztBQU1wRCxRQUFJLE9BQU8sVUFBQSxlQUFBLENBQVgsS0FBVyxDQUFYO0FBQ0EsUUFBSSxlQUFlLFVBQUEsY0FBQSxDQUFuQixRQUFtQixDQUFuQjtBQUNBLFFBQUksV0FBVyxVQUFBLFFBQUEsQ0FBZixTQUFlLENBQWY7QUFFQSxRQUFJLFNBQVMsR0FBQSxPQUFBLENBQUEsUUFBQSxDQUFBLGFBQUEsQ0FBQSxJQUFBLEVBQWIsSUFBYSxDQUFiO0FBVm9ELGFBWXBELGtCQUFPLFdBQVAsSUFBQSxFQUFBLHFDQVpvRCxJQVlwRCxHQVpvRCxHQVlwRCxDQVpvRDs7QUFjcEQsUUFBSSxhQUFhLEdBQUEsT0FBQSxDQUFBLFFBQUEsQ0FBQSxPQUFBLENBQWpCLE1BQWlCLENBQWpCOztBQWRvRCxRQUFBLHdCQWdCWixXQUFBLFVBQUEsQ0FBc0IsR0FoQlYsT0FnQlosQ0FoQlk7QUFBQSxRQUFBLGNBQUEsc0JBQUEsV0FBQTtBQUFBLFFBQUEsV0FBQSxzQkFBQSxNQUFBOztBQWtCcEQ7QUFDRSxZQUFJLGlCQUFpQixZQUFyQixPQUFBO0FBQ0EsWUFBSSxhQUFhLEdBQWpCLEtBQWlCLEVBQWpCO0FBQ0EsWUFBSSxlQUFlLEdBQUEsYUFBQSxDQUFpQixlQUFwQyxNQUFtQixDQUFuQjtBQUNBLFlBQUksWUFBWSxXQUFoQixZQUFnQixFQUFoQjtBQUNBLHFCQUFBLGFBQUEsQ0FBQSxTQUFBO0FBQ0EscUJBQUEsUUFBQSxDQUFzQixXQUF0QixPQUFzQixFQUF0QjtBQUVBLFlBQUksU0FBUyxPQUFBLE1BQUEsQ0FBYyxXQUEzQixhQUEyQixFQUFkLENBQWI7QUFJQSxhQUFLLElBQUksSUFBVCxDQUFBLEVBQWdCLElBQUksU0FBcEIsTUFBQSxFQUFBLEdBQUEsRUFBMEM7QUFDeEMsZ0JBQUksT0FBTyxTQUFYLENBQVcsQ0FBWDtBQUNBLGdCQUFJLFFBQU8sYUFBYSxPQUF4QixDQUFXLENBQVg7QUFDQSxnQkFBSSxNQUFNLFdBQUEsU0FBQSxDQUFWLElBQVUsQ0FBVjtBQUNBLG1CQUFBLEtBQUEsSUFBQSxHQUFBO0FBQ0Q7QUFFRCxZQUFBLFNBQUEsRUFBZTtBQUNiLGlCQUFLLElBQUksS0FBVCxDQUFBLEVBQWdCLEtBQUksZUFBcEIsTUFBQSxFQUFBLElBQUEsRUFBZ0Q7QUFDOUMsb0JBQUksU0FBTyxlQUFYLEVBQVcsQ0FBWDtBQUNBLG9CQUFJLFNBQVMsS0FBYixDQUFBO0FBQ0Esb0JBQUksUUFBUSxVQUFaLE1BQVksQ0FBWjtBQUVBLG9CQUFJLFVBQUosU0FBQSxFQUF5QixhQUFBLElBQUEsQ0FBQSxNQUFBLEVBQUEsS0FBQTtBQUMxQjtBQUNGO0FBRUQscUJBQUEsY0FBQSxDQUFBLE1BQUE7QUFFQSxXQS9CRixTQStCRSxHQS9CRixDQStCa0I7QUFDaEIsV0FBQSxJQUFBLENBQUEsUUFBQTtBQUNEO0FBckRMLENBQUEsRUFBQSxLQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVmVyc2lvbmVkUGF0aFJlZmVyZW5jZSB9IGZyb20gJ0BnbGltbWVyL3JlZmVyZW5jZSc7XG5pbXBvcnQgeyBBUFBFTkRfT1BDT0RFUyB9IGZyb20gJy4uLy4uL29wY29kZXMnO1xuaW1wb3J0IHsgUGFydGlhbERlZmluaXRpb24gfSBmcm9tICdAZ2xpbW1lci9vcGNvZGUtY29tcGlsZXInO1xuaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQgeyBjaGVjayB9IGZyb20gJ0BnbGltbWVyL2RlYnVnJztcbmltcG9ydCB7IE9wLCBEaWN0IH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBDaGVja1JlZmVyZW5jZSB9IGZyb20gJy4vLWRlYnVnLXN0cmlwJztcbmltcG9ydCB7IENPTlNUQU5UUyB9IGZyb20gJy4uLy4uL3N5bWJvbHMnO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoXG4gIE9wLkludm9rZVBhcnRpYWwsXG4gICh2bSwgeyBvcDE6IF9tZXRhLCBvcDI6IF9zeW1ib2xzLCBvcDM6IF9ldmFsSW5mbyB9KSA9PiB7XG4gICAgbGV0IHsgW0NPTlNUQU5UU106IGNvbnN0YW50cywgc3RhY2sgfSA9IHZtO1xuXG4gICAgbGV0IG5hbWUgPSBjaGVjayhzdGFjay5wb3AoKSwgQ2hlY2tSZWZlcmVuY2UpLnZhbHVlKCk7XG4gICAgYXNzZXJ0KHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJywgYENvdWxkIG5vdCBmaW5kIGEgcGFydGlhbCBuYW1lZCBcIiR7U3RyaW5nKG5hbWUpfVwiYCk7XG5cbiAgICBsZXQgbWV0YSA9IGNvbnN0YW50cy5nZXRUZW1wbGF0ZU1ldGEoX21ldGEpO1xuICAgIGxldCBvdXRlclN5bWJvbHMgPSBjb25zdGFudHMuZ2V0U3RyaW5nQXJyYXkoX3N5bWJvbHMpO1xuICAgIGxldCBldmFsSW5mbyA9IGNvbnN0YW50cy5nZXRBcnJheShfZXZhbEluZm8pO1xuXG4gICAgbGV0IGhhbmRsZSA9IHZtLnJ1bnRpbWUucmVzb2x2ZXIubG9va3VwUGFydGlhbChuYW1lIGFzIHN0cmluZywgbWV0YSk7XG5cbiAgICBhc3NlcnQoaGFuZGxlICE9PSBudWxsLCBgQ291bGQgbm90IGZpbmQgYSBwYXJ0aWFsIG5hbWVkIFwiJHtuYW1lfVwiYCk7XG5cbiAgICBsZXQgZGVmaW5pdGlvbiA9IHZtLnJ1bnRpbWUucmVzb2x2ZXIucmVzb2x2ZTxQYXJ0aWFsRGVmaW5pdGlvbj4oaGFuZGxlISk7XG5cbiAgICBsZXQgeyBzeW1ib2xUYWJsZSwgaGFuZGxlOiB2bUhhbmRsZSB9ID0gZGVmaW5pdGlvbi5nZXRQYXJ0aWFsKHZtLmNvbnRleHQpO1xuXG4gICAge1xuICAgICAgbGV0IHBhcnRpYWxTeW1ib2xzID0gc3ltYm9sVGFibGUuc3ltYm9scztcbiAgICAgIGxldCBvdXRlclNjb3BlID0gdm0uc2NvcGUoKTtcbiAgICAgIGxldCBwYXJ0aWFsU2NvcGUgPSB2bS5wdXNoUm9vdFNjb3BlKHBhcnRpYWxTeW1ib2xzLmxlbmd0aCk7XG4gICAgICBsZXQgZXZhbFNjb3BlID0gb3V0ZXJTY29wZS5nZXRFdmFsU2NvcGUoKTtcbiAgICAgIHBhcnRpYWxTY29wZS5iaW5kRXZhbFNjb3BlKGV2YWxTY29wZSk7XG4gICAgICBwYXJ0aWFsU2NvcGUuYmluZFNlbGYob3V0ZXJTY29wZS5nZXRTZWxmKCkpO1xuXG4gICAgICBsZXQgbG9jYWxzID0gT2JqZWN0LmNyZWF0ZShvdXRlclNjb3BlLmdldFBhcnRpYWxNYXAoKSkgYXMgRGljdDxcbiAgICAgICAgVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTx1bmtub3duPlxuICAgICAgPjtcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBldmFsSW5mby5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgc2xvdCA9IGV2YWxJbmZvW2ldO1xuICAgICAgICBsZXQgbmFtZSA9IG91dGVyU3ltYm9sc1tzbG90IC0gMV07XG4gICAgICAgIGxldCByZWYgPSBvdXRlclNjb3BlLmdldFN5bWJvbChzbG90KTtcbiAgICAgICAgbG9jYWxzW25hbWVdID0gcmVmO1xuICAgICAgfVxuXG4gICAgICBpZiAoZXZhbFNjb3BlKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGFydGlhbFN5bWJvbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBsZXQgbmFtZSA9IHBhcnRpYWxTeW1ib2xzW2ldO1xuICAgICAgICAgIGxldCBzeW1ib2wgPSBpICsgMTtcbiAgICAgICAgICBsZXQgdmFsdWUgPSBldmFsU2NvcGVbbmFtZV07XG5cbiAgICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkgcGFydGlhbFNjb3BlLmJpbmQoc3ltYm9sLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcGFydGlhbFNjb3BlLmJpbmRQYXJ0aWFsTWFwKGxvY2Fscyk7XG5cbiAgICAgIHZtLnB1c2hGcmFtZSgpOyAvLyBzcCArPSAyXG4gICAgICB2bS5jYWxsKHZtSGFuZGxlISk7XG4gICAgfVxuICB9LFxuICAnaml0J1xuKTtcbiJdLCJzb3VyY2VSb290IjoiIn0=