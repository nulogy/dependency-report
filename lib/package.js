function Package(name) {
  this.name = name
  this.filepaths = []
  this.exportNames = []
  this.filepathsForExports = new Map()
}

Package.prototype.addExports = function(exportNames, filepath) {
  this.exportNames = [...this.exportNames, ...exportNames]

  for (const name of exportNames) {
    if (!this.filepathsForExports.has(name)) {
      this.filepathsForExports.set(name, [])
    }

    this.filepathsForExports.get(name).push(filepath)
  }
}

Package.prototype.addFilepath = function(filepath) {
  this.filepaths.push(filepath)
}

Package.prototype.exportsUsage = function(exportName) {
  const usage = new Map()

  for (const name of this.exportNames) {
    if (!usage.has(name)) {
      usage.set(name, 0)
    }

    usage.set(name, usage.get(name) + 1)
  }

  if (typeof exportName === 'string') {
    return usage.get(exportName) || 0
  }

  return [...usage.keys()]
    .sort((a, b) => usage.get(b) - usage.get(a))
    .map(name => ({
      name,
      usage: usage.get(name)
    }))
}

Package.prototype.toPlainObject = function() {
  // Convert filepathsForExports back to a plain object for serialization
  const filepathsForExportsPlain = {}
  for (const [key, value] of this.filepathsForExports) {
    filepathsForExportsPlain[key] = value
  }

  return {
    name: this.name,
    // Files: this.filepaths.length,
    // exportsUsage: this.exportsUsage(),
    // exportNames: this.exportNames,
    filepathsForExports: filepathsForExportsPlain,
    filepaths: this.filepaths
  }
}

Package.prototype.toJSON = function() {
  return JSON.stringify(this.toPlainObject(), null, 2)
}

Package.prototype.usageReport = function() {
  return {
    name: this.name,
    files: this.filepaths.length,
    exportsUsage: this.exportsUsage()
  }
}

Package.prototype.exportReport = function(exportNames) {
  const exportNamesArray = Array.isArray(exportNames) ? exportNames : [exportNames]

  return exportNamesArray.map(exportName => {
    const filepathsForExports = this.filepathsForExports.get(exportName) || []
    return {
      name: exportName,
      files: filepathsForExports.length,
      filepaths: filepathsForExports
    }
  })
}

export default Package
