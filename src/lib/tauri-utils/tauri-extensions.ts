export type ArtifactExtension = 'AppImage' | 'AppImage.tar.gz' | 'AppImage.tar.gz.sig' | 'app' | 'app.tar.gz' | 'app.tar.gz.sig' | 'dmg' | 'exe' | 'nsis.zip' | 'nsis.zip.sig' | 'msi' | 'msi.zip' | 'msi.zip.sig'

export const knownExtensions: readonly ArtifactExtension[] = Object.freeze([
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
])

export const COMPRESS_EXTENSION = '.tar.gz'
export const UPDATER_EXTENSION = '.updater'

const macVersionlessExtensions: readonly ArtifactExtension[] = Object.freeze(['app', 'app.tar.gz', 'app.tar.gz.sig'])
const updaterExtensions: readonly ArtifactExtension[] = Object.freeze(['AppImage.tar.gz', 'app.tar.gz', 'nsis.zip', 'msi.zip'])
const signatureExtensions: readonly ArtifactExtension[] = Object.freeze(['AppImage.tar.gz.sig', 'app.tar.gz.sig', 'nsis.zip.sig', 'msi.zip.sig'])

export const isMacVersionlessArtifact = (filename: string) => {
  return macVersionlessExtensions.some(ext => filename.endsWith(ext))
}

export const getUpdaterExtension = (filename: string): ArtifactExtension | undefined => {
  return updaterExtensions.find(ext => filename.endsWith(ext))
}

export const getSignatureExtension = (filename: string): ArtifactExtension | undefined => {
  return signatureExtensions.find(ext => filename.endsWith(ext))
}
