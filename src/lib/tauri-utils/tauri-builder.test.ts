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
    { projectDir: 'project-with-yarn', expectedPackageManager: 'yarn' },
    { projectDir: 'project-with-pnpm', expectedPackageManager: 'pnpm' },
    { projectDir: 'project-with-npm', expectedPackageManager: 'npm' },
  ])('Project "$projectDir" uses "$expectedPackageManager" as package manager', async ({ projectDir, expectedPackageManager }) => {
    const tauriContext = path.join(__dirname, 'test-files', projectDir)
    await tauriBuilder.build(tauriContext, '--target aarch64-apple-darwin --bundles "app,dmg,updater"')
    expect(buildMock).toHaveReturned()
    expect(executeCommandMock).toHaveBeenNthCalledWith(1, `${expectedPackageManager} install`, { cwd: tauriContext })
    expect(executeCommandMock).toHaveBeenNthCalledWith(2, `${expectedPackageManager} tauri build --target aarch64-apple-darwin --bundles "app,dmg,updater"`, { cwd: tauriContext })
  })
})

describe('targetFromBuildOptions', () => {
  test.each([
    { optionsString: "--target aarch64-apple-darwin --bundles 'app,dmg,updater'", expectedTarget: 'aarch64-apple-darwin' }, // Target set via full name
    { optionsString: "-t x86_64-pc-windows-msvc --bundles 'app,dmg,updater'", expectedTarget: 'x86_64-pc-windows-msvc' }, // Target set via alias
    { optionsString: '', expectedTarget: void 0 }, // No flags set at all
    { optionsString: "--bundles 'app,dmg,updater'", expectedTarget: void 0 }, // Target not set, other flags set
  ])('Parse options "$optionsString" should contain target "$expectedTarget"', ({ optionsString, expectedTarget }) => {
    tauriBuilder.targetFromBuildOptions(optionsString)
    expect(targetFromBuildOptionsMock).toHaveReturnedWith(expectedTarget)
  })
})
