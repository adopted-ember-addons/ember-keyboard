'use strict';

const path = require('path');
const mapping = require('ember-rfc176-data');

function isIgnored(ignore, importPath, exportName) {
  if (Array.isArray(ignore)) {
    return ignore.indexOf(importPath) > -1;
  } else {
    let ignoredExports = ignore[importPath];

    return ignoredExports && ignoredExports.indexOf(exportName) > -1;
  }
}

function isDecorator(moduleName, importName) {
  switch (moduleName) {
    case '@ember/service':
      return importName === 'inject';
    case '@ember/controller':
      return importName === 'inject';
    case '@glimmer/tracking':
      return importName === 'tracked';
    case '@ember/object/compat':
      return importName === 'dependentKeyCompat';
    case '@ember/object':
      return ['action', 'computed'].includes(importName);
    case '@ember/object/computed':
      // only the default import of this module is not a decorator
      return importName !== 'default';
  }
}

module.exports = function (babel) {
  const t = babel.types;

  const TSTypesRequiringModification = [
    'TSAsExpression',
    'TSTypeAssertion',
    'TSNonNullExpression',
  ];
  const isTypescriptNode = (node) =>
    node.type.startsWith('TS') &&
    !TSTypesRequiringModification.includes(node.type);

  // Flips the ember-rfc176-data mapping into an 'import' indexed object, that exposes the
  // default import as well as named imports, e.g. import {foo} from 'bar'
  const reverseMapping = {};
  mapping.forEach((exportDefinition) => {
    const imported = exportDefinition.global;
    const importRoot = exportDefinition.module;
    let importName = exportDefinition.export;

    if (!reverseMapping[importRoot]) {
      reverseMapping[importRoot] = {};
    }

    reverseMapping[importRoot][importName] = imported;
  });

  function getMemberExpressionFor(global) {
    let parts = global.split('.');

    let object = parts.shift();
    let property = parts.shift();

    let memberExpression = t.MemberExpression(
      t.identifier(object),
      t.identifier(property)
    );

    while (parts.length > 0) {
      let property = parts.shift();

      memberExpression = t.MemberExpression(
        memberExpression,
        t.identifier(property)
      );
    }

    return memberExpression;
  }

  return {
    name: 'ember-modules-api-polyfill',
    visitor: {
      ImportDeclaration(path, state) {
        let ignore = (state.opts && state.opts.ignore) || [];
        let node = path.node;
        let declarations = [];
        let removals = [];
        let specifiers = path.get('specifiers');
        let importPath = node.source.value;

        if (importPath === 'ember') {
          // For `import Ember from 'ember'`, we can just remove the import
          // and change `Ember` usage to to global Ember object.
          let specifierPath = specifiers.find((specifierPath) => {
            if (specifierPath.isImportDefaultSpecifier()) {
              return true;
            }
            // TODO: Use the nice Babel way to throw
            throw new Error(`Unexpected non-default import from 'ember'`);
          });

          if (specifierPath) {
            let local = specifierPath.node.local;
            if (local.name !== 'Ember') {
              path.scope.rename(local.name, 'Ember');
            }
            removals.push(specifierPath);
          } else {
            // import 'ember';
            path.remove();
          }
        }

        // This is the mapping to use for the import statement
        const mapping = reverseMapping[importPath];

        // Only walk specifiers if this is a module we have a mapping for
        if (mapping) {
          // Iterate all the specifiers and attempt to locate their mapping
          specifiers.forEach((specifierPath) => {
            let specifier = specifierPath.node;
            let importName;

            // imported is the name of the module being imported, e.g. import foo from bar
            const imported = specifier.imported;

            // local is the name of the module in the current scope, this is usually the same
            // as the imported value, unless the module is aliased
            const local = specifier.local;

            // We only care about these 2 specifiers
            if (
              specifier.type !== 'ImportDefaultSpecifier' &&
              specifier.type !== 'ImportSpecifier'
            ) {
              if (specifier.type === 'ImportNamespaceSpecifier') {
                throw new Error(
                  `Using \`import * as ${specifier.local.name} from '${importPath}'\` is not supported.`
                );
              }
              return;
            }

            // Determine the import name, either default or named
            if (specifier.type === 'ImportDefaultSpecifier') {
              importName = 'default';
            } else {
              importName = imported.name;
            }

            if (isIgnored(ignore, importPath, importName)) {
              return;
            }

            // Extract the global mapping
            const global = mapping[importName];

            // Ensure the module being imported exists
            if (!global) {
              throw path.buildCodeFrameError(
                `${importPath} does not have a ${importName} export`
              );
            }

            removals.push(specifierPath);

            if (
              path.scope.bindings[local.name].referencePaths.find(
                (rp) => rp.parent.type === 'ExportSpecifier'
              )
            ) {
              // not safe to use path.scope.rename directly
              declarations.push(
                t.variableDeclaration('var', [
                  t.variableDeclarator(
                    t.identifier(local.name),
                    t.identifier(global)
                  ),
                ])
              );
            } else {
              let binding = path.scope.getBinding(local.name);
              let referencePaths = binding.referencePaths;

              if (isDecorator(importPath, importName)) {
                // tldr; decorator paths are not always included in `path.scope.getBinding(local.name)`
                //
                // In some circumstances, decorators are not included in the
                // reference paths for a local binding when the decorator
                // identifier name is also defined _within_ the method being
                // decorated. This is likely a bug in Babel, that should be
                // reported and fixed.
                //
                // in order to fix that, we have to manually traverse to gather
                // the decorator references **before** the
                // @babel/plugin-proposal-decorators runs (because it removes
                // them)
                path.parentPath.traverse({
                  Decorator(decoratorPath) {
                    if (
                      decoratorPath.node.expression.type === 'Identifier' &&
                      decoratorPath.node.expression.name === local.name
                    ) {
                      referencePaths.push(decoratorPath.get('expression'));
                    }
                  },
                });
              }

              // Replace the occurences of the imported name with the global name.
              referencePaths.forEach((referencePath) => {
                if (!isTypescriptNode(referencePath.parentPath)) {
                  referencePath.replaceWith(getMemberExpressionFor(global));
                }
              });
            }
          });
        }

        if (removals.length > 0 || mapping) {
          if (removals.length === node.specifiers.length) {
            path.replaceWithMultiple(declarations);
          } else {
            removals.forEach((specifierPath) => specifierPath.remove());
            path.insertAfter(declarations);
          }
        }
      },

      ExportNamedDeclaration(path, state) {
        let ignore = (state.opts && state.opts.ignore) || [];
        let node = path.node;
        if (!node.source) {
          return;
        }

        let replacements = [];
        let removals = [];
        let specifiers = path.get('specifiers');
        let importPath = node.source.value;

        // This is the mapping to use for the import statement
        const mapping = reverseMapping[importPath];

        // Only walk specifiers if this is a module we have a mapping for
        if (mapping) {
          // Iterate all the specifiers and attempt to locate their mapping
          specifiers.forEach((specifierPath) => {
            let specifier = specifierPath.node;

            // exported is the name of the module being export,
            // e.g. `foo` in `export { computed as foo } from '@ember/object';`
            const exported = specifier.exported;

            // local is the original name of the module, this is usually the same
            // as the exported value, unless the module is aliased
            const local = specifier.local;

            // We only care about the ExportSpecifier
            if (specifier.type !== 'ExportSpecifier') {
              return;
            }

            // Determine the import name, either default or named
            let importName = local.name;

            if (isIgnored(ignore, importPath, importName)) {
              return;
            }

            // Extract the global mapping
            const global = mapping[importName];

            // Ensure the module being imported exists
            if (!global) {
              throw path.buildCodeFrameError(
                `${importPath} does not have a ${importName} export`
              );
            }

            removals.push(specifierPath);

            let declaration;
            const globalAsIdentifier = t.identifier(global);
            if (exported.name === 'default') {
              declaration = t.exportDefaultDeclaration(globalAsIdentifier);
            } else {
              // Replace the node with a new `var name = Ember.something`
              declaration = t.exportNamedDeclaration(
                t.variableDeclaration('var', [
                  t.variableDeclarator(exported, globalAsIdentifier),
                ]),
                [],
                null
              );
            }
            replacements.push(declaration);
          });
        }

        if (removals.length > 0 && removals.length === node.specifiers.length) {
          path.replaceWithMultiple(replacements);
        } else if (replacements.length > 0) {
          removals.forEach((specifierPath) => specifierPath.remove());
          path.insertAfter(replacements);
        }
      },

      ExportAllDeclaration(path) {
        let node = path.node;
        let importPath = node.source.value;

        // This is the mapping to use for the import statement
        const mapping = reverseMapping[importPath];

        // Only walk specifiers if this is a module we have a mapping for
        if (mapping) {
          throw path.buildCodeFrameError(
            `Wildcard exports from ${importPath} are currently not possible`
          );
        }
      },
    },
  };
};

// Provide the path to the package's base directory for caching with broccoli
// Ref: https://github.com/babel/broccoli-babel-transpiler#caching
module.exports.baseDir = () => path.resolve(__dirname, '..');
