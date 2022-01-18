"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const broccoli_plugin_1 = __importDefault(require("broccoli-plugin"));
function toBroccoliPlugin(packagerClass) {
    class PackagerRunner extends broccoli_plugin_1.default {
        constructor(stage, variants, options) {
            super([stage.tree], {
                persistentOutput: true,
                needsCache: false,
                annotation: packagerClass.annotation,
            });
            this.stage = stage;
            this.variants = variants;
            this.options = options;
        }
        async build() {
            if (!this.packager) {
                let { outputPath, packageCache } = await this.stage.ready();
                // We always register a shared stage3 packageCache so it can be used by
                // things like babel plugins and template compilers.
                if (packageCache) {
                    packageCache.shareAs('embroider-stage3');
                }
                this.packager = new packagerClass(outputPath, this.outputPath, this.variants, msg => console.log(msg), this.options);
            }
            return this.packager.build();
        }
    }
    return PackagerRunner;
}
exports.default = toBroccoliPlugin;
//# sourceMappingURL=to-broccoli-plugin.js.map