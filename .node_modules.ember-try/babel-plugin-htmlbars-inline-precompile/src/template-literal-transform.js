const filePath = require('path');
const { registerRefs } = require('./util');

module.exports.replaceTemplateLiteralProposal = function (t, path, state, compiled, options) {
  let version = options.useTemplateLiteralProposalSemantics;

  if (typeof version !== 'number' || version !== 1) {
    throw path.buildCodeFrameError(
      'Passed an invalid version for useTemplateLiteralProposalSemantics. This option must be assign a version number. The current valid version numbers are: 1'
    );
  }

  let { parentPath } = path;
  let filename = filePath.parse(state.file.opts.filename).name;

  if (parentPath.node.type === 'ClassProperty') {
    if (parentPath.node.static !== true) {
      throw path.buildCodeFrameError(
        `Attempted to use \`${options.originalName}\` with a non-static class field. Templates declared with this helper must be assigned to the \`static template\` class field`
      );
    }

    if (parentPath.node.key.name !== 'template') {
      throw path.buildCodeFrameError(
        `Attempted to use \`${options.originalName}\` with the ${parentPath.node.key.name} class property. Templates declared with this helper must be assigned to the \`static template\` class field`
      );
    }

    let classPath = parentPath.parentPath.parentPath;

    if (classPath.node.type === 'ClassDeclaration') {
      registerRefs(
        classPath.insertAfter(
          t.expressionStatement(
            t.callExpression(state.ensureImport('setComponentTemplate', '@ember/component'), [
              compiled,
              classPath.node.id,
            ])
          )
        ),
        (newPath) => [
          newPath.get('expression.callee'),
          newPath.get('expression.arguments.0.callee'),
        ]
      );
    } else {
      registerRefs(
        classPath.replaceWith(
          t.expressionStatement(
            t.callExpression(state.ensureImport('setComponentTemplate', '@ember/component'), [
              compiled,
              classPath.node,
            ])
          )
        ),
        (newPath) => [
          newPath.parentPath.get('callee'),
          newPath.parentPath.get('arguments.0.callee'),
        ]
      );
    }

    parentPath.remove();
  } else {
    let varId = parentPath.node.id || path.scope.generateUidIdentifier(filename);

    registerRefs(
      path.replaceWith(
        t.callExpression(state.ensureImport('setComponentTemplate', '@ember/component'), [
          compiled,
          t.callExpression(state.ensureImport('default', '@ember/component/template-only'), [
            t.stringLiteral(filename),
            t.stringLiteral(varId.name),
          ]),
        ])
      ),
      (newPath) => [
        newPath.get('callee'),
        newPath.get('arguments.0.callee'),
        newPath.get('arguments.1.callee'),
      ]
    );
  }
};
