import _ from 'lodash'

const removeExportSpecifier = path => {
  const parent = path.parentPath
  const specifiers = _.get(parent, 'node.specifiers')

  path.remove()

  // Heads up! We should also remove ExportNamedDeclaration if it become empty
  if (specifiers.length === 0) parent.remove()
}

export default removeExportSpecifier
