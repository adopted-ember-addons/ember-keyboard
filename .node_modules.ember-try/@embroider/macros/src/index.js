"use strict";
/* Macro Type Signatures */
Object.defineProperty(exports, "__esModule", { value: true });
exports.moduleExists = exports.failBuild = exports.isTesting = exports.isDevelopingApp = exports.getGlobalConfig = exports.getOwnConfig = exports.getConfig = exports.importSync = exports.each = exports.macroCondition = exports.dependencySatisfies = void 0;
/*
  CAUTION: this code is not necessarily what you are actually running. In
  general, the macros are implemented at build time using babel, and so calls to
  these functions get compiled away before they ever run. However, this code is
  here because it provides types to typescript users of the macros.

  Some macros also have runtime implementations that are useful in development
  mode, in addition to their build-time implementations in babel. You can find
  the runtime implementations in runtime.ts.

  Having a runtime mode lets us do things like produce a single build in
  development that works for both fastboot and browser, using the macros to
  switch between modes. For production, you would switch to the build-time macro
  implementation to get two optimized builds instead.
*/
function dependencySatisfies(packageName, semverRange) {
    throw new Oops(packageName, semverRange);
}
exports.dependencySatisfies = dependencySatisfies;
function macroCondition(predicate) {
    throw new Oops(predicate);
}
exports.macroCondition = macroCondition;
function each(array) {
    throw new Oops(array);
}
exports.each = each;
// We would prefer to write:
//   export function importSync<T extends string>(specifier: T): typeof import(T) {
// but TS doesn't seem to support that at present.
function importSync(specifier) {
    throw new Oops(specifier);
}
exports.importSync = importSync;
function getConfig(packageName) {
    throw new Oops(packageName);
}
exports.getConfig = getConfig;
function getOwnConfig() {
    throw new Oops();
}
exports.getOwnConfig = getOwnConfig;
function getGlobalConfig() {
    throw new Oops();
}
exports.getGlobalConfig = getGlobalConfig;
function isDevelopingApp() {
    throw new Oops();
}
exports.isDevelopingApp = isDevelopingApp;
function isTesting() {
    throw new Oops();
}
exports.isTesting = isTesting;
function failBuild(message) {
    throw new Oops(message);
}
exports.failBuild = failBuild;
function moduleExists(packageName) {
    throw new Oops(packageName);
}
exports.moduleExists = moduleExists;
class Oops extends Error {
    constructor(...params) {
        super(`this method is really implemented at compile time via a babel plugin. If you're seeing this exception, something went wrong`);
        this.params = params;
    }
}
//# sourceMappingURL=index.js.map