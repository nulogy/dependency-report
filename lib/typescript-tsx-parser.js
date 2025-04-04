import babelOptionsImport from 'recast/parsers/_babel_options.js'
import { parser } from 'recast/parsers/babel.js'

const getBabelOptions = babelOptionsImport.default // Needed because _babel_options.js uses export.default syntax

function parse(source, options) {
  const babelOptions = getBabelOptions(options)
  babelOptions.plugins.push(['typescript', { isTSX: true }], 'jsx')
  return parser.parse(source, babelOptions)
}

export { parse }
