'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.map = map;

var _validators = require('./validators');

var _property = require('./property');

var _autotrack = require('./autotrack');

function map(input, callback) {
    return new MapReference(input, callback);
}
class MapReference {
    constructor(inner, callback) {
        this.inner = inner;
        this.callback = callback;
        this.updatable = (0, _validators.createUpdatableTag)();
        this.tag = (0, _validators.combine)([inner.tag, this.updatable]);
    }
    value() {
        let { inner, callback } = this;
        let old = (0, _autotrack.pushTrackFrame)();
        let ret = callback(inner.value());
        let tag = (0, _autotrack.popTrackFrame)(old);
        (0, _validators.update)(this.updatable, tag);
        return ret;
    }
    get(key) {
        return (0, _property.property)(this, key);
    }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3JlZmVyZW5jZS9saWIvY29tYmluYXRvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7UUFLTSxHLEdBQUEsRzs7OztBQUpOOztBQUVBOztBQUVNLFNBQUEsR0FBQSxDQUFBLEtBQUEsRUFBQSxRQUFBLEVBRXFCO0FBRXpCLFdBQU8sSUFBQSxZQUFBLENBQUEsS0FBQSxFQUFQLFFBQU8sQ0FBUDtBQUNEO0FBRUQsTUFBQSxZQUFBLENBQWtCO0FBSWhCLGdCQUFBLEtBQUEsRUFBQSxRQUFBLEVBQXVGO0FBQW5FLGFBQUEsS0FBQSxHQUFBLEtBQUE7QUFBMEMsYUFBQSxRQUFBLEdBQUEsUUFBQTtBQUZyRCxhQUFBLFNBQUEsR0FBQSxxQ0FBQTtBQUdQLGFBQUEsR0FBQSxHQUFXLHlCQUFRLENBQUMsTUFBRCxHQUFBLEVBQVksS0FBL0IsU0FBbUIsQ0FBUixDQUFYO0FBQ0Q7QUFFRCxZQUFLO0FBQ0gsWUFBSSxFQUFBLEtBQUEsRUFBQSxRQUFBLEtBQUosSUFBQTtBQUVBLFlBQUksTUFBSixnQ0FBQTtBQUNBLFlBQUksTUFBTSxTQUFTLE1BQW5CLEtBQW1CLEVBQVQsQ0FBVjtBQUNBLFlBQUksTUFBTSw4QkFBVixHQUFVLENBQVY7QUFDQSxnQ0FBTyxLQUFQLFNBQUEsRUFBQSxHQUFBO0FBRUEsZUFBQSxHQUFBO0FBQ0Q7QUFFRCxRQUFBLEdBQUEsRUFBZTtBQUNiLGVBQU8sd0JBQUEsSUFBQSxFQUFQLEdBQU8sQ0FBUDtBQUNEO0FBckJlIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVGFnLCBjcmVhdGVVcGRhdGFibGVUYWcsIGNvbWJpbmUsIHVwZGF0ZSB9IGZyb20gJy4vdmFsaWRhdG9ycyc7XG5pbXBvcnQgeyBwcm9wZXJ0eSB9IGZyb20gJy4vcHJvcGVydHknO1xuaW1wb3J0IHsgVmVyc2lvbmVkUGF0aFJlZmVyZW5jZSB9IGZyb20gJy4vcmVmZXJlbmNlJztcbmltcG9ydCB7IHB1c2hUcmFja0ZyYW1lLCBwb3BUcmFja0ZyYW1lIH0gZnJvbSAnLi9hdXRvdHJhY2snO1xuXG5leHBvcnQgZnVuY3Rpb24gbWFwPFQsIFU+KFxuICBpbnB1dDogVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTxUPixcbiAgY2FsbGJhY2s6ICh2YWx1ZTogVCkgPT4gVVxuKTogVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTxVPiB7XG4gIHJldHVybiBuZXcgTWFwUmVmZXJlbmNlKGlucHV0LCBjYWxsYmFjayk7XG59XG5cbmNsYXNzIE1hcFJlZmVyZW5jZTxULCBVPiBpbXBsZW1lbnRzIFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8VT4ge1xuICByZWFkb25seSB0YWc6IFRhZztcbiAgcmVhZG9ubHkgdXBkYXRhYmxlID0gY3JlYXRlVXBkYXRhYmxlVGFnKCk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBpbm5lcjogVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTxUPiwgcHJpdmF0ZSBjYWxsYmFjazogKHZhbHVlOiBUKSA9PiBVKSB7XG4gICAgdGhpcy50YWcgPSBjb21iaW5lKFtpbm5lci50YWcsIHRoaXMudXBkYXRhYmxlXSk7XG4gIH1cblxuICB2YWx1ZSgpOiBVIHtcbiAgICBsZXQgeyBpbm5lciwgY2FsbGJhY2sgfSA9IHRoaXM7XG5cbiAgICBsZXQgb2xkID0gcHVzaFRyYWNrRnJhbWUoKTtcbiAgICBsZXQgcmV0ID0gY2FsbGJhY2soaW5uZXIudmFsdWUoKSk7XG4gICAgbGV0IHRhZyA9IHBvcFRyYWNrRnJhbWUob2xkKTtcbiAgICB1cGRhdGUodGhpcy51cGRhdGFibGUsIHRhZyk7XG5cbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgZ2V0KGtleTogc3RyaW5nKTogVmVyc2lvbmVkUGF0aFJlZmVyZW5jZSB7XG4gICAgcmV0dXJuIHByb3BlcnR5KHRoaXMsIGtleSk7XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=