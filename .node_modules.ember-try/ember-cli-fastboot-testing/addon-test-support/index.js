import { fetch } from 'whatwg-fetch';
import { setupContext, teardownContext } from '@ember/test-helpers';
import { mockServer } from './-private/mock-server';
import JSONfn from 'json-fn';

export function setup(hooks) {
  hooks.beforeEach(async function() {
    await mockServer.cleanUp();
    return setupContext(this);
  });

  hooks.afterEach(async function() {
    await mockServer.cleanUp();
    return teardownContext(this);
  });
}

/**
 * TODO
 *
 * @example
 * ```
 * // TODO
 * ```
 *
 * @param {string} url the URL path to render, like `/photos/1`
 * @param {Object} options
 * @param {string} [options.html] the HTML document to insert the rendered app into
 * @param {Object} [options.metadata] Per request specific data used in the app.
 * @param {Boolean} [options.shouldRender] whether the app should do rendering or not. If set to false, it puts the app in routing-only.
 * @param {Boolean} [options.disableShoebox] whether we should send the API data in the shoebox. If set to false, it will not send the API data used for rendering the app on server side in the index.html.
 * @param {Integer} [options.destroyAppInstanceInMs] whether to destroy the instance in the given number of ms. This is a failure mechanism to not wedge the Node process (See: https://github.com/ember-fastboot/fastboot/issues/90)
 * @param {ClientRequest} [options.request] Node's `ClientRequest` object is provided to the Ember application via the FastBoot service.
 * @param {ClientResponse} [options.response] Node's `ServerResponse` object is provided to the Ember application via the FastBoot service.
 * @returns {Promise<Result>} result
 */
export async function fastboot(url, options = {}) {
  let response = await fetchFromEmberCli(url, options);
  let result = await response.json();

  let body = result.err ?
    formatError(result.err) :
    extractBody(result.html);

  result.htmlDocument = parseHtml(result.html)
  result.body = body;

  return result;
}

/**
 * TODO
 *
 * @example
 * ```
 * // TODO
 * ```
 *
 * @param {string} url the URL path to render, like `/photos/1`
 * @param {Object} options
 * @param {string} [options.html] the HTML document to insert the rendered app into
 * @param {Object} [options.metadata] Per request specific data used in the app.
 * @param {Boolean} [options.shouldRender] whether the app should do rendering or not. If set to false, it puts the app in routing-only.
 * @param {Boolean} [options.disableShoebox] whether we should send the API data in the shoebox. If set to false, it will not send the API data used for rendering the app on server side in the index.html.
 * @param {Integer} [options.destroyAppInstanceInMs] whether to destroy the instance in the given number of ms. This is a failure mechanism to not wedge the Node process (See: https://github.com/ember-fastboot/fastboot/issues/90)
 * @param {ClientRequest} [options.request] Node's `ClientRequest` object is provided to the Ember application via the FastBoot service.
 * @param {ClientResponse} [options.response] Node's `ServerResponse` object is provided to the Ember application via the FastBoot service.
 * @returns {Promise<Result>} result
 */
export async function visit(url, options = {}) {
  let result = await fastboot(url, options);

  document.querySelector('#ember-testing').innerHTML = result.body;

  return result;
}

export { mockServer };

// private

let fetchFromEmberCli = async function(url, options) {
  let response;
  let error;

  try {
    response = await fetch('/__fastboot-testing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        options: JSONfn.stringify(options),
      }),
    });
  } catch (e) {
    if (e.message && e.message.match(/^Mirage:/)) {
      error = `Ember CLI FastBoot Testing: It looks like Mirage is intercepting ember-cli-fastboot-testing's attempt to render ${url}. Please disable Mirage when running FastBoot tests.`;
    } else {
      error = `Ember CLI FastBoot Testing: We were unable to render ${url}. Is your test suite blocking or intercepting HTTP requests? Error: ${e.message ? e.message : e}.`
    }
  }

  if (response && response.headers && response.headers.get && response.headers.get('x-fastboot-testing') !== 'true') {
    error = `Ember CLI FastBoot Testing: We were unable to render ${url}. Is your test suite blocking or intercepting HTTP requests?`;
  }

  if (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    throw new Error(error);
  }

  return response;
};

let parseHtml = function(str) {
  let parser = new DOMParser();
  return parser.parseFromString(str, "text/html");
}

let extractBody = function(html) {
  let start = '<script type="x/boundary" id="fastboot-body-start"></script>';
  let end = '<script type="x/boundary" id="fastboot-body-end"></script>';

  let startPosition = html.indexOf(start);
  let endPosition = html.indexOf(end);

  if (!startPosition || !endPosition) {
    throw "Could not find fastboot boundary";
  }

  let startAt = startPosition + start.length;
  let endAt = endPosition - startAt;

  return html.substr(startAt, endAt);
}

let formatError = function(err) {
  return `<pre>${err.stack}</pre>`;
};
