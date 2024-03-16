import * as core from '@actions/core'
import { parseTauriCargoTomlFileInContext } from './lib/rust-utils/get-rust-app-info'
import { getRequiredEnvVars } from './lib/github-utils/github-env-vars'

export type ActionInputs = 'tauriContext'
export type ActionOutputs = 'appName' | 'appVersion'

const input = (name: ActionInputs, options: core.InputOptions = { required: true, trimWhitespace: true }) => core.getInput(name, options)

const output = (name: ActionOutputs, value: any) => core.setOutput(name, value)

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const { GITHUB_TOKEN, GITHUB_REPOSITORY, GITHUB_SHA } = getRequiredEnvVars()

    if (!GITHUB_TOKEN) {
      core.setFailed('GITHUB_TOKEN is required')
      return
    }

    if (!GITHUB_REPOSITORY) {
      core.setFailed('GITHUB_REPOSITORY is required')
      return
    }

    const [owner, repo] = GITHUB_REPOSITORY.split('/')

    if (!owner || !repo) {
      core.setFailed('GITHUB_REPOSITORY must be called with the format owner/repo')
      return
    }

    if (!GITHUB_SHA) {
      core.setFailed('GITHUB_SHA is required')
      return
    }

    const tauriContext = input('tauriContext')
    // Debug logs (core.debug("msg")) are only output if the `ACTIONS_STEP_DEBUG` secret is true
    console.log('Action called with:', { owner, repo, GITHUB_SHA, GITHUB_REPOSITORY }, new Date().toTimeString())
    const appInfo = await parseTauriCargoTomlFileInContext(tauriContext)
    output('appName', appInfo.package.name)
    output('appVersion', appInfo.package.version)
  } catch (error) {
    // Fail the workflow run if an error occurs
    core.setFailed((error as Error).message)
  }
}
