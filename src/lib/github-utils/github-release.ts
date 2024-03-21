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
  core.startGroup('GET OR CREATE RELEASE')
  const octokit = new Octokit({ auth: githubToken })
  try {
    // First try to get release by tag. If not found, create it.
    console.log(`Will get existing release with tag "${tag}"`)
    const existingRelease = await octokit.repos.getReleaseByTag({ owner, repo, tag })
    console.log(`Did get existing release with tag "${tag}". ID: "${existingRelease.data.id}"`)
  } catch (getReleaseError) {
    // If error is not 404, it's an unknown error.
    if ((getReleaseError as any).status !== 404) {
      throw new Error(`Unexpected error getting GitHub release by tag "${tag}": ${(getReleaseError as Error).message}`, { cause: getReleaseError })
    }

    // Release not found, create it.
    console.log(`Release with tag "${tag}" not found. Will create it.`)
    const createReleaseResponse = await octokit.repos.createRelease({
      owner,
      repo,
      tag_name: tag,
      target_commitish: sha,
      name: `Release ${tag}`,
      body: `Tag \`${tag}\``,
      draft,
      prerelease,
    } as CreateReleaseParams)
    console.log(`Did create release with tag "${tag}". ID: ${createReleaseResponse.data.id}`)
  } finally {
    core.endGroup()
  }
}
