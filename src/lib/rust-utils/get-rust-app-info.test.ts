import { expect } from '@jest/globals'
import { parseCargoTomlFile, parseTauriCargoTomlFileInContext } from './get-rust-app-info'
import path from 'path'

describe('parseCargoTomlFile', () => {
  it('parses valid cargo file', async () => {
    const appData = await parseCargoTomlFile(path.join(__dirname, './test-files/src-tauri/Cargo.toml'))
    expect(appData.package.name).toBe('demo-app')
    expect(appData.package.edition).toBe('2021')
    expect(appData.package.description).toBe('Just a demo app to unit test utils.')
    expect(appData.package.version).toBe('0.0.18')
  })

  it('parses valid invalid cargo file generating an empty object', async () => {
    const appData = await parseCargoTomlFile(path.join(__dirname, './test-files/src-tauri/InvalidCargo.toml'))
    expect(appData.package.name).toBe('')
    expect(appData.package.edition).toBe('')
    expect(appData.package.description).toBe('')
    expect(appData.package.version).toBe('')
  })

  it('returns rejected promise is passed a non-existent file', async () => {
    await expect(parseCargoTomlFile(path.join(__dirname, './test-files/src-tauri/Non-Existent-Cargo.toml'))).rejects.toThrow()
  })
})

describe('parseTauriCargoTomlFileInContext', () => {
  it('finds and parses Cargo.toml file', async () => {
    const appData = await parseTauriCargoTomlFileInContext(path.join(__dirname, 'test-files'))
    expect(appData.package.name).toBe('demo-app')
    expect(appData.package.edition).toBe('2021')
    expect(appData.package.description).toBe('Just a demo app to unit test utils.')
    expect(appData.package.version).toBe('0.0.18')
  })

  it('finds and parses Cargo.toml file even using trailing slashes', async () => {
    const appData = await parseTauriCargoTomlFileInContext(path.join(__dirname, 'test-files/'))
    expect(appData.package.name).toBe('demo-app')
    expect(appData.package.edition).toBe('2021')
    expect(appData.package.description).toBe('Just a demo app to unit test utils.')
    expect(appData.package.version).toBe('0.0.18')
  })

  it('finds and parses Cargo.toml file even using leading slashes', async () => {
    const appData = await parseTauriCargoTomlFileInContext(path.join(__dirname, '/test-files'))
    expect(appData.package.name).toBe('demo-app')
    expect(appData.package.edition).toBe('2021')
    expect(appData.package.description).toBe('Just a demo app to unit test utils.')
    expect(appData.package.version).toBe('0.0.18')
  })

  it('finds and parses Cargo.toml file even using leading and trailing slashes', async () => {
    const appData = await parseTauriCargoTomlFileInContext(path.join(__dirname, '/test-files/'))
    expect(appData.package.name).toBe('demo-app')
    expect(appData.package.edition).toBe('2021')
    expect(appData.package.description).toBe('Just a demo app to unit test utils.')
    expect(appData.package.version).toBe('0.0.18')
  })
})
