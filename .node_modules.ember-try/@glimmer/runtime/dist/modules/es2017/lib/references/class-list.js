import { combineTagged } from '@glimmer/reference';
import { normalizeStringValue } from '../dom/normalize';
export default class ClassListReference {
    constructor(list) {
        this.list = list;
        this.tag = combineTagged(list);
        this.list = list;
    }
    value() {
        let ret = [];
        let { list } = this;
        for (let i = 0; i < list.length; i++) {
            let value = normalizeStringValue(list[i].value());
            if (value) ret.push(value);
        }
        return ret.length === 0 ? null : ret.join(' ');
    }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL3JlZmVyZW5jZXMvY2xhc3MtbGlzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUF5QixhQUF6QixRQUE4QyxvQkFBOUM7QUFHQSxTQUFTLG9CQUFULFFBQXFDLGtCQUFyQztBQUVBLGVBQWMsTUFBTyxrQkFBUCxDQUF5QjtBQUdyQyxnQkFBb0IsSUFBcEIsRUFBOEM7QUFBMUIsYUFBQSxJQUFBLEdBQUEsSUFBQTtBQUNsQixhQUFLLEdBQUwsR0FBVyxjQUFjLElBQWQsQ0FBWDtBQUNBLGFBQUssSUFBTCxHQUFZLElBQVo7QUFDRDtBQUVELFlBQUs7QUFDSCxZQUFJLE1BQWdCLEVBQXBCO0FBQ0EsWUFBSSxFQUFFLElBQUYsS0FBVyxJQUFmO0FBRUEsYUFBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLEtBQUssTUFBekIsRUFBaUMsR0FBakMsRUFBc0M7QUFDcEMsZ0JBQUksUUFBUSxxQkFBcUIsS0FBSyxDQUFMLEVBQVEsS0FBUixFQUFyQixDQUFaO0FBQ0EsZ0JBQUksS0FBSixFQUFXLElBQUksSUFBSixDQUFTLEtBQVQ7QUFDWjtBQUVELGVBQU8sSUFBSSxNQUFKLEtBQWUsQ0FBZixHQUFtQixJQUFuQixHQUEwQixJQUFJLElBQUosQ0FBUyxHQUFULENBQWpDO0FBQ0Q7QUFsQm9DIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUmVmZXJlbmNlLCBUYWcsIGNvbWJpbmVUYWdnZWQgfSBmcm9tICdAZ2xpbW1lci9yZWZlcmVuY2UnO1xuaW1wb3J0IHsgT3B0aW9uIH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5cbmltcG9ydCB7IG5vcm1hbGl6ZVN0cmluZ1ZhbHVlIH0gZnJvbSAnLi4vZG9tL25vcm1hbGl6ZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENsYXNzTGlzdFJlZmVyZW5jZSBpbXBsZW1lbnRzIFJlZmVyZW5jZTxPcHRpb248c3RyaW5nPj4ge1xuICBwdWJsaWMgdGFnOiBUYWc7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBsaXN0OiBSZWZlcmVuY2U8dW5rbm93bj5bXSkge1xuICAgIHRoaXMudGFnID0gY29tYmluZVRhZ2dlZChsaXN0KTtcbiAgICB0aGlzLmxpc3QgPSBsaXN0O1xuICB9XG5cbiAgdmFsdWUoKTogT3B0aW9uPHN0cmluZz4ge1xuICAgIGxldCByZXQ6IHN0cmluZ1tdID0gW107XG4gICAgbGV0IHsgbGlzdCB9ID0gdGhpcztcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IHZhbHVlID0gbm9ybWFsaXplU3RyaW5nVmFsdWUobGlzdFtpXS52YWx1ZSgpKTtcbiAgICAgIGlmICh2YWx1ZSkgcmV0LnB1c2godmFsdWUpO1xuICAgIH1cblxuICAgIHJldHVybiByZXQubGVuZ3RoID09PSAwID8gbnVsbCA6IHJldC5qb2luKCcgJyk7XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=