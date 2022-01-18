'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ConstReference = undefined;

var _validators = require('./validators');

var _property = require('./property');

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var ConstReference = exports.ConstReference = function () {
    function ConstReference(inner) {
        _classCallCheck(this, ConstReference);

        this.inner = inner;
        this.tag = _validators.CONSTANT_TAG;
    }

    ConstReference.prototype.value = function value() {
        return this.inner;
    };

    ConstReference.prototype.get = function get(_key) {
        return _property.UNDEFINED_REFERENCE;
    };

    return ConstReference;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3JlZmVyZW5jZS9saWIvY29uc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUVBOzs7Ozs7OztBQUVBLElBQUEsMENBQUEsWUFBQTtBQUdFLGFBQUEsY0FBQSxDQUFBLEtBQUEsRUFBOEI7QUFBQSx3QkFBQSxJQUFBLEVBQUEsY0FBQTs7QUFBUixhQUFBLEtBQUEsR0FBQSxLQUFBO0FBRmYsYUFBQSxHQUFBLEdBQUEsd0JBQUE7QUFFMkI7O0FBSHBDLG1CQUFBLFNBQUEsQ0FBQSxLQUFBLEdBQUEsU0FBQSxLQUFBLEdBS087QUFDSCxlQUFPLEtBQVAsS0FBQTtBQU5KLEtBQUE7O0FBQUEsbUJBQUEsU0FBQSxDQUFBLEdBQUEsR0FBQSxTQUFBLEdBQUEsQ0FBQSxJQUFBLEVBU2tCO0FBQ2QsZUFBQSw2QkFBQTtBQVZKLEtBQUE7O0FBQUEsV0FBQSxjQUFBO0FBQUEsQ0FBQSxFQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ09OU1RBTlRfVEFHLCBUYWcgfSBmcm9tICcuL3ZhbGlkYXRvcnMnO1xuaW1wb3J0IHsgVmVyc2lvbmVkUGF0aFJlZmVyZW5jZSB9IGZyb20gJy4vcmVmZXJlbmNlJztcbmltcG9ydCB7IFVOREVGSU5FRF9SRUZFUkVOQ0UgfSBmcm9tICcuL3Byb3BlcnR5JztcblxuZXhwb3J0IGNsYXNzIENvbnN0UmVmZXJlbmNlPFQgPSB1bmtub3duPiBpbXBsZW1lbnRzIFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8VD4ge1xuICBwdWJsaWMgdGFnOiBUYWcgPSBDT05TVEFOVF9UQUc7XG5cbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIGlubmVyOiBUKSB7fVxuXG4gIHZhbHVlKCk6IFQge1xuICAgIHJldHVybiB0aGlzLmlubmVyO1xuICB9XG5cbiAgZ2V0KF9rZXk6IHN0cmluZyk6IFZlcnNpb25lZFBhdGhSZWZlcmVuY2Uge1xuICAgIHJldHVybiBVTkRFRklORURfUkVGRVJFTkNFO1xuICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9