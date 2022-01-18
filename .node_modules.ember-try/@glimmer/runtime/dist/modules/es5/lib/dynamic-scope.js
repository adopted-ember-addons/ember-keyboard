function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { assign } from '@glimmer/util';
export var DefaultDynamicScope = function () {
    function DefaultDynamicScope(bucket) {
        _classCallCheck(this, DefaultDynamicScope);

        if (bucket) {
            this.bucket = assign({}, bucket);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2R5bmFtaWMtc2NvcGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxTQUFBLE1BQUEsUUFBQSxlQUFBO0FBR0EsV0FBTSxtQkFBTjtBQUdFLGlDQUFBLE1BQUEsRUFBd0M7QUFBQTs7QUFDdEMsWUFBQSxNQUFBLEVBQVk7QUFDVixpQkFBQSxNQUFBLEdBQWMsT0FBQSxFQUFBLEVBQWQsTUFBYyxDQUFkO0FBREYsU0FBQSxNQUVPO0FBQ0wsaUJBQUEsTUFBQSxHQUFBLEVBQUE7QUFDRDtBQUNGOztBQVRILGtDQVdFLEdBWEYsZ0JBV0UsR0FYRixFQVdpQjtBQUNiLGVBQU8sS0FBQSxNQUFBLENBQVAsR0FBTyxDQUFQO0FBQ0QsS0FiSDs7QUFBQSxrQ0FlRSxHQWZGLGdCQWVFLEdBZkYsRUFlRSxTQWZGLEVBZTJDO0FBQ3ZDLGVBQVEsS0FBQSxNQUFBLENBQUEsR0FBQSxJQUFSLFNBQUE7QUFDRCxLQWpCSDs7QUFBQSxrQ0FtQkUsS0FuQkYsb0JBbUJPO0FBQ0gsZUFBTyxJQUFBLG1CQUFBLENBQXdCLEtBQS9CLE1BQU8sQ0FBUDtBQUNELEtBckJIOztBQUFBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEeW5hbWljU2NvcGUsIERpY3QgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IGFzc2lnbiB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0IHsgUGF0aFJlZmVyZW5jZSB9IGZyb20gJ0BnbGltbWVyL3JlZmVyZW5jZSc7XG5cbmV4cG9ydCBjbGFzcyBEZWZhdWx0RHluYW1pY1Njb3BlIGltcGxlbWVudHMgRHluYW1pY1Njb3BlIHtcbiAgcHJpdmF0ZSBidWNrZXQ6IERpY3Q8UGF0aFJlZmVyZW5jZT47XG5cbiAgY29uc3RydWN0b3IoYnVja2V0PzogRGljdDxQYXRoUmVmZXJlbmNlPikge1xuICAgIGlmIChidWNrZXQpIHtcbiAgICAgIHRoaXMuYnVja2V0ID0gYXNzaWduKHt9LCBidWNrZXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmJ1Y2tldCA9IHt9O1xuICAgIH1cbiAgfVxuXG4gIGdldChrZXk6IHN0cmluZyk6IFBhdGhSZWZlcmVuY2Uge1xuICAgIHJldHVybiB0aGlzLmJ1Y2tldFtrZXldO1xuICB9XG5cbiAgc2V0KGtleTogc3RyaW5nLCByZWZlcmVuY2U6IFBhdGhSZWZlcmVuY2UpOiBQYXRoUmVmZXJlbmNlIHtcbiAgICByZXR1cm4gKHRoaXMuYnVja2V0W2tleV0gPSByZWZlcmVuY2UpO1xuICB9XG5cbiAgY2hpbGQoKTogRGVmYXVsdER5bmFtaWNTY29wZSB7XG4gICAgcmV0dXJuIG5ldyBEZWZhdWx0RHluYW1pY1Njb3BlKHRoaXMuYnVja2V0KTtcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==