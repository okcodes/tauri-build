import { expect } from '@jest/globals'
import { parseCargoTomlFile } from './get-rust-app-info'
import path from 'path'

describe('get-rust-app-info.ts', () => {
  it('parses valid cargo file', async () => {
    const appData = await parseCargoTomlFile(
      path.join(__dirname, './test-files/ValidCargo.toml')
    )
    expect(appData.package.name).toBe('demo-app')
    expect(appData.package.edition).toBe('2021')
    expect(appData.package.description).toBe(
      'Just a demo app to unit test utils.'
    )
    expect(appData.package.version).toBe('0.0.18')
  })

  it('parses valid invalid cargo file generating an empty object', async () => {
    const appData = await parseCargoTomlFile(
      path.join(__dirname, './test-files/InvalidCargo.toml')
    )
    expect(appData.package.name).toBe('')
    expect(appData.package.edition).toBe('')
    expect(appData.package.description).toBe('')
    expect(appData.package.version).toBe('')
  })
})
