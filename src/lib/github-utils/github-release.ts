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

const getDraftReleaseByTag = async ({ tag, repo, octokit, owner }: { octokit: Octokit; tag: string; repo: string; owner: string }): Promise<{ uploadUrl: string; releaseId: number }> => {
  // TODO: auto pagination so if there are more than 100 pages
  const releases = await octokit.repos.listReleases({ owner, repo, per_page: 100 })
  const foundRelease = releases.data.find(_ => _.tag_name === tag)
  console.log(foundRelease)
  if (!foundRelease) {
    throw { status: 404 }
  }
  return { uploadUrl: foundRelease.upload_url, releaseId: foundRelease.id }
}

export const getOrCreateGitHubRelease = async ({ githubToken, repo, owner, tag, sha, prerelease, draft }: Params): Promise<{ uploadUrl: string; releaseId: number }> => {
  const octokit = new Octokit({ auth: githubToken })
  core.startGroup('GET OR CREATE RELEASE')
  try {
    // First try to get release by tag. If not found, create it.
    console.log(`Will get existing release with tag "${tag}"`, { owner, repo, tag })
    if (draft) {
      // Draft releases cannot be retrieved directly.
      const release = await getDraftReleaseByTag({ tag, repo, octokit, owner })
      console.log(`Did get existing draft release with tag "${tag}".`, { owner, repo, tag, release })
      return release
    } else {
      const release = await octokit.repos.getReleaseByTag({ owner, repo, tag })
      console.log(`Did get existing non-draft release with tag "${tag}".`, { owner, repo, tag, release: release.data })
      return { uploadUrl: release.data.upload_url, releaseId: release.data.id }
    }
  } catch (error) {
    // If error is not 404, it's an unknown error.
    if ((error as any).status !== 404) {
      console.error('Unexpected error getting release by tag', { owner, repo, tag, error })
      throw new Error(`Unexpected error getting GitHub release by tag "${tag}": ${(error as Error).message}`, { cause: error })
    }

    // Release not found, create it.
    console.log(`Release with tag "${tag}" not found. Will create it.`, { owner, repo, tag, sha, draft, prerelease })
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
    console.log(`Did create release with tag "${tag}"`, { owner, repo, tag, sha, draft, prerelease, release: createReleaseResponse.data })
    return { uploadUrl: createReleaseResponse.data.upload_url, releaseId: createReleaseResponse.data.id }
  } finally {
    core.endGroup()
  }
}
