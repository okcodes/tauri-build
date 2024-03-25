import { Octokit } from '@octokit/rest'

type UploadTextParams = {
  releaseId: number
  owner: string
  repo: string
  githubToken: string
  name: string
  text: string
}

export const uploadTextAsAsset = async ({ releaseId, owner, repo, githubToken, name, text }: UploadTextParams): Promise<void> => {
  try {
    console.log('Will upload text as asset', { releaseId, name })
    const octokit = new Octokit({ auth: githubToken })
    const release = await octokit.repos.getRelease({ release_id: releaseId, owner, repo })
    const data = Buffer.from(text, 'utf-8')
    const response = await octokit.repos.uploadReleaseAsset({
      url: release.data.upload_url,
      headers: { 'content-type': 'application/octet-stream' },
      name,
      data,
    } as any)
    console.log('Did upload text as asset', { releaseId, name, data: response.data })
  } catch (error) {
    console.error('Error uploading text as asset', { name, releaseId, error })
    throw new Error(`Error uploading text as asset "${name}": ${(error as Error).message}`, { cause: error })
  }
}
