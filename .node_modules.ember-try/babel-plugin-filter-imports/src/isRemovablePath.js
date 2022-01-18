import * as t from '@babel/types'

const isRemovablePath = path =>
  t.isArrowFunctionExpression(path) ||
  t.isDecorator(path) ||
  t.isExpressionStatement(path) ||
  t.isExportSpecifier(path) ||
  t.isExportNamedDeclaration(path) ||
  t.isReturnStatement(path) ||
  t.isVariableDeclarator(path)

export default isRemovablePath
