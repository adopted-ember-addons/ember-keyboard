"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@babel/types");
const path_1 = require("path");
const template_compiler_1 = require("./template-compiler");
const types_2 = require("@babel/types");
const core_1 = require("@babel/core");
const types_3 = require("@babel/types");
const types_4 = require("@babel/types");
const types_5 = require("@babel/types");
const types_6 = require("@babel/types");
// These are the known names that people are using to import the `hbs` macro
// from. In theory the original plugin lets people customize these names, but
// that is a terrible idea.
const modulePaths = [
    ['htmlbars-inline-precompile', 'default'],
    ['ember-cli-htmlbars-inline-precompile', 'default'],
    ['ember-cli-htmlbars', 'hbs'],
];
function inlineHBSTransform() {
    return {
        visitor: {
            Program: {
                enter(_, state) {
                    state.dependencies = new Map();
                },
                exit(path, state) {
                    if (state.opts.stage === 3) {
                        pruneImports(path);
                    }
                    let counter = 0;
                    for (let dep of state.dependencies.values()) {
                        path.node.body.unshift(amdDefine(dep.runtimeName, counter));
                        path.node.body.unshift(types_3.importDeclaration([types_4.importDefaultSpecifier(types_2.identifier(`a${counter++}`))], types_1.stringLiteral(dep.path)));
                    }
                },
            },
            TaggedTemplateExpression(path, state) {
                for (let [modulePath, identifier] of modulePaths) {
                    if (path.get('tag').referencesImport(modulePath, identifier)) {
                        handleTagged(path, state);
                    }
                }
            },
            CallExpression(path, state) {
                for (let [modulePath, identifier] of modulePaths) {
                    if (path.get('callee').referencesImport(modulePath, identifier)) {
                        handleCalled(path, state);
                    }
                }
            },
        },
    };
}
exports.default = inlineHBSTransform;
inlineHBSTransform._parallelBabel = {
    requireFile: __filename,
};
inlineHBSTransform.baseDir = function () {
    return path_1.join(__dirname, '..');
};
function handleTagged(path, state) {
    if (path.node.quasi.expressions.length) {
        throw path.buildCodeFrameError('placeholders inside a tagged template string are not supported');
    }
    let template = path.node.quasi.quasis.map(quasi => quasi.value.cooked).join('');
    if (state.opts.stage === 1) {
        let compiled = compiler(state).applyTransforms(state.file.opts.filename, template);
        path.get('quasi').replaceWith(types_1.templateLiteral([types_1.templateElement({ raw: compiled, cooked: compiled })], []));
    }
    else {
        let { compiled, dependencies } = compiler(state).precompile(state.file.opts.filename, template);
        for (let dep of dependencies) {
            state.dependencies.set(dep.runtimeName, dep);
        }
        let func = types_2.memberExpression(types_2.memberExpression(types_2.identifier('Ember'), types_2.identifier('HTMLBars')), types_2.identifier('template'));
        path.replaceWith(types_2.callExpression(func, [jsonLiteral(compiled)]));
    }
}
function handleCalled(path, state) {
    if (path.node.arguments.length !== 1) {
        throw path.buildCodeFrameError('hbs accepts exactly one argument');
    }
    let arg = path.node.arguments[0];
    if (!types_1.isStringLiteral(arg)) {
        throw path.buildCodeFrameError('hbs accepts only a string literal argument');
    }
    let template = arg.value;
    if (state.opts.stage === 1) {
        let compiled = compiler(state).applyTransforms(state.file.opts.filename, template);
        path.get('arguments')[0].replaceWith(types_1.stringLiteral(compiled));
    }
    else {
        let { compiled, dependencies } = compiler(state).precompile(state.file.opts.filename, template);
        for (let dep of dependencies) {
            state.dependencies.set(dep.runtimeName, dep);
        }
        let func = types_2.memberExpression(types_2.memberExpression(types_2.identifier('Ember'), types_2.identifier('HTMLBars')), types_2.identifier('template'));
        path.replaceWith(types_2.callExpression(func, [jsonLiteral(compiled)]));
    }
}
function pruneImports(path) {
    if (!path.isProgram()) {
        return;
    }
    for (let topLevelPath of path.get('body')) {
        if (topLevelPath.isImportDeclaration()) {
            let modulePath = topLevelPath.get('source').node.value;
            if (modulePaths.find(p => p[0] === modulePath)) {
                topLevelPath.remove();
            }
        }
    }
}
function jsonLiteral(value) {
    if (typeof value === 'undefined') {
        return types_2.identifier('undefined');
    }
    let ast = core_1.parse(`a(${value})`, {});
    let statement = ast.program.body[0];
    let expression = statement.expression;
    return expression.arguments[0];
}
function compiler(state) {
    if (!state.templateCompiler) {
        state.templateCompiler = new template_compiler_1.TemplateCompiler(state.opts.templateCompiler);
    }
    return state.templateCompiler;
}
function amdDefine(runtimeName, importCounter) {
    return types_5.expressionStatement(types_2.callExpression(types_2.memberExpression(types_2.identifier('window'), types_2.identifier('define')), [
        types_1.stringLiteral(runtimeName),
        types_1.functionExpression(null, [], types_1.blockStatement([types_6.returnStatement(types_2.identifier(`a${importCounter}`))])),
    ]));
}
//# sourceMappingURL=babel-plugin-inline-hbs.js.map