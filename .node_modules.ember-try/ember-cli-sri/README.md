# Ember-cli-sri
[![build status](https://secure.travis-ci.org/jonathanKingston/ember-cli-sri.svg)](http://travis-ci.org/jonathanKingston/ember-cli-sri)
[![npm status](http://img.shields.io/npm/v/ember-cli-sri.svg)](https://www.npmjs.org/package/ember-cli-sri)
[![dependency status](https://david-dm.org/jonathanKingston/ember-cli-sri.svg)](https://david-dm.org/jonathanKingston/ember-cli-sri)

## What is it
This plugin is used to generate [Subresource Integrity (SRI)](http://www.w3.org/TR/SRI/) hashes for ember applications.
Subresource integrity is a security concept used to check JavaScript and stylesheets are loaded with the correct content when using a CDN.

## Why
The reason to add this to your application is to protect against poisoned CDNs breaking JavaScript or CSS subresources.

- [JavaScript DDoS prevention](https://blog.cloudflare.com/an-introduction-to-javascript-based-ddos/)
  - The latest [GitHub DDoS attack](http://googleonlinesecurity.blogspot.co.uk/2015/04/a-javascript-based-ddos-attack-as-seen.html)
- Protection against corrupted code on less trusted servers

## Installation

* `ember install ember-cli-sri`

## Configure

In `Brocfile.js` or `ember-cli-build.js`:
```js
var app = new EmberApp({
});
```

- Without fingerprinting Ember will default to using relative URLs
- All relative paths will be given an integrity attribute which will make compliant browsers check content matches

Or:
```js
var app = new EmberApp({
  SRI: {
    crossorigin: 'anonymous'
  },
  fingerprint: {
    prepend: 'https://subdomain.cloudfront.net/'
  }
});
```

- If your applications origin is different to where your subresources load from you will need to use CORS
- Your subresources will need to be served with CORS headers
- You will need to specify `SRI.crossorigin`

Or:
```js
var app = new EmberApp({
  origin: 'https://subdomain.cloudfront.net/',
  fingerprint: {
    prepend: 'https://subdomain.cloudfront.net/'
  }
});
```

- If you like absolute URLs in your HTML then let the addon know by specifying a `origin` attribute

### Options

- **origin** - set to the URL the Ember app is served from (Example: https://example.com)
- **SRI**
  - **crossorigin** - adds a crossorigin attribute to script and link elements
      - This is **required** for CORS resources, values are:
          - `use-credentials`
          - `anonymous`
  - **runsIn** - default: ['production', 'test']
  - **enabled** - default: true
  - **paranoiaCheck** - default: false
  - **fingerprintCheck** - default: false
- **fingerprint**
  - **prepend** - resources with a full path will only get an applied integrity if the md5 checksum passes

## Example output

```html
<script src="https://example.com/thing-5e1978f9cfa158d9841d7b6d8a4e5c57.js" integrity="sha256-oFeuE/P+XJMjkMS5pAPudQOMGJQ323nQt+DQ+9zbdAg= sha512-+EXjzt0I7g6BjvqqjkkboGyRlFSfIuyzY2SQ43HQKZBrHsjmRzEdjSHhiDzVs30nXL9H0tKw6WbMPc6RfzUumQ==" crossorigin="anonymous" /></script>
<script src="https://example.com/thing-5e1978f9cfa158d9841d7b6d8a4e5c57.js" crossorigin="use-credentials"  integrity="sha256-oFeuE/P+XJMjkMS5pAPudQOMGJQ323nQt+DQ+9zbdAg= sha512-+EXjzt0I7g6BjvqqjkkboGyRlFSfIuyzY2SQ43HQKZBrHsjmRzEdjSHhiDzVs30nXL9H0tKw6WbMPc6RfzUumQ=="/></script>
<script src="unicode-chars.js" integrity="sha256-TH5eRuwfOSKZE0EKVF4WZ6gVQ/zUch4CZE2knqpS4MU= sha512-eANuTl8NOQEa4/zm44zxX6g7ffwf6NXftA2sv4ZiQURnJsfJkUnYP8XpN2XVVZee4SjB32i28WM6trs9HVgQmA=="/></script>
```

## Fail safe

This addon should fail safely at all times so resources matching `https?` need:

- Asset URL needs to start with `fingerprint.prepend`
- Asset must use fingerprinting with md5
- Asset must match md5 sum to what is in the filesystem
- An `SRI.crossorigin` attribute must be set or a matching `origin` to `fingerprint.prepend`

If the config is not set correctly it should result in just a lack of SRI protection, which is better than a broken website.

Please file bugs if you find a case when the config doesn't 'fail safe', is not clear or results in a broken page.

## Gotchas

- If your Ember application is **NOT** being loaded on the same origin as in `fingerprint.prepend`:
  - The `fingerprint.prepend` domain will need to be serving [CORS Headers](http://www.w3.org/TR/cors/)

- If your Ember application **is** being loaded on the same origin as in `fingerprint.prepend`:
  - Setting the crossorigin attribute isn't advised unless origin is serving [CORS Headers](http://www.w3.org/TR/cors/)

- In code that uses SRI, you **MUST NOT** tamper with the built output JavaScript files as code will not load.

## Crossorigin attribute

When the request doesn't match Same Origin Policy the [crossorigin attribute](https://html.spec.whatwg.org/multipage/infrastructure.html#cors-settings-attribute) **MUST** be present for the integrity of the file to be checked.
With an integrity set on an external origin and a missing crossorigin the browser will choose to 'fail-open' which means it will load the resource as if the integrity attribute was not set.

Values:

- **anonymous** - A cross-origin request (i.e., with Origin: HTTP header) is performed. But no credentials are sent (i.e., no cookie, no X.509 certificate, and no HTTP Basic authentication is sent). If the server does not give credentials to the origin site (by not setting the Access-Control-Allow-Origin: HTTP header), the resource will be tainted and its usage restricted.
- **use-credentials** - A cross-origin request (i.e., with Origin: HTTP header) performed with credentials (i.e., a cookie, a certificate, and HTTP Basic authentication is performed). If the server does not give credentials to the origin site (through Access-Control-Allow-Credentials: HTTP header), the resource will be tainted and its usage restricted.

## 'Fail-open' vs 'Fail-close'

- The current implementation in Chrome 'fails-open' resources that don't set the correct `crossorigin` attribute, this will be changed to 'fail-close' which is simpler to debug.
- Browsers will still however 'fail-open' on cross origin resources that don't match the integrity attribute but don't send the correct CORS headers.
  - This is because an attacker could check the integrity of authenticated only files or files behind a firewall.
- Browsers that don't support integrity checking will fail-open so it is a safe property to use if configured correctly.

### 'paranoiaCheck'

There was an encoding issue based on certain characters when using Chrome, the fix for which [landed](https://code.google.com/p/chromium/issues/detail?id=527286) in Chrome 46.
This check fails if there is any non ASCII characters. On failure the file won't have an integrity attribute added.
Currently, it defaults to false (i.e. this check is disabled). You can reenable it if you wish to remain compatible with
versions of Chrome &lt; 46.

### 'fingerprintCheck'

If you are fingerprinting your assets and/or prepending a URL (e.g. to your static web server or CDN), you will likely want
to disable this check. Otherwise, if your assets include other assets, they will fail the check and the file won't have an
integrity attribute added.
Currently, it defaults to false (i.e. this check is disabled). You can reenable it for a little extra confidence that the
correct files are being hashed, but only if you are not fingerprinting or prepending your assets and have no plans to in the
future.

## Browser support

- Chrome 46
- Firefox 43

Notes:
- Please verify Ember applications in supporting browsers, paying close attention to console messages
- No known formal objections to the specification

## Running Tests

* `npm test`

