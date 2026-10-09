import { get } from '@ember/object';

function compare(a, b) {
  const diff = a - b;
  return Number(diff > 0) - Number(diff < 0);
}
function compareProp(a, b, propName, convertValue) {
  return compare(convertValue ? convertValue(get(a, propName)) : get(a, propName), convertValue ? convertValue(get(b, propName)) : get(b, propName));
}
function reverseCompareProp(a, b, propName, convertValue = null) {
  return compareProp(b, a, propName, convertValue);
}

export { compare, compareProp, reverseCompareProp };
//# sourceMappingURL=sort.js.map
