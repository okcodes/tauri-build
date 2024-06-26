import * as core from '@actions/core'
import { getRequiredEnvVars } from './lib/github-utils/github-env-vars'
import { build, targetFromBuildOptions } from './lib/tauri-utils/tauri-builder'
import { parseTauriCargoTomlFileInContext } from './lib/rust-utils/get-rust-app-info'
import { tagNameFromTemplate } from './lib/github-utils/tag-template'
import { getReleaseById, getReleaseByTagOrCreate } from './lib/github-utils/github-release'
import { uploadAppToGithub } from './lib/tauri-utils/tauri-github-uploader'
import { VERSION } from './version'

export type ActionInputs = 'tauriContext' | 'buildOptions' | 'expectedArtifacts' | 'tagTemplate' | 'releaseId'
export type ActionBooleanInputs = 'prerelease' | 'draft' | 'skipBuild'
export type ActionOutputs = 'appName' | 'appVersion' | 'tag' | 'releaseId'

const input = (name: ActionInputs, options: core.InputOptions): string => core.getInput(name, options)
const booleanInput = (name: ActionBooleanInputs, options: core.InputOptions): boolean => core.getBooleanInput(name, options)
const output = (name: ActionOutputs, value: string): void => core.setOutput(name, value)

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  console.log(`Running okcodes/tauri-build action v${VERSION}`)

  try {
    console.log(`Running Build App Command`)
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

    const tauriContext = input('tauriContext', { required: true, trimWhitespace: true })
    const buildOptions = input('buildOptions', { required: false, trimWhitespace: true })
    const expectedArtifactsStr = input('expectedArtifacts', { required: false, trimWhitespace: true })
    const tagTemplate = input('tagTemplate', { required: false, trimWhitespace: true })
    const releaseIdStr = input('releaseId', { required: false, trimWhitespace: true })
    const prerelease = booleanInput('prerelease', { required: false, trimWhitespace: true })
    const draft = booleanInput('draft', { required: false, trimWhitespace: true })
    const skipBuild = booleanInput('skipBuild', { required: false, trimWhitespace: true })

    // Validate tagTemplate and releaseId

    // TODO: Test these failed calls
    if (tagTemplate && releaseIdStr) {
      core.setFailed('You must provide only one either "releaseId" or "tagTemplate" but not both.')
      return
    }

    if (!tagTemplate && !releaseIdStr) {
      core.setFailed('You must provide either "releaseId" or "tagTemplate".')
      return
    }

    if (releaseIdStr && isNaN(+releaseIdStr)) {
      core.setFailed('When you provide "releaseId", it must be a number.')
      return
    }

    // TODO: Test this
    if (!skipBuild && !releaseIdStr) {
      core.warning(
        'IMPORTANT: You should consider using the "releaseId" input when "skipBuild" is `false` to prevent creating duplicated (draft) releases which means ending up with incomplete built artifacts when running jobs on matrices, see why: https://github.com/okcodes/tauri-build/issues/9'
      )
    }

    // TODO: Test this
    if (skipBuild && !tagTemplate) {
      core.setFailed('When you set "skipBuild" to true, you must specify "tagTemplate" as well.')
      return
    }

    // Validate amount of artifacts
    const invalidExpectedArtifacts = isNaN(+expectedArtifactsStr) || +expectedArtifactsStr <= 0
    if (!skipBuild && invalidExpectedArtifacts) {
      core.setFailed('The input "expectedArtifacts" must be a number greater or equal to 1.')
      return
    }

    // Validate build options
    if (!skipBuild && !targetFromBuildOptions(buildOptions)) {
      core.setFailed('The buildOptions must contain a flag --target (or -t) specifying the rust target triple to build')
      return
    }

    // Debug logs (core.debug("msg")) are only output if the `ACTIONS_STEP_DEBUG` secret is true
    console.log('Action called with:', { owner, repo, GITHUB_SHA, GITHUB_REPOSITORY })
    const appInfo = await parseTauriCargoTomlFileInContext(tauriContext)
    const { name: appName, version: appVersion } = appInfo.package

    // Create release if it does not exist
    const {
      uploadUrl,
      id: retrievedReleaseId,
      tag,
    } = releaseIdStr
      ? await getReleaseById({ owner, repo, id: +releaseIdStr, githubToken: GITHUB_TOKEN })
      : await getReleaseByTagOrCreate({ githubToken: GITHUB_TOKEN, repo, owner, tag: tagNameFromTemplate(tagTemplate, { appInfo, gitSha: GITHUB_SHA }), sha: GITHUB_SHA, prerelease, draft })
    // TODO: Test these above

    // Set app meta outputs
    output('appName', appName)
    output('appVersion', appVersion)
    output('tag', tag)
    output('releaseId', String(retrievedReleaseId))

    if (skipBuild) {
      return
    }

    const { target: rustTarget } = await build(tauriContext, buildOptions)
    await uploadAppToGithub({ uploadUrl, appVersion, githubToken: GITHUB_TOKEN, appName, tauriContext, rustTarget, expectedArtifacts: +expectedArtifactsStr, tag })
  } catch (error) {
    // Fail the workflow run if an error occurs
    console.error('Error building app', error)
    core.setFailed((error as Error).message)
  }
}
