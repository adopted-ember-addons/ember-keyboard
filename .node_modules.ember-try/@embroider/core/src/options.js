"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionsWithDefaults = void 0;
function optionsWithDefaults(options) {
    let defaults = {
        staticHelpers: false,
        staticComponents: false,
        packageRules: [],
        splitAtRoutes: [],
        splitControllers: false,
        splitRouteClasses: false,
        staticAppPaths: [],
        skipBabel: [],
        pluginHints: [],
    };
    if (options) {
        return Object.assign(defaults, options);
    }
    return defaults;
}
exports.optionsWithDefaults = optionsWithDefaults;
//# sourceMappingURL=options.js.map