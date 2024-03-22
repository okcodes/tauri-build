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
] as const)

export const COMPRESS_EXT = '.tar.gz'
