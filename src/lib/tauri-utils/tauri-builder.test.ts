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

  it('If a command fails, it must throw', async () => {
    executeCommandMock = jest.spyOn(commandUtils, 'executeCommand').mockImplementation(async (_command, _options) => {
      throw new Error('Forced error for testing')
    })
    const tauriContext = path.join(__dirname, 'test-files', 'project-with-npm')
    await expect(tauriBuilder.build(tauriContext, '')).rejects.toThrow('Error building: Forced error for testing')
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
    expect(executeCommandMock).toHaveBeenNthCalledWith(3, `${expectedPackageManager} tauri build --target aarch64-apple-darwin --bundles "app,dmg,updater"`, { cwd: tauriContext })
  })

  test.each([
    { target: 'x86_64-apple-darwin', expectedRustDependencies: ['rustup target add x86_64-apple-darwin'] },
    { target: 'aarch64-apple-darwin', expectedRustDependencies: ['rustup target add aarch64-apple-darwin'] },
    { target: 'universal-apple-darwin', expectedRustDependencies: ['rustup target add x86_64-apple-darwin', 'rustup target add aarch64-apple-darwin'] },
    { target: 'x86_64-pc-windows-msvc', expectedRustDependencies: ['rustup target add x86_64-pc-windows-msvc'] },
    { target: 'i686-pc-windows-msvc', expectedRustDependencies: ['rustup target add i686-pc-windows-msvc'] },
    { target: 'aarch64-pc-windows-msvc', expectedRustDependencies: ['rustup target add aarch64-pc-windows-msvc'] },
  ])('Building for target "$target" installs required dependencies"', async ({ target, expectedRustDependencies }) => {
    const tauriContext = path.join(__dirname, 'test-files', 'project-with-pnpm')
    await tauriBuilder.build(tauriContext, `--target ${target} --bundles "app,dmg,updater"`)
    expect(buildMock).toHaveReturned()
    expect(executeCommandMock).toHaveBeenNthCalledWith(2, expectedRustDependencies[0], { cwd: tauriContext })

    if (target === 'universal-apple-darwin') {
      expect(expectedRustDependencies.length).toBe(2)
      expect(executeCommandMock).toHaveBeenNthCalledWith(3, expectedRustDependencies[1], { cwd: tauriContext })
    } else {
      expect(expectedRustDependencies.length).toBe(1)
    }
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
