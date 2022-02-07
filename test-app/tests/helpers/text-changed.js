import { find } from '@ember/test-helpers';

const defaultOptions = {
  selectorName: undefined,
  beforeValue: undefined,
  afterValue: undefined,
};

export const textChanged = async (assert, testFn, passedOptions = {}) => {
  const options = {
    ...defaultOptions,
    ...passedOptions,
  };

  const { beforeValue, afterValue, selectorName } = options;

  const beforeElement = find(`[data-test-${selectorName}]`);

  const beforeResult = beforeElement.innerText.trim();

  assert.equal(beforeResult, beforeValue);

  await testFn();

  const afterElement = find(`[data-test-${selectorName}]`);
  const afterResult = afterElement.innerText.trim();

  assert.equal(afterResult, afterValue);
};
