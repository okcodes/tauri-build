import { glob } from 'glob'
import path from 'path'
import fs from 'fs'
import * as core from '@actions/core'
import { executeCommand } from '../command-utils/command-utils'
import { Octokit } from '@octokit/rest'

type ArtifactExtension = 'AppImage' | 'AppImage.tar.gz' | 'AppImage.tar.gz.sig' | 'app' | 'app.tar.gz' | 'app.tar.gz.sig' | 'dmg' | 'exe' | 'nsis.zip' | 'nsis.zip.sig' | 'msi' | 'msi.zip' | 'msi.zip.sig'

const knownExtensions: ArtifactExtension[] = [
  // Linux
  'AppImage', // the standard app bundle
  'AppImage.tar.gz', // the updater bundle
  'AppImage.tar.gz.sig', // the signature of the update bundle
  // macOS
  'app', // the standard app bundle
  'app.tar.gz', // the updater bundle
  'app.tar.gz.sig', // the signature of the update bundle
  'dmg', // app bundle in a mountable disk image
  // Windows NSIS
  'exe', // the standard app bundle
  'nsis.zip', // the updater bundle
  'nsis.zip.sig', // the signature of the update bundle
  // Windows MSI
  'msi', // the standard app bundle
  'msi.zip', // the updater bundle
  'msi.zip.sig', // the signature of the update bundle
]
const COMPRESS_EXT = '.tar.gz'

type UploadAppToGithubArgs = {
  rustTarget: string
  appName: string
  tauriContext: string
  expectedArtifacts: number
  appVersion: string
  githubToken: string
  repo: string
  owner: string
  tag: string
}

const macVersionlessExt: readonly ArtifactExtension[] = Object.freeze(['app', 'app.tar.gz', 'app.tar.gz.sig'])
const macUpdaterOrSignatureExt: readonly ArtifactExtension[] = Object.freeze(['app.tar.gz', 'app.tar.gz.sig'])

const isMacVersionlessArtifact = (filename: string) => {
  return macVersionlessExt.some(ext => filename.endsWith(ext))
}

const isMacUpdaterOrSignature = (filename: string) => {
  return macUpdaterOrSignatureExt.some(ext => filename.endsWith(ext))
}

const rustTargetToMacSuffixMap: Record<string, string> = {
  'aarch64-apple-darwin': 'aarch64',
  'x86_64-apple-darwin': 'x64',
  'universal-apple-darwin': 'universal',
}

const rustTargetToMacSuffix = (target: string) => {
  return rustTargetToMacSuffixMap[target] || target
}

const getAssetName = ({ appName, artifactPath, appVersion, rustTarget }: { appName: string; artifactPath: string; appVersion: string; rustTarget: string }): string => {
  if (isMacVersionlessArtifact(artifactPath)) {
    const match = path.basename(artifactPath).match(new RegExp(`^${appName}(?<extension>.*)`))
    const extension = match?.groups?.extension || ''
    const updaterSuffix = isMacUpdaterOrSignature(artifactPath) ? '-updater' : '' // TODO: Use the -updater suffix in all platforms.
    return `${appName}_${appVersion}_${rustTargetToMacSuffix(rustTarget)}${updaterSuffix}${extension}`
  }
  return path.basename(artifactPath)
}

export const uploadAppToGithub = async ({ rustTarget, appName, tauriContext, expectedArtifacts, appVersion, githubToken, owner, repo, tag }: UploadAppToGithubArgs): Promise<void> => {
  try {
    const artifactsPattern = `src-tauri/target/${rustTarget}/release/bundle/**/${appName}*.{${knownExtensions.join(',')}}`

    // Find files to upload
    const artifacts = (await glob(artifactsPattern, { cwd: tauriContext })).map(relativePath => ({
      path: path.join(tauriContext, relativePath),
      isDir: fs.statSync(path.join(tauriContext, relativePath)).isDirectory(),
      assetName: getAssetName({ artifactPath: relativePath, appName, rustTarget, appVersion }),
    }))

    // Validate amount of artifacts
    if (isNaN(expectedArtifacts) || expectedArtifacts <= 0) {
      core.setFailed(`The input "expected-artifacts" received an invalid value ${expectedArtifacts}. Make sure it's a number greater or equal to 1.`)
      return
    }

    if (artifacts.length !== expectedArtifacts) {
      core.setFailed(`Expecting ${expectedArtifacts} artifacts but got ${artifacts.length}: ${JSON.stringify(artifacts)}`)
      return
    }

    console.log(`Found ${artifacts.length} artifacts`, artifacts)

    // Compress directory artifacts
    for (let i in artifacts) {
      const artifact = artifacts[i]!

      // Compress only the dir artifacts
      if (!artifact.isDir) continue

      // Prepare compressed path
      const artifactDir = path.dirname(artifact.path)
      const artifactBasename = path.basename(artifact.path)
      const zArtifactPath = path.join(artifactDir, `__zipped__${artifactBasename}${COMPRESS_EXT}`)

      // Fail if the compressed file already exist, preventing overriding existing data
      if (fs.existsSync(zArtifactPath)) {
        core.setFailed(`Won't compress artifact, the file "${zArtifactPath}" already exists.`)
        return
      }

      // Compress
      const zipCommand = `tar czf ${zArtifactPath} -C ${artifactDir} ${artifactBasename}`
      console.log(`Dir Artifact: "${artifact.path}" is a directory, will compress`, { zipCommand, artifact })
      await executeCommand(zipCommand)

      // Replace artifact original name with the name after compressing it.
      artifacts[i]!.path = zArtifactPath // The artifact to upload now is the zipped one
      artifacts[i]!.assetName += COMPRESS_EXT // Append zipped ext to asset name
    }

    // Upload each artifact
    console.log(`Found ${artifacts.length} artifacts, did compress the ones that are directories.".`, artifacts)
    // Get release where to upload the artifacts
    const octokit = new Octokit({ auth: githubToken })
    const release = await octokit.repos.getReleaseByTag({ owner, repo, tag })
    const uploadUrl = release.data.upload_url
    for (const artifact of artifacts) {
      await uploadArtifact({ artifactPath: artifact.path, githubToken, uploadUrl, name: artifact.assetName })
    }
    console.log(`Did upload ${artifacts.length} artifacts`, artifacts)
  } catch (error) {
    core.setFailed(`Cannot upload artifacts: ${(error as Error).message}`)
  }
}

type UploadParams = {
  artifactPath: string
  uploadUrl: string
  githubToken: string
  name: string
}

const uploadArtifact = async ({ artifactPath, uploadUrl, githubToken, name }: UploadParams) => {
  try {
    console.log('Will read artifact file', { artifactPath, name })
    const fileBuffer = fs.readFileSync(artifactPath)
    console.log('Did read artifact file', { artifactPath, name })

    // Create an octokit instance per upload, because if an upload takes too long, and this function is not called in parallel calls that are invoked late will contain an expired octokit instance.
    console.log('Will upload artifact file', { artifactPath, name })
    const octokit = new Octokit({ auth: githubToken })
    const response = await octokit.repos.uploadReleaseAsset({ url: uploadUrl, headers: { 'content-type': 'application/octet-stream' }, name, data: fileBuffer } as any)
    console.log('Did upload artifact file', { artifactPath, name, data: response.data })
  } catch (error) {
    throw new Error(`uploadArtifact failed: "${artifactPath}": ${(error as Error).message}`, { cause: error })
  }
}
