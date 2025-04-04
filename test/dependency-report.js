// eslint-disable unicorn/no-abusive-eslint-disable
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { temporaryFile } from 'tempy'
import DependencyReport from '../lib/dependency-report.js'

const fileContents = [
`
import React from 'react'
import {
  Pane as EGPane,
  Text,
  Card
} from 'evergreen-ui'
import Dialog from 'ui/Dialog'

function justSomeCode() {

}
`,
`
import React, { PropTypes } from 'react'
import { filter } from 'lodash'
import {
  Pane as EGPane,
  Text,
  Card,
  Table,
  TableCell
} from 'evergreen-ui'
import Dialog from 'ui/Dialog'

function justSomeCode() {

}
`,
`
import React from 'react'
import _ from 'lodash'
import {
  Pane as EGPane,
  Text,
  Card,
  Table,
  TableCell,
  Popover,
  SelectMenu,
  Dialog
} from 'evergreen-ui'

function justSomeCode() {

}
`,[
`
import React from 'react'
import { Text } from 'evergreen-ui'

// TypeScript
export default function mcCode(_value: string) {
  return (
    <Text>
      Foo
    </Text>
  )
}
`,
  'tsx'
]
]

const setup = async () => {
  const filePromises = fileContents.map(async file => {
    let content = file
    let extension = 'js'

    if (Array.isArray(file)) {
      content = file[0]
      extension = file[1]
    }

    const filePath = temporaryFile({ extension })
    await fs.writeFile(filePath, content)
    return filePath
  })
  const files = await Promise.all(filePromises)

  return files
}

test('run a report over a single file', async (_t) => {
  const files = await setup()

  const report = new DependencyReport({
    files: [files[0]]
  })

  await assert.doesNotReject(async () => report.run())
})

test('run a report over a multiple files', async (_t) => {
  const files = await setup()
  const report = new DependencyReport({
    files,
    parser: 'typescript'
  })

  await assert.doesNotReject(async () => report.run())
})

test('get the usage of a package over a single file', async (_t) => {
  const files = await setup()

  const report = new DependencyReport({
    files,
    parser: 'typescript'
  })

  await report.run()

  const evergreenPackage = report.getPackages('evergreen-ui')[0]

  const usage = evergreenPackage.exportsUsage()
  assert.deepEqual(usage, [
    { name: 'Text', usage: 4 },
    { name: 'Pane', usage: 3 },
    { name: 'Card', usage: 3 },
    { name: 'Table', usage: 2 },
    { name: 'TableCell', usage: 2 },
    { name: 'Popover', usage: 1 },
    { name: 'SelectMenu', usage: 1 },
    { name: 'Dialog', usage: 1 }
  ])
})

test('get the usage of a single export for a package', async (_t) => {
  const files = await setup()

  const report = new DependencyReport({
    files,
    parser: 'typescript'
  })

  await report.run()

  const evergreenPackage = report.getPackages('evergreen-ui')[0]

  const usage = evergreenPackage.exportsUsage('Pane')

  assert.equal(usage, 3)
})

test('get the usage by export name', async (_t) => {
  const files = await setup()

  const report = new DependencyReport({
    files,
    parser: 'typescript'
  })

  await report.run()

  const exportUsage = report.getByExportNames('Dialog')[0]

  assert.equal(exportUsage.packages['ui/Dialog'].usage, 2)
  assert.equal(exportUsage.packages['evergreen-ui'].usage, 1)
})

test('get the complete snapshot', async (_t) => {
  const files = await setup()

  const report = new DependencyReport({
    files,
    parser: 'typescript'
  })

  await report.run()

  assert.doesNotThrow(() => JSON.stringify(report.toPlainObject(), null, 2))
})
