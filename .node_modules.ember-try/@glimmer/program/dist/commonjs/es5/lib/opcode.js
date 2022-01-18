"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
        }
    }return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
}();

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var RuntimeOpImpl = exports.RuntimeOpImpl = function () {
    function RuntimeOpImpl(heap) {
        _classCallCheck(this, RuntimeOpImpl);

        this.heap = heap;
        this.offset = 0;
    }

    _createClass(RuntimeOpImpl, [{
        key: "size",
        get: function get() {
            var rawType = this.heap.getbyaddr(this.offset);
            return ((rawType & 768 /* OPERAND_LEN_MASK */) >> 8 /* ARG_SHIFT */) + 1;
        }
    }, {
        key: "isMachine",
        get: function get() {
            var rawType = this.heap.getbyaddr(this.offset);
            return rawType & 1024 /* MACHINE_MASK */ ? 1 : 0;
        }
    }, {
        key: "type",
        get: function get() {
            return this.heap.getbyaddr(this.offset) & 255 /* TYPE_MASK */;
        }
    }, {
        key: "op1",
        get: function get() {
            return this.heap.getbyaddr(this.offset + 1);
        }
    }, {
        key: "op2",
        get: function get() {
            return this.heap.getbyaddr(this.offset + 2);
        }
    }, {
        key: "op3",
        get: function get() {
            return this.heap.getbyaddr(this.offset + 3);
        }
    }]);

    return RuntimeOpImpl;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3Byb2dyYW0vbGliL29wY29kZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFTSxJQUFBLHdDQUFBLFlBQUE7QUFFSixhQUFBLGFBQUEsQ0FBQSxJQUFBLEVBQXFDO0FBQUEsd0JBQUEsSUFBQSxFQUFBLGFBQUE7O0FBQWhCLGFBQUEsSUFBQSxHQUFBLElBQUE7QUFEZCxhQUFBLE1BQUEsR0FBQSxDQUFBO0FBQ2tDOztBQUZyQyxpQkFBQSxhQUFBLEVBQUEsQ0FBQTtBQUFBLGFBQUEsTUFBQTtBQUFBLGFBQUEsU0FBQSxHQUFBLEdBSUk7QUFDTixnQkFBSSxVQUFVLEtBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBb0IsS0FBbEMsTUFBYyxDQUFkO0FBQ0EsbUJBQU8sQ0FBQyxDQUFDLFVBQUQsR0FBQSxDQUFBLHNCQUFBLEtBQUQsQ0FBQSxDQUFBLGVBQUEsSUFBUCxDQUFBO0FBQ0Q7QUFQRyxLQUFBLEVBQUE7QUFBQSxhQUFBLFdBQUE7QUFBQSxhQUFBLFNBQUEsR0FBQSxHQVNTO0FBQ1gsZ0JBQUksVUFBVSxLQUFBLElBQUEsQ0FBQSxTQUFBLENBQW9CLEtBQWxDLE1BQWMsQ0FBZDtBQUNBLG1CQUFPLFVBQUEsSUFBQSxDQUFBLGtCQUFBLEdBQUEsQ0FBQSxHQUFQLENBQUE7QUFDRDtBQVpHLEtBQUEsRUFBQTtBQUFBLGFBQUEsTUFBQTtBQUFBLGFBQUEsU0FBQSxHQUFBLEdBY0k7QUFDTixtQkFBTyxLQUFBLElBQUEsQ0FBQSxTQUFBLENBQW9CLEtBQXBCLE1BQUEsSUFBUCxHQUFBLENBQUEsZUFBQTtBQUNEO0FBaEJHLEtBQUEsRUFBQTtBQUFBLGFBQUEsS0FBQTtBQUFBLGFBQUEsU0FBQSxHQUFBLEdBa0JHO0FBQ0wsbUJBQU8sS0FBQSxJQUFBLENBQUEsU0FBQSxDQUFvQixLQUFBLE1BQUEsR0FBM0IsQ0FBTyxDQUFQO0FBQ0Q7QUFwQkcsS0FBQSxFQUFBO0FBQUEsYUFBQSxLQUFBO0FBQUEsYUFBQSxTQUFBLEdBQUEsR0FzQkc7QUFDTCxtQkFBTyxLQUFBLElBQUEsQ0FBQSxTQUFBLENBQW9CLEtBQUEsTUFBQSxHQUEzQixDQUFPLENBQVA7QUFDRDtBQXhCRyxLQUFBLEVBQUE7QUFBQSxhQUFBLEtBQUE7QUFBQSxhQUFBLFNBQUEsR0FBQSxHQTBCRztBQUNMLG1CQUFPLEtBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBb0IsS0FBQSxNQUFBLEdBQTNCLENBQU8sQ0FBUDtBQUNEO0FBNUJHLEtBQUEsQ0FBQTs7QUFBQSxXQUFBLGFBQUE7QUFBQSxDQUFBLEVBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBPcGNvZGVTaXplLCBSdW50aW1lT3AsIE9wY29kZUhlYXAgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcblxuZXhwb3J0IGNsYXNzIFJ1bnRpbWVPcEltcGwgaW1wbGVtZW50cyBSdW50aW1lT3Age1xuICBwdWJsaWMgb2Zmc2V0ID0gMDtcbiAgY29uc3RydWN0b3IocmVhZG9ubHkgaGVhcDogT3Bjb2RlSGVhcCkge31cblxuICBnZXQgc2l6ZSgpIHtcbiAgICBsZXQgcmF3VHlwZSA9IHRoaXMuaGVhcC5nZXRieWFkZHIodGhpcy5vZmZzZXQpO1xuICAgIHJldHVybiAoKHJhd1R5cGUgJiBPcGNvZGVTaXplLk9QRVJBTkRfTEVOX01BU0spID4+IE9wY29kZVNpemUuQVJHX1NISUZUKSArIDE7XG4gIH1cblxuICBnZXQgaXNNYWNoaW5lKCk6IDAgfCAxIHtcbiAgICBsZXQgcmF3VHlwZSA9IHRoaXMuaGVhcC5nZXRieWFkZHIodGhpcy5vZmZzZXQpO1xuICAgIHJldHVybiByYXdUeXBlICYgT3Bjb2RlU2l6ZS5NQUNISU5FX01BU0sgPyAxIDogMDtcbiAgfVxuXG4gIGdldCB0eXBlKCkge1xuICAgIHJldHVybiB0aGlzLmhlYXAuZ2V0YnlhZGRyKHRoaXMub2Zmc2V0KSAmIE9wY29kZVNpemUuVFlQRV9NQVNLO1xuICB9XG5cbiAgZ2V0IG9wMSgpIHtcbiAgICByZXR1cm4gdGhpcy5oZWFwLmdldGJ5YWRkcih0aGlzLm9mZnNldCArIDEpO1xuICB9XG5cbiAgZ2V0IG9wMigpIHtcbiAgICByZXR1cm4gdGhpcy5oZWFwLmdldGJ5YWRkcih0aGlzLm9mZnNldCArIDIpO1xuICB9XG5cbiAgZ2V0IG9wMygpIHtcbiAgICByZXR1cm4gdGhpcy5oZWFwLmdldGJ5YWRkcih0aGlzLm9mZnNldCArIDMpO1xuICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9