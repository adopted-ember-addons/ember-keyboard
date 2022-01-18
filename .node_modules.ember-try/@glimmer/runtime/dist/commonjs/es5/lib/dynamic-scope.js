"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DefaultDynamicScope = undefined;

var _util = require("@glimmer/util");

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var DefaultDynamicScope = exports.DefaultDynamicScope = function () {
    function DefaultDynamicScope(bucket) {
        _classCallCheck(this, DefaultDynamicScope);

        if (bucket) {
            this.bucket = (0, _util.assign)({}, bucket);
        } else {
            this.bucket = {};
        }
    }

    DefaultDynamicScope.prototype.get = function get(key) {
        return this.bucket[key];
    };

    DefaultDynamicScope.prototype.set = function set(key, reference) {
        return this.bucket[key] = reference;
    };

    DefaultDynamicScope.prototype.child = function child() {
        return new DefaultDynamicScope(this.bucket);
    };

    return DefaultDynamicScope;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2R5bmFtaWMtc2NvcGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUNBOzs7Ozs7OztBQUdBLElBQUEsb0RBQUEsWUFBQTtBQUdFLGFBQUEsbUJBQUEsQ0FBQSxNQUFBLEVBQXdDO0FBQUEsd0JBQUEsSUFBQSxFQUFBLG1CQUFBOztBQUN0QyxZQUFBLE1BQUEsRUFBWTtBQUNWLGlCQUFBLE1BQUEsR0FBYyxrQkFBQSxFQUFBLEVBQWQsTUFBYyxDQUFkO0FBREYsU0FBQSxNQUVPO0FBQ0wsaUJBQUEsTUFBQSxHQUFBLEVBQUE7QUFDRDtBQUNGOztBQVRILHdCQUFBLFNBQUEsQ0FBQSxHQUFBLEdBQUEsU0FBQSxHQUFBLENBQUEsR0FBQSxFQVdpQjtBQUNiLGVBQU8sS0FBQSxNQUFBLENBQVAsR0FBTyxDQUFQO0FBWkosS0FBQTs7QUFBQSx3QkFBQSxTQUFBLENBQUEsR0FBQSxHQUFBLFNBQUEsR0FBQSxDQUFBLEdBQUEsRUFBQSxTQUFBLEVBZTJDO0FBQ3ZDLGVBQVEsS0FBQSxNQUFBLENBQUEsR0FBQSxJQUFSLFNBQUE7QUFoQkosS0FBQTs7QUFBQSx3QkFBQSxTQUFBLENBQUEsS0FBQSxHQUFBLFNBQUEsS0FBQSxHQW1CTztBQUNILGVBQU8sSUFBQSxtQkFBQSxDQUF3QixLQUEvQixNQUFPLENBQVA7QUFwQkosS0FBQTs7QUFBQSxXQUFBLG1CQUFBO0FBQUEsQ0FBQSxFQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRHluYW1pY1Njb3BlLCBEaWN0IH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBhc3NpZ24gfSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCB7IFBhdGhSZWZlcmVuY2UgfSBmcm9tICdAZ2xpbW1lci9yZWZlcmVuY2UnO1xuXG5leHBvcnQgY2xhc3MgRGVmYXVsdER5bmFtaWNTY29wZSBpbXBsZW1lbnRzIER5bmFtaWNTY29wZSB7XG4gIHByaXZhdGUgYnVja2V0OiBEaWN0PFBhdGhSZWZlcmVuY2U+O1xuXG4gIGNvbnN0cnVjdG9yKGJ1Y2tldD86IERpY3Q8UGF0aFJlZmVyZW5jZT4pIHtcbiAgICBpZiAoYnVja2V0KSB7XG4gICAgICB0aGlzLmJ1Y2tldCA9IGFzc2lnbih7fSwgYnVja2V0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5idWNrZXQgPSB7fTtcbiAgICB9XG4gIH1cblxuICBnZXQoa2V5OiBzdHJpbmcpOiBQYXRoUmVmZXJlbmNlIHtcbiAgICByZXR1cm4gdGhpcy5idWNrZXRba2V5XTtcbiAgfVxuXG4gIHNldChrZXk6IHN0cmluZywgcmVmZXJlbmNlOiBQYXRoUmVmZXJlbmNlKTogUGF0aFJlZmVyZW5jZSB7XG4gICAgcmV0dXJuICh0aGlzLmJ1Y2tldFtrZXldID0gcmVmZXJlbmNlKTtcbiAgfVxuXG4gIGNoaWxkKCk6IERlZmF1bHREeW5hbWljU2NvcGUge1xuICAgIHJldHVybiBuZXcgRGVmYXVsdER5bmFtaWNTY29wZSh0aGlzLmJ1Y2tldCk7XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=