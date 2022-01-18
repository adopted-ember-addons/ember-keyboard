export interface AssertionResult {
    result: boolean;
    actual: any;
    expected: any;
    message: string;
}
export interface ExistsOptions {
    count: number;
}
export default class DOMAssertions {
    private target;
    private rootElement;
    private testContext;
    constructor(target: string | Element | null, rootElement: Element | Document, testContext: Assert);
    /**
     * Assert an {@link HTMLElement} (or multiple) matching the `selector` exists.
     *
     * @param {string?} message
     *
     * @example
     * assert.dom('#title').exists();
     *
     * @see {@link #doesNotExist}
     */
    exists(message?: string): DOMAssertions;
    /**
     * Assert an {@link HTMLElement} (or multiple) matching the `selector` exists.
     *
     * @param {object?} options
     * @param {number?} options.count
     * @param {string?} message
     *
     * @example
     * assert.dom('.choice').exists({ count: 4 });
     *
     * @see {@link #doesNotExist}
     */
    exists(options: ExistsOptions, message?: string): DOMAssertions;
    /**
     * Assert an {@link HTMLElement} matching the `selector` does not exists.
     *
     * @param {string?} message
     *
     * @example
     * assert.dom('.should-not-exist').doesNotExist();
     *
     * @see {@link #exists}
     */
    doesNotExist(message?: string): DOMAssertions;
    /**
     * Assert that the {@link HTMLElement} or an {@link HTMLElement} matching the
     * `selector` is currently checked.
     *
     * Note: This also supports `aria-checked="true/false"`.
     *
     * @param {string?} message
     *
     * @example
     * assert.dom('input.active').isChecked();
     *
     * @see {@link #isNotChecked}
     */
    isChecked(message?: string): DOMAssertions;
    /**
     * Assert that the {@link HTMLElement} or an {@link HTMLElement} matching the
     * `selector` is currently unchecked.
     *
     * Note: This also supports `aria-checked="true/false"`.
     *
     * @param {string?} message
     *
     * @example
     * assert.dom('input.active').isNotChecked();
     *
     * @see {@link #isChecked}
     */
    isNotChecked(message?: string): DOMAssertions;
    /**
     * Assert that the {@link HTMLElement} or an {@link HTMLElement} matching the
     * `selector` is currently focused.
     *
     * @param {string?} message
     *
     * @example
     * assert.dom('input.email').isFocused();
     *
     * @see {@link #isNotFocused}
     */
    isFocused(message?: string): DOMAssertions;
    /**
     * Assert that the {@link HTMLElement} or an {@link HTMLElement} matching the
     * `selector` is not currently focused.
     *
     * @param {string?} message
     *
     * @example
     * assert.dom('input[type="password"]').isNotFocused();
     *
     * @see {@link #isFocused}
     */
    isNotFocused(message?: string): DOMAssertions;
    /**
     * Assert that the {@link HTMLElement} or an {@link HTMLElement} matching the
     * `selector` is currently required.
     *
     * @param {string?} message
     *
     * @example
     * assert.dom('input[type="text"]').isRequired();
     *
     * @see {@link #isNotRequired}
     */
    isRequired(message?: string): DOMAssertions;
    /**
     * Assert that the {@link HTMLElement} or an {@link HTMLElement} matching the
     * `selector` is currently not required.
     *
     * @param {string?} message
     *
     * @example
     * assert.dom('input[type="text"]').isNotRequired();
     *
     * @see {@link #isRequired}
     */
    isNotRequired(message?: string): DOMAssertions;
    /**
     * Assert that the {@link HTMLElement} passes validation
     *
     * Validity is determined by asserting that:
     *
     * - `element.reportValidity() === true`
     *
     * @param {string?} message
     *
     * @example
     * assert.dom('.input').isValid();
     *
     * @see {@link #isValid}
     */
    isValid(message?: string): DOMAssertions;
    /**
     * Assert that the {@link HTMLElement} does not pass validation
     *
     * Validity is determined by asserting that:
     *
     * - `element.reportValidity() === true`
     *
     * @param {string?} message
     *
     * @example
     * assert.dom('.input').isNotValid();
     *
     * @see {@link #isValid}
     */
    isNotValid(message?: string): DOMAssertions;
    /**
     * Assert that the {@link HTMLElement} or an {@link HTMLElement} matching the
     * `selector` exists and is visible.
     *
     * Visibility is determined by asserting that:
     *
     * - the element's offsetWidth and offsetHeight are non-zero
     * - any of the element's DOMRect objects have a non-zero size
     *
     * Additionally, visibility in this case means that the element is visible on the page,
     * but not necessarily in the viewport.
     *
     * @param {string?} message
     *
     * @example
     * assert.dom('.foo').isVisible();
     *
     * @see {@link #isNotVisible}
     */
    isVisible(message?: string): DOMAssertions;
    /**
     * Assert that the {@link HTMLElement} or an {@link HTMLElement} matching the
     * `selector` exists and is visible.
     *
     * Visibility is determined by asserting that:
     *
     * - the element's offsetWidth and offsetHeight are non-zero
     * - any of the element's DOMRect objects have a non-zero size
     *
     * Additionally, visibility in this case means that the element is visible on the page,
     * but not necessarily in the viewport.
     *
     * @param {object?} options
     * @param {number?} options.count
     * @param {string?} message
     *
     * @example
     * assert.dom('.choice').isVisible({ count: 4 });
     *
     * @see {@link #isNotVisible}
     */
    isVisible(options: ExistsOptions, message?: string): DOMAssertions;
    /**
     * Assert that the {@link HTMLElement} or an {@link HTMLElement} matching the
     * `selector` does not exist or is not visible on the page.
     *
     * Visibility is determined by asserting that:
     *
     * - the element's offsetWidth or offsetHeight are zero
     * - all of the element's DOMRect objects have a size of zero
     *
     * Additionally, visibility in this case means that the element is visible on the page,
     * but not necessarily in the viewport.
     *
     * @param {string?} message
     *
     * @example
     * assert.dom('.foo').isNotVisible();
     *
     * @see {@link #isVisible}
     */
    isNotVisible(message?: string): DOMAssertions;
    /**
     * Assert that the {@link HTMLElement} has an attribute with the provided `name`.
     *
     * @param {string} name
     *
     * @example
     * assert.dom('input.password-input').hasAttribute('disabled');
     *
     * @see {@link #doesNotHaveAttribute}
     */
    hasAttribute(name: string): DOMAssertions;
    /**
     * Assert that the {@link HTMLElement} has an attribute with the provided `name`
     * and checks if the attribute `value` matches the provided text or regular
     * expression.
     *
     * @param {string} name
     * @param {string|RegExp|object} value
     * @param {string?} message
     *
     * @example
     * assert.dom('input.password-input').hasAttribute('type', 'password');
     *
     * @see {@link #doesNotHaveAttribute}
     */
    hasAttribute(name: string, value: string | RegExp | {
        any: true;
    }, message?: string): DOMAssertions;
    /**
     * Assert that the {@link HTMLElement} has no attribute with the provided `name`.
     *
     * **Aliases:** `hasNoAttribute`, `lacksAttribute`
     *
     * @param {string} name
     * @param {string?} message
     *
     * @example
     * assert.dom('input.username').hasNoAttribute('disabled');
     *
     * @see {@link #hasAttribute}
     */
    doesNotHaveAttribute(name: string, message?: string): DOMAssertions;
    hasNoAttribute(name: string, message?: string): DOMAssertions;
    lacksAttribute(name: string, message?: string): DOMAssertions;
    /**
     * Assert that the {@link HTMLElement} has an ARIA attribute with the provided
     * `name` and optionally checks if the attribute `value` matches the provided
     * text or regular expression.
     *
     * @param {string} name
     * @param {string|RegExp|object?} value
     * @param {string?} message
     *
     * @example
     * assert.dom('button').hasAria('pressed', 'true');
     *
     * @see {@link #hasNoAria}
     */
    hasAria(name: string, value?: string | RegExp | {
        any: true;
    }, message?: string): DOMAssertions;
    /**
     * Assert that the {@link HTMLElement} has no ARIA attribute with the
     * provided `name`.
     *
     * @param {string} name
     * @param {string?} message
     *
     * @example
     * assert.dom('button').doesNotHaveAria('pressed');
     *
     * @see {@link #hasAria}
     */
    doesNotHaveAria(name: string, message?: string): DOMAssertions;
    /**
     * Assert that the {@link HTMLElement} has a property with the provided `name`
     * and checks if the property `value` matches the provided text or regular
     * expression.
     *
     * @param {string} name
     * @param {RegExp|any} value
     * @param {string?} message
     *
     * @example
     * assert.dom('input.password-input').hasProperty('type', 'password');
     *
     * @see {@link #doesNotHaveProperty}
     */
    hasProperty(name: string, value: unknown, message?: string): DOMAssertions;
    /**
     *  Assert that the {@link HTMLElement} or an {@link HTMLElement} matching the
     * `selector` is disabled.
     *
     * @param {string?} message
     *
     * @example
     * assert.dom('.foo').isDisabled();
     *
     * @see {@link #isNotDisabled}
     */
    isDisabled(message?: string): DOMAssertions;
    /**
     *  Assert that the {@link HTMLElement} or an {@link HTMLElement} matching the
     * `selector` is not disabled.
     *
     * **Aliases:** `isEnabled`
     *
     * @param {string?} message
     *
     * @example
     * assert.dom('.foo').isNotDisabled();
     *
     * @see {@link #isDisabled}
     */
    isNotDisabled(message?: string): DOMAssertions;
    isEnabled(message?: string): DOMAssertions;
    /**
     * Assert that the {@link HTMLElement} has the `expected` CSS class using
     * [`classList`](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList).
     *
     * `expected` can also be a regular expression, and the assertion will return
     * true if any of the element's CSS classes match.
     *
     * @param {string|RegExp} expected
     * @param {string?} message
     *
     * @example
     * assert.dom('input[type="password"]').hasClass('secret-password-input');
     *
     * @example
     * assert.dom('input[type="password"]').hasClass(/.*password-input/);
     *
     * @see {@link #doesNotHaveClass}
     */
    hasClass(expected: string | RegExp, message?: string): DOMAssertions;
    /**
     * Assert that the {@link HTMLElement} does not have the `expected` CSS class using
     * [`classList`](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList).
     *
     * `expected` can also be a regular expression, and the assertion will return
     * true if none of the element's CSS classes match.
     *
     * **Aliases:** `hasNoClass`, `lacksClass`
     *
     * @param {string|RegExp} expected
     * @param {string?} message
     *
     * @example
     * assert.dom('input[type="password"]').doesNotHaveClass('username-input');
     *
     * @example
     * assert.dom('input[type="password"]').doesNotHaveClass(/username-.*-input/);
     *
     * @see {@link #hasClass}
     */
    doesNotHaveClass(expected: string | RegExp, message?: string): DOMAssertions;
    hasNoClass(expected: string | RegExp, message?: string): DOMAssertions;
    lacksClass(expected: string | RegExp, message?: string): DOMAssertions;
    /**
     * Assert that the [HTMLElement][] has the `expected` style declarations using
     * [`window.getComputedStyle`](https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle).
     *
     * @param {object} expected
     * @param {string?} message
     *
     * @example
     * assert.dom('.progress-bar').hasStyle({
     *   opacity: 1,
     *   display: 'block'
     * });
     *
     * @see {@link #hasClass}
     */
    hasStyle(expected: object, message?: string): DOMAssertions;
    hasPseudoElementStyle(selector: string, expected: object, message?: string): DOMAssertions;
    /**
     * Assert that the [HTMLElement][] does not have the `expected` style declarations using
     * [`window.getComputedStyle`](https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle).
     *
     * @param {object} expected
     * @param {string?} message
     *
     * @example
     * assert.dom('.progress-bar').doesNotHaveStyle({
     *   opacity: 1,
     *   display: 'block'
     * });
     *
     * @see {@link #hasClass}
     */
    doesNotHaveStyle(expected: object, message?: string): DOMAssertions;
    doesNotHavePseudoElementStyle(selector: string, expected: object, message: string): DOMAssertions;
    /**
     * Assert that the text of the {@link HTMLElement} or an {@link HTMLElement}
     * matching the `selector` matches the `expected` text, using the
     * [`textContent`](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent)
     * attribute and stripping/collapsing whitespace.
     *
     * `expected` can also be a regular expression.
     *
     * > Note: This assertion will collapse whitespace if the type you pass in is a string.
     * > If you are testing specifically for whitespace integrity, pass your expected text
     * > in as a RegEx pattern.
     *
     * **Aliases:** `matchesText`
     *
     * @param {string|RegExp} expected
     * @param {string?} message
     *
     * @example
     * // <h2 id="title">
     * //   Welcome to <b>QUnit</b>
     * // </h2>
     *
     * assert.dom('#title').hasText('Welcome to QUnit');
     *
     * @example
     * assert.dom('.foo').hasText(/[12]\d{3}/);
     *
     * @see {@link #includesText}
     */
    hasText(expected: string | RegExp | {
        any: true;
    }, message?: string): DOMAssertions;
    matchesText(expected: string | RegExp | {
        any: true;
    }, message?: string): DOMAssertions;
    /**
     * Assert that the `textContent` property of an {@link HTMLElement} is not empty.
     *
     * @param {string?} message
     *
     * @example
     * assert.dom('button.share').hasAnyText();
     *
     * @see {@link #hasText}
     */
    hasAnyText(message?: string): DOMAssertions;
    /**
     * Assert that the `textContent` property of an {@link HTMLElement} is empty.
     *
     * @param {string?} message
     *
     * @example
     * assert.dom('div').hasNoText();
     *
     * @see {@link #hasNoText}
     */
    hasNoText(message?: string): DOMAssertions;
    /**
     * Assert that the text of the {@link HTMLElement} or an {@link HTMLElement}
     * matching the `selector` contains the given `text`, using the
     * [`textContent`](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent)
     * attribute.
     *
     * > Note: This assertion will collapse whitespace in `textContent` before searching.
     * > If you would like to assert on a string that *should* contain line breaks, tabs,
     * > more than one space in a row, or starting/ending whitespace, use the {@link #hasText}
     * > selector and pass your expected text in as a RegEx pattern.
     *
     * **Aliases:** `containsText`, `hasTextContaining`
     *
     * @param {string} text
     * @param {string?} message
     *
     * @example
     * assert.dom('#title').includesText('Welcome');
     *
     * @see {@link #hasText}
     */
    includesText(text: string, message?: string): DOMAssertions;
    containsText(expected: string, message?: string): DOMAssertions;
    hasTextContaining(expected: string, message?: string): DOMAssertions;
    /**
     * Assert that the text of the {@link HTMLElement} or an {@link HTMLElement}
     * matching the `selector` does not include the given `text`, using the
     * [`textContent`](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent)
     * attribute.
     *
     * **Aliases:** `doesNotContainText`, `doesNotHaveTextContaining`
     *
     * @param {string} text
     * @param {string?} message
     *
     * @example
     * assert.dom('#title').doesNotIncludeText('Welcome');
     */
    doesNotIncludeText(text: string, message?: string): DOMAssertions;
    doesNotContainText(unexpected: string, message?: string): DOMAssertions;
    doesNotHaveTextContaining(unexpected: string, message?: string): DOMAssertions;
    /**
     * Assert that the `value` property of an {@link HTMLInputElement} matches
     * the `expected` text or regular expression.
     *
     * If no `expected` value is provided, the assertion will fail if the
     * `value` is an empty string.
     *
     * @param {string|RegExp|object?} expected
     * @param {string?} message
     *
     * @example
     * assert.dom('input.username').hasValue('HSimpson');
  
     * @see {@link #hasAnyValue}
     * @see {@link #hasNoValue}
     */
    hasValue(expected?: string | RegExp | {
        any: true;
    }, message?: string): DOMAssertions;
    /**
     * Assert that the `value` property of an {@link HTMLInputElement} is not empty.
     *
     * @param {string?} message
     *
     * @example
     * assert.dom('input.username').hasAnyValue();
     *
     * @see {@link #hasValue}
     * @see {@link #hasNoValue}
     */
    hasAnyValue(message?: string): DOMAssertions;
    /**
     * Assert that the `value` property of an {@link HTMLInputElement} is empty.
     *
     * **Aliases:** `lacksValue`
     *
     * @param {string?} message
     *
     * @example
     * assert.dom('input.username').hasNoValue();
     *
     * @see {@link #hasValue}
     * @see {@link #hasAnyValue}
     */
    hasNoValue(message?: string): DOMAssertions;
    lacksValue(message?: string): DOMAssertions;
    /**
     * Assert that the target selector selects only Elements that are also selected by
     * compareSelector.
     *
     * @param {string} compareSelector
     * @param {string?} message
     *
     * @example
     * assert.dom('p.red').matchesSelector('div.wrapper p:last-child')
     */
    matchesSelector(compareSelector: string, message?: string): DOMAssertions;
    /**
     * Assert that the target selector selects only Elements that are not also selected by
     * compareSelector.
     *
     * @param {string} compareSelector
     * @param {string?} message
     *
     * @example
     * assert.dom('input').doesNotMatchSelector('input[disabled]')
     */
    doesNotMatchSelector(compareSelector: string, message?: string): DOMAssertions;
    /**
     * Assert that the tagName of the {@link HTMLElement} or an {@link HTMLElement}
     * matching the `selector` matches the `expected` tagName, using the
     * [`tagName`](https://developer.mozilla.org/en-US/docs/Web/API/Element/tagName)
     * property of the {@link HTMLElement}.
     *
     * @param {string} expected
     * @param {string?} message
     *
     * @example
     * // <h1 id="title">
     * //   Title
     * // </h1>
     *
     * assert.dom('#title').hasTagName('h1');
     */
    hasTagName(tagName: string, message?: string): DOMAssertions;
    /**
     * Assert that the tagName of the {@link HTMLElement} or an {@link HTMLElement}
     * matching the `selector` does not match the `expected` tagName, using the
     * [`tagName`](https://developer.mozilla.org/en-US/docs/Web/API/Element/tagName)
     * property of the {@link HTMLElement}.
     *
     * @param {string} expected
     * @param {string?} message
     *
     * @example
     * // <section id="block">
     * //   Title
     * // </section>
     *
     * assert.dom('section#block').doesNotHaveTagName('div');
     */
    doesNotHaveTagName(tagName: string, message?: string): DOMAssertions;
    /**
     * @private
     */
    private pushResult;
    /**
     * Finds a valid HTMLElement from target, or pushes a failing assertion if a valid
     * element is not found.
     * @private
     * @returns (HTMLElement|null) a valid HTMLElement, or null
     */
    private findTargetElement;
    /**
     * Finds a valid HTMLElement from target
     * @private
     * @returns (HTMLElement|null) a valid HTMLElement, or null
     * @throws TypeError will be thrown if target is an unrecognized type
     */
    private findElement;
    /**
     * Finds a collection of Element instances from target using querySelectorAll
     * @private
     * @returns (Element[]) an array of Element instances
     * @throws TypeError will be thrown if target is an unrecognized type
     */
    private findElements;
    /**
     * @private
     */
    private get targetDescription();
}
