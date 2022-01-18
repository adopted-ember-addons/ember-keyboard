'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _reference = require('@glimmer/reference');

var _normalize = require('../dom/normalize');

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var ClassListReference = function () {
    function ClassListReference(list) {
        _classCallCheck(this, ClassListReference);

        this.list = list;
        this.tag = (0, _reference.combineTagged)(list);
        this.list = list;
    }

    ClassListReference.prototype.value = function value() {
        var ret = [];
        var list = this.list;

        for (var i = 0; i < list.length; i++) {
            var value = (0, _normalize.normalizeStringValue)(list[i].value());
            if (value) ret.push(value);
        }
        return ret.length === 0 ? null : ret.join(' ');
    };

    return ClassListReference;
}();

exports.default = ClassListReference;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL3JlZmVyZW5jZXMvY2xhc3MtbGlzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7QUFHQTs7Ozs7Ozs7SUFFYyxxQjtBQUdaLGFBQUEsa0JBQUEsQ0FBQSxJQUFBLEVBQThDO0FBQUEsd0JBQUEsSUFBQSxFQUFBLGtCQUFBOztBQUExQixhQUFBLElBQUEsR0FBQSxJQUFBO0FBQ2xCLGFBQUEsR0FBQSxHQUFXLDhCQUFYLElBQVcsQ0FBWDtBQUNBLGFBQUEsSUFBQSxHQUFBLElBQUE7QUFDRDs7aUNBRUQsSyxvQkFBSztBQUNILFlBQUksTUFBSixFQUFBO0FBREcsWUFBQSxPQUFBLEtBQUEsSUFBQTs7QUFJSCxhQUFLLElBQUksSUFBVCxDQUFBLEVBQWdCLElBQUksS0FBcEIsTUFBQSxFQUFBLEdBQUEsRUFBc0M7QUFDcEMsZ0JBQUksUUFBUSxxQ0FBcUIsS0FBQSxDQUFBLEVBQWpDLEtBQWlDLEVBQXJCLENBQVo7QUFDQSxnQkFBQSxLQUFBLEVBQVcsSUFBQSxJQUFBLENBQUEsS0FBQTtBQUNaO0FBRUQsZUFBTyxJQUFBLE1BQUEsS0FBQSxDQUFBLEdBQUEsSUFBQSxHQUEwQixJQUFBLElBQUEsQ0FBakMsR0FBaUMsQ0FBakM7Ozs7OztrQkFqQlUsa0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBSZWZlcmVuY2UsIFRhZywgY29tYmluZVRhZ2dlZCB9IGZyb20gJ0BnbGltbWVyL3JlZmVyZW5jZSc7XG5pbXBvcnQgeyBPcHRpb24gfSBmcm9tICdAZ2xpbW1lci91dGlsJztcblxuaW1wb3J0IHsgbm9ybWFsaXplU3RyaW5nVmFsdWUgfSBmcm9tICcuLi9kb20vbm9ybWFsaXplJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2xhc3NMaXN0UmVmZXJlbmNlIGltcGxlbWVudHMgUmVmZXJlbmNlPE9wdGlvbjxzdHJpbmc+PiB7XG4gIHB1YmxpYyB0YWc6IFRhZztcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGxpc3Q6IFJlZmVyZW5jZTx1bmtub3duPltdKSB7XG4gICAgdGhpcy50YWcgPSBjb21iaW5lVGFnZ2VkKGxpc3QpO1xuICAgIHRoaXMubGlzdCA9IGxpc3Q7XG4gIH1cblxuICB2YWx1ZSgpOiBPcHRpb248c3RyaW5nPiB7XG4gICAgbGV0IHJldDogc3RyaW5nW10gPSBbXTtcbiAgICBsZXQgeyBsaXN0IH0gPSB0aGlzO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgdmFsdWUgPSBub3JtYWxpemVTdHJpbmdWYWx1ZShsaXN0W2ldLnZhbHVlKCkpO1xuICAgICAgaWYgKHZhbHVlKSByZXQucHVzaCh2YWx1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldC5sZW5ndGggPT09IDAgPyBudWxsIDogcmV0LmpvaW4oJyAnKTtcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==