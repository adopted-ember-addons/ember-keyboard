import DOMAssertions, { AssertionResult } from '../assertions';
export default class TestAssertions {
    results: AssertionResult[];
    dom(target: string | Element | null, rootElement?: Element): DOMAssertions;
    pushResult(result: AssertionResult): void;
}
