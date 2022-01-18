import * as t from '@babel/types'
import _ from 'lodash'

const getSpecifiersForRemoval = (members, specifiers) =>
  _.transform(specifiers, (result, specifier) => {
    if (_.includes(members, '*')) {
      result.push(...specifiers)
      return false
    }

    if (t.isImportDefaultSpecifier(specifier) && _.includes(members, 'default')) {
      result.push(specifier)
    }

    if (_.includes(members, _.get(specifier, 'local.name'))) result.push(specifier)
  })

export default getSpecifiersForRemoval
