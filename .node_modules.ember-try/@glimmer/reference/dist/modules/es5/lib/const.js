function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { CONSTANT_TAG } from './validators';
import { UNDEFINED_REFERENCE } from './property';
export var ConstReference = function () {
    function ConstReference(inner) {
        _classCallCheck(this, ConstReference);

        this.inner = inner;
        this.tag = CONSTANT_TAG;
    }

    ConstReference.prototype.value = function value() {
        return this.inner;
    };

    ConstReference.prototype.get = function get(_key) {
        return UNDEFINED_REFERENCE;
    };

    return ConstReference;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3JlZmVyZW5jZS9saWIvY29uc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxTQUFBLFlBQUEsUUFBQSxjQUFBO0FBRUEsU0FBQSxtQkFBQSxRQUFBLFlBQUE7QUFFQSxXQUFNLGNBQU47QUFHRSw0QkFBQSxLQUFBLEVBQThCO0FBQUE7O0FBQVIsYUFBQSxLQUFBLEdBQUEsS0FBQTtBQUZmLGFBQUEsR0FBQSxHQUFBLFlBQUE7QUFFMkI7O0FBSHBDLDZCQUtFLEtBTEYsb0JBS087QUFDSCxlQUFPLEtBQVAsS0FBQTtBQUNELEtBUEg7O0FBQUEsNkJBU0UsR0FURixnQkFTRSxJQVRGLEVBU2tCO0FBQ2QsZUFBQSxtQkFBQTtBQUNELEtBWEg7O0FBQUE7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENPTlNUQU5UX1RBRywgVGFnIH0gZnJvbSAnLi92YWxpZGF0b3JzJztcbmltcG9ydCB7IFZlcnNpb25lZFBhdGhSZWZlcmVuY2UgfSBmcm9tICcuL3JlZmVyZW5jZSc7XG5pbXBvcnQgeyBVTkRFRklORURfUkVGRVJFTkNFIH0gZnJvbSAnLi9wcm9wZXJ0eSc7XG5cbmV4cG9ydCBjbGFzcyBDb25zdFJlZmVyZW5jZTxUID0gdW5rbm93bj4gaW1wbGVtZW50cyBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPFQ+IHtcbiAgcHVibGljIHRhZzogVGFnID0gQ09OU1RBTlRfVEFHO1xuXG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBpbm5lcjogVCkge31cblxuICB2YWx1ZSgpOiBUIHtcbiAgICByZXR1cm4gdGhpcy5pbm5lcjtcbiAgfVxuXG4gIGdldChfa2V5OiBzdHJpbmcpOiBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlIHtcbiAgICByZXR1cm4gVU5ERUZJTkVEX1JFRkVSRU5DRTtcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==