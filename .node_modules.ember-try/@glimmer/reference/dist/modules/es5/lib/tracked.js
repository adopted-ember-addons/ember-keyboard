function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { dict } from '@glimmer/util';
import { createTag, dirty } from './validators';
import { dirtyTag } from './tags';

var PrivateImpl = function () {
    function PrivateImpl() {
        _classCallCheck(this, PrivateImpl);

        this.inner = undefined;
    }

    PrivateImpl.prototype.get = function get() {
        return this.inner;
    };

    PrivateImpl.prototype.set = function set(value) {
        this.inner = value;
    };

    return PrivateImpl;
}();

var PRIVATES = new WeakMap();
function privateFor(object, key) {
    var privates = void 0;
    if (PRIVATES.has(object)) {
        privates = PRIVATES.get(object);
    } else {
        privates = dict();
        PRIVATES.set(object, privates);
    }
    if (key in privates) {
        return privates[key];
    } else {
        var p = new PrivateImpl();
        privates[key] = p;
        return p;
    }
}
export var EPOCH = createTag();
export function setStateFor(object, key, value) {
    dirty(EPOCH);
    dirtyTag(object, key);
    privateFor(object, key).set(value);
}
export function getStateFor(object, key) {
    return privateFor(object, key).get();
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3JlZmVyZW5jZS9saWIvdHJhY2tlZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLFNBQUEsSUFBQSxRQUFBLGVBQUE7QUFDQSxTQUFBLFNBQUEsRUFBQSxLQUFBLFFBQUEsY0FBQTtBQUNBLFNBQUEsUUFBQSxRQUFBLFFBQUE7O0lBU0EsVztBQUFBLDJCQUFBO0FBQUE7O0FBQ1UsYUFBQSxLQUFBLEdBQUEsU0FBQTtBQVNUOzswQkFQQyxHLGtCQUFHO0FBQ0QsZUFBTyxLQUFQLEtBQUE7QUFDRCxLOzswQkFFRCxHLGdCQUFBLEssRUFBWTtBQUNWLGFBQUEsS0FBQSxHQUFBLEtBQUE7QUFDRCxLOzs7OztBQUdILElBQU0sV0FBVyxJQUFqQixPQUFpQixFQUFqQjtBQUVBLFNBQUEsVUFBQSxDQUFBLE1BQUEsRUFBQSxHQUFBLEVBQTBFO0FBQ3hFLFFBQUEsaUJBQUE7QUFFQSxRQUFJLFNBQUEsR0FBQSxDQUFKLE1BQUksQ0FBSixFQUEwQjtBQUN4QixtQkFBVyxTQUFBLEdBQUEsQ0FBWCxNQUFXLENBQVg7QUFERixLQUFBLE1BRU87QUFDTCxtQkFBQSxNQUFBO0FBQ0EsaUJBQUEsR0FBQSxDQUFBLE1BQUEsRUFBQSxRQUFBO0FBQ0Q7QUFFRCxRQUFJLE9BQUosUUFBQSxFQUFxQjtBQUNuQixlQUFPLFNBQVAsR0FBTyxDQUFQO0FBREYsS0FBQSxNQUVPO0FBQ0wsWUFBSSxJQUFJLElBQVIsV0FBUSxFQUFSO0FBQ0EsaUJBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxlQUFBLENBQUE7QUFDRDtBQUNGO0FBRUQsT0FBTyxJQUFNLFFBQU4sV0FBQTtBQUVQLE9BQU0sU0FBQSxXQUFBLENBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBR087QUFFWCxVQUFBLEtBQUE7QUFDQSxhQUFBLE1BQUEsRUFBQSxHQUFBO0FBQ0EsZUFBQSxNQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsQ0FBQSxLQUFBO0FBQ0Q7QUFFRCxPQUFNLFNBQUEsV0FBQSxDQUFBLE1BQUEsRUFBQSxHQUFBLEVBRUU7QUFFTixXQUFPLFdBQUEsTUFBQSxFQUFBLEdBQUEsRUFBUCxHQUFPLEVBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGRpY3QgfSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCB7IGNyZWF0ZVRhZywgZGlydHkgfSBmcm9tICcuL3ZhbGlkYXRvcnMnO1xuaW1wb3J0IHsgZGlydHlUYWcgfSBmcm9tICcuL3RhZ3MnO1xuXG50eXBlIFByaXZhdGVzPFQ+ID0geyBbSyBpbiBrZXlvZiBUXT86IFByaXZhdGU8VFtLXT4gfTtcblxuaW50ZXJmYWNlIFByaXZhdGU8VD4ge1xuICBnZXQoKTogVCB8IHVuZGVmaW5lZDtcbiAgc2V0KHZhbHVlOiBUKTogdm9pZDtcbn1cblxuY2xhc3MgUHJpdmF0ZUltcGw8VD4gaW1wbGVtZW50cyBQcml2YXRlPFQ+IHtcbiAgcHJpdmF0ZSBpbm5lcjogVCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICBnZXQoKTogVCB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuaW5uZXI7XG4gIH1cblxuICBzZXQodmFsdWU6IFQpOiB2b2lkIHtcbiAgICB0aGlzLmlubmVyID0gdmFsdWU7XG4gIH1cbn1cblxuY29uc3QgUFJJVkFURVMgPSBuZXcgV2Vha01hcDxvYmplY3QsIFByaXZhdGVzPG9iamVjdD4+KCk7XG5cbmZ1bmN0aW9uIHByaXZhdGVGb3I8TyBleHRlbmRzIG9iamVjdCwgSyBleHRlbmRzIGtleW9mIE8+KG9iamVjdDogTywga2V5OiBLKTogUHJpdmF0ZTxPW0tdPiB7XG4gIGxldCBwcml2YXRlczogUHJpdmF0ZXM8Tz47XG5cbiAgaWYgKFBSSVZBVEVTLmhhcyhvYmplY3QpKSB7XG4gICAgcHJpdmF0ZXMgPSBQUklWQVRFUy5nZXQob2JqZWN0KSEgYXMgUHJpdmF0ZXM8Tz47XG4gIH0gZWxzZSB7XG4gICAgcHJpdmF0ZXMgPSBkaWN0KCkgYXMgUHJpdmF0ZXM8Tz47XG4gICAgUFJJVkFURVMuc2V0KG9iamVjdCwgcHJpdmF0ZXMpO1xuICB9XG5cbiAgaWYgKGtleSBpbiBwcml2YXRlcykge1xuICAgIHJldHVybiBwcml2YXRlc1trZXldITtcbiAgfSBlbHNlIHtcbiAgICBsZXQgcCA9IG5ldyBQcml2YXRlSW1wbDxPW0tdPigpO1xuICAgIHByaXZhdGVzW2tleV0gPSBwO1xuICAgIHJldHVybiBwO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBFUE9DSCA9IGNyZWF0ZVRhZygpO1xuXG5leHBvcnQgZnVuY3Rpb24gc2V0U3RhdGVGb3I8TyBleHRlbmRzIG9iamVjdCwgSyBleHRlbmRzIGtleW9mIE8+KFxuICBvYmplY3Q6IE8sXG4gIGtleTogSyxcbiAgdmFsdWU6IE9bS11cbik6IHZvaWQge1xuICBkaXJ0eShFUE9DSCk7XG4gIGRpcnR5VGFnKG9iamVjdCwga2V5KTtcbiAgcHJpdmF0ZUZvcihvYmplY3QsIGtleSkuc2V0KHZhbHVlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFN0YXRlRm9yPE8gZXh0ZW5kcyBvYmplY3QsIEsgZXh0ZW5kcyBrZXlvZiBPPihcbiAgb2JqZWN0OiBPLFxuICBrZXk6IEtcbik6IE9bS10gfCB1bmRlZmluZWQge1xuICByZXR1cm4gcHJpdmF0ZUZvcihvYmplY3QsIGtleSkuZ2V0KCk7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9