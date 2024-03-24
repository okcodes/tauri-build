import { Octokit } from '@octokit/rest'

export const listGithubReleaseAssets = async ({ githubToken, owner, repo, releaseId }: { githubToken: string; owner: string; repo: string; releaseId: number }): Promise<Record<string, string>> => {
  try {
    const octokit = new Octokit({ auth: githubToken })
    const response = await octokit.repos.listReleaseAssets({ owner, repo, release_id: releaseId, per_page: 10 })
    console.log('Listed release assets', { owner, repo, releaseId, response })
    return response.data.reduce(
      (acc, asset) => {
        acc[asset.name] = asset.url
        return acc
      },
      {} as Record<string, string>
    )
  } catch (error) {
    console.error('Unexpected error listing release assets', { owner, repo, releaseId, error })
    throw new Error(`Unexpected error listing release assets: ${(error as Error).message}`, { cause: error })
  }
}
