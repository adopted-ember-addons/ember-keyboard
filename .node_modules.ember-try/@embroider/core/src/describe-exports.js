"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.describeExports = void 0;
const core_1 = require("@babel/core");
const traverse_1 = __importDefault(require("@babel/traverse"));
const types_1 = require("@babel/types");
const assert_never_1 = __importDefault(require("assert-never"));
function describeExports(code, babelParserConfig) {
    let ast = core_1.parse(code, babelParserConfig);
    if (!ast || ast.type !== 'File') {
        throw new Error(`bug in embroider/core describe-exports`);
    }
    let names = new Set();
    let hasDefaultExport = false;
    traverse_1.default(ast, {
        ExportNamedDeclaration(path) {
            for (let spec of path.node.specifiers) {
                switch (spec.type) {
                    case 'ExportSpecifier':
                    case 'ExportNamespaceSpecifier':
                        const name = spec.exported.type === 'Identifier' ? spec.exported.name : spec.exported.value;
                        if (name === 'default') {
                            hasDefaultExport = true;
                        }
                        else {
                            names.add(name);
                        }
                        break;
                    case 'ExportDefaultSpecifier':
                        // this is in the types but was never standardized
                        break;
                    default:
                        assert_never_1.default(spec);
                }
            }
            if (types_1.isVariableDeclaration(path.node.declaration)) {
                for (let dec of path.node.declaration.declarations) {
                    if (types_1.isIdentifier(dec.id)) {
                        names.add(dec.id.name);
                    }
                }
            }
        },
        ExportDefaultDeclaration(_path) {
            hasDefaultExport = true;
        },
    });
    return { names, hasDefaultExport };
}
exports.describeExports = describeExports;
//# sourceMappingURL=describe-exports.js.map