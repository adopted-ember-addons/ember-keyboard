"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const broccoli_plugin_1 = __importDefault(require("broccoli-plugin"));
/*
  Takes some named broccoli trees and/or lists of broccoli trees and gives you
  the resulting inputPaths once those trees are built. Example:

    import { Node } from 'broccoli-node-api';;

    interface MyInputs<T> {
      codeFromMyApp: T,
      codeFromMyAddons: T[]
    }

    function(trees: MyInputs<Node>): Node {
      return WaitForTrees(trees, build);
    }

    async function build(paths: MyInputs<string>) {
      // paths.someTree is a string
      // paths.otherTrees is a string[]
    }

*/
class WaitForTrees extends broccoli_plugin_1.default {
    constructor(trees, annotation, buildHook) {
        super(flatTrees(trees), {
            persistentOutput: true,
            needsCache: false,
            annotation: annotation,
            trackInputChanges: true,
        });
        this.trees = trees;
        this.buildHook = buildHook;
    }
    async build(detail) {
        let result = {};
        let changedMap = new Map();
        let inputPathCounter = 0;
        for (let entry of findTrees(this.trees)) {
            if (entry.single) {
                result[entry.name] = this.inputPaths[inputPathCounter];
                let didChange = detail ? detail.changedNodes[inputPathCounter] : true;
                changedMap.set(this.inputPaths[inputPathCounter], didChange);
                inputPathCounter += 1;
            }
            else if (entry.multi) {
                let sliced = this.inputPaths.slice(inputPathCounter, inputPathCounter + entry.multi.length);
                result[entry.name] = sliced.map(slice => {
                    let didChange = detail ? detail.changedNodes[inputPathCounter] : true;
                    changedMap.set(slice, didChange);
                    inputPathCounter++;
                    return slice;
                });
            }
        }
        return this.buildHook(result, changedMap);
    }
}
exports.default = WaitForTrees;
function isTree(x) {
    return x && typeof x.__broccoliGetInfo__ === 'function';
}
function* findTrees(trees) {
    for (let [name, value] of Object.entries(trees)) {
        if (Array.isArray(value)) {
            let stringTrees = value.filter(t => typeof t === 'string');
            if (stringTrees.length > 0) {
                throw new Error(`found strings instead of broccoli trees for ${name}: ${value}`);
            }
            yield { name, multi: value.filter(isTree) };
        }
        else if (isTree(value)) {
            yield { name, single: value };
        }
        else if (typeof value === 'string') {
            throw new Error(`found a string when we expected a broccoli tree for ${name}: ${value}`);
        }
    }
}
function flatTrees(trees) {
    let output = [];
    for (let value of findTrees(trees)) {
        if (value.multi) {
            output = output.concat(value.multi);
        }
        else if (value.single) {
            output.push(value.single);
        }
    }
    return output;
}
//# sourceMappingURL=wait-for-trees.js.map