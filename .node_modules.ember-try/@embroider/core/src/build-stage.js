"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const wait_for_trees_1 = __importDefault(require("./wait-for-trees"));
const package_cache_1 = __importDefault(require("./package-cache"));
const typescript_memoize_1 = require("typescript-memoize");
// This is a utility class for defining new Stages. It aids in handling the
// boilerplate required to split your functionality between the
// broccoli-pipeline-construction phase and the actual building phase.
class BuildStage {
    constructor(prevStage, inTrees, annotation, instantiate) {
        this.prevStage = prevStage;
        this.inTrees = inTrees;
        this.annotation = annotation;
        this.instantiate = instantiate;
    }
    get tree() {
        return new wait_for_trees_1.default(this.augment(this.inTrees), this.annotation, async (treePaths) => {
            if (!this.active) {
                let { outputPath, packageCache } = await this.prevStage.ready();
                if (!packageCache) {
                    packageCache = new package_cache_1.default();
                }
                this.outputPath = outputPath;
                this.packageCache = packageCache;
                this.active = await this.instantiate(outputPath, this.prevStage.inputPath, packageCache);
            }
            delete treePaths.__prevStageTree;
            await this.active.build(this.deAugment(treePaths));
            this.deferReady.resolve();
        });
    }
    get inputPath() {
        return this.prevStage.inputPath;
    }
    async ready() {
        await this.deferReady.promise;
        return {
            outputPath: this.outputPath,
            packageCache: this.packageCache,
        };
    }
    get deferReady() {
        let resolve;
        let promise = new Promise(r => (resolve = r));
        return { resolve: resolve, promise };
    }
    augment(inTrees) {
        return Object.assign({ __prevStageTree: this.prevStage.tree }, inTrees);
    }
    deAugment(treePaths) {
        delete treePaths.__prevStageTree;
        return treePaths;
    }
}
__decorate([
    typescript_memoize_1.Memoize()
], BuildStage.prototype, "tree", null);
__decorate([
    typescript_memoize_1.Memoize()
], BuildStage.prototype, "deferReady", null);
exports.default = BuildStage;
//# sourceMappingURL=build-stage.js.map