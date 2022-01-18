import * as t from '@babel/types'
import _ from 'lodash'

import findReferenceRemovalPath from './findReferenceRemovalPath'
import removeExportSpecifier from './removeExportSpecifier'

const removeReferences = (path, specifier) => {
  if (!path.scope.getBinding(specifier)) return
  const { referencePaths } = path.scope.getBinding(specifier)

  _.forEach(referencePaths, referencePath => {
    const removalPath = findReferenceRemovalPath(referencePath)

    if (removalPath.removed) return
    if (t.isArrowFunctionExpression(removalPath)) {
      removalPath.get('body').remove()
      return
    }
    if (t.isExportSpecifier(removalPath)) {
      removeExportSpecifier(removalPath)
      return
    }
    if (t.isVariableDeclarator(removalPath))
      removeReferences(removalPath, _.get(removalPath, 'node.id.name'))
    removalPath.remove()
  })
}

export default removeReferences
