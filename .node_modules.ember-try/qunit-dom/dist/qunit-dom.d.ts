import type DOMAssertions from './assertions';
export { setup } from './qunit-dom-modules';
declare global {
    interface Assert {
        dom(target?: string | Element | null, rootElement?: Element): DOMAssertions;
    }
}
