function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { associate, DESTROY } from '@glimmer/util';
import { clear } from '../bounds';
import { inTransaction } from '../environment';
import { asyncDestroy } from '../lifetime';
import UpdatingVM from './update';

var RenderResultImpl = function () {
    function RenderResultImpl(env, updating, bounds, drop) {
        _classCallCheck(this, RenderResultImpl);

        this.env = env;
        this.updating = updating;
        this.bounds = bounds;
        this.drop = drop;
        associate(this, drop);
    }

    RenderResultImpl.prototype.rerender = function rerender() {
        var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { alwaysRevalidate: false },
            _ref$alwaysRevalidate = _ref.alwaysRevalidate,
            alwaysRevalidate = _ref$alwaysRevalidate === undefined ? false : _ref$alwaysRevalidate;

        var env = this.env,
            updating = this.updating;

        var vm = new UpdatingVM(env, { alwaysRevalidate: alwaysRevalidate });
        vm.execute(updating, this);
    };

    RenderResultImpl.prototype.parentElement = function parentElement() {
        return this.bounds.parentElement();
    };

    RenderResultImpl.prototype.firstNode = function firstNode() {
        return this.bounds.firstNode();
    };

    RenderResultImpl.prototype.lastNode = function lastNode() {
        return this.bounds.lastNode();
    };

    RenderResultImpl.prototype.handleException = function handleException() {
        throw 'this should never happen';
    };

    RenderResultImpl.prototype[DESTROY] = function () {
        clear(this.bounds);
    };
    // compat, as this is a user-exposed API


    RenderResultImpl.prototype.destroy = function destroy() {
        var _this = this;

        inTransaction(this.env, function () {
            return asyncDestroy(_this, _this.env);
        });
    };

    return RenderResultImpl;
}();

export default RenderResultImpl;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL3ZtL3JlbmRlci1yZXN1bHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxTQUFBLFNBQUEsRUFBQSxPQUFBLFFBQUEsZUFBQTtBQUVBLFNBQUEsS0FBQSxRQUFBLFdBQUE7QUFDQSxTQUFBLGFBQUEsUUFBQSxnQkFBQTtBQUNBLFNBQUEsWUFBQSxRQUFBLGFBQUE7QUFFQSxPQUFBLFVBQUEsTUFBQSxVQUFBOztJQUVjLGdCO0FBQ1osOEJBQUEsR0FBQSxFQUFBLFFBQUEsRUFBQSxNQUFBLEVBQUEsSUFBQSxFQUl1QjtBQUFBOztBQUhkLGFBQUEsR0FBQSxHQUFBLEdBQUE7QUFDQyxhQUFBLFFBQUEsR0FBQSxRQUFBO0FBQ0EsYUFBQSxNQUFBLEdBQUEsTUFBQTtBQUNDLGFBQUEsSUFBQSxHQUFBLElBQUE7QUFFVCxrQkFBQSxJQUFBLEVBQUEsSUFBQTtBQUNEOzsrQkFFRCxRLHVCQUFtRTtBQUFBLHVGQUEzQixFQUFFLGtCQUExQyxLQUF3QyxFQUEyQjtBQUFBLHlDQUF4RCxnQkFBd0Q7QUFBQSxZQUF4RCxnQkFBd0QseUNBQTFELEtBQTBEOztBQUFBLFlBQzdELEdBRDZELEdBQ2pFLElBRGlFLENBQzdELEdBRDZEO0FBQUEsWUFDN0QsUUFENkQsR0FDakUsSUFEaUUsQ0FDN0QsUUFENkQ7O0FBRWpFLFlBQUksS0FBSyxJQUFBLFVBQUEsQ0FBQSxHQUFBLEVBQW9CLEVBQTdCLGtDQUE2QixFQUFwQixDQUFUO0FBQ0EsV0FBQSxPQUFBLENBQUEsUUFBQSxFQUFBLElBQUE7QUFDRCxLOzsrQkFFRCxhLDRCQUFhO0FBQ1gsZUFBTyxLQUFBLE1BQUEsQ0FBUCxhQUFPLEVBQVA7QUFDRCxLOzsrQkFFRCxTLHdCQUFTO0FBQ1AsZUFBTyxLQUFBLE1BQUEsQ0FBUCxTQUFPLEVBQVA7QUFDRCxLOzsrQkFFRCxRLHVCQUFRO0FBQ04sZUFBTyxLQUFBLE1BQUEsQ0FBUCxRQUFPLEVBQVA7QUFDRCxLOzsrQkFFRCxlLDhCQUFlO0FBQ2IsY0FBQSwwQkFBQTtBQUNELEs7OytCQUVELE8sZ0JBQVM7QUFDUCxjQUFNLEtBQU4sTUFBQTtBQUNELEs7QUFFRDs7OytCQUNBLE8sc0JBQU87QUFBQTs7QUFDTCxzQkFBYyxLQUFkLEdBQUEsRUFBd0I7QUFBQSxtQkFBTSxhQUFBLEtBQUEsRUFBbUIsTUFBakQsR0FBOEIsQ0FBTjtBQUFBLFNBQXhCO0FBQ0QsSzs7Ozs7ZUF2Q1csZ0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFbnZpcm9ubWVudCwgUmVuZGVyUmVzdWx0LCBMaXZlQmxvY2sgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IGFzc29jaWF0ZSwgREVTVFJPWSwgTGlua2VkTGlzdCB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0IHsgU2ltcGxlRWxlbWVudCwgU2ltcGxlTm9kZSB9IGZyb20gJ0BzaW1wbGUtZG9tL2ludGVyZmFjZSc7XG5pbXBvcnQgeyBjbGVhciB9IGZyb20gJy4uL2JvdW5kcyc7XG5pbXBvcnQgeyBpblRyYW5zYWN0aW9uIH0gZnJvbSAnLi4vZW52aXJvbm1lbnQnO1xuaW1wb3J0IHsgYXN5bmNEZXN0cm95IH0gZnJvbSAnLi4vbGlmZXRpbWUnO1xuaW1wb3J0IHsgVXBkYXRpbmdPcGNvZGUgfSBmcm9tICcuLi9vcGNvZGVzJztcbmltcG9ydCBVcGRhdGluZ1ZNIGZyb20gJy4vdXBkYXRlJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVuZGVyUmVzdWx0SW1wbCBpbXBsZW1lbnRzIFJlbmRlclJlc3VsdCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBlbnY6IEVudmlyb25tZW50LFxuICAgIHByaXZhdGUgdXBkYXRpbmc6IExpbmtlZExpc3Q8VXBkYXRpbmdPcGNvZGU+LFxuICAgIHByaXZhdGUgYm91bmRzOiBMaXZlQmxvY2ssXG4gICAgcmVhZG9ubHkgZHJvcDogb2JqZWN0XG4gICkge1xuICAgIGFzc29jaWF0ZSh0aGlzLCBkcm9wKTtcbiAgfVxuXG4gIHJlcmVuZGVyKHsgYWx3YXlzUmV2YWxpZGF0ZSA9IGZhbHNlIH0gPSB7IGFsd2F5c1JldmFsaWRhdGU6IGZhbHNlIH0pIHtcbiAgICBsZXQgeyBlbnYsIHVwZGF0aW5nIH0gPSB0aGlzO1xuICAgIGxldCB2bSA9IG5ldyBVcGRhdGluZ1ZNKGVudiwgeyBhbHdheXNSZXZhbGlkYXRlIH0pO1xuICAgIHZtLmV4ZWN1dGUodXBkYXRpbmcsIHRoaXMpO1xuICB9XG5cbiAgcGFyZW50RWxlbWVudCgpOiBTaW1wbGVFbGVtZW50IHtcbiAgICByZXR1cm4gdGhpcy5ib3VuZHMucGFyZW50RWxlbWVudCgpO1xuICB9XG5cbiAgZmlyc3ROb2RlKCk6IFNpbXBsZU5vZGUge1xuICAgIHJldHVybiB0aGlzLmJvdW5kcy5maXJzdE5vZGUoKTtcbiAgfVxuXG4gIGxhc3ROb2RlKCk6IFNpbXBsZU5vZGUge1xuICAgIHJldHVybiB0aGlzLmJvdW5kcy5sYXN0Tm9kZSgpO1xuICB9XG5cbiAgaGFuZGxlRXhjZXB0aW9uKCkge1xuICAgIHRocm93ICd0aGlzIHNob3VsZCBuZXZlciBoYXBwZW4nO1xuICB9XG5cbiAgW0RFU1RST1ldKCkge1xuICAgIGNsZWFyKHRoaXMuYm91bmRzKTtcbiAgfVxuXG4gIC8vIGNvbXBhdCwgYXMgdGhpcyBpcyBhIHVzZXItZXhwb3NlZCBBUElcbiAgZGVzdHJveSgpIHtcbiAgICBpblRyYW5zYWN0aW9uKHRoaXMuZW52LCAoKSA9PiBhc3luY0Rlc3Ryb3kodGhpcywgdGhpcy5lbnYpKTtcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==