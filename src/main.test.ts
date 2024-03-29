/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import * as main from './main'
import path from 'path'
import { test_deleteAllRequiredEnvVars, test_setEnvVar } from './lib/github-utils/github-env-vars'
import * as githubRelease from './lib/github-utils/github-release'
import * as tauriBuilder from './lib/tauri-utils/tauri-builder'
import * as tauriGithubUploader from './lib/tauri-utils/tauri-github-uploader'
import * as commandUtils from './lib/command-utils/command-utils'
import type { ActionBooleanInputs, ActionInputs, ActionOutputs } from './main'

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

// Mocked functions
// let debugMock: jest.SpiedFunction<typeof core.debug>
let errorMock: jest.SpiedFunction<typeof core.error>
let getInputMock: jest.SpiedFunction<typeof core.getInput>
let getBooleanInputMock: jest.SpiedFunction<typeof core.getBooleanInput>
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>
let setOutputMock: jest.SpiedFunction<typeof core.setOutput>
let executeCommandMock: jest.SpiedFunction<typeof commandUtils.executeCommand>
let getOrCreateGitHubReleaseMock: jest.SpiedFunction<typeof githubRelease.getOrCreateGitHubRelease>
let uploadAppToGithubMock: jest.SpiedFunction<typeof tauriGithubUploader.uploadAppToGithub>

// Keep original implementation and spy
const buildSpied = jest.spyOn(tauriBuilder, 'build')

const THE_GITHUB_TOKEN = 'unit-test-token'
const THE_GITHUB_OWNER = 'the-owner'
const THE_GITHUB_REPO = 'the-repo'
const THE_GITHUB_REPOSITORY = `${THE_GITHUB_OWNER}/${THE_GITHUB_REPO}`
const THE_GITHUB_SHA = '4a18826a13c84325ae24d2b7c83918159319c94d'
const THE_GITHUB_SHORT_SHA = '4a18826'

const setAllValidRequiredEnvVars = (): void => {
  test_setEnvVar('GITHUB_TOKEN', THE_GITHUB_TOKEN)
  test_setEnvVar('GITHUB_REPOSITORY', THE_GITHUB_REPOSITORY)
  test_setEnvVar('GITHUB_SHA', THE_GITHUB_SHA)
}

describe('run', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Unset all env vars
    test_deleteAllRequiredEnvVars()

    // debugMock = jest.spyOn(core, 'debug').mockImplementation()
    errorMock = jest.spyOn(core, 'error').mockImplementation()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    getBooleanInputMock = jest.spyOn(core, 'getBooleanInput').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
    setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()
    executeCommandMock = jest.spyOn(commandUtils, 'executeCommand').mockImplementation()
    getOrCreateGitHubReleaseMock = jest.spyOn(githubRelease, 'getOrCreateGitHubRelease').mockResolvedValue({ uploadUrl: 'https://example.com/upload-url', releaseId: 1234567890 })
    uploadAppToGithubMock = jest.spyOn(tauriGithubUploader, 'uploadAppToGithub').mockImplementation()
  })

  type SuccessTestCase = {
    inputs: Record<ActionInputs, string>
    booleanInputs: Record<ActionBooleanInputs, boolean>
    expected: {
      expectedArtifacts: number
      tag: string
      target: string
      buildCommand: string
    }
  }

  const successTestCases: SuccessTestCase[] = [
    {
      inputs: {
        buildOptions: '--target aarch64-apple-darwin --bundles app,dmg,updater',
        tagTemplate: '{NAME}-v{VERSION}+{SHORT_SHA}',
        expectedArtifacts: '30',
        tauriContext: path.join(__dirname, 'test-files'),
      },
      booleanInputs: {
        draft: true,
        prerelease: true,
        skipBuild: false,
      },
      expected: {
        expectedArtifacts: 30,
        tag: `my-app-under-test-v7.7.7+${THE_GITHUB_SHORT_SHA}`,
        target: 'aarch64-apple-darwin',
        buildCommand: 'npm tauri build --target aarch64-apple-darwin --bundles app,dmg,updater',
      },
    },
    {
      inputs: {
        buildOptions: '--target universal-apple-darwin --bundles app,dmg,updater',
        tagTemplate: 'hardcoded-text-{VERSION}',
        expectedArtifacts: '31',
        tauriContext: path.join(__dirname, 'test-files'),
      },
      booleanInputs: {
        draft: false,
        prerelease: true,
        skipBuild: false,
      },
      expected: {
        expectedArtifacts: 31,
        tag: 'hardcoded-text-7.7.7',
        target: 'universal-apple-darwin',
        buildCommand: 'npm tauri build --target universal-apple-darwin --bundles app,dmg,updater',
      },
    },
    {
      inputs: {
        buildOptions: '--target x86_64-apple-darwin --bundles app,dmg,updater',
        tagTemplate: '{name}-{version}+{short_sha}',
        expectedArtifacts: '32',
        tauriContext: path.join(__dirname, 'test-files'),
      },
      booleanInputs: {
        draft: true,
        prerelease: false,
        skipBuild: false,
      },
      expected: {
        expectedArtifacts: 32,
        tag: `my-app-under-test-7.7.7+${THE_GITHUB_SHORT_SHA}`,
        target: 'x86_64-apple-darwin',
        buildCommand: 'npm tauri build --target x86_64-apple-darwin --bundles app,dmg,updater',
      },
    },
    {
      inputs: {
        buildOptions: '--target x86_64-pc-windows-msvc -b app,dmg,updater',
        tagTemplate: 'my-test-app',
        expectedArtifacts: '33',
        tauriContext: path.join(__dirname, 'test-files'),
      },
      booleanInputs: {
        draft: false,
        prerelease: false,
        skipBuild: false,
      },
      expected: {
        expectedArtifacts: 33,
        tag: 'my-test-app',
        target: 'x86_64-pc-windows-msvc',
        buildCommand: 'npm tauri build --target x86_64-pc-windows-msvc -b app,dmg,updater',
      },
    },
    {
      inputs: {
        buildOptions: '-t i686-pc-windows-msvc',
        tagTemplate: '{VERSION}',
        expectedArtifacts: '33',
        tauriContext: path.join(__dirname, 'test-files'),
      },
      booleanInputs: {
        draft: true,
        prerelease: true,
        skipBuild: false,
      },
      expected: {
        expectedArtifacts: 33,
        tag: '7.7.7',
        target: 'i686-pc-windows-msvc',
        buildCommand: 'npm tauri build -t i686-pc-windows-msvc',
      },
    },
    {
      inputs: {
        buildOptions: '-t aarch64-pc-windows-msvc',
        tagTemplate: '{sHoRt_sHa}',
        expectedArtifacts: '34',
        tauriContext: path.join(__dirname, 'test-files'),
      },
      booleanInputs: {
        draft: false,
        prerelease: false,
        skipBuild: false,
      },
      expected: {
        expectedArtifacts: 34,
        tag: THE_GITHUB_SHORT_SHA,
        target: 'aarch64-pc-windows-msvc',
        buildCommand: 'npm tauri build -t aarch64-pc-windows-msvc',
      },
    },
  ]
  test.each(successTestCases)('With: $inputs, and $booleanInputs, is expecting $expected.', async ({ inputs, booleanInputs, expected }) => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => inputs[name as ActionInputs])
    getBooleanInputMock.mockImplementation(name => booleanInputs[name as ActionBooleanInputs])

    setAllValidRequiredEnvVars()
    await main.run()
    expect(runMock).toHaveBeenCalledTimes(1)
    expect(runMock).toHaveReturned()

    // Create release called correctly
    expect(getOrCreateGitHubReleaseMock).toHaveBeenCalledTimes(1)
    expect(getOrCreateGitHubReleaseMock).toHaveBeenNthCalledWith(1, {
      githubToken: THE_GITHUB_TOKEN,
      repo: THE_GITHUB_REPO,
      owner: THE_GITHUB_OWNER,
      tag: expected.tag,
      sha: THE_GITHUB_SHA,
      prerelease: booleanInputs.prerelease,
      draft: booleanInputs.draft,
    })

    // Build called correctly
    expect(buildSpied).toHaveBeenCalledTimes(1)
    expect(buildSpied).toHaveBeenNthCalledWith(1, path.join(__dirname, 'test-files'), inputs.buildOptions)
    expect(await buildSpied.mock.results[0].value).toEqual({ target: expected.target })

    // Upload to GitHub called correctly
    const cwd = path.join(__dirname, 'test-files')
    expect(uploadAppToGithubMock).toHaveBeenCalledTimes(1)
    expect(uploadAppToGithubMock).toHaveBeenNthCalledWith(1, {
      appName: 'my-app-under-test',
      appVersion: '7.7.7',
      expectedArtifacts: expected.expectedArtifacts,
      githubToken: 'unit-test-token',
      rustTarget: expected.target,
      uploadUrl: 'https://example.com/upload-url',
      tauriContext: cwd,
      tag: expected.tag,
    })

    // Utility commands called correctly
    expect(executeCommandMock).toHaveBeenNthCalledWith(1, 'npm install', { cwd })
    if (expected.target !== 'universal-apple-darwin') {
      expect(executeCommandMock).toHaveBeenCalledTimes(3)
      expect(executeCommandMock).toHaveBeenNthCalledWith(2, `rustup target add ${expected.target}`, { cwd })
      expect(executeCommandMock).toHaveBeenNthCalledWith(3, expected.buildCommand, { cwd })
    } else {
      // On apple universal we install an additional rust target, so we make an extra command call
      expect(executeCommandMock).toHaveBeenCalledTimes(4)
      expect(executeCommandMock).toHaveBeenNthCalledWith(2, `rustup target add x86_64-apple-darwin`, { cwd })
      expect(executeCommandMock).toHaveBeenNthCalledWith(3, `rustup target add aarch64-apple-darwin`, { cwd })
      expect(executeCommandMock).toHaveBeenNthCalledWith(4, expected.buildCommand, { cwd })
    }

    // Verify that all the core library functions were called correctly
    expect(setOutputMock).toHaveBeenCalledTimes(4)
    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'appName' as ActionOutputs, 'my-app-under-test')
    expect(setOutputMock).toHaveBeenNthCalledWith(2, 'appVersion' as ActionOutputs, '7.7.7')
    expect(setOutputMock).toHaveBeenNthCalledWith(3, 'tag' as ActionOutputs, expected.tag)
    expect(setOutputMock).toHaveBeenNthCalledWith(4, 'releaseId' as ActionOutputs, '1234567890')

    expect(setFailedMock).not.toHaveBeenCalled()
    expect(errorMock).not.toHaveBeenCalled()
  })

  type FailedTestCase = {
    inputs: Partial<Record<ActionInputs, string>>
  }

  // TODO: Test that build options can contain empty string if skip build is true.
  const failedTestCase: FailedTestCase[] = [
    {
      inputs: {
        buildOptions: '',
        expectedArtifacts: '1',
      },
    },
    {
      inputs: {
        buildOptions: '--bundles app,dmg,updater',
        expectedArtifacts: '1',
      },
    },
  ]

  test.each(failedTestCase)('With invalid build options it should fail', async ({ inputs }) => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => inputs[name as ActionInputs] || '')
    getBooleanInputMock.mockReturnValue(false)

    setAllValidRequiredEnvVars()
    await main.run()
    expect(runMock).toHaveBeenCalledTimes(1)
    expect(runMock).toHaveReturned()

    // Create release called correctly
    expect(getOrCreateGitHubReleaseMock).toHaveBeenCalledTimes(0)

    // Build called correctly
    expect(buildSpied).toHaveBeenCalledTimes(0)

    expect(uploadAppToGithubMock).toHaveBeenCalledTimes(0)

    // Utility commands called correctly
    expect(executeCommandMock).toHaveBeenCalledTimes(0)

    // Verify that all the core library functions were called correctly
    expect(setOutputMock).toHaveBeenCalledTimes(0)

    expect(setFailedMock).toHaveBeenCalledTimes(1)
    expect(setFailedMock).toHaveBeenNthCalledWith(1, 'The buildOptions must contain a flag --target (or -t) specifying the rust target triple to build')
    expect(errorMock).not.toHaveBeenCalled()
  })

  test.each([
    {
      description: 'Called with invalid "expectedArtifacts" must fail.',
      expectedArtifacts: '0', // Invalid expected artifacts
      buildOptions: '--target universal-apple-darwin', // Valid
      expectedError: 'The input "expectedArtifacts" must be a number greater or equal to 1.',
    },
    {
      description: 'Called with invalid "expectedArtifacts" must fail.',
      expectedArtifacts: '', // Invalid expected artifacts
      buildOptions: '-t universal-apple-darwin', // Valid
      expectedError: 'The input "expectedArtifacts" must be a number greater or equal to 1.',
    },
    {
      description: 'Called with valid "expectedArtifacts" but invalid "buildOptions".',
      expectedArtifacts: '1', // Valid expected artifacts
      buildOptions: '--bundles updater', // Invalid build options (--target missing).
      expectedError: 'The buildOptions must contain a flag --target (or -t) specifying the rust target triple to build',
    },
  ])('$description', async ({ expectedArtifacts, expectedError, buildOptions }) => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name as ActionInputs) {
        case 'tauriContext':
          return path.join(__dirname, 'test-files')
        case 'buildOptions':
          return buildOptions
        case 'expectedArtifacts':
          return expectedArtifacts
        case 'tagTemplate':
          return 'hardcoded'
        default:
          return ''
      }
    })
    getBooleanInputMock.mockReturnValue(false)

    setAllValidRequiredEnvVars()
    await main.run()
    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenCalledTimes(1)
    expect(setFailedMock).toHaveBeenNthCalledWith(1, expectedError)

    // Core function not called
    expect(getOrCreateGitHubReleaseMock).not.toHaveBeenCalled()
    expect(buildSpied).not.toHaveBeenCalled()
  })

  it('called with invalid "tauriContext" data must fail', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name as ActionInputs) {
        case 'tauriContext':
          return path.join(__dirname, 'non-existent-dir')
        case 'expectedArtifacts':
          return '1'
        case 'buildOptions':
          return '--target universal-apple-darwin'
        default:
          return ''
      }
    })
    getBooleanInputMock.mockReturnValue(false)

    setAllValidRequiredEnvVars()
    await main.run()
    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenCalledTimes(1)
    expect(setFailedMock).toHaveBeenNthCalledWith(1, expect.stringMatching(/^Cannot read or parse toml file/))

    // Core function not called
    expect(getOrCreateGitHubReleaseMock).not.toHaveBeenCalled()
    expect(buildSpied).not.toHaveBeenCalled()
  })

  it('called with no GITHUB_TOKEN must fail', async () => {
    getInputMock.mockReturnValue('')
    getBooleanInputMock.mockReturnValue(false)
    await main.run()
    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenNthCalledWith(1, 'GITHUB_TOKEN is required')

    // Core function not called
    expect(getOrCreateGitHubReleaseMock).not.toHaveBeenCalled()
    expect(buildSpied).not.toHaveBeenCalled()
  })

  it('called with no GITHUB_REPOSITORY must fail', async () => {
    getInputMock.mockReturnValue('')
    getBooleanInputMock.mockReturnValue(false)
    test_setEnvVar('GITHUB_TOKEN', THE_GITHUB_TOKEN)
    await main.run()
    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenNthCalledWith(1, 'GITHUB_REPOSITORY is required')

    // Core function not called
    expect(getOrCreateGitHubReleaseMock).not.toHaveBeenCalled()
    expect(buildSpied).not.toHaveBeenCalled()
  })

  it('called with invalid GITHUB_REPOSITORY must fail', async () => {
    getInputMock.mockReturnValue('')
    getBooleanInputMock.mockReturnValue(false)
    test_setEnvVar('GITHUB_TOKEN', THE_GITHUB_TOKEN)
    test_setEnvVar('GITHUB_REPOSITORY', 'invalid')
    await main.run()
    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenNthCalledWith(1, 'GITHUB_REPOSITORY must be called with the format owner/repo')
  })

  it('called with no GITHUB_SHA must fail', async () => {
    getInputMock.mockReturnValue('')
    getBooleanInputMock.mockReturnValue(false)
    test_setEnvVar('GITHUB_TOKEN', THE_GITHUB_TOKEN)
    test_setEnvVar('GITHUB_REPOSITORY', THE_GITHUB_REPOSITORY)
    await main.run()
    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenNthCalledWith(1, 'GITHUB_SHA is required')

    // Core function not called
    expect(getOrCreateGitHubReleaseMock).not.toHaveBeenCalled()
    expect(buildSpied).not.toHaveBeenCalled()
  })
})
