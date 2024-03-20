/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import * as main from '../src/main'
import { ActionInputs, ActionOutputs } from '../src/main'
import path from 'path'
import { test_deleteAllRequiredEnvVars, test_setEnvVar } from '../src/lib/github-utils/github-env-vars'
import * as githubRelease from '../src/lib/github-utils/github-release'
import * as tauriBuilder from '../src/lib/tauri-utils/tauri-builder'

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

// Other utilities
const timeRegex = /^\d{2}:\d{2}:\d{2}/

// Mock the GitHub Actions core library
let debugMock: jest.SpiedFunction<typeof core.debug>
let errorMock: jest.SpiedFunction<typeof core.error>
let getInputMock: jest.SpiedFunction<typeof core.getInput>
let getBooleanInputMock: jest.SpiedFunction<typeof core.getBooleanInput>
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>
let setOutputMock: jest.SpiedFunction<typeof core.setOutput>
let getOrCreateGitHubReleaseMock: jest.SpiedFunction<typeof githubRelease.getOrCreateGitHubRelease>
let buildMock: jest.SpiedFunction<typeof tauriBuilder.build>

const THE_GITHUB_TOKEN = 'unit-test-token'
const THE_GITHUB_OWNER = 'the-owner'
const THE_GITHUB_REPO = 'the-repo'
const THE_GITHUB_REPOSITORY = `${THE_GITHUB_OWNER}/${THE_GITHUB_REPO}`
const THE_GITHUB_SHA = '4a18826a13c84325ae24d2b7c83918159319c94d'
const THE_GITHUB_SHORT_SHA = '4a18826'

const setAllValidRequiredEnvVars = () => {
  test_setEnvVar('GITHUB_TOKEN', THE_GITHUB_TOKEN)
  test_setEnvVar('GITHUB_REPOSITORY', THE_GITHUB_REPOSITORY)
  test_setEnvVar('GITHUB_SHA', THE_GITHUB_SHA)
}

describe('run', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Unset all env vars
    test_deleteAllRequiredEnvVars()

    debugMock = jest.spyOn(core, 'debug').mockImplementation()
    errorMock = jest.spyOn(core, 'error').mockImplementation()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    getBooleanInputMock = jest.spyOn(core, 'getBooleanInput').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
    setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()
    getOrCreateGitHubReleaseMock = jest.spyOn(githubRelease, 'getOrCreateGitHubRelease').mockImplementation()
    buildMock = jest.spyOn(tauriBuilder, 'build').mockImplementation()
  })

  test.each([
    ['--target aarch64-apple-darwin --bundles app,dmg,updater', '{NAME}-v{VERSION}+{SHORT_SHA}', `my-app-under-test-v7.7.7+${THE_GITHUB_SHORT_SHA}`, true, true],
    ['--target aarch64-apple-darwin --bundles app,dmg,updater', 'hardcoded-text-{VERSION}', 'hardcoded-text-7.7.7', true, false],
    ['--target aarch64-apple-darwin --bundles app,dmg,updater', '{name}-{version}+{short_sha}', `my-app-under-test-7.7.7+${THE_GITHUB_SHORT_SHA}`, false, true],
    ['--target aarch64-apple-darwin --bundles app,dmg,updater', 'my-test-app', 'my-test-app', false, false],
    ['', '{VERSION}', '7.7.7', true, true],
    ['', '{sHoRt_sHa}', THE_GITHUB_SHORT_SHA, false, false],
  ])('Must succeed with buildOptions: %s, tagTemplate: %s, tag: %s, prerelease: %s, draft: %s', async (buildOptions, tagTemplate, tag, prerelease, draft) => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name as ActionInputs) {
        case 'tauriContext':
          return path.join(__dirname, 'test-files')
        case 'buildOptions':
          return buildOptions
        case 'tagTemplate':
          return tagTemplate
        default:
          return ''
      }
    })
    getBooleanInputMock.mockImplementation(name => {
      switch (name as ActionInputs) {
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
    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'appName' as ActionOutputs, 'my-app-under-test')
    expect(setOutputMock).toHaveBeenNthCalledWith(2, 'appVersion' as ActionOutputs, '7.7.7')
    expect(setOutputMock).toHaveBeenNthCalledWith(3, 'tag' as ActionOutputs, tag)
    expect(getOrCreateGitHubReleaseMock).toHaveBeenNthCalledWith(1, {
      githubToken: THE_GITHUB_TOKEN,
      repo: THE_GITHUB_REPO,
      owner: THE_GITHUB_OWNER,
      tag,
      sha: THE_GITHUB_SHA,
      prerelease,
      draft,
    })
    expect(buildMock).toHaveBeenNthCalledWith(1, path.join(__dirname, 'test-files'), buildOptions)
    expect(setFailedMock).not.toHaveBeenCalled()
    expect(errorMock).not.toHaveBeenCalled()
  })

  it('called with invalid "tauriContext" data must fail', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name as ActionInputs) {
        case 'tauriContext':
          return path.join(__dirname, 'non-existent-dir')
        default:
          return ''
      }
    })

    setAllValidRequiredEnvVars()
    await main.run()
    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenCalledTimes(1)

    // Core function not called
    expect(getOrCreateGitHubReleaseMock).not.toHaveBeenCalled()
    expect(buildMock).not.toHaveBeenCalled()
  })

  it('called with no GITHUB_TOKEN must fail', async () => {
    await main.run()
    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenNthCalledWith(1, 'GITHUB_TOKEN is required')

    // Core function not called
    expect(getOrCreateGitHubReleaseMock).not.toHaveBeenCalled()
    expect(buildMock).not.toHaveBeenCalled()
  })

  it('called with no GITHUB_REPOSITORY must fail', async () => {
    test_setEnvVar('GITHUB_TOKEN', THE_GITHUB_TOKEN)
    await main.run()
    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenNthCalledWith(1, 'GITHUB_REPOSITORY is required')

    // Core function not called
    expect(getOrCreateGitHubReleaseMock).not.toHaveBeenCalled()
    expect(buildMock).not.toHaveBeenCalled()
  })

  it('called with invalid GITHUB_REPOSITORY must fail', async () => {
    test_setEnvVar('GITHUB_TOKEN', THE_GITHUB_TOKEN)
    test_setEnvVar('GITHUB_REPOSITORY', 'invalid')
    await main.run()
    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenNthCalledWith(1, 'GITHUB_REPOSITORY must be called with the format owner/repo')
  })

  it('called with no GITHUB_SHA must fail', async () => {
    test_setEnvVar('GITHUB_TOKEN', THE_GITHUB_TOKEN)
    test_setEnvVar('GITHUB_REPOSITORY', THE_GITHUB_REPOSITORY)
    await main.run()
    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenNthCalledWith(1, 'GITHUB_SHA is required')

    // Core function not called
    expect(getOrCreateGitHubReleaseMock).not.toHaveBeenCalled()
    expect(buildMock).not.toHaveBeenCalled()
  })
})

/*
describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    debugMock = jest.spyOn(core, 'debug').mockImplementation()
    errorMock = jest.spyOn(core, 'error').mockImplementation()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
    setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()
  })

  it('sets the time output', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'milliseconds':
          return '500'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(debugMock).toHaveBeenNthCalledWith(1, 'Waiting 500 milliseconds ...')
    expect(debugMock).toHaveBeenNthCalledWith(2, expect.stringMatching(timeRegex))
    expect(debugMock).toHaveBeenNthCalledWith(3, expect.stringMatching(timeRegex))
    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'time', expect.stringMatching(timeRegex))
    expect(errorMock).not.toHaveBeenCalled()
  })

  it('sets a failed status', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'milliseconds':
          return 'this is not a number'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setFailedMock).toHaveBeenNthCalledWith(1, 'milliseconds not a number')
    expect(errorMock).not.toHaveBeenCalled()
  })
})
 */
