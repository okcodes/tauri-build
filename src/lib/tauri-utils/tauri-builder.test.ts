import path from 'path'
import * as tauriBuilder from './/tauri-builder'
import * as commandUtils from '../command-utils/command-utils'

let executeCommandMock: jest.SpiedFunction<typeof commandUtils.executeCommand>

const buildMock = jest.spyOn(tauriBuilder, 'build')
const targetFromOptionsMock = jest.spyOn(tauriBuilder, 'targetFromOptions')
const parseArgsStringMock = jest.spyOn(tauriBuilder, 'parseArgsString')

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
    await tauriBuilder.build(tauriContext, '     --target  aarch64-apple-darwin   --bundles "app,dmg,updater"  ') // Build options supports trimming repeated spaces.
    expect(buildMock).toHaveReturned()
    expect(executeCommandMock).toHaveBeenNthCalledWith(1, expectedPackageManager, ['install'], { cwd: tauriContext })
    // Note how the "bundles" flag is special, and it will always surround all the bundles with single quotes and will remove spaces between them.
    expect(executeCommandMock).toHaveBeenNthCalledWith(2, expectedPackageManager, ['tauri', 'build', '--target', "'aarch64-apple-darwin'", '--bundles', "'app,dmg,updater'"], { cwd: tauriContext })
  })
})

describe('targetFromOptions', () => {
  test.each([
    ["     --target  aarch64-apple-darwin   --bundles   'app,dmg,updater'   ", "'aarch64-apple-darwin'"], // Target set via full name
    ["     -t  x86_64-pc-windows-msvc   --bundles   'app,dmg,updater'   ", "'x86_64-pc-windows-msvc'"], // Target set via alias
    ['', void 0], // No flags set at all
    ["--bundles 'app,dmg,updater'", void 0], // Target not set, other flags set
  ])('Parse options "%s" should contain target "%s"', (options, target) => {
    tauriBuilder.targetFromOptions(options)
    expect(targetFromOptionsMock).toHaveReturnedWith(target)
  })
})

describe('parseArgsString', () => {
  test.each([
    {
      input: '--option1 value1 --option2 value2',
      expected: ['--option1', "'value1'", '--option2', "'value2'"],
    },
    {
      input: "--option-with-spaces 'value with spaces' --option2 value2",
      expected: ['--option-with-spaces', "'value with spaces'", '--option2', "'value2'"],
    },
    {
      input: '--booleanOption',
      expected: ['--booleanOption', "'true'"],
    },
    {
      input: "-a shorthand -b 'another value'",
      expected: ['-a', "'shorthand'", '-b', "'another value'"],
    },
    {
      input: "--mixed 'mixed value' --numeric 12345",
      expected: ['--mixed', "'mixed value'", '--numeric', "'12345'"],
    },
  ])('correctly parses input "$input" into expected output', ({ input, expected }) => {
    tauriBuilder.parseArgsString(input)
    expect(parseArgsStringMock).toHaveReturnedWith(expected)
  })
})
