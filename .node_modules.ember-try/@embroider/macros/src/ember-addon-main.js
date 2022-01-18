"use strict";
const path_1 = require("path");
const node_1 = require("./node");
module.exports = {
    name: '@embroider/macros',
    included(parent) {
        this._super.included.apply(this, arguments);
        this.options.babel = { plugins: [] };
        let parentOptions = (parent.options = parent.options || {});
        let ownOptions = (parentOptions['@embroider/macros'] = parentOptions['@embroider/macros'] || {});
        const appInstance = this._findHost();
        this.setMacrosConfig(node_1.MacrosConfig.for(appInstance));
        // if parent is an addon it has root. If it's an app it has project.root.
        let source = parent.root || parent.project.root;
        if (ownOptions.setOwnConfig) {
            node_1.MacrosConfig.for(appInstance).setOwnConfig(source, ownOptions.setOwnConfig);
        }
        if (ownOptions.setConfig) {
            for (let [packageName, config] of Object.entries(ownOptions.setConfig)) {
                node_1.MacrosConfig.for(appInstance).setConfig(source, packageName, config);
            }
        }
        if (appInstance.env !== 'production') {
            let macros = node_1.MacrosConfig.for(appInstance);
            // tell the macros where our app is
            macros.enableAppDevelopment(path_1.join(appInstance.project.configPath(), '..', '..'));
            // also tell them our root project is under development. This can be
            // different, in the case where this is an addon and the app is the dummy
            // app.
            macros.enablePackageDevelopment(appInstance.project.root);
            // keep the macros in runtime mode for development & testing
            macros.enableRuntimeMode();
        }
        // add our babel plugin to our parent's babel
        this.installBabelPlugin(parent);
        // and to our own babel, because we may need to inline runtime config into
        // our source code
        this.installBabelPlugin(this);
        appInstance.import('vendor/embroider-macros-test-support.js', { type: 'test' });
        // When we're used inside the traditional ember-cli build pipeline without
        // Embroider, we unfortunately need to hook into here uncleanly because we
        // need to delineate the point in time after which writing macro config is
        // forbidden and consuming it becomes allowed. There's no existing hook with
        // that timing.
        const originalToTree = appInstance.toTree;
        appInstance.toTree = function () {
            node_1.MacrosConfig.for(appInstance).finalize();
            return originalToTree.apply(appInstance, arguments);
        };
    },
    // Other addons are allowed to call this. It's needed if an addon needs to
    // emit code containing macros into that addon's parent (via a babel plugin,
    // for exmple). This is only an issue in classic builds, under embroider all
    // babel plugins should be thought of as *language extensions* that are
    // available everywhere, we don't scope them so narrowly so this probably
    // doesn't come up.
    installBabelPlugin(appOrAddonInstance) {
        let babelOptions = (appOrAddonInstance.options.babel = appOrAddonInstance.options.babel || {});
        let babelPlugins = (babelOptions.plugins = babelOptions.plugins || []);
        if (!babelPlugins.some(node_1.isEmbroiderMacrosPlugin)) {
            let appInstance = this._findHost();
            let source = appOrAddonInstance.root || appOrAddonInstance.project.root;
            babelPlugins.unshift(node_1.MacrosConfig.for(appInstance).babelPluginConfig(source));
        }
    },
    setupPreprocessorRegistry(type, registry) {
        if (type === 'parent') {
            // the htmlbars-ast-plugins are split into two parts because order is
            // important. Weirdly, they appear to run in the reverse order that you
            // register them here.
            //
            // MacrosConfig.astPlugins is static because in classic ember-cli, at this
            // point there's not yet an appInstance, so we defer getting it and
            // calling setConfig until our included hook.
            let { plugins, setConfig } = node_1.MacrosConfig.astPlugins(this.parent.root);
            this.setMacrosConfig = setConfig;
            plugins.forEach((plugin, index) => {
                registry.add('htmlbars-ast-plugin', {
                    name: `@embroider/macros/${index}`,
                    plugin,
                    baseDir() {
                        return path_1.join(__dirname, '..');
                    },
                });
            });
        }
    },
    options: {},
};
//# sourceMappingURL=ember-addon-main.js.map