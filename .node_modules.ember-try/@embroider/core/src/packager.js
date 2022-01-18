"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyVariantToTemplateCompiler = exports.applyVariantToBabelConfig = void 0;
function applyVariantToBabelConfig(variant, babelConfig) {
    if (variant.runtime === 'fastboot') {
        babelConfig = Object.assign({}, babelConfig);
        if (babelConfig.plugins) {
            babelConfig.plugins = babelConfig.plugins.slice();
        }
        else {
            babelConfig.plugins = [];
        }
        let macroPlugin = babelConfig.plugins.find((p) => Array.isArray(p) && p[1] && p[1].embroiderMacrosConfigMarker);
        if (macroPlugin) {
            macroPlugin[1].globalConfig.fastboot = { isRunning: true };
        }
    }
    return babelConfig;
}
exports.applyVariantToBabelConfig = applyVariantToBabelConfig;
function applyVariantToTemplateCompiler(_variant, templateCompiler) {
    // TODO: we don't actually consume the variant in the template macros yet, but
    // Packagers must call this function anyway because we will.
    return templateCompiler;
}
exports.applyVariantToTemplateCompiler = applyVariantToTemplateCompiler;
//# sourceMappingURL=packager.js.map