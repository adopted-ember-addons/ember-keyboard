import isRemovablePath from './isRemovablePath'

const findReferenceRemovalPath = referencePath => {
  const parent = referencePath.findParent(isRemovablePath)

  if (parent) return parent
  if (isRemovablePath(referencePath)) return referencePath

  throw new Error(
    [
      'Cannot find the path for removal, please open issue with code example and the stack trace on Github:',
      'https://github.com/ember-cli/babel-plugin-filter-imports',
    ].join(' '),
  )
}

export default findReferenceRemovalPath
