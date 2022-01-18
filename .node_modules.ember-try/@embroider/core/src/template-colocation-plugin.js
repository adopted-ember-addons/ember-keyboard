"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const types_1 = require("@babel/types");
const path_1 = require("path");
const paths_1 = require("./paths");
const package_cache_1 = __importDefault(require("./package-cache"));
const packageCache = package_cache_1.default.shared('embroider-stage3');
function unusedNameLike(name, path) {
    let candidate = name;
    let counter = 0;
    while (path.scope.getBinding(candidate)) {
        candidate = `${name}${counter++}`;
    }
    return candidate;
}
function setComponentTemplate() {
    return types_1.memberExpression(types_1.identifier('Ember'), types_1.identifier('_setComponentTemplate'));
}
function main() {
    return {
        visitor: {
            Program: {
                enter(path, state) {
                    let filename = path.hub.file.opts.filename;
                    let owningPackage = packageCache.ownerOfFile(filename);
                    if (!owningPackage || !owningPackage.isV2Ember() || !owningPackage.meta['auto-upgraded']) {
                        return;
                    }
                    let hbsFilename = filename.replace(/\.\w{1,3}$/, '') + '.hbs';
                    if (fs_1.existsSync(hbsFilename)) {
                        state.colocatedTemplate = hbsFilename;
                    }
                },
                exit(path, state) {
                    if (!state.colocatedTemplate) {
                        return;
                    }
                    if (state.importTemplateAs) {
                        path.node.body.unshift(types_1.importDeclaration([types_1.importDefaultSpecifier(types_1.identifier(state.importTemplateAs))], types_1.stringLiteral(paths_1.explicitRelative(path_1.dirname(state.colocatedTemplate), state.colocatedTemplate))));
                    }
                    if (state.mustImportComponent) {
                        state.associateWithName = unusedNameLike('COMPONENT', path);
                        let specifier;
                        if (state.mustImportComponent.name === 'default') {
                            specifier = types_1.importDefaultSpecifier(types_1.identifier(state.associateWithName));
                        }
                        else {
                            specifier = types_1.importSpecifier(types_1.identifier(state.associateWithName), types_1.identifier(state.mustImportComponent.name));
                        }
                        path.node.body.push(types_1.importDeclaration([specifier], types_1.stringLiteral(state.mustImportComponent.source)));
                    }
                    if (state.associateWithName && state.importTemplateAs) {
                        path.node.body.push(types_1.expressionStatement(types_1.callExpression(setComponentTemplate(), [
                            types_1.identifier(state.importTemplateAs),
                            types_1.identifier(state.associateWithName),
                        ])));
                    }
                },
            },
            ExportDefaultDeclaration(path, state) {
                if (!state.colocatedTemplate) {
                    return;
                }
                let declaration = path.get('declaration').node;
                if (types_1.isClassDeclaration(declaration)) {
                    state.importTemplateAs = unusedNameLike('TEMPLATE', path);
                    if (declaration.id != null) {
                        state.associateWithName = declaration.id.name;
                    }
                    else {
                        path.node.declaration = types_1.callExpression(setComponentTemplate(), [
                            types_1.identifier(state.importTemplateAs),
                            types_1.classExpression(null, declaration.superClass, declaration.body, declaration.decorators),
                        ]);
                    }
                }
                else if (types_1.isFunctionDeclaration(declaration)) {
                    state.importTemplateAs = unusedNameLike('TEMPLATE', path);
                    if (declaration.id != null) {
                        state.associateWithName = declaration.id.name;
                    }
                    else {
                        path.node.declaration = types_1.callExpression(setComponentTemplate(), [
                            types_1.identifier(state.importTemplateAs),
                            types_1.functionExpression(null, declaration.params, declaration.body, declaration.generator, declaration.async),
                        ]);
                    }
                }
                else if (types_1.isTSDeclareFunction(declaration)) {
                    // we don't rewrite this
                }
                else {
                    state.importTemplateAs = unusedNameLike('TEMPLATE', path);
                    path.node.declaration = types_1.callExpression(setComponentTemplate(), [
                        types_1.identifier(state.importTemplateAs),
                        declaration,
                    ]);
                }
            },
            ExportNamedDeclaration(path, state) {
                if (!state.colocatedTemplate) {
                    return;
                }
                let { node } = path;
                for (let specifier of path.node.specifiers) {
                    if (types_1.isExportDefaultSpecifier(specifier)) {
                    }
                    else if (types_1.isExportSpecifier(specifier)) {
                        const name = specifier.exported.type === 'Identifier' ? specifier.exported.name : specifier.exported.value;
                        if (name === 'default') {
                            state.importTemplateAs = unusedNameLike('TEMPLATE', path);
                            if (node.source) {
                                // our default export is a reexport from elsewhere. We will
                                // synthesize a new import for it so we can get a local handle
                                // on it
                                state.mustImportComponent = { source: node.source.value, name: specifier.local.name };
                            }
                            else {
                                // our default export is one of our local names
                                state.associateWithName = specifier.local.name;
                            }
                        }
                    }
                }
            },
        },
    };
}
exports.default = main;
//# sourceMappingURL=template-colocation-plugin.js.map