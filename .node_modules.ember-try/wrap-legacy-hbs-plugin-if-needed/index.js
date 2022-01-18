"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function wrapLegacyPluginIfNeeded(_plugin) {
    let plugin = _plugin;
    if (_plugin.prototype && _plugin.prototype.transform) {
        const pluginFunc = (env) => {
            let pluginInstantiated = false;
            return {
                name: _plugin.constructor && _plugin.constructor.name,
                visitor: {
                    Program(node) {
                        if (!pluginInstantiated) {
                            pluginInstantiated = true;
                            const plugin = new _plugin(env);
                            plugin.syntax = env.syntax;
                            return plugin.transform(node);
                        }
                    },
                },
            };
        };
        pluginFunc.__raw = _plugin;
        plugin = pluginFunc;
    }
    return plugin;
}
exports.default = wrapLegacyPluginIfNeeded;
