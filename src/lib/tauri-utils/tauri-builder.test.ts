import path from 'path'
import * as tauriBuilder from './/tauri-builder'
import * as commandUtils from '../command-utils/command-utils'

let executeCommandMock: jest.SpiedFunction<typeof commandUtils.executeCommand>

const buildMock = jest.spyOn(tauriBuilder, 'build')
const targetFromBuildOptionsMock = jest.spyOn(tauriBuilder, 'targetFromBuildOptions')

describe('build', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    executeCommandMock = jest.spyOn(commandUtils, 'executeCommand').mockImplementation(async (_command, _options) => {
      return { stderr: '', stdout: 'Mock result' }
    })
  })

  test.each([
    ['project-with-yarn', 'yarn'],
    ['project-with-pnpm', 'pnpm'],
    ['project-with-npm', 'npm'],
  ])('Project "%s" uses "%s" as package manager', async (projectDir, expectedPackageManager) => {
    const tauriContext = path.join(__dirname, 'test-files', projectDir)
    await tauriBuilder.build(tauriContext, '--target aarch64-apple-darwin --bundles "app,dmg,updater"') // Build options supports trimming repeated spaces.
    expect(buildMock).toHaveReturned()
    expect(executeCommandMock).toHaveBeenNthCalledWith(1, `${expectedPackageManager} install`, { cwd: tauriContext })
    // Note how the "bundles" flag is special, and it will always surround all the bundles with single quotes and will remove spaces between them.
    expect(executeCommandMock).toHaveBeenNthCalledWith(2, `${expectedPackageManager} tauri build --target aarch64-apple-darwin --bundles "app,dmg,updater"`, { cwd: tauriContext })
  })
})

describe('targetFromBuildOptions', () => {
  test.each([
    ["--target aarch64-apple-darwin --bundles 'app,dmg,updater'", 'aarch64-apple-darwin'], // Target set via full name
    ["-t x86_64-pc-windows-msvc --bundles 'app,dmg,updater'", 'x86_64-pc-windows-msvc'], // Target set via alias
    ['', void 0], // No flags set at all
    ["--bundles 'app,dmg,updater'", void 0], // Target not set, other flags set
  ])('Parse options "%s" should contain target "%s"', (options, target) => {
    tauriBuilder.targetFromBuildOptions(options)
    expect(targetFromBuildOptionsMock).toHaveReturnedWith(target)
  })
})
