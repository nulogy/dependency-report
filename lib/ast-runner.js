import recast from 'recast'

const { visit, namedTypes } = recast.types

function getExportNames(specifiers) {
  const exportNames = []

  for (const specifier of specifiers) {
    const exportName = specifier.local.name

    if (namedTypes.ImportDefaultSpecifier.check(specifier)) {
      exportNames.push(exportName)
    } else {
      // Only non-default specifiers have `imported`
      exportNames.push(
        specifier.imported ? specifier.imported.name : exportName
      )
    }
  }

  return exportNames
}

async function runAst(contents, parserName = 'babel') {
  const parserImport = parserName === 'typescript'
    ? './typescript-tsx-parser.js' // Custom parse to set `isTSX: true` and provide `jsx` plugin
    : `recast/parsers/${parserName}.js`

  const parser = await import(parserImport)
  const ast = recast.parse(contents, { isTSX: true, parser })
  const packages = []
  let exportNames = []

  // Loop over all the import statements
  visit(ast, {
    visitImportDeclaration(path) {
      this.traverse(path)

      const results = getExportNames(path.node.specifiers)

      exportNames = [...exportNames, ...results]

      const packageObject = {
        name: path.node.source.value,
        exportNames: results
      }

      packages.push(packageObject)
    }
  })

  return {
    packages,
    exportNames
  }
}

export default runAst
