import { Octokit } from '@octokit/rest'
import * as core from '@actions/core'

import type { RestEndpointMethodTypes } from '@octokit/rest'

type CreateReleaseParams = RestEndpointMethodTypes['repos']['createRelease']['parameters']

type GithubRelease = {
  uploadUrl: string
  id: number
  tag: string
}

const getDraftReleaseByTag = async ({ tag, repo, octokit, owner }: { octokit: Octokit; tag: string; repo: string; owner: string }): Promise<GithubRelease> => {
  let page = 1
  let hasNextPage = true

  while (hasNextPage) {
    const releases = await octokit.repos.listReleases({ owner, repo, per_page: 100, page })
    const matchingReleases = releases.data.filter(_ => _.tag_name === tag)
    if (matchingReleases[0]) {
      return { uploadUrl: matchingReleases[0].upload_url, id: matchingReleases[0].id, tag: matchingReleases[0].tag_name }
    }
    hasNextPage = releases.headers?.link?.includes('rel="next"') || false
    if (hasNextPage) {
      page++
    }
  }

  throw { status: 404 }
}

type GetReleaseByTagOrCreateParams = {
  githubToken: string
  repo: string
  owner: string
  tag: string
  sha: string
  prerelease: boolean
  draft: boolean
}

export const getReleaseByTagOrCreate = async ({ githubToken, repo, owner, tag, sha, prerelease, draft }: GetReleaseByTagOrCreateParams): Promise<GithubRelease> => {
  const octokit = new Octokit({ auth: githubToken })
  core.startGroup('GET OR CREATE RELEASE')
  try {
    // First try to get release by tag. If not found, create it.
    console.log(`Will get release with tag "${tag}"`, { owner, repo, tag, draft })
    if (draft) {
      // Draft releases cannot be retrieved directly.
      const release = await getDraftReleaseByTag({ tag, repo, octokit, owner })
      console.log(`Did get existing draft release with tag "${tag}".`, { owner, repo, tag, release })
      return release
    } else {
      const release = await octokit.repos.getReleaseByTag({ owner, repo, tag })
      console.log(`Did get existing non-draft release with tag "${tag}".`, { owner, repo, tag, release: release.data })
      return { uploadUrl: release.data.upload_url, id: release.data.id, tag: release.data.tag_name }
    }
  } catch (error) {
    // If error is not 404, it's an unknown error.
    if ((error as any).status !== 404) {
      console.error('Unexpected error getting release by tag', { owner, repo, tag }, error)
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
    return { uploadUrl: createReleaseResponse.data.upload_url, id: createReleaseResponse.data.id, tag: createReleaseResponse.data.tag_name }
  } finally {
    core.endGroup()
  }
}

type GetReleaseByIdParams = {
  githubToken: string
  repo: string
  owner: string
  id: number
}

export const getReleaseById = async ({ githubToken, repo, owner, id }: GetReleaseByIdParams): Promise<GithubRelease> => {
  try {
    const octokit = new Octokit({ auth: githubToken })
    const release = await octokit.repos.getRelease({ release_id: id, owner, repo })
    return { uploadUrl: release.data.upload_url, id: release.data.id, tag: release.data.tag_name }
  } catch (error) {
    console.error('Cannot get release by ID', { owner, repo, id }, error)
    throw new Error(`Cannot get ID with ID "${id}": ${(error as Error).message}`, { cause: error })
  }
}
