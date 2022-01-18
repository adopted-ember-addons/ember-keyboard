'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DefaultDynamicScope = undefined;

var _util = require('@glimmer/util');

class DefaultDynamicScope {
    constructor(bucket) {
        if (bucket) {
            this.bucket = (0, _util.assign)({}, bucket);
        } else {
            this.bucket = {};
        }
    }
    get(key) {
        return this.bucket[key];
    }
    set(key, reference) {
        return this.bucket[key] = reference;
    }
    child() {
        return new DefaultDynamicScope(this.bucket);
    }
}
exports.DefaultDynamicScope = DefaultDynamicScope;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2R5bmFtaWMtc2NvcGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBSU0sTUFBQSxtQkFBQSxDQUEwQjtBQUc5QixnQkFBQSxNQUFBLEVBQXdDO0FBQ3RDLFlBQUEsTUFBQSxFQUFZO0FBQ1YsaUJBQUEsTUFBQSxHQUFjLGtCQUFBLEVBQUEsRUFBZCxNQUFjLENBQWQ7QUFERixTQUFBLE1BRU87QUFDTCxpQkFBQSxNQUFBLEdBQUEsRUFBQTtBQUNEO0FBQ0Y7QUFFRCxRQUFBLEdBQUEsRUFBZTtBQUNiLGVBQU8sS0FBQSxNQUFBLENBQVAsR0FBTyxDQUFQO0FBQ0Q7QUFFRCxRQUFBLEdBQUEsRUFBQSxTQUFBLEVBQXlDO0FBQ3ZDLGVBQVEsS0FBQSxNQUFBLENBQUEsR0FBQSxJQUFSLFNBQUE7QUFDRDtBQUVELFlBQUs7QUFDSCxlQUFPLElBQUEsbUJBQUEsQ0FBd0IsS0FBL0IsTUFBTyxDQUFQO0FBQ0Q7QUFyQjZCO1FBQTFCLG1CLEdBQUEsbUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEeW5hbWljU2NvcGUsIERpY3QgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IGFzc2lnbiB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0IHsgUGF0aFJlZmVyZW5jZSB9IGZyb20gJ0BnbGltbWVyL3JlZmVyZW5jZSc7XG5cbmV4cG9ydCBjbGFzcyBEZWZhdWx0RHluYW1pY1Njb3BlIGltcGxlbWVudHMgRHluYW1pY1Njb3BlIHtcbiAgcHJpdmF0ZSBidWNrZXQ6IERpY3Q8UGF0aFJlZmVyZW5jZT47XG5cbiAgY29uc3RydWN0b3IoYnVja2V0PzogRGljdDxQYXRoUmVmZXJlbmNlPikge1xuICAgIGlmIChidWNrZXQpIHtcbiAgICAgIHRoaXMuYnVja2V0ID0gYXNzaWduKHt9LCBidWNrZXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmJ1Y2tldCA9IHt9O1xuICAgIH1cbiAgfVxuXG4gIGdldChrZXk6IHN0cmluZyk6IFBhdGhSZWZlcmVuY2Uge1xuICAgIHJldHVybiB0aGlzLmJ1Y2tldFtrZXldO1xuICB9XG5cbiAgc2V0KGtleTogc3RyaW5nLCByZWZlcmVuY2U6IFBhdGhSZWZlcmVuY2UpOiBQYXRoUmVmZXJlbmNlIHtcbiAgICByZXR1cm4gKHRoaXMuYnVja2V0W2tleV0gPSByZWZlcmVuY2UpO1xuICB9XG5cbiAgY2hpbGQoKTogRGVmYXVsdER5bmFtaWNTY29wZSB7XG4gICAgcmV0dXJuIG5ldyBEZWZhdWx0RHluYW1pY1Njb3BlKHRoaXMuYnVja2V0KTtcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==