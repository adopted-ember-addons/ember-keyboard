"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.maybeAttrs = void 0;
const evaluate_1 = __importDefault(require("./evaluate"));
function maybeAttrs(elementNode, node, builders) {
    let [predicate, ...bareAttrs] = node.params;
    if (!predicate) {
        throw new Error(`macroMaybeAttrs requires at least one argument`);
    }
    let result = evaluate_1.default(predicate);
    if (!result.confident) {
        throw new Error(`first argument to macroMaybeAttrs must be statically analyzable`);
    }
    for (let bareAttr of bareAttrs) {
        if (bareAttr.type !== 'PathExpression') {
            throw new Error(`macroMaybeAttrs found a ${bareAttr.type} where it expected a PathExpression`);
        }
    }
    if (result.value) {
        for (let bareAttr of bareAttrs) {
            elementNode.attributes.push(builders.attr(bareAttr.original, builders.text('')));
        }
        for (let attr of node.hash.pairs) {
            elementNode.attributes.push(builders.attr(attr.key, builders.mustache(attr.value)));
        }
    }
}
exports.maybeAttrs = maybeAttrs;
//# sourceMappingURL=macro-maybe-attrs.js.map