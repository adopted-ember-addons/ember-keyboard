var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

export var RuntimeOpImpl = function () {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3Byb2dyYW0vbGliL29wY29kZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBRU0sV0FBQSxhQUFBO0FBRUosMkJBQUEsSUFBQSxFQUFxQztBQUFBOztBQUFoQixhQUFBLElBQUEsR0FBQSxJQUFBO0FBRGQsYUFBQSxNQUFBLEdBQUEsQ0FBQTtBQUNrQzs7QUFGckM7QUFBQTtBQUFBLDRCQUlJO0FBQ04sZ0JBQUksVUFBVSxLQUFBLElBQUEsQ0FBQSxTQUFBLENBQW9CLEtBQWxDLE1BQWMsQ0FBZDtBQUNBLG1CQUFPLENBQUMsQ0FBQyxVQUFELEdBQUEsQ0FBQSxzQkFBQSxLQUFELENBQUEsQ0FBQSxlQUFBLElBQVAsQ0FBQTtBQUNEO0FBUEc7QUFBQTtBQUFBLDRCQVNTO0FBQ1gsZ0JBQUksVUFBVSxLQUFBLElBQUEsQ0FBQSxTQUFBLENBQW9CLEtBQWxDLE1BQWMsQ0FBZDtBQUNBLG1CQUFPLFVBQUEsSUFBQSxDQUFBLGtCQUFBLEdBQUEsQ0FBQSxHQUFQLENBQUE7QUFDRDtBQVpHO0FBQUE7QUFBQSw0QkFjSTtBQUNOLG1CQUFPLEtBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBb0IsS0FBcEIsTUFBQSxJQUFQLEdBQUEsQ0FBQSxlQUFBO0FBQ0Q7QUFoQkc7QUFBQTtBQUFBLDRCQWtCRztBQUNMLG1CQUFPLEtBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBb0IsS0FBQSxNQUFBLEdBQTNCLENBQU8sQ0FBUDtBQUNEO0FBcEJHO0FBQUE7QUFBQSw0QkFzQkc7QUFDTCxtQkFBTyxLQUFBLElBQUEsQ0FBQSxTQUFBLENBQW9CLEtBQUEsTUFBQSxHQUEzQixDQUFPLENBQVA7QUFDRDtBQXhCRztBQUFBO0FBQUEsNEJBMEJHO0FBQ0wsbUJBQU8sS0FBQSxJQUFBLENBQUEsU0FBQSxDQUFvQixLQUFBLE1BQUEsR0FBM0IsQ0FBTyxDQUFQO0FBQ0Q7QUE1Qkc7O0FBQUE7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE9wY29kZVNpemUsIFJ1bnRpbWVPcCwgT3Bjb2RlSGVhcCB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuXG5leHBvcnQgY2xhc3MgUnVudGltZU9wSW1wbCBpbXBsZW1lbnRzIFJ1bnRpbWVPcCB7XG4gIHB1YmxpYyBvZmZzZXQgPSAwO1xuICBjb25zdHJ1Y3RvcihyZWFkb25seSBoZWFwOiBPcGNvZGVIZWFwKSB7fVxuXG4gIGdldCBzaXplKCkge1xuICAgIGxldCByYXdUeXBlID0gdGhpcy5oZWFwLmdldGJ5YWRkcih0aGlzLm9mZnNldCk7XG4gICAgcmV0dXJuICgocmF3VHlwZSAmIE9wY29kZVNpemUuT1BFUkFORF9MRU5fTUFTSykgPj4gT3Bjb2RlU2l6ZS5BUkdfU0hJRlQpICsgMTtcbiAgfVxuXG4gIGdldCBpc01hY2hpbmUoKTogMCB8IDEge1xuICAgIGxldCByYXdUeXBlID0gdGhpcy5oZWFwLmdldGJ5YWRkcih0aGlzLm9mZnNldCk7XG4gICAgcmV0dXJuIHJhd1R5cGUgJiBPcGNvZGVTaXplLk1BQ0hJTkVfTUFTSyA/IDEgOiAwO1xuICB9XG5cbiAgZ2V0IHR5cGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuaGVhcC5nZXRieWFkZHIodGhpcy5vZmZzZXQpICYgT3Bjb2RlU2l6ZS5UWVBFX01BU0s7XG4gIH1cblxuICBnZXQgb3AxKCkge1xuICAgIHJldHVybiB0aGlzLmhlYXAuZ2V0YnlhZGRyKHRoaXMub2Zmc2V0ICsgMSk7XG4gIH1cblxuICBnZXQgb3AyKCkge1xuICAgIHJldHVybiB0aGlzLmhlYXAuZ2V0YnlhZGRyKHRoaXMub2Zmc2V0ICsgMik7XG4gIH1cblxuICBnZXQgb3AzKCkge1xuICAgIHJldHVybiB0aGlzLmhlYXAuZ2V0YnlhZGRyKHRoaXMub2Zmc2V0ICsgMyk7XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=