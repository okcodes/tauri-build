/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import * as main from '../src/main'
import { BuildAppActionInputs, BuildAppActionOutputs } from '../src/commands/build-app-command'
import path from 'path'
import { test_deleteAllRequiredEnvVars, test_setEnvVar } from '../src/lib/github-utils/github-env-vars'
import * as githubRelease from '../src/lib/github-utils/github-release'
import * as tauriBuilder from '../src/lib/tauri-utils/tauri-builder'
import * as tauriGithubUploader from '../src/lib/tauri-utils/tauri-github-uploader'
import * as commandUtils from '../src/lib/command-utils/command-utils'
import { BUILD_APP_COMMAND, MainActionInputs } from '../src/main'

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
    getOrCreateGitHubReleaseMock = jest.spyOn(githubRelease, 'getOrCreateGitHubRelease').mockImplementation()
    uploadAppToGithubMock = jest.spyOn(tauriGithubUploader, 'uploadAppToGithub').mockImplementation()
  })

  test.each([
    {
      buildOptions: '--target aarch64-apple-darwin --bundles app,dmg,updater',
      tagTemplate: '{NAME}-v{VERSION}+{SHORT_SHA}',
      tag: `my-app-under-test-v7.7.7+${THE_GITHUB_SHORT_SHA}`,
      prerelease: true,
      draft: true,
      expectedArtifacts: '30',
      expectedTarget: 'aarch64-apple-darwin',
      expectedBuildCommand: `npm tauri build --target aarch64-apple-darwin --bundles app,dmg,updater`,
    },
    {
      buildOptions: '--target universal-apple-darwin --bundles app,dmg,updater',
      tagTemplate: 'hardcoded-text-{VERSION}',
      tag: 'hardcoded-text-7.7.7',
      prerelease: true,
      draft: false,
      expectedArtifacts: '31',
      expectedTarget: 'universal-apple-darwin',
      expectedBuildCommand: `npm tauri build --target universal-apple-darwin --bundles app,dmg,updater`,
    },
    {
      buildOptions: '--target x86_64-apple-darwin --bundles app,dmg,updater',
      tagTemplate: '{name}-{version}+{short_sha}',
      tag: `my-app-under-test-7.7.7+${THE_GITHUB_SHORT_SHA}`,
      prerelease: false,
      draft: true,
      expectedArtifacts: '32',
      expectedTarget: 'x86_64-apple-darwin',
      expectedBuildCommand: `npm tauri build --target x86_64-apple-darwin --bundles app,dmg,updater`,
    },
    {
      buildOptions: '--target x86_64-pc-windows-msvc -b app,dmg,updater',
      tagTemplate: 'my-test-app',
      tag: 'my-test-app',
      prerelease: false,
      draft: false,
      expectedArtifacts: '33',
      expectedTarget: 'x86_64-pc-windows-msvc',
      expectedBuildCommand: `npm tauri build --target x86_64-pc-windows-msvc -b app,dmg,updater`,
    },
    {
      buildOptions: '-t i686-pc-windows-msvc',
      tagTemplate: '{VERSION}',
      tag: '7.7.7',
      prerelease: true,
      draft: true,
      expectedArtifacts: '33',
      expectedTarget: 'i686-pc-windows-msvc',
      expectedBuildCommand: `npm tauri build -t i686-pc-windows-msvc`,
    },
    {
      buildOptions: '-t aarch64-pc-windows-msvc',
      tagTemplate: '{sHoRt_sHa}',
      tag: THE_GITHUB_SHORT_SHA,
      prerelease: false,
      draft: false,
      expectedArtifacts: '33',
      expectedTarget: 'aarch64-pc-windows-msvc',
      expectedBuildCommand: `npm tauri build -t aarch64-pc-windows-msvc`,
    },
    // { buildOptions: '', tagTemplate: '{VERSION}', tag: '7.7.7', prerelease: true, draft: true, expectedArtifacts: '33' },
    // { buildOptions: '', tagTemplate: '{sHoRt_sHa}', tag: THE_GITHUB_SHORT_SHA, prerelease: false, draft: false, expectedArtifacts: '33' },
  ])(
    'With: buildOptions $buildOptions, tagTemplate $tagTemplate, tag $tag, prerelease $prerelease, draft $draft, expectedArtifacts $expectedArtifacts, expectedTarget $expectedTarget',
    async ({ buildOptions, tagTemplate, tag, prerelease, draft, expectedArtifacts, expectedTarget, expectedBuildCommand }) => {
      // Set the action's inputs as return values from core.getInput()
      getInputMock.mockImplementation(name => {
        switch (name as BuildAppActionInputs | MainActionInputs) {
          case 'tauriContext':
            return path.join(__dirname, 'test-files')
          case 'buildOptions':
            return buildOptions
          case 'expectedArtifacts':
            return expectedArtifacts
          case 'tagTemplate':
            return tagTemplate
          case 'command':
            return BUILD_APP_COMMAND
          default:
            return ''
        }
      })
      getBooleanInputMock.mockImplementation(name => {
        switch (name as BuildAppActionInputs) {
          case 'prerelease':
            return prerelease
          case 'draft':
            return draft
          default:
            return false
        }
      })

      setAllValidRequiredEnvVars()
      await main.run()
      expect(runMock).toHaveReturned()

      // Verify that all the core library functions were called correctly
      expect(setOutputMock).toHaveBeenNthCalledWith(1, 'appName' as BuildAppActionOutputs, 'my-app-under-test')
      expect(setOutputMock).toHaveBeenNthCalledWith(2, 'appVersion' as BuildAppActionOutputs, '7.7.7')
      expect(setOutputMock).toHaveBeenNthCalledWith(3, 'tag' as BuildAppActionOutputs, tag)
      expect(getOrCreateGitHubReleaseMock).toHaveBeenNthCalledWith(1, { githubToken: THE_GITHUB_TOKEN, repo: THE_GITHUB_REPO, owner: THE_GITHUB_OWNER, tag, sha: THE_GITHUB_SHA, prerelease, draft })
      expect(buildSpied).toHaveBeenNthCalledWith(1, path.join(__dirname, 'test-files'), buildOptions)

      const cwd = path.join(__dirname, 'test-files')

      expect(executeCommandMock).toHaveBeenNthCalledWith(1, 'npm install', { cwd })
      if (expectedTarget !== 'universal-apple-darwin') {
        expect(executeCommandMock).toHaveBeenNthCalledWith(2, `rustup target add ${expectedTarget}`, { cwd })
        expect(executeCommandMock).toHaveBeenNthCalledWith(3, expectedBuildCommand, { cwd })
      } else {
        // On apple universal we install an additional rust target, so we make an extra command call
        expect(executeCommandMock).toHaveBeenNthCalledWith(2, `rustup target add x86_64-apple-darwin`, { cwd })
        expect(executeCommandMock).toHaveBeenNthCalledWith(3, `rustup target add aarch64-apple-darwin`, { cwd })
        expect(executeCommandMock).toHaveBeenNthCalledWith(4, expectedBuildCommand, { cwd })
      }
      expect(uploadAppToGithubMock).toHaveBeenCalledTimes(1)
      expect(uploadAppToGithubMock).toHaveBeenNthCalledWith(1, {
        appName: 'my-app-under-test',
        appVersion: '7.7.7',
        expectedArtifacts: +expectedArtifacts,
        githubToken: 'unit-test-token',
        owner: 'the-owner',
        repo: 'the-repo',
        rustTarget: expectedTarget,
        tag,
        tauriContext: cwd,
      })
      expect(await buildSpied.mock.results[0].value).toEqual({ target: expectedTarget })
      expect(setFailedMock).not.toHaveBeenCalled()
      expect(errorMock).not.toHaveBeenCalled()
    }
  )

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
      switch (name as BuildAppActionInputs | MainActionInputs) {
        case 'tauriContext':
          return path.join(__dirname, 'test-files')
        case 'buildOptions':
          return buildOptions
        case 'expectedArtifacts':
          return expectedArtifacts
        case 'tagTemplate':
          return 'hardcoded'
        case 'command':
          return BUILD_APP_COMMAND
        default:
          return ''
      }
    })
    getBooleanInputMock.mockImplementation(name => {
      switch (name as BuildAppActionInputs) {
        case 'prerelease':
          return true
        case 'draft':
          return true
        default:
          return false
      }
    })

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
      switch (name as BuildAppActionInputs | MainActionInputs) {
        case 'tauriContext':
          return path.join(__dirname, 'non-existent-dir')
        case 'expectedArtifacts':
          return '1'
        case 'buildOptions':
          return '--target universal-apple-darwin'
        case 'command':
          return BUILD_APP_COMMAND
        default:
          return ''
      }
    })

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
    getInputMock.mockImplementation(name => {
      switch (name as BuildAppActionInputs | MainActionInputs) {
        case 'command':
          return BUILD_APP_COMMAND
        default:
          return ''
      }
    })
    await main.run()
    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenNthCalledWith(1, 'GITHUB_TOKEN is required')

    // Core function not called
    expect(getOrCreateGitHubReleaseMock).not.toHaveBeenCalled()
    expect(buildSpied).not.toHaveBeenCalled()
  })

  it('called with no GITHUB_REPOSITORY must fail', async () => {
    getInputMock.mockImplementation(name => {
      switch (name as BuildAppActionInputs | MainActionInputs) {
        case 'command':
          return BUILD_APP_COMMAND
        default:
          return ''
      }
    })
    test_setEnvVar('GITHUB_TOKEN', THE_GITHUB_TOKEN)
    await main.run()
    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenNthCalledWith(1, 'GITHUB_REPOSITORY is required')

    // Core function not called
    expect(getOrCreateGitHubReleaseMock).not.toHaveBeenCalled()
    expect(buildSpied).not.toHaveBeenCalled()
  })

  it('called with invalid GITHUB_REPOSITORY must fail', async () => {
    getInputMock.mockImplementation(name => {
      switch (name as BuildAppActionInputs | MainActionInputs) {
        case 'command':
          return BUILD_APP_COMMAND
        default:
          return ''
      }
    })
    test_setEnvVar('GITHUB_TOKEN', THE_GITHUB_TOKEN)
    test_setEnvVar('GITHUB_REPOSITORY', 'invalid')
    await main.run()
    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenNthCalledWith(1, 'GITHUB_REPOSITORY must be called with the format owner/repo')
  })

  it('called with no GITHUB_SHA must fail', async () => {
    getInputMock.mockImplementation(name => {
      switch (name as BuildAppActionInputs | MainActionInputs) {
        case 'command':
          return BUILD_APP_COMMAND
        default:
          return ''
      }
    })
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
