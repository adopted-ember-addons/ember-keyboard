import { get } from '@ember/object';

function compare(a, b) {
  let diff = a - b;
  return (diff > 0) - (diff < 0);
}
function compareProp(a, b, propName, convertValue) {
  return compare(convertValue ? convertValue(get(a, propName)) : get(a, propName), convertValue ? convertValue(get(b, propName)) : get(b, propName));
}
function reverseCompareProp(a, b, propName, convertValue = null) {
  return compareProp(b, a, propName, convertValue);
}

export { compare, compareProp, reverseCompareProp };
