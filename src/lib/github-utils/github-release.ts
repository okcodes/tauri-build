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
    core.debug(`Will get existing release with tag "${tag}"`)
    const octokit = new Octokit({ auth: githubToken })
    const existingRelease = await octokit.repos.getReleaseByTag({ owner, repo, tag })
    core.debug(`Did get existing release with tag "${tag}". ID: "${existingRelease.data.id}"`)
  } catch (getReleaseError) {
    // If error is not 404, it's an unknown error.
    if ((getReleaseError as any).status !== 404) {
      throw new Error(`Unexpected error getting GitHub release by tag "${tag}": ${(getReleaseError as Error).message}`, { cause: getReleaseError })
    }

    // Release not found, create it.
    core.debug(`Release with tag "${tag}" not found.`)
    await createGitHubRelease({ githubToken, repo, owner, tag, sha, prerelease, draft })
  }
}

export const createGitHubRelease = async ({ githubToken, repo, owner, tag, sha, prerelease, draft }: Params): Promise<void> => {
  core.debug(`Will create will release with tag "${tag}" it.`)
  const octokit = new Octokit({ auth: githubToken })
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
