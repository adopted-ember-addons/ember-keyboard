import { isEmpty, isString } from '../../dom/normalize';
import { UpdatingOpcode } from '../../opcodes';
import { value, validate } from '@glimmer/reference';
export default class DynamicTextContent extends UpdatingOpcode {
    constructor(node, reference, lastValue) {
        super();
        this.node = node;
        this.reference = reference;
        this.lastValue = lastValue;
        this.type = 'dynamic-text';
        this.tag = reference.tag;
        this.lastRevision = value(this.tag);
    }
    evaluate() {
        let { reference, tag } = this;
        if (!validate(tag, this.lastRevision)) {
            this.lastRevision = value(tag);
            this.update(reference.value());
        }
    }
    update(value) {
        let { lastValue } = this;
        if (value === lastValue) return;
        let normalized;
        if (isEmpty(value)) {
            normalized = '';
        } else if (isString(value)) {
            normalized = value;
        } else {
            normalized = String(value);
        }
        if (normalized !== lastValue) {
            let textNode = this.node;
            textNode.nodeValue = this.lastValue = normalized;
        }
    }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL3ZtL2NvbnRlbnQvdGV4dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLE9BQVQsRUFBa0IsUUFBbEIsUUFBa0MscUJBQWxDO0FBQ0EsU0FBUyxjQUFULFFBQStCLGVBQS9CO0FBQ0EsU0FBa0MsS0FBbEMsRUFBeUMsUUFBekMsUUFBbUUsb0JBQW5FO0FBR0EsZUFBYyxNQUFPLGtCQUFQLFNBQWtDLGNBQWxDLENBQWdEO0FBTTVELGdCQUNTLElBRFQsRUFFVSxTQUZWLEVBR1UsU0FIVixFQUcyQjtBQUV6QjtBQUpPLGFBQUEsSUFBQSxHQUFBLElBQUE7QUFDQyxhQUFBLFNBQUEsR0FBQSxTQUFBO0FBQ0EsYUFBQSxTQUFBLEdBQUEsU0FBQTtBQVJILGFBQUEsSUFBQSxHQUFPLGNBQVA7QUFXTCxhQUFLLEdBQUwsR0FBVyxVQUFVLEdBQXJCO0FBQ0EsYUFBSyxZQUFMLEdBQW9CLE1BQU0sS0FBSyxHQUFYLENBQXBCO0FBQ0Q7QUFFRCxlQUFRO0FBQ04sWUFBSSxFQUFFLFNBQUYsRUFBYSxHQUFiLEtBQXFCLElBQXpCO0FBRUEsWUFBSSxDQUFDLFNBQVMsR0FBVCxFQUFjLEtBQUssWUFBbkIsQ0FBTCxFQUF1QztBQUNyQyxpQkFBSyxZQUFMLEdBQW9CLE1BQU0sR0FBTixDQUFwQjtBQUNBLGlCQUFLLE1BQUwsQ0FBWSxVQUFVLEtBQVYsRUFBWjtBQUNEO0FBQ0Y7QUFFRCxXQUFPLEtBQVAsRUFBcUI7QUFDbkIsWUFBSSxFQUFFLFNBQUYsS0FBZ0IsSUFBcEI7QUFFQSxZQUFJLFVBQVUsU0FBZCxFQUF5QjtBQUV6QixZQUFJLFVBQUo7QUFFQSxZQUFJLFFBQVEsS0FBUixDQUFKLEVBQW9CO0FBQ2xCLHlCQUFhLEVBQWI7QUFDRCxTQUZELE1BRU8sSUFBSSxTQUFTLEtBQVQsQ0FBSixFQUFxQjtBQUMxQix5QkFBYSxLQUFiO0FBQ0QsU0FGTSxNQUVBO0FBQ0wseUJBQWEsT0FBTyxLQUFQLENBQWI7QUFDRDtBQUVELFlBQUksZUFBZSxTQUFuQixFQUE4QjtBQUM1QixnQkFBSSxXQUFXLEtBQUssSUFBcEI7QUFDQSxxQkFBUyxTQUFULEdBQXFCLEtBQUssU0FBTCxHQUFpQixVQUF0QztBQUNEO0FBQ0Y7QUE1QzJEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgaXNFbXB0eSwgaXNTdHJpbmcgfSBmcm9tICcuLi8uLi9kb20vbm9ybWFsaXplJztcbmltcG9ydCB7IFVwZGF0aW5nT3Bjb2RlIH0gZnJvbSAnLi4vLi4vb3Bjb2Rlcyc7XG5pbXBvcnQgeyBUYWcsIFZlcnNpb25lZFJlZmVyZW5jZSwgdmFsdWUsIHZhbGlkYXRlLCBSZXZpc2lvbiB9IGZyb20gJ0BnbGltbWVyL3JlZmVyZW5jZSc7XG5pbXBvcnQgeyBTaW1wbGVUZXh0IH0gZnJvbSAnQHNpbXBsZS1kb20vaW50ZXJmYWNlJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRHluYW1pY1RleHRDb250ZW50IGV4dGVuZHMgVXBkYXRpbmdPcGNvZGUge1xuICBwdWJsaWMgdHlwZSA9ICdkeW5hbWljLXRleHQnO1xuXG4gIHB1YmxpYyB0YWc6IFRhZztcbiAgcHVibGljIGxhc3RSZXZpc2lvbjogUmV2aXNpb247XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIG5vZGU6IFNpbXBsZVRleHQsXG4gICAgcHJpdmF0ZSByZWZlcmVuY2U6IFZlcnNpb25lZFJlZmVyZW5jZTx1bmtub3duPixcbiAgICBwcml2YXRlIGxhc3RWYWx1ZTogc3RyaW5nXG4gICkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy50YWcgPSByZWZlcmVuY2UudGFnO1xuICAgIHRoaXMubGFzdFJldmlzaW9uID0gdmFsdWUodGhpcy50YWcpO1xuICB9XG5cbiAgZXZhbHVhdGUoKSB7XG4gICAgbGV0IHsgcmVmZXJlbmNlLCB0YWcgfSA9IHRoaXM7XG5cbiAgICBpZiAoIXZhbGlkYXRlKHRhZywgdGhpcy5sYXN0UmV2aXNpb24pKSB7XG4gICAgICB0aGlzLmxhc3RSZXZpc2lvbiA9IHZhbHVlKHRhZyk7XG4gICAgICB0aGlzLnVwZGF0ZShyZWZlcmVuY2UudmFsdWUoKSk7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlKHZhbHVlOiB1bmtub3duKTogdm9pZCB7XG4gICAgbGV0IHsgbGFzdFZhbHVlIH0gPSB0aGlzO1xuXG4gICAgaWYgKHZhbHVlID09PSBsYXN0VmFsdWUpIHJldHVybjtcblxuICAgIGxldCBub3JtYWxpemVkOiBzdHJpbmc7XG5cbiAgICBpZiAoaXNFbXB0eSh2YWx1ZSkpIHtcbiAgICAgIG5vcm1hbGl6ZWQgPSAnJztcbiAgICB9IGVsc2UgaWYgKGlzU3RyaW5nKHZhbHVlKSkge1xuICAgICAgbm9ybWFsaXplZCA9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBub3JtYWxpemVkID0gU3RyaW5nKHZhbHVlKTtcbiAgICB9XG5cbiAgICBpZiAobm9ybWFsaXplZCAhPT0gbGFzdFZhbHVlKSB7XG4gICAgICBsZXQgdGV4dE5vZGUgPSB0aGlzLm5vZGU7XG4gICAgICB0ZXh0Tm9kZS5ub2RlVmFsdWUgPSB0aGlzLmxhc3RWYWx1ZSA9IG5vcm1hbGl6ZWQ7XG4gICAgfVxuICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9