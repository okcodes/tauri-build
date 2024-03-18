import { Octokit } from '@octokit/rest'
import * as core from '@actions/core'

import type { RestEndpointMethodTypes } from '@octokit/rest'

type CreateReleaseParams = RestEndpointMethodTypes['repos']['createRelease']['parameters']

type Params = {
  githubToken: string
  repo: string
  owner: string
  tag: string
  sha: string
  prerelease: boolean
  draft: boolean
}

export const getOrCreateGitHubRelease = async ({ githubToken, repo, owner, tag, sha, prerelease, draft }: Params): Promise<void> => {
  try {
    // First try to get release by tag. If not found, create it.
    core.info(`Will get existing release with tag "${tag}"`)
    const octokit = new Octokit({ auth: githubToken })
    const existingRelease = await octokit.repos.getReleaseByTag({ owner, repo, tag })
    core.info(`Did get existing release with tag "${tag}". ID: "${existingRelease.data.id}"`)
  } catch (getReleaseError) {
    // If error is not 404, it's an unknown error.
    if ((getReleaseError as any).status !== 404) {
      throw new Error(`Unexpected error getting GitHub release by tag "${tag}": ${(getReleaseError as Error).message}`, { cause: getReleaseError })
    }

    // Release not found, create it.
    core.info(`Release with tag "${tag}" not found.`)
    await createGitHubRelease({ githubToken, repo, owner, tag, sha, prerelease, draft })
  }
}

export const createGitHubRelease = async ({ githubToken, repo, owner, tag, sha, prerelease, draft }: Params): Promise<void> => {
  core.info(`Will create will release with tag "${tag}" it.`)

  const octokit = new Octokit({ auth: githubToken })

  // Create tag manually so it get signed.
  try {
    console.log(`Will create tag "${tag}" in commit "${sha}"`)
    const createTagResponse = await octokit.git.createTag({
      owner,
      repo,
      tag,
      message: tag,
      object: sha,
      type: 'commit',
    } as RestEndpointMethodTypes['git']['createTag']['parameters'])
    console.log(`Did create tag "${tag}" in commit "${sha}". Tag sha: "${createTagResponse.data.sha}".`)

    // Create a reference for the tag
    console.log(`Will create reference to tag "${tag}".`)
    const referenceResponse = await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/tags/${tag}`,
      sha: createTagResponse.data.sha, // Is this sha different from the commit sha?
    })
    console.log(`Did create reference to tag "${tag}".`, referenceResponse)
  } catch (createTagError) {
    console.error(`Cannot create tag "${tag}" on commit "${sha}": ${(createTagError as Error).message}`, createTagError)
    // Don't throw. Creating a tag is not required, if a release is created the tag is created automatically.
    // The manual tag creation is just for creating a signed tag but that's not a required step.
  }

  const createReleaseResponse = await octokit.repos.createRelease({
    owner,
    repo,
    tag_name: tag,
    target_commitish: sha,
    name: `Release ${tag}`,
    body: `# Release \`${tag}\``,
    draft,
    prerelease,
  } as CreateReleaseParams)
  console.log(`Did create release with tag "${tag}". ID: ${createReleaseResponse.data.id}`)
}
