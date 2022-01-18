"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
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

var UNRESOLVED = {};
var WELL_KNOWN_EMPTY_ARRAY_POSITION = exports.WELL_KNOWN_EMPTY_ARRAY_POSITION = 0;
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

exports.WriteOnlyConstants = WriteOnlyConstants;
var RuntimeConstantsImpl = exports.RuntimeConstantsImpl = function () {
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
var Constants = exports.Constants = function (_WriteOnlyConstants) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3Byb2dyYW0vbGliL2NvbnN0YW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBUUEsSUFBTSxhQUFOLEVBQUE7QUFFTyxJQUFNLDRFQUFOLENBQUE7QUFDUCxJQUFNLHdCQUF3QixPQUFBLE1BQUEsQ0FBOUIsRUFBOEIsQ0FBOUI7O0lBRU0scUI7QUFBTixhQUFBLGtCQUFBLEdBQUE7QUFBQSx3QkFBQSxJQUFBLEVBQUEsa0JBQUE7O0FBQ0U7QUFFVSxhQUFBLE9BQUEsR0FBQSxFQUFBO0FBQ0EsYUFBQSxNQUFBLEdBQW1DLENBQW5DLHFCQUFtQyxDQUFuQztBQUNBLGFBQUEsTUFBQSxHQUFBLEVBQUE7QUFDQSxhQUFBLE9BQUEsR0FBQSxFQUFBO0FBQ0EsYUFBQSxRQUFBLEdBQUEsRUFBQTtBQUNBLGFBQUEsT0FBQSxHQUFBLEVBQUE7QUFDQSxhQUFBLE1BQUEsR0FBQSxFQUFBO0FBb0VYOztpQ0FsRUMsSyxrQkFBQSxNLEVBQW9CO0FBQ2xCLGVBQU8sS0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsSUFBUCxDQUFBOzs7aUNBR0YsTSxtQkFBQSxLLEVBQW9CO0FBQ2xCLFlBQUksUUFBUSxLQUFBLE9BQUEsQ0FBQSxPQUFBLENBQVosS0FBWSxDQUFaO0FBRUEsWUFBSSxRQUFRLENBQVosQ0FBQSxFQUFnQjtBQUNkLG1CQUFBLEtBQUE7QUFDRDtBQUVELGVBQU8sS0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsSUFBUCxDQUFBOzs7aUNBR0YsVyx3QkFBQSxPLEVBQTZCO0FBQzNCLFlBQUksV0FBcUIsSUFBQSxLQUFBLENBQVUsUUFBbkMsTUFBeUIsQ0FBekI7QUFFQSxhQUFLLElBQUksSUFBVCxDQUFBLEVBQWdCLElBQUksUUFBcEIsTUFBQSxFQUFBLEdBQUEsRUFBeUM7QUFDdkMscUJBQUEsQ0FBQSxJQUFjLEtBQUEsTUFB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WUFBSSxRQUFRLEtBQUEsUUFBQSxDQUFaLEtBQVksQ0FBWjtBQUNBLFlBQUksU0FBbUIsSUFBQSxLQUFBLENBQVUsTUFBakMsTUFBdUIsQ0FBdkI7QUFFQSxhQUFLLElBQUksSUFBVCxDQUFBLEVBQWdCLElBQUksTUFBcEIsTUFBQSxFQUFBLEdBQUEsRUFBdUM7QUFDckMsZ0JBQUksSUFBSSxNQUFSLENBQVEsQ0FBUjtBQUNBLG1CQUFBLENBQUEsSUFBWSxLQUFBLFNBQUEsQ0FBWixDQUFZLENBQVo7QUFDRDtBQUVELGVBQUEsTUFBQTtBQWhDSixLQUFBOztBQUFBLGNBQUEsU0FBQSxDQUFBLFFBQUEsR0FBQSxTQUFBLFFBQUEsQ0FBQSxLQUFBLEVBbUN3QjtBQUNwQixlQUFRLEtBQUEsTUFBQSxDQUFSLEtBQVEsQ0FBUjtBQXBDSixLQUFBOztBQUFBLGNBQUEsU0FBQSxDQUFBLGVBQUEsR0FBQSxTQUFBLGVBQUEsQ0FBQSxDQUFBLEVBdUM4QjtBQUMxQixlQUFPLEtBQUEsS0FBQSxDQUFXLEtBQUEsT0FBQSxDQUFsQixDQUFrQixDQUFYLENBQVA7QUF4Q0osS0FBQTs7QUFBQSxjQUFBLFNBQUEsQ0FBQSxRQUFBLEdBQUEsU0FBQSxRQUFBLENBQUEsS0FBQSxFQTJDMkI7QUFDdkIsZUFBTyxLQUFBLE1BQUEsQ0FBUCxLQUFPLENBQVA7QUE1Q0osS0FBQTs7QUFBQSxXQUFBLFNBQUE7QUFBQSxDQUFBLENBQUEsa0JBQUEsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIFN5bWJvbFRhYmxlLFxuICBDb21waWxlVGltZUNvbnN0YW50cyxcbiAgRU1QVFlfQVJSQVksXG4gIENvbnN0YW50UG9vbCxcbiAgUnVudGltZUNvbnN0YW50cyxcbn0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5cbmNvbnN0IFVOUkVTT0xWRUQgPSB7fTtcblxuZXhwb3J0IGNvbnN0IFdFTExfS05PV05fRU1QVFlfQVJSQVlfUE9TSVRJT04gPSAwO1xuY29uc3QgV0VMTF9LTk9XX0VNUFRZX0FSUkFZID0gT2JqZWN0LmZyZWV6ZShbXSk7XG5cbmV4cG9ydCBjbGFzcyBXcml0ZU9ubHlDb25zdGFudHMgaW1wbGVtZW50cyBDb21waWxlVGltZUNvbnN0YW50cyB7XG4gIC8vIGAwYCBtZWFucyBOVUxMXG5cbiAgcHJvdGVjdGVkIHN0cmluZ3M6IHN0cmluZ1tdID0gW107XG4gIHByb3RlY3RlZCBhcnJheXM6IG51bWJlcltdW10gfCBFTVBUWV9BUlJBWSA9IFtXRUxMX0tOT1dfRU1QVFlfQVJSQVldO1xuICBwcm90ZWN0ZWQgdGFibGVzOiBTeW1ib2xUYWJsZVtdID0gW107XG4gIHByb3RlY3RlZCBoYW5kbGVzOiBudW1iZXJbXSA9IFtdO1xuICBwcm90ZWN0ZWQgcmVzb2x2ZWQ6IHVua25vd25bXSA9IFtdO1xuICBwcm90ZWN0ZWQgbnVtYmVyczogbnVtYmVyW10gPSBbXTtcbiAgcHJvdGVjdGVkIG90aGVyczogdW5rbm93bltdID0gW107XG5cbiAgb3RoZXIob3RoZXI6IHVua25vd24pOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLm90aGVycy5wdXNoKG90aGVyKSAtIDE7XG4gIH1cblxuICBzdHJpbmcodmFsdWU6IHN0cmluZyk6IG51bWJlciB7XG4gICAgbGV0IGluZGV4ID0gdGhpcy5zdHJpbmdzLmluZGV4T2YodmFsdWUpO1xuXG4gICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgIHJldHVybiBpbmRleDtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5zdHJpbmdzLnB1c2godmFsdWUpIC0gMTtcbiAgfVxuXG4gIHN0cmluZ0FycmF5KHN0cmluZ3M6IHN0cmluZ1tdKTogbnVtYmVyIHtcbiAgICBsZXQgX3N0cmluZ3M6IG51bWJlcltdID0gbmV3IEFycmF5KHN0cmluZ3MubGVuZ3RoKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyaW5ncy5sZW5ndGg7IGkrKykge1xuICAgICAgX3N0cmluZ3NbaV0gPSB0aGlzLnN0cmluZyhzdHJpbmdzW2ldKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5hcnJheShfc3RyaW5ncyk7XG4gIH1cblxuICBhcnJheSh2YWx1ZXM6IG51bWJlcltdKTogbnVtYmVyIHtcbiAgICBpZiAodmFsdWVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIFdFTExfS05PV05fRU1QVFlfQVJSQVlfUE9TSVRJT047XG4gICAgfVxuXG4gICAgbGV0IGluZGV4ID0gKHRoaXMuYXJyYXlzIGFzIG51bWJlcltdW10pLmluZGV4T2YodmFsdWVzKTtcblxuICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICByZXR1cm4gaW5kZXg7XG4gICAgfVxuXG4gICAgcmV0dXJuICh0aGlzLmFycmF5cyBhcyBudW1iZXJbXVtdKS5wdXNoKHZhbHVlcykgLSAxO1xuICB9XG5cbiAgdGVtcGxhdGVNZXRhKHZhbHVlOiB1bmtub3duKTogbnVtYmVyIHtcbiAgICBsZXQgc3RyID0gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgIGxldCBpbmRleCA9IHRoaXMuc3RyaW5ncy5pbmRleE9mKHN0cik7XG4gICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgIHJldHVybiBpbmRleDtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5zdHJpbmdzLnB1c2goc3RyKSAtIDE7XG4gIH1cblxuICBudW1iZXIobnVtYmVyOiBudW1iZXIpOiBudW1iZXIge1xuICAgIGxldCBpbmRleCA9IHRoaXMubnVtYmVycy5pbmRleE9mKG51bWJlcik7XG5cbiAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgcmV0dXJuIGluZGV4O1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLm51bWJlcnMucHVzaChudW1iZXIpIC0gMTtcbiAgfVxuXG4gIHRvUG9vbCgpOiBDb25zdGFudFBvb2wge1xuICAgIHJldHVybiB7XG4gICAgICBzdHJpbmdzOiB0aGlzLnN0cmluZ3MsXG4gICAgICBhcnJheXM6IHRoaXMuYXJyYXlzLFxuICAgICAgaGFuZGxlczogdGhpcy5oYW5kbGVzLFxuICAgICAgbnVtYmVyczogdGhpcy5udW1iZXJzLFxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJ1bnRpbWVDb25zdGFudHNJbXBsIGltcGxlbWVudHMgUnVudGltZUNvbnN0YW50cyB7XG4gIHByb3RlY3RlZCBzdHJpbmdzOiBzdHJpbmdbXTtcbiAgcHJvdGVjdGVkIGFycmF5czogbnVtYmVyW11bXSB8IEVNUFRZX0FSUkFZO1xuICBwcm90ZWN0ZWQgaGFuZGxlczogbnVtYmVyW107XG4gIHByb3RlY3RlZCBudW1iZXJzOiBudW1iZXJbXTtcbiAgcHJvdGVjdGVkIG90aGVyczogdW5rbm93bltdO1xuXG4gIGNvbnN0cnVjdG9yKHBvb2w6IENvbnN0YW50UG9vbCkge1xuICAgIHRoaXMuc3RyaW5ncyA9IHBvb2wuc3RyaW5ncztcbiAgICB0aGlzLmFycmF5cyA9IHBvb2wuYXJyYXlzO1xuICAgIHRoaXMuaGFuZGxlcyA9IHBvb2wuaGFuZGxlcztcbiAgICB0aGlzLm51bWJlcnMgPSBwb29sLm51bWJlcnM7XG4gICAgdGhpcy5vdGhlcnMgPSBbXTtcbiAgfVxuXG4gIGdldFN0cmluZyh2YWx1ZTogbnVtYmVyKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5zdHJpbmdzW3ZhbHVlXTtcbiAgfVxuXG4gIGdldE51bWJlcih2YWx1ZTogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5udW1iZXJzW3ZhbHVlXTtcbiAgfVxuXG4gIGdldFN0cmluZ0FycmF5KHZhbHVlOiBudW1iZXIpOiBzdHJpbmdbXSB7XG4gICAgbGV0IG5hbWVzID0gdGhpcy5nZXRBcnJheSh2YWx1ZSk7XG4gICAgbGV0IF9uYW1lczogc3RyaW5nW10gPSBuZXcgQXJyYXkobmFtZXMubGVuZ3RoKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBuID0gbmFtZXNbaV07XG4gICAgICBfbmFtZXNbaV0gPSB0aGlzLmdldFN0cmluZyhuKTtcbiAgICB9XG5cbiAgICByZXR1cm4gX25hbWVzO1xuICB9XG5cbiAgZ2V0QXJyYXkodmFsdWU6IG51bWJlcik6IG51bWJlcltdIHtcbiAgICByZXR1cm4gKHRoaXMuYXJyYXlzIGFzIG51bWJlcltdW10pW3ZhbHVlXTtcbiAgfVxuXG4gIGdldFRlbXBsYXRlTWV0YTxUPihzOiBudW1iZXIpOiBUIHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZSh0aGlzLnN0cmluZ3Nbc10pIGFzIFQ7XG4gIH1cblxuICBnZXRPdGhlcjxUPih2YWx1ZTogbnVtYmVyKTogVCB7XG4gICAgcmV0dXJuIHRoaXMub3RoZXJzW3ZhbHVlXSBhcyBUO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDb25zdGFudHMgZXh0ZW5kcyBXcml0ZU9ubHlDb25zdGFudHMgaW1wbGVtZW50cyBSdW50aW1lQ29uc3RhbnRzIHtcbiAgY29uc3RydWN0b3IocG9vbD86IENvbnN0YW50UG9vbCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICBpZiAocG9vbCkge1xuICAgICAgdGhpcy5zdHJpbmdzID0gcG9vbC5zdHJpbmdzO1xuICAgICAgdGhpcy5hcnJheXMgPSBwb29sLmFycmF5cztcbiAgICAgIHRoaXMuaGFuZGxlcyA9IHBvb2wuaGFuZGxlcztcbiAgICAgIHRoaXMucmVzb2x2ZWQgPSB0aGlzLmhhbmRsZXMubWFwKCgpID0+IFVOUkVTT0xWRUQpO1xuICAgICAgdGhpcy5udW1iZXJzID0gcG9vbC5udW1iZXJzO1xuICAgIH1cblxuICAgIHRoaXMub3RoZXJzID0gW107XG4gIH1cblxuICBnZXROdW1iZXIodmFsdWU6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMubnVtYmVyc1t2YWx1ZV07XG4gIH1cblxuICBnZXRTdHJpbmcodmFsdWU6IG51bWJlcik6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuc3RyaW5nc1t2YWx1ZV07XG4gIH1cblxuICBnZXRTdHJpbmdBcnJheSh2YWx1ZTogbnVtYmVyKTogc3RyaW5nW10ge1xuICAgIGxldCBuYW1lcyA9IHRoaXMuZ2V0QXJyYXkodmFsdWUpO1xuICAgIGxldCBfbmFtZXM6IHN0cmluZ1tdID0gbmV3IEFycmF5KG5hbWVzLmxlbmd0aCk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgbiA9IG5hbWVzW2ldO1xuICAgICAgX25hbWVzW2ldID0gdGhpcy5nZXRTdHJpbmcobik7XG4gICAgfVxuXG4gICAgcmV0dXJuIF9uYW1lcztcbiAgfVxuXG4gIGdldEFycmF5KHZhbHVlOiBudW1iZXIpOiBudW1iZXJbXSB7XG4gICAgcmV0dXJuICh0aGlzLmFycmF5cyBhcyBudW1iZXJbXVtdKVt2YWx1ZV07XG4gIH1cblxuICBnZXRUZW1wbGF0ZU1ldGE8VD4oczogbnVtYmVyKTogVCB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UodGhpcy5zdHJpbmdzW3NdKSBhcyBUO1xuICB9XG5cbiAgZ2V0T3RoZXI8VD4odmFsdWU6IG51bWJlcik6IFQge1xuICAgIHJldHVybiB0aGlzLm90aGVyc1t2YWx1ZV0gYXMgVDtcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==