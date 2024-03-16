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
import { getBooleanInput } from '@actions/core'
import * as createGithubRelease from '../src/lib/github-utils/create-github-release'

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
let getOrCreateGitHubReleaseMock: jest.SpiedFunction<typeof createGithubRelease.getOrCreateGitHubRelease>

const setAllValidRequiredEnvVars = () => {
  test_setEnvVar('GITHUB_TOKEN', 'unit-test')
  test_setEnvVar('GITHUB_REPOSITORY', 'the-user/the-repo')
  test_setEnvVar('GITHUB_SHA', '4a18826a13c84325ae24d2b7c83918159319c94d')
}

describe('action', () => {
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
    getOrCreateGitHubReleaseMock = jest.spyOn(createGithubRelease, 'getOrCreateGitHubRelease').mockImplementation()
  })

  it('called with correct data must succeed', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name as ActionInputs) {
        case 'tauriContext':
          return path.join(__dirname, 'test-files')
        case 'tagTemplate':
          return 'my-test-app-{{VERSION}}-and-{{VERSION}}'
        default:
          return ''
      }
    })
    getBooleanInputMock.mockImplementation(name => {
      switch (name as ActionInputs) {
        case 'prerelease':
          return true
        case 'draft':
          return false
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
    expect(setOutputMock).toHaveBeenNthCalledWith(3, 'tag' as ActionOutputs, 'my-test-app-7.7.7-and-7.7.7')
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
  })

  it('called with no GITHUB_TOKEN must fail', async () => {
    await main.run()
    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenNthCalledWith(1, 'GITHUB_TOKEN is required')
  })

  it('called with no GITHUB_REPOSITORY must fail', async () => {
    test_setEnvVar('GITHUB_TOKEN', 'unit-test')
    await main.run()
    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenNthCalledWith(1, 'GITHUB_REPOSITORY is required')
  })

  it('called with invalid GITHUB_REPOSITORY must fail', async () => {
    test_setEnvVar('GITHUB_TOKEN', 'unit-test')
    test_setEnvVar('GITHUB_REPOSITORY', 'invalid')
    await main.run()
    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenNthCalledWith(1, 'GITHUB_REPOSITORY must be called with the format owner/repo')
  })

  it('called with no GITHUB_SHA must fail', async () => {
    test_setEnvVar('GITHUB_TOKEN', 'unit-test')
    test_setEnvVar('GITHUB_REPOSITORY', 'the-user/the-repo')
    await main.run()
    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenNthCalledWith(1, 'GITHUB_SHA is required')
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
