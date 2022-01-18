function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UNRESOLVED = {};
export var WELL_KNOWN_EMPTY_ARRAY_POSITION = 0;
var WELL_KNOW_EMPTY_ARRAY = Object.freeze([]);

var WriteOnlyConstants = function () {
    function WriteOnlyConstants() {
        _classCallCheck(this, WriteOnlyConstants);

        // `0` means NULL
        this.strings = [];
        this.arrays = [WELL_KNOW_EMPTY_ARRAY];
        this.tables = [];
        this.handles = [];
        this.resolved = [];
        this.numbers = [];
        this.others = [];
    }

    WriteOnlyConstants.prototype.other = function other(_other) {
        return this.others.push(_other) - 1;
    };

    WriteOnlyConstants.prototype.string = function string(value) {
        var index = this.strings.indexOf(value);
        if (index > -1) {
            return index;
        }
        return this.strings.push(value) - 1;
    };

    WriteOnlyConstants.prototype.stringArray = function stringArray(strings) {
        var _strings = new Array(strings.length);
        for (var i = 0; i < strings.length; i++) {
            _strings[i] = this.string(strings[i]);
        }
        return this.array(_strings);
    };

    WriteOnlyConstants.prototype.array = function array(values) {
        if (values.length === 0) {
            return WELL_KNOWN_EMPTY_ARRAY_POSITION;
        }
        var index = this.arrays.indexOf(values);
        if (index > -1) {
            return index;
        }
        return this.arrays.push(values) - 1;
    };

    WriteOnlyConstants.prototype.templateMeta = function templateMeta(value) {
        var str = JSON.stringify(value);
        var index = this.strings.indexOf(str);
        if (index > -1) {
            return index;
        }
        return this.strings.push(str) - 1;
    };

    WriteOnlyConstants.prototype.number = function number(_number) {
        var index = this.numbers.indexOf(_number);
        if (index > -1) {
            return index;
        }
        return this.numbers.push(_number) - 1;
    };

    WriteOnlyConstants.prototype.toPool = function toPool() {
        return {
            strings: this.strings,
            arrays: this.arrays,
            handles: this.handles,
            numbers: this.numbers
        };
    };

    return WriteOnlyConstants;
}();

export { WriteOnlyConstants };

export var RuntimeConstantsImpl = function () {
    function RuntimeConstantsImpl(pool) {
        _classCallCheck(this, RuntimeConstantsImpl);

        this.strings = pool.strings;
        this.arrays = pool.arrays;
        this.handles = pool.handles;
        this.numbers = pool.numbers;
        this.others = [];
    }

    RuntimeConstantsImpl.prototype.getString = function getString(value) {
        return this.strings[value];
    };

    RuntimeConstantsImpl.prototype.getNumber = function getNumber(value) {
        return this.numbers[value];
    };

    RuntimeConstantsImpl.prototype.getStringArray = function getStringArray(value) {
        var names = this.getArray(value);
        var _names = new Array(names.length);
        for (var i = 0; i < names.length; i++) {
            var n = names[i];
            _names[i] = this.getString(n);
        }
        return _names;
    };

    RuntimeConstantsImpl.prototype.getArray = function getArray(value) {
        return this.arrays[value];
    };

    RuntimeConstantsImpl.prototype.getTemplateMeta = function getTemplateMeta(s) {
        return JSON.parse(this.strings[s]);
    };

    RuntimeConstantsImpl.prototype.getOther = function getOther(value) {
        return this.others[value];
    };

    return RuntimeConstantsImpl;
}();
export var Constants = function (_WriteOnlyConstants) {
    _inherits(Constants, _WriteOnlyConstants);

    function Constants(pool) {
        _classCallCheck(this, Constants);

        var _this = _possibleConstructorReturn(this, _WriteOnlyConstants.call(this));

        if (pool) {
            _this.strings = pool.strings;
            _this.arrays = pool.arrays;
            _this.handles = pool.handles;
            _this.resolved = _this.handles.map(function () {
                return UNRESOLVED;
            });
            _this.numbers = pool.numbers;
        }
        _this.others = [];
        return _this;
    }

    Constants.prototype.getNumber = function getNumber(value) {
        return this.numbers[value];
    };

    Constants.prototype.getString = function getString(value) {
        return this.strings[value];
    };

    Constants.prototype.getStringArray = function getStringArray(value) {
        var names = this.getArray(value);
        var _names = new Array(names.length);
        for (var i = 0; i < names.length; i++) {
            var n = names[i];
            _names[i] = this.getString(n);
        }
        return _names;
    };

    Constants.prototype.getArray = function getArray(value) {
        return this.arrays[value];
    };

    Constants.prototype.getTemplateMeta = function getTemplateMeta(s) {
        return JSON.parse(this.strings[s]);
    };

    Constants.prototype.getOther = function getOther(value) {
        return this.others[value];
    };

    return Constants;
}(WriteOnlyConstants);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3Byb2dyYW0vbGliL2NvbnN0YW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQVFBLElBQU0sYUFBTixFQUFBO0FBRUEsT0FBTyxJQUFNLGtDQUFOLENBQUE7QUFDUCxJQUFNLHdCQUF3QixPQUFBLE1BQUEsQ0FBOUIsRUFBOEIsQ0FBOUI7O0lBRU0sa0I7QUFBTixrQ0FBQTtBQUFBOztBQUNFO0FBRVUsYUFBQSxPQUFBLEdBQUEsRUFBQTtBQUNBLGFBQUEsTUFBQSxHQUFtQyxDQUFuQyxxQkFBbUMsQ0FBbkM7QUFDQSxhQUFBLE1BQUEsR0FBQSxFQUFBO0FBQ0EsYUFBQSxPQUFBLEdBQUEsRUFBQTtBQUNBLGFBQUEsUUFBQSxHQUFBLEVBQUE7QUFDQSxhQUFBLE9BQUEsR0FBQSxFQUFBO0FBQ0EsYUFBQSxNQUFBLEdBQUEsRUFBQTtBQW9FWDs7aUNBbEVDLEssa0JBQUEsTSxFQUFvQjtBQUNsQixlQUFPLEtBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLElBQVAsQ0FBQTtBQUNELEs7O2lDQUVELE0sbUJBQUEsSyxFQUFvQjtBQUNsQixZQUFJLFFBQVEsS0FBQSxPQUFBLENBQUEsT0FBQSxDQUFaLEtBQVksQ0FBWjtBQUVBLFlBQUksUUFBUSxDQUFaLENBQUEsRUFBZ0I7QUFDZCxtQkFBQSxLQUFBO0FBQ0Q7QUFFRCxlQUFPLEtBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLElBQVAsQ0FBQTtBQUNELEs7O2lDQUVELFcsd0JBQUEsTyxFQUE2QjtBQUMzQixZQUFJLFdBQXFCLElBQUEsS0FBQSxDQUFVLFFBQW5DLE1BQXlCLENBQXpCO0FBRUEsYUFBSyxJQUFJLElBQVQsQ0FBQSxFQUFnQixJQUFJLFFBQXBCLE1BQUEsRUFBQSxHQUFBLEVBQXlDO0FBQ3ZDLHFCQUFBLENBQUEsSUFBYyxLQUFBLE1BQUEsQ0FBWSxRQUExQixDQUEwQixDQUFaLENBQWQ7QUFDRDtBQUVE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QUFDMUIsZUFBTyxLQUFBLEtBQUEsQ0FBVyxLQUFBLE9BQUEsQ0FBbEIsQ0FBa0IsQ0FBWCxDQUFQO0FBQ0QsS0F6Q0g7O0FBQUEsd0JBMkNFLFFBM0NGLHFCQTJDRSxLQTNDRixFQTJDMkI7QUFDdkIsZUFBTyxLQUFBLE1BQUEsQ0FBUCxLQUFPLENBQVA7QUFDRCxLQTdDSDs7QUFBQTtBQUFBLEVBQU0sa0JBQU4iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBTeW1ib2xUYWJsZSxcbiAgQ29tcGlsZVRpbWVDb25zdGFudHMsXG4gIEVNUFRZX0FSUkFZLFxuICBDb25zdGFudFBvb2wsXG4gIFJ1bnRpbWVDb25zdGFudHMsXG59IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuXG5jb25zdCBVTlJFU09MVkVEID0ge307XG5cbmV4cG9ydCBjb25zdCBXRUxMX0tOT1dOX0VNUFRZX0FSUkFZX1BPU0lUSU9OID0gMDtcbmNvbnN0IFdFTExfS05PV19FTVBUWV9BUlJBWSA9IE9iamVjdC5mcmVlemUoW10pO1xuXG5leHBvcnQgY2xhc3MgV3JpdGVPbmx5Q29uc3RhbnRzIGltcGxlbWVudHMgQ29tcGlsZVRpbWVDb25zdGFudHMge1xuICAvLyBgMGAgbWVhbnMgTlVMTFxuXG4gIHByb3RlY3RlZCBzdHJpbmdzOiBzdHJpbmdbXSA9IFtdO1xuICBwcm90ZWN0ZWQgYXJyYXlzOiBudW1iZXJbXVtdIHwgRU1QVFlfQVJSQVkgPSBbV0VMTF9LTk9XX0VNUFRZX0FSUkFZXTtcbiAgcHJvdGVjdGVkIHRhYmxlczogU3ltYm9sVGFibGVbXSA9IFtdO1xuICBwcm90ZWN0ZWQgaGFuZGxlczogbnVtYmVyW10gPSBbXTtcbiAgcHJvdGVjdGVkIHJlc29sdmVkOiB1bmtub3duW10gPSBbXTtcbiAgcHJvdGVjdGVkIG51bWJlcnM6IG51bWJlcltdID0gW107XG4gIHByb3RlY3RlZCBvdGhlcnM6IHVua25vd25bXSA9IFtdO1xuXG4gIG90aGVyKG90aGVyOiB1bmtub3duKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5vdGhlcnMucHVzaChvdGhlcikgLSAxO1xuICB9XG5cbiAgc3RyaW5nKHZhbHVlOiBzdHJpbmcpOiBudW1iZXIge1xuICAgIGxldCBpbmRleCA9IHRoaXMuc3RyaW5ncy5pbmRleE9mKHZhbHVlKTtcblxuICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICByZXR1cm4gaW5kZXg7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuc3RyaW5ncy5wdXNoKHZhbHVlKSAtIDE7XG4gIH1cblxuICBzdHJpbmdBcnJheShzdHJpbmdzOiBzdHJpbmdbXSk6IG51bWJlciB7XG4gICAgbGV0IF9zdHJpbmdzOiBudW1iZXJbXSA9IG5ldyBBcnJheShzdHJpbmdzLmxlbmd0aCk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0cmluZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIF9zdHJpbmdzW2ldID0gdGhpcy5zdHJpbmcoc3RyaW5nc1tpXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuYXJyYXkoX3N0cmluZ3MpO1xuICB9XG5cbiAgYXJyYXkodmFsdWVzOiBudW1iZXJbXSk6IG51bWJlciB7XG4gICAgaWYgKHZhbHVlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBXRUxMX0tOT1dOX0VNUFRZX0FSUkFZX1BPU0lUSU9OO1xuICAgIH1cblxuICAgIGxldCBpbmRleCA9ICh0aGlzLmFycmF5cyBhcyBudW1iZXJbXVtdKS5pbmRleE9mKHZhbHVlcyk7XG5cbiAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgcmV0dXJuIGluZGV4O1xuICAgIH1cblxuICAgIHJldHVybiAodGhpcy5hcnJheXMgYXMgbnVtYmVyW11bXSkucHVzaCh2YWx1ZXMpIC0gMTtcbiAgfVxuXG4gIHRlbXBsYXRlTWV0YSh2YWx1ZTogdW5rbm93bik6IG51bWJlciB7XG4gICAgbGV0IHN0ciA9IEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICBsZXQgaW5kZXggPSB0aGlzLnN0cmluZ3MuaW5kZXhPZihzdHIpO1xuICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICByZXR1cm4gaW5kZXg7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuc3RyaW5ncy5wdXNoKHN0cikgLSAxO1xuICB9XG5cbiAgbnVtYmVyKG51bWJlcjogbnVtYmVyKTogbnVtYmVyIHtcbiAgICBsZXQgaW5kZXggPSB0aGlzLm51bWJlcnMuaW5kZXhPZihudW1iZXIpO1xuXG4gICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgIHJldHVybiBpbmRleDtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5udW1iZXJzLnB1c2gobnVtYmVyKSAtIDE7XG4gIH1cblxuICB0b1Bvb2woKTogQ29uc3RhbnRQb29sIHtcbiAgICByZXR1cm4ge1xuICAgICAgc3RyaW5nczogdGhpcy5zdHJpbmdzLFxuICAgICAgYXJyYXlzOiB0aGlzLmFycmF5cyxcbiAgICAgIGhhbmRsZXM6IHRoaXMuaGFuZGxlcyxcbiAgICAgIG51bWJlcnM6IHRoaXMubnVtYmVycyxcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSdW50aW1lQ29uc3RhbnRzSW1wbCBpbXBsZW1lbnRzIFJ1bnRpbWVDb25zdGFudHMge1xuICBwcm90ZWN0ZWQgc3RyaW5nczogc3RyaW5nW107XG4gIHByb3RlY3RlZCBhcnJheXM6IG51bWJlcltdW10gfCBFTVBUWV9BUlJBWTtcbiAgcHJvdGVjdGVkIGhhbmRsZXM6IG51bWJlcltdO1xuICBwcm90ZWN0ZWQgbnVtYmVyczogbnVtYmVyW107XG4gIHByb3RlY3RlZCBvdGhlcnM6IHVua25vd25bXTtcblxuICBjb25zdHJ1Y3Rvcihwb29sOiBDb25zdGFudFBvb2wpIHtcbiAgICB0aGlzLnN0cmluZ3MgPSBwb29sLnN0cmluZ3M7XG4gICAgdGhpcy5hcnJheXMgPSBwb29sLmFycmF5cztcbiAgICB0aGlzLmhhbmRsZXMgPSBwb29sLmhhbmRsZXM7XG4gICAgdGhpcy5udW1iZXJzID0gcG9vbC5udW1iZXJzO1xuICAgIHRoaXMub3RoZXJzID0gW107XG4gIH1cblxuICBnZXRTdHJpbmcodmFsdWU6IG51bWJlcik6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuc3RyaW5nc1t2YWx1ZV07XG4gIH1cblxuICBnZXROdW1iZXIodmFsdWU6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMubnVtYmVyc1t2YWx1ZV07XG4gIH1cblxuICBnZXRTdHJpbmdBcnJheSh2YWx1ZTogbnVtYmVyKTogc3RyaW5nW10ge1xuICAgIGxldCBuYW1lcyA9IHRoaXMuZ2V0QXJyYXkodmFsdWUpO1xuICAgIGxldCBfbmFtZXM6IHN0cmluZ1tdID0gbmV3IEFycmF5KG5hbWVzLmxlbmd0aCk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgbiA9IG5hbWVzW2ldO1xuICAgICAgX25hbWVzW2ldID0gdGhpcy5nZXRTdHJpbmcobik7XG4gICAgfVxuXG4gICAgcmV0dXJuIF9uYW1lcztcbiAgfVxuXG4gIGdldEFycmF5KHZhbHVlOiBudW1iZXIpOiBudW1iZXJbXSB7XG4gICAgcmV0dXJuICh0aGlzLmFycmF5cyBhcyBudW1iZXJbXVtdKVt2YWx1ZV07XG4gIH1cblxuICBnZXRUZW1wbGF0ZU1ldGE8VD4oczogbnVtYmVyKTogVCB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UodGhpcy5zdHJpbmdzW3NdKSBhcyBUO1xuICB9XG5cbiAgZ2V0T3RoZXI8VD4odmFsdWU6IG51bWJlcik6IFQge1xuICAgIHJldHVybiB0aGlzLm90aGVyc1t2YWx1ZV0gYXMgVDtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ29uc3RhbnRzIGV4dGVuZHMgV3JpdGVPbmx5Q29uc3RhbnRzIGltcGxlbWVudHMgUnVudGltZUNvbnN0YW50cyB7XG4gIGNvbnN0cnVjdG9yKHBvb2w/OiBDb25zdGFudFBvb2wpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgaWYgKHBvb2wpIHtcbiAgICAgIHRoaXMuc3RyaW5ncyA9IHBvb2wuc3RyaW5ncztcbiAgICAgIHRoaXMuYXJyYXlzID0gcG9vbC5hcnJheXM7XG4gICAgICB0aGlzLmhhbmRsZXMgPSBwb29sLmhhbmRsZXM7XG4gICAgICB0aGlzLnJlc29sdmVkID0gdGhpcy5oYW5kbGVzLm1hcCgoKSA9PiBVTlJFU09MVkVEKTtcbiAgICAgIHRoaXMubnVtYmVycyA9IHBvb2wubnVtYmVycztcbiAgICB9XG5cbiAgICB0aGlzLm90aGVycyA9IFtdO1xuICB9XG5cbiAgZ2V0TnVtYmVyKHZhbHVlOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLm51bWJlcnNbdmFsdWVdO1xuICB9XG5cbiAgZ2V0U3RyaW5nKHZhbHVlOiBudW1iZXIpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnN0cmluZ3NbdmFsdWVdO1xuICB9XG5cbiAgZ2V0U3RyaW5nQXJyYXkodmFsdWU6IG51bWJlcik6IHN0cmluZ1tdIHtcbiAgICBsZXQgbmFtZXMgPSB0aGlzLmdldEFycmF5KHZhbHVlKTtcbiAgICBsZXQgX25hbWVzOiBzdHJpbmdbXSA9IG5ldyBBcnJheShuYW1lcy5sZW5ndGgpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IG4gPSBuYW1lc1tpXTtcbiAgICAgIF9uYW1lc1tpXSA9IHRoaXMuZ2V0U3RyaW5nKG4pO1xuICAgIH1cblxuICAgIHJldHVybiBfbmFtZXM7XG4gIH1cblxuICBnZXRBcnJheSh2YWx1ZTogbnVtYmVyKTogbnVtYmVyW10ge1xuICAgIHJldHVybiAodGhpcy5hcnJheXMgYXMgbnVtYmVyW11bXSlbdmFsdWVdO1xuICB9XG5cbiAgZ2V0VGVtcGxhdGVNZXRhPFQ+KHM6IG51bWJlcik6IFQge1xuICAgIHJldHVybiBKU09OLnBhcnNlKHRoaXMuc3RyaW5nc1tzXSkgYXMgVDtcbiAgfVxuXG4gIGdldE90aGVyPFQ+KHZhbHVlOiBudW1iZXIpOiBUIHtcbiAgICByZXR1cm4gdGhpcy5vdGhlcnNbdmFsdWVdIGFzIFQ7XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=