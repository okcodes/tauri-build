import { glob } from 'glob'
import path from 'path'
import fs from 'fs'
import * as core from '@actions/core'
import { executeCommand } from '../command-utils/command-utils'
import { Octokit } from '@octokit/rest'

type ArtifactExtension = 'AppImage' | 'AppImage.tar.gz' | 'AppImage.tar.gz.sig' | 'app' | 'app.tar.gz' | 'app.tar.gz.sig' | 'dmg' | 'exe' | 'nsis.zip' | 'nsis.zip.sig' | 'msi' | 'msi.zip' | 'msi.zip.sig'

const knownExtensions: ArtifactExtension[] = [
  // Linux
  'AppImage', // app
  'AppImage.tar.gz', // updater
  'AppImage.tar.gz.sig', // signature
  // macOS
  'app', // app
  'app.tar.gz', // updater
  'app.tar.gz.sig', // signature
  'dmg', // app (mountable)
  // Windows NSIS
  'exe', // app
  'nsis.zip', // updater
  'nsis.zip.sig', // signature
  // Windows MSI
  'msi', // app
  'msi.zip', // updater
  'msi.zip.sig', // signature
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

const updaterExtensions: readonly ArtifactExtension[] = Object.freeze(['AppImage.tar.gz', 'app.tar.gz', 'nsis.zip', 'msi.zip'])
const signatureExtensions: readonly ArtifactExtension[] = Object.freeze(['AppImage.tar.gz.sig', 'app.tar.gz.sig', 'nsis.zip.sig', 'msi.zip.sig'])

const isMacVersionlessArtifact = (filename: string) => {
  return macVersionlessExt.some(ext => filename.endsWith(ext))
}

const getUpdaterExtension = (filename: string): ArtifactExtension | undefined => {
  return updaterExtensions.find(ext => filename.endsWith(ext))
}

const getSignatureExtension = (filename: string): ArtifactExtension | undefined => {
  return signatureExtensions.find(ext => filename.endsWith(ext))
}

// Only mapping for apple targets are needed, because apple is the only platform that produces a file with no version attached to it (the .app).
const rustTargetToMacSuffixMap: Record<string, string> = {
  'aarch64-apple-darwin': 'aarch64',
  'x86_64-apple-darwin': 'x64',
  'universal-apple-darwin': 'universal',
}

const rustTargetToMacBasenameSuffix = (target: string) => {
  return rustTargetToMacSuffixMap[target] || target
}

const UPDATER_PREFIX = '.updater'

export const getAssetMeta = ({ appName, filePath, appVersion, rustTarget }: { appName: string; filePath: string; appVersion: string; rustTarget: string }): { assetName: string; isUpdater: boolean; isSignature: boolean } => {
  const updaterExt = getUpdaterExtension(filePath)
  const isUpdater = !!updaterExt
  const signatureExt = getSignatureExtension(filePath)
  const isSignature = !!signatureExt

  // Updaters and signatures use a prefix before the file basename.
  const updaterSuffix = isUpdater || isSignature ? UPDATER_PREFIX : ''

  if (isMacVersionlessArtifact(filePath)) {
    const match = path.basename(filePath).match(new RegExp(`^${appName}(?<extension>.*)`))
    const extension = match?.groups?.extension || ''
    const assetName = `${appName}_${appVersion}_${rustTargetToMacBasenameSuffix(rustTarget)}${updaterSuffix}${extension}`
    return { assetName, isUpdater, isSignature }
  }

  const updaterOrSignatureExtension = updaterExt || signatureExt
  if (updaterOrSignatureExtension) {
    const assetName = `${path.basename(filePath, `.${updaterOrSignatureExtension}`)}${updaterSuffix}.${updaterOrSignatureExtension}`
    return { assetName, isUpdater, isSignature }
  }

  const assetName = path.basename(filePath)
  return { assetName, isUpdater, isSignature }
}

export const uploadAppToGithub = async ({ rustTarget, appName, tauriContext, expectedArtifacts, appVersion, githubToken, owner, repo, tag }: UploadAppToGithubArgs): Promise<void> => {
  try {
    core.startGroup('UPLOAD APP TO GITHUB')

    const artifactsPattern = `src-tauri/target/${rustTarget}/release/bundle/**/${appName}*.{${knownExtensions.join(',')}}`

    // Find files to upload
    const artifactRelativePaths = await glob(artifactsPattern, { cwd: tauriContext })
    const artifacts = artifactRelativePaths.map(relativePath => ({
      path: path.join(tauriContext, relativePath),
      isDir: fs.statSync(path.join(tauriContext, relativePath)).isDirectory(),
      assetName: getAssetMeta({ filePath: relativePath, appName, rustTarget, appVersion }).assetName,
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
    console.log('Will get release by tag', { owner, repo, tag })
    const release = await octokit.repos.getReleaseByTag({ owner, repo, tag })
    console.log('Did get release by tag', { owner, repo, tag, release: release.data })
    const uploadUrl = release.data.upload_url
    console.log(`Will upload ${artifacts.length} artifacts`, artifacts)
    for (const artifact of artifacts) {
      await uploadArtifact({ artifactPath: artifact.path, githubToken, uploadUrl, name: artifact.assetName })
    }
    console.log(`Did upload ${artifacts.length} artifacts`, artifacts)
  } catch (error) {
    console.error('Cannot upload artifacts error details:', error)
    core.setFailed(`Cannot upload artifacts: ${(error as Error).message}`)
  } finally {
    core.endGroup()
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
    console.error('Error uploading artifact', { artifactPath, name, uploadUrl, error })
    throw new Error(`uploadArtifact failed: "${artifactPath}": ${(error as Error).message}`, { cause: error })
  }
}
