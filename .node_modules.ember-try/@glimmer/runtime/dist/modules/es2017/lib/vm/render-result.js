import { associate, DESTROY } from '@glimmer/util';
import { clear } from '../bounds';
import { inTransaction } from '../environment';
import { asyncDestroy } from '../lifetime';
import UpdatingVM from './update';
export default class RenderResultImpl {
    constructor(env, updating, bounds, drop) {
        this.env = env;
        this.updating = updating;
        this.bounds = bounds;
        this.drop = drop;
        associate(this, drop);
    }
    rerender({ alwaysRevalidate = false } = { alwaysRevalidate: false }) {
        let { env, updating } = this;
        let vm = new UpdatingVM(env, { alwaysRevalidate });
        vm.execute(updating, this);
    }
    parentElement() {
        return this.bounds.parentElement();
    }
    firstNode() {
        return this.bounds.firstNode();
    }
    lastNode() {
        return this.bounds.lastNode();
    }
    handleException() {
        throw 'this should never happen';
    }
    [DESTROY]() {
        clear(this.bounds);
    }
    // compat, as this is a user-exposed API
    destroy() {
        inTransaction(this.env, () => asyncDestroy(this, this.env));
    }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL3ZtL3JlbmRlci1yZXN1bHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsU0FBUyxTQUFULEVBQW9CLE9BQXBCLFFBQStDLGVBQS9DO0FBRUEsU0FBUyxLQUFULFFBQXNCLFdBQXRCO0FBQ0EsU0FBUyxhQUFULFFBQThCLGdCQUE5QjtBQUNBLFNBQVMsWUFBVCxRQUE2QixhQUE3QjtBQUVBLE9BQU8sVUFBUCxNQUF1QixVQUF2QjtBQUVBLGVBQWMsTUFBTyxnQkFBUCxDQUF1QjtBQUNuQyxnQkFDUyxHQURULEVBRVUsUUFGVixFQUdVLE1BSFYsRUFJVyxJQUpYLEVBSXVCO0FBSGQsYUFBQSxHQUFBLEdBQUEsR0FBQTtBQUNDLGFBQUEsUUFBQSxHQUFBLFFBQUE7QUFDQSxhQUFBLE1BQUEsR0FBQSxNQUFBO0FBQ0MsYUFBQSxJQUFBLEdBQUEsSUFBQTtBQUVULGtCQUFVLElBQVYsRUFBZ0IsSUFBaEI7QUFDRDtBQUVELGFBQVMsRUFBRSxtQkFBbUIsS0FBckIsS0FBK0IsRUFBRSxrQkFBa0IsS0FBcEIsRUFBeEMsRUFBbUU7QUFDakUsWUFBSSxFQUFFLEdBQUYsRUFBTyxRQUFQLEtBQW9CLElBQXhCO0FBQ0EsWUFBSSxLQUFLLElBQUksVUFBSixDQUFlLEdBQWYsRUFBb0IsRUFBRSxnQkFBRixFQUFwQixDQUFUO0FBQ0EsV0FBRyxPQUFILENBQVcsUUFBWCxFQUFxQixJQUFyQjtBQUNEO0FBRUQsb0JBQWE7QUFDWCxlQUFPLEtBQUssTUFBTCxDQUFZLGFBQVosRUFBUDtBQUNEO0FBRUQsZ0JBQVM7QUFDUCxlQUFPLEtBQUssTUFBTCxDQUFZLFNBQVosRUFBUDtBQUNEO0FBRUQsZUFBUTtBQUNOLGVBQU8sS0FBSyxNQUFMLENBQVksUUFBWixFQUFQO0FBQ0Q7QUFFRCxzQkFBZTtBQUNiLGNBQU0sMEJBQU47QUFDRDtBQUVELEtBQUMsT0FBRCxJQUFTO0FBQ1AsY0FBTSxLQUFLLE1BQVg7QUFDRDtBQUVEO0FBQ0EsY0FBTztBQUNMLHNCQUFjLEtBQUssR0FBbkIsRUFBd0IsTUFBTSxhQUFhLElBQWIsRUFBbUIsS0FBSyxHQUF4QixDQUE5QjtBQUNEO0FBdkNrQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVudmlyb25tZW50LCBSZW5kZXJSZXN1bHQsIExpdmVCbG9jayB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgYXNzb2NpYXRlLCBERVNUUk9ZLCBMaW5rZWRMaXN0IH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQgeyBTaW1wbGVFbGVtZW50LCBTaW1wbGVOb2RlIH0gZnJvbSAnQHNpbXBsZS1kb20vaW50ZXJmYWNlJztcbmltcG9ydCB7IGNsZWFyIH0gZnJvbSAnLi4vYm91bmRzJztcbmltcG9ydCB7IGluVHJhbnNhY3Rpb24gfSBmcm9tICcuLi9lbnZpcm9ubWVudCc7XG5pbXBvcnQgeyBhc3luY0Rlc3Ryb3kgfSBmcm9tICcuLi9saWZldGltZSc7XG5pbXBvcnQgeyBVcGRhdGluZ09wY29kZSB9IGZyb20gJy4uL29wY29kZXMnO1xuaW1wb3J0IFVwZGF0aW5nVk0gZnJvbSAnLi91cGRhdGUnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZW5kZXJSZXN1bHRJbXBsIGltcGxlbWVudHMgUmVuZGVyUmVzdWx0IHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGVudjogRW52aXJvbm1lbnQsXG4gICAgcHJpdmF0ZSB1cGRhdGluZzogTGlua2VkTGlzdDxVcGRhdGluZ09wY29kZT4sXG4gICAgcHJpdmF0ZSBib3VuZHM6IExpdmVCbG9jayxcbiAgICByZWFkb25seSBkcm9wOiBvYmplY3RcbiAgKSB7XG4gICAgYXNzb2NpYXRlKHRoaXMsIGRyb3ApO1xuICB9XG5cbiAgcmVyZW5kZXIoeyBhbHdheXNSZXZhbGlkYXRlID0gZmFsc2UgfSA9IHsgYWx3YXlzUmV2YWxpZGF0ZTogZmFsc2UgfSkge1xuICAgIGxldCB7IGVudiwgdXBkYXRpbmcgfSA9IHRoaXM7XG4gICAgbGV0IHZtID0gbmV3IFVwZGF0aW5nVk0oZW52LCB7IGFsd2F5c1JldmFsaWRhdGUgfSk7XG4gICAgdm0uZXhlY3V0ZSh1cGRhdGluZywgdGhpcyk7XG4gIH1cblxuICBwYXJlbnRFbGVtZW50KCk6IFNpbXBsZUVsZW1lbnQge1xuICAgIHJldHVybiB0aGlzLmJvdW5kcy5wYXJlbnRFbGVtZW50KCk7XG4gIH1cblxuICBmaXJzdE5vZGUoKTogU2ltcGxlTm9kZSB7XG4gICAgcmV0dXJuIHRoaXMuYm91bmRzLmZpcnN0Tm9kZSgpO1xuICB9XG5cbiAgbGFzdE5vZGUoKTogU2ltcGxlTm9kZSB7XG4gICAgcmV0dXJuIHRoaXMuYm91bmRzLmxhc3ROb2RlKCk7XG4gIH1cblxuICBoYW5kbGVFeGNlcHRpb24oKSB7XG4gICAgdGhyb3cgJ3RoaXMgc2hvdWxkIG5ldmVyIGhhcHBlbic7XG4gIH1cblxuICBbREVTVFJPWV0oKSB7XG4gICAgY2xlYXIodGhpcy5ib3VuZHMpO1xuICB9XG5cbiAgLy8gY29tcGF0LCBhcyB0aGlzIGlzIGEgdXNlci1leHBvc2VkIEFQSVxuICBkZXN0cm95KCkge1xuICAgIGluVHJhbnNhY3Rpb24odGhpcy5lbnYsICgpID0+IGFzeW5jRGVzdHJveSh0aGlzLCB0aGlzLmVudikpO1xuICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9