import path from 'path'
import * as tauriBuilder from './/tauri-builder'
import * as commandUtils from '../command-utils/command-utils'

let executeCommandMock: jest.SpiedFunction<typeof commandUtils.executeCommand>

const buildMock = jest.spyOn(tauriBuilder, 'build')
const targetFromOptionsMock = jest.spyOn(tauriBuilder, 'targetFromOptions')

describe('build', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    executeCommandMock = jest.spyOn(commandUtils, 'executeCommand').mockImplementation(async (_binary, _args, _options) => {
      return { stderr: '', stdout: 'Mock result' }
    })
  })

  test.each([
    ['project-with-yarn', 'yarn'],
    ['project-with-pnpm', 'pnpm'],
    ['project-with-npm', 'npm'],
  ])('Project "%s" uses "%s" as package manager', async (projectDir, expectedPackageManager) => {
    const tauriContext = path.join(__dirname, 'test-files', projectDir)
    await tauriBuilder.build(tauriContext, "     --target  aarch64-apple-darwin   --bundles   'app,dmg,updater'   ") // Build options supports trimming repeated spaces.
    expect(buildMock).toHaveReturned()
    expect(executeCommandMock).toHaveBeenNthCalledWith(1, expectedPackageManager, ['install'], { cwd: tauriContext })
    expect(executeCommandMock).toHaveBeenNthCalledWith(2, expectedPackageManager, ['tauri', 'build', '--target', 'aarch64-apple-darwin', '--bundles', "'app,dmg,updater'"], { cwd: tauriContext })
  })
})

describe('targetFromOptions', () => {
  test.each([
    ["     --target  aarch64-apple-darwin   --bundles   'app,dmg,updater'   ", 'aarch64-apple-darwin'],
    ["     -t  x86_64-pc-windows-msvc   --bundles   'app,dmg,updater'   ", 'x86_64-pc-windows-msvc'],
    ['-t', void 0],
    ['--target', void 0],
    ['', void 0],
    ["--bundles 'app,dmg,updater'", void 0],
  ])('Parse options "%s" should contain target "%s"', (options, target) => {
    tauriBuilder.targetFromOptions(options)
    expect(targetFromOptionsMock).toHaveReturnedWith(target)
  })
})
