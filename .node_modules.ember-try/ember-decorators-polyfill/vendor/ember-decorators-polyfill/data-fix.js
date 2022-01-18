(function() {
  function isFieldDescriptor(possibleDesc) {
    let [target, key, desc] = possibleDesc;

    return (
      possibleDesc.length === 3 &&
      typeof target === 'object' &&
      target !== null &&
      typeof key === 'string' &&
      ((typeof desc === 'object' &&
        desc !== null &&
        'enumerable' in desc &&
        'configurable' in desc) ||
        desc === undefined) // TS compatibility
    );
  }

  function computedMacroWithOptionalParams(fn) {
    return (...maybeDesc) =>
      (isFieldDescriptor(maybeDesc)
        ? Function.apply.call(fn(), undefined, maybeDesc)
        : Function.apply.call(fn, undefined, maybeDesc))
  }

  let originalRequire = window.require;
  window.require = require = function patchDataDecorators(moduleName) {
    let DS;

    try {
      DS = originalRequire('ember-data').default;
    } catch (e) {
      return originalRequire(moduleName);
    }

    let {
      attr: dataAttr,
      belongsTo: dataBelongsTo,
      hasMany: dataHasMany,
    } = DS;

    let attr = computedMacroWithOptionalParams(dataAttr);
    let belongsTo = computedMacroWithOptionalParams(dataBelongsTo);
    let hasMany = computedMacroWithOptionalParams(dataHasMany);

    DS.attr = attr;
    DS.belongsTo = belongsTo;
    DS.hasMany = hasMany;

    if (window.requirejs.entries['@ember-data/model/index']) {
      let newExports = Object.assign(
        {},
        window.requirejs.entries['@ember-data/model/index'].module.exports,
        { attr, belongsTo, hasMany }
      );

      window.requirejs.entries['@ember-data/model/index'].module.exports = newExports;
    }

    window.require = require = window.requirejs;

    return window.requirejs(moduleName);
  }
})();

