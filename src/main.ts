import * as core from '@actions/core'
import { wait } from './wait'
import { parseCargoTomlFile, parseTauriCargoTomlFileInContext } from './lib/rust-utils/get-rust-app-info'

export type ActionInputs = 'tauriContext'
export type ActionOutputs = 'appName' | 'appVersion'

const input = (name: ActionInputs, options: core.InputOptions = { required: true, trimWhitespace: true }) => core.getInput(name, options)

const output = (name: ActionOutputs, value: any) => core.setOutput(name, value)

const booleanInput = (name: ActionInputs) => core.getBooleanInput(name, { required: true })

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const { GITHUB_TOKEN = '', GITHUB_REPOSITORY = '', GITHUB_SHA = '' } = process.env as GithubEnvVars

    if (!GITHUB_TOKEN) {
      core.setFailed('GITHUB_TOKEN is required')
      return
    }

    const [owner, repo] = GITHUB_REPOSITORY.split('/')

    const tauriContext = input('tauriContext')
    // Debug logs (core.debug("msg")) are only output if the `ACTIONS_STEP_DEBUG` secret is true
    console.log('Action called with:', { owner, repo, GITHUB_SHA, GITHUB_REPOSITORY }, new Date().toTimeString())
    const appInfo = await parseTauriCargoTomlFileInContext(tauriContext)
    output('appName', appInfo.package.name)
    output('appVersion', appInfo.package.version)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
