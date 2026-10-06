import { get } from '@ember/object';

type ConvertValue = ((value: unknown) => number) | null | undefined;

export function compare(a: number, b: number): -1 | 0 | 1 {
  const diff = a - b;
  return (Number(diff > 0) - Number(diff < 0)) as -1 | 0 | 1;
}

export function compareProp(
  a: object,
  b: object,
  propName: string,
  convertValue?: ConvertValue,
): -1 | 0 | 1 {
  return compare(
    (convertValue
      ? convertValue(get(a, propName))
      : get(a, propName)) as number,
    (convertValue
      ? convertValue(get(b, propName))
      : get(b, propName)) as number,
  );
}

export function reverseCompareProp(
  a: object,
  b: object,
  propName: string,
  convertValue: ConvertValue = null,
): -1 | 0 | 1 {
  return compareProp(b, a, propName, convertValue);
}
