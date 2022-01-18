'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ConstReference = undefined;

var _validators = require('./validators');

var _property = require('./property');

class ConstReference {
    constructor(inner) {
        this.inner = inner;
        this.tag = _validators.CONSTANT_TAG;
    }
    value() {
        return this.inner;
    }
    get(_key) {
        return _property.UNDEFINED_REFERENCE;
    }
}
exports.ConstReference = ConstReference;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3JlZmVyZW5jZS9saWIvY29uc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBRUE7O0FBRU0sTUFBQSxjQUFBLENBQXFCO0FBR3pCLGdCQUFBLEtBQUEsRUFBOEI7QUFBUixhQUFBLEtBQUEsR0FBQSxLQUFBO0FBRmYsYUFBQSxHQUFBLEdBQUEsd0JBQUE7QUFFMkI7QUFFbEMsWUFBSztBQUNILGVBQU8sS0FBUCxLQUFBO0FBQ0Q7QUFFRCxRQUFBLElBQUEsRUFBZ0I7QUFDZCxlQUFBLDZCQUFBO0FBQ0Q7QUFYd0I7UUFBckIsYyxHQUFBLGMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDT05TVEFOVF9UQUcsIFRhZyB9IGZyb20gJy4vdmFsaWRhdG9ycyc7XG5pbXBvcnQgeyBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlIH0gZnJvbSAnLi9yZWZlcmVuY2UnO1xuaW1wb3J0IHsgVU5ERUZJTkVEX1JFRkVSRU5DRSB9IGZyb20gJy4vcHJvcGVydHknO1xuXG5leHBvcnQgY2xhc3MgQ29uc3RSZWZlcmVuY2U8VCA9IHVua25vd24+IGltcGxlbWVudHMgVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTxUPiB7XG4gIHB1YmxpYyB0YWc6IFRhZyA9IENPTlNUQU5UX1RBRztcblxuICBjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgaW5uZXI6IFQpIHt9XG5cbiAgdmFsdWUoKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuaW5uZXI7XG4gIH1cblxuICBnZXQoX2tleTogc3RyaW5nKTogVmVyc2lvbmVkUGF0aFJlZmVyZW5jZSB7XG4gICAgcmV0dXJuIFVOREVGSU5FRF9SRUZFUkVOQ0U7XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=