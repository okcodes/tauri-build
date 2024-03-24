import { assembleSemiUpdater, TauriSemiUpdater } from './tauri-semi-updater-assembler'

const allAssets: GithubAsset[] = [
  // macOS Silicon (darwin-aarch64)
  { url: 'https://example.com/aarch64-apple-darwin.xxx_0.0.18_aarch64.app.tar.gz/0000', name: 'aarch64-apple-darwin.xxx_0.0.18_aarch64.app.tar.gz' },
  { url: 'https://example.com/aarch64-apple-darwin.xxx_0.0.18_aarch64.dmg/0000', name: 'aarch64-apple-darwin.xxx_0.0.18_aarch64.dmg' },
  { url: 'https://example.com/aarch64-apple-darwin.xxx_0.0.18_aarch64.updater.app.tar.gz/0000', name: 'aarch64-apple-darwin.xxx_0.0.18_aarch64.updater.app.tar.gz' },
  { url: 'https://example.com/aarch64-apple-darwin.xxx_0.0.18_aarch64.updater.app.tar.gz.sig/0000', name: 'aarch64-apple-darwin.xxx_0.0.18_aarch64.updater.app.tar.gz.sig' },
  // macOS Intel (darwin-x86_64)
  { url: 'https://example.com/x86_64-apple-darwin.xxx_0.0.18_x64.app.tar.gz/0000', name: 'x86_64-apple-darwin.xxx_0.0.18_x64.app.tar.gz' },
  { url: 'https://example.com/x86_64-apple-darwin.xxx_0.0.18_x64.dmg/0000', name: 'x86_64-apple-darwin.xxx_0.0.18_x64.dmg' },
  { url: 'https://example.com/x86_64-apple-darwin.xxx_0.0.18_x64.updater.app.tar.gz/0000', name: 'x86_64-apple-darwin.xxx_0.0.18_x64.updater.app.tar.gz' },
  { url: 'https://example.com/x86_64-apple-darwin.xxx_0.0.18_x64.updater.app.tar.gz.sig/0000', name: 'x86_64-apple-darwin.xxx_0.0.18_x64.updater.app.tar.gz.sig' },
  // macOS Universal (darwin-aarch64, darwin-x86_64)
  { url: 'https://example.com/universal-apple-darwin.xxx_0.0.18_universal.app.tar.gz/0000', name: 'universal-apple-darwin.xxx_0.0.18_universal.app.tar.gz' },
  { url: 'https://example.com/universal-apple-darwin.xxx_0.0.18_universal.dmg/0000', name: 'universal-apple-darwin.xxx_0.0.18_universal.dmg' },
  { url: 'https://example.com/universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz/0000', name: 'universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz' },
  { url: 'https://example.com/universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz.sig/0000', name: 'universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz.sig' },
  // Windows 64 (windows-x86_64)
  { url: 'https://example.com/x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.exe/0000', name: 'x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.exe' },
  { url: 'https://example.com/x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.updater.nsis.zip/0000', name: 'x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.updater.nsis.zip' },
  { url: 'https://example.com/x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.updater.nsis.zip.sig/0000', name: 'x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.updater.nsis.zip.sig' },
  { url: 'https://example.com/x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.msi/0000', name: 'x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.msi' },
  { url: 'https://example.com/x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.updater.msi.zip/0000', name: 'x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.updater.msi.zip' },
  { url: 'https://example.com/x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.updater.msi.zip.sig/0000', name: 'x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.updater.msi.zip.sig' },
  // Windows 32 (windows-i686)
  { url: 'https://example.com/i686-pc-windows-msvc.xxx_0.0.18_x86-setup.exe/0000', name: 'i686-pc-windows-msvc.xxx_0.0.18_x86-setup.exe' },
  { url: 'https://example.com/i686-pc-windows-msvc.xxx_0.0.18_x86-setup.updater.nsis.zip/0000', name: 'i686-pc-windows-msvc.xxx_0.0.18_x86-setup.updater.nsis.zip' },
  { url: 'https://example.com/i686-pc-windows-msvc.xxx_0.0.18_x86-setup.updater.nsis.zip.sig/0000', name: 'i686-pc-windows-msvc.xxx_0.0.18_x86-setup.updater.nsis.zip.sig' },
  { url: 'https://example.com/i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.msi/0000', name: 'i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.msi' },
  { url: 'https://example.com/i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.updater.msi.zip/0000', name: 'i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.updater.msi.zip' },
  { url: 'https://example.com/i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.updater.msi.zip.sig/0000', name: 'i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.updater.msi.zip.sig' },
  // Windows ARM64 (windows-aarch64)
  { url: 'https://example.com/aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.exe/0000', name: 'aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.exe' },
  { url: 'https://example.com/aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip/0000', name: 'aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip' },
  { url: 'https://example.com/aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip.sig/0000', name: 'aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip.sig' },
  // Invalid Random Assets
  { url: 'https://example.com/an-asset.txt/0000', name: 'an-asset.txt' },
  { url: 'https://example.com/README.md/0000', name: 'README.md' },
  { url: 'https://example.com/INVALIDaarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip.sig/0000', name: 'INVALIDaarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip.sig' },
]

const allAssetsWithoutSignatures: GithubAsset[] = [
  // macOS Silicon (darwin-aarch64)
  { url: 'https://example.com/aarch64-apple-darwin.xxx_0.0.18_aarch64.app.tar.gz/1111', name: 'aarch64-apple-darwin.xxx_0.0.18_aarch64.app.tar.gz' },
  { url: 'https://example.com/aarch64-apple-darwin.xxx_0.0.18_aarch64.dmg/1111', name: 'aarch64-apple-darwin.xxx_0.0.18_aarch64.dmg' },
  { url: 'https://example.com/aarch64-apple-darwin.xxx_0.0.18_aarch64.updater.app.tar.gz/1111', name: 'aarch64-apple-darwin.xxx_0.0.18_aarch64.updater.app.tar.gz' },
  // macOS Intel (darwin-x86_64)
  { url: 'https://example.com/x86_64-apple-darwin.xxx_0.0.18_x64.app.tar.gz/1111', name: 'x86_64-apple-darwin.xxx_0.0.18_x64.app.tar.gz' },
  { url: 'https://example.com/x86_64-apple-darwin.xxx_0.0.18_x64.dmg/1111', name: 'x86_64-apple-darwin.xxx_0.0.18_x64.dmg' },
  { url: 'https://example.com/x86_64-apple-darwin.xxx_0.0.18_x64.updater.app.tar.gz/1111', name: 'x86_64-apple-darwin.xxx_0.0.18_x64.updater.app.tar.gz' },
  // macOS Universal (darwin-aarch64, darwin-x86_64)
  { url: 'https://example.com/universal-apple-darwin.xxx_0.0.18_universal.app.tar.gz/1111', name: 'universal-apple-darwin.xxx_0.0.18_universal.app.tar.gz' },
  { url: 'https://example.com/universal-apple-darwin.xxx_0.0.18_universal.dmg/1111', name: 'universal-apple-darwin.xxx_0.0.18_universal.dmg' },
  { url: 'https://example.com/universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz/1111', name: 'universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz' },
  // Windows 64 (windows-x86_64)
  { url: 'https://example.com/x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.exe/1111', name: 'x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.exe' },
  { url: 'https://example.com/x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.updater.nsis.zip/1111', name: 'x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.updater.nsis.zip' },
  { url: 'https://example.com/x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.msi/1111', name: 'x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.msi' },
  { url: 'https://example.com/x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.updater.msi.zip/1111', name: 'x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.updater.msi.zip' },
  // Windows 32 (windows-i686)
  { url: 'https://example.com/i686-pc-windows-msvc.xxx_0.0.18_x86-setup.exe/1111', name: 'i686-pc-windows-msvc.xxx_0.0.18_x86-setup.exe' },
  { url: 'https://example.com/i686-pc-windows-msvc.xxx_0.0.18_x86-setup.updater.nsis.zip/1111', name: 'i686-pc-windows-msvc.xxx_0.0.18_x86-setup.updater.nsis.zip' },
  { url: 'https://example.com/i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.msi/1111', name: 'i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.msi' },
  { url: 'https://example.com/i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.updater.msi.zip/1111', name: 'i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.updater.msi.zip' },
  // Windows ARM64 (windows-aarch64)
  { url: 'https://example.com/aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.exe/1111', name: 'aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.exe' },
  { url: 'https://example.com/aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip/1111', name: 'aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip' },
]

const allAssetsWithoutUpdaters: GithubAsset[] = [
  // macOS Silicon (darwin-aarch64)
  { url: 'https://example.com/aarch64-apple-darwin.xxx_0.0.18_aarch64.app.tar.gz/0000', name: 'aarch64-apple-darwin.xxx_0.0.18_aarch64.app.tar.gz' },
  { url: 'https://example.com/aarch64-apple-darwin.xxx_0.0.18_aarch64.dmg/0000', name: 'aarch64-apple-darwin.xxx_0.0.18_aarch64.dmg' },
  { url: 'https://example.com/aarch64-apple-darwin.xxx_0.0.18_aarch64.updater.app.tar.gz.sig/0000', name: 'aarch64-apple-darwin.xxx_0.0.18_aarch64.updater.app.tar.gz.sig' },
  // macOS Intel (darwin-x86_64)
  { url: 'https://example.com/x86_64-apple-darwin.xxx_0.0.18_x64.app.tar.gz/0000', name: 'x86_64-apple-darwin.xxx_0.0.18_x64.app.tar.gz' },
  { url: 'https://example.com/x86_64-apple-darwin.xxx_0.0.18_x64.dmg/0000', name: 'x86_64-apple-darwin.xxx_0.0.18_x64.dmg' },
  { url: 'https://example.com/x86_64-apple-darwin.xxx_0.0.18_x64.updater.app.tar.gz.sig/0000', name: 'x86_64-apple-darwin.xxx_0.0.18_x64.updater.app.tar.gz.sig' },
  // macOS Universal (darwin-aarch64, darwin-x86_64)
  { url: 'https://example.com/universal-apple-darwin.xxx_0.0.18_universal.app.tar.gz/0000', name: 'universal-apple-darwin.xxx_0.0.18_universal.app.tar.gz' },
  { url: 'https://example.com/universal-apple-darwin.xxx_0.0.18_universal.dmg/0000', name: 'universal-apple-darwin.xxx_0.0.18_universal.dmg' },
  { url: 'https://example.com/universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz.sig/0000', name: 'universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz.sig' },
  // Windows 64 (windows-x86_64)
  { url: 'https://example.com/x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.exe/0000', name: 'x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.exe' },
  { url: 'https://example.com/x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.updater.nsis.zip.sig/0000', name: 'x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.updater.nsis.zip.sig' },
  { url: 'https://example.com/x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.msi/0000', name: 'x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.msi' },
  { url: 'https://example.com/x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.updater.msi.zip.sig/0000', name: 'x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.updater.msi.zip.sig' },
  // Windows 32 (windows-i686)
  { url: 'https://example.com/i686-pc-windows-msvc.xxx_0.0.18_x86-setup.exe/0000', name: 'i686-pc-windows-msvc.xxx_0.0.18_x86-setup.exe' },
  { url: 'https://example.com/i686-pc-windows-msvc.xxx_0.0.18_x86-setup.updater.nsis.zip.sig/0000', name: 'i686-pc-windows-msvc.xxx_0.0.18_x86-setup.updater.nsis.zip.sig' },
  { url: 'https://example.com/i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.msi/0000', name: 'i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.msi' },
  { url: 'https://example.com/i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.updater.msi.zip.sig/0000', name: 'i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.updater.msi.zip.sig' },
  // Windows ARM64 (windows-aarch64)
  { url: 'https://example.com/aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.exe/0000', name: 'aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.exe' },
  { url: 'https://example.com/aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip.sig/0000', name: 'aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip.sig' },
]

describe('assembleSemiUpdater', () => {
  type TestCase = {
    description: string
    appVersion: string
    pubDate: string
    assets: GithubAsset[]
    preferUniversal: boolean
    preferNsis: boolean
    expected: TauriSemiUpdater
  }
  const testCases: TestCase[] = [
    {
      description: 'app build for windows + macOS',
      appVersion: '0.0.0',
      pubDate: new Date('2024-03-16T10:05:30Z').toString(),
      assets: allAssets,
      preferUniversal: false,
      preferNsis: false,
      expected: {
        version: '0.0.0',
        notes: `Version 0.0.0 brings enhancements and bug fixes for improved performance and stability.`,
        pub_date: new Date('2024-03-16T10:05:30Z').toString(),
        platformsPlaceholder: {
          'darwin-aarch64': {
            updater: { url: 'https://example.com/aarch64-apple-darwin.xxx_0.0.18_aarch64.updater.app.tar.gz/0000', name: 'aarch64-apple-darwin.xxx_0.0.18_aarch64.updater.app.tar.gz' },
            signature: { url: 'https://example.com/aarch64-apple-darwin.xxx_0.0.18_aarch64.updater.app.tar.gz.sig/0000', name: 'aarch64-apple-darwin.xxx_0.0.18_aarch64.updater.app.tar.gz.sig' },
          },
          'darwin-x86_64': {
            updater: { url: 'https://example.com/x86_64-apple-darwin.xxx_0.0.18_x64.updater.app.tar.gz/0000', name: 'x86_64-apple-darwin.xxx_0.0.18_x64.updater.app.tar.gz' },
            signature: { url: 'https://example.com/x86_64-apple-darwin.xxx_0.0.18_x64.updater.app.tar.gz.sig/0000', name: 'x86_64-apple-darwin.xxx_0.0.18_x64.updater.app.tar.gz.sig' },
          },
          'windows-aarch64': {
            updater: { url: 'https://example.com/aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip/0000', name: 'aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip' },
            signature: { url: 'https://example.com/aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip.sig/0000', name: 'aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip.sig' },
          },
          'windows-i686': {
            updater: { url: 'https://example.com/i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.updater.msi.zip/0000', name: 'i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.updater.msi.zip' },
            signature: { url: 'https://example.com/i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.updater.msi.zip.sig/0000', name: 'i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.updater.msi.zip.sig' },
          },
          'windows-x86_64': {
            updater: { url: 'https://example.com/x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.updater.msi.zip/0000', name: 'x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.updater.msi.zip' },
            signature: { url: 'https://example.com/x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.updater.msi.zip.sig/0000', name: 'x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.updater.msi.zip.sig' },
          },
        },
      },
    },
    {
      description: 'app build for windows + macOS',
      appVersion: '0.0.0',
      pubDate: new Date('2024-03-16T10:05:30Z').toString(),
      assets: allAssets,
      preferUniversal: true,
      preferNsis: false,
      expected: {
        version: '0.0.0',
        notes: `Version 0.0.0 brings enhancements and bug fixes for improved performance and stability.`,
        pub_date: new Date('2024-03-16T10:05:30Z').toString(),
        platformsPlaceholder: {
          'darwin-aarch64': {
            updater: { url: 'https://example.com/universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz/0000', name: 'universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz' },
            signature: { url: 'https://example.com/universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz.sig/0000', name: 'universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz.sig' },
          },
          'darwin-x86_64': {
            updater: { url: 'https://example.com/universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz/0000', name: 'universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz' },
            signature: { url: 'https://example.com/universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz.sig/0000', name: 'universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz.sig' },
          },
          'windows-aarch64': {
            updater: { url: 'https://example.com/aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip/0000', name: 'aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip' },
            signature: { url: 'https://example.com/aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip.sig/0000', name: 'aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip.sig' },
          },
          'windows-i686': {
            updater: { url: 'https://example.com/i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.updater.msi.zip/0000', name: 'i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.updater.msi.zip' },
            signature: { url: 'https://example.com/i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.updater.msi.zip.sig/0000', name: 'i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.updater.msi.zip.sig' },
          },
          'windows-x86_64': {
            updater: { url: 'https://example.com/x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.updater.msi.zip/0000', name: 'x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.updater.msi.zip' },
            signature: { url: 'https://example.com/x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.updater.msi.zip.sig/0000', name: 'x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.updater.msi.zip.sig' },
          },
        },
      },
    },
    {
      description: 'app build for windows + macOS',
      appVersion: '0.0.0',
      pubDate: new Date('2024-03-16T10:05:30Z').toString(),
      assets: allAssets,
      preferUniversal: false,
      preferNsis: true,
      expected: {
        version: '0.0.0',
        notes: `Version 0.0.0 brings enhancements and bug fixes for improved performance and stability.`,
        pub_date: new Date('2024-03-16T10:05:30Z').toString(),
        platformsPlaceholder: {
          'darwin-aarch64': {
            updater: { url: 'https://example.com/aarch64-apple-darwin.xxx_0.0.18_aarch64.updater.app.tar.gz/0000', name: 'aarch64-apple-darwin.xxx_0.0.18_aarch64.updater.app.tar.gz' },
            signature: { url: 'https://example.com/aarch64-apple-darwin.xxx_0.0.18_aarch64.updater.app.tar.gz.sig/0000', name: 'aarch64-apple-darwin.xxx_0.0.18_aarch64.updater.app.tar.gz.sig' },
          },
          'darwin-x86_64': {
            updater: { url: 'https://example.com/x86_64-apple-darwin.xxx_0.0.18_x64.updater.app.tar.gz/0000', name: 'x86_64-apple-darwin.xxx_0.0.18_x64.updater.app.tar.gz' },
            signature: { url: 'https://example.com/x86_64-apple-darwin.xxx_0.0.18_x64.updater.app.tar.gz.sig/0000', name: 'x86_64-apple-darwin.xxx_0.0.18_x64.updater.app.tar.gz.sig' },
          },
          'windows-aarch64': {
            updater: { url: 'https://example.com/aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip/0000', name: 'aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip' },
            signature: { url: 'https://example.com/aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip.sig/0000', name: 'aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip.sig' },
          },
          'windows-i686': {
            updater: { url: 'https://example.com/i686-pc-windows-msvc.xxx_0.0.18_x86-setup.updater.nsis.zip/0000', name: 'i686-pc-windows-msvc.xxx_0.0.18_x86-setup.updater.nsis.zip' },
            signature: { url: 'https://example.com/i686-pc-windows-msvc.xxx_0.0.18_x86-setup.updater.nsis.zip.sig/0000', name: 'i686-pc-windows-msvc.xxx_0.0.18_x86-setup.updater.nsis.zip.sig' },
          },
          'windows-x86_64': {
            updater: { url: 'https://example.com/x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.updater.nsis.zip/0000', name: 'x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.updater.nsis.zip' },
            signature: { url: 'https://example.com/x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.updater.nsis.zip.sig/0000', name: 'x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.updater.nsis.zip.sig' },
          },
        },
      },
    },
    {
      description: 'app build for windows + macOS',
      appVersion: '0.0.0',
      pubDate: new Date('2024-03-16T10:05:30Z').toString(),
      assets: allAssets,
      preferUniversal: true,
      preferNsis: true,
      expected: {
        version: '0.0.0',
        notes: `Version 0.0.0 brings enhancements and bug fixes for improved performance and stability.`,
        pub_date: new Date('2024-03-16T10:05:30Z').toString(),
        platformsPlaceholder: {
          'darwin-aarch64': {
            updater: { url: 'https://example.com/universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz/0000', name: 'universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz' },
            signature: { url: 'https://example.com/universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz.sig/0000', name: 'universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz.sig' },
          },
          'darwin-x86_64': {
            updater: { url: 'https://example.com/universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz/0000', name: 'universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz' },
            signature: { url: 'https://example.com/universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz.sig/0000', name: 'universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz.sig' },
          },
          'windows-aarch64': {
            updater: { url: 'https://example.com/aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip/0000', name: 'aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip' },
            signature: { url: 'https://example.com/aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip.sig/0000', name: 'aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip.sig' },
          },
          'windows-i686': {
            updater: { url: 'https://example.com/i686-pc-windows-msvc.xxx_0.0.18_x86-setup.updater.nsis.zip/0000', name: 'i686-pc-windows-msvc.xxx_0.0.18_x86-setup.updater.nsis.zip' },
            signature: { url: 'https://example.com/i686-pc-windows-msvc.xxx_0.0.18_x86-setup.updater.nsis.zip.sig/0000', name: 'i686-pc-windows-msvc.xxx_0.0.18_x86-setup.updater.nsis.zip.sig' },
          },
          'windows-x86_64': {
            updater: { url: 'https://example.com/x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.updater.nsis.zip/0000', name: 'x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.updater.nsis.zip' },
            signature: { url: 'https://example.com/x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.updater.nsis.zip.sig/0000', name: 'x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.updater.nsis.zip.sig' },
          },
        },
      },
    },
    {
      description: 'app build for windows + macOS (prefer with fallback)',
      appVersion: '0.0.0',
      pubDate: new Date('2024-03-16T10:05:30Z').toString(),
      assets: [
        // macOS Silicon (darwin-aarch64)
        { url: 'https://example.com/aarch64-apple-darwin.xxx_0.0.18_aarch64.updater.app.tar.gz/2222', name: 'aarch64-apple-darwin.xxx_0.0.18_aarch64.updater.app.tar.gz' },
        { url: 'https://example.com/aarch64-apple-darwin.xxx_0.0.18_aarch64.updater.app.tar.gz.sig/2222', name: 'aarch64-apple-darwin.xxx_0.0.18_aarch64.updater.app.tar.gz.sig' },
        // macOS Intel (darwin-x86_64)
        { url: 'https://example.com/x86_64-apple-darwin.xxx_0.0.18_x64.updater.app.tar.gz/2222', name: 'x86_64-apple-darwin.xxx_0.0.18_x64.updater.app.tar.gz' },
        { url: 'https://example.com/x86_64-apple-darwin.xxx_0.0.18_x64.updater.app.tar.gz.sig/2222', name: 'x86_64-apple-darwin.xxx_0.0.18_x64.updater.app.tar.gz.sig' },
        // macOS Universal (darwin-aarch64, darwin-x86_64)
        // { url: 'https://example.com/universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz/2222', name: 'universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz' }, // Disable universal
        // { url: 'https://example.com/universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz.sig/2222', name: 'universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz.sig' }, // Disable universal
        // Windows 64 (windows-x86_64)
        // { url: 'https://example.com/x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.updater.nsis.zip/2222', name: 'x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.updater.nsis.zip' }, // Disable NSIS
        // { url: 'https://example.com/x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.updater.nsis.zip.sig/2222', name: 'x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.updater.nsis.zip.sig' }, // Disable NSIS
        { url: 'https://example.com/x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.updater.msi.zip/2222', name: 'x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.updater.msi.zip' },
        { url: 'https://example.com/x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.updater.msi.zip.sig/2222', name: 'x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.updater.msi.zip.sig' },
        // Windows 32 (windows-i686)
        // { url: 'https://example.com/i686-pc-windows-msvc.xxx_0.0.18_x86-setup.updater.nsis.zip/2222', name: 'i686-pc-windows-msvc.xxx_0.0.18_x86-setup.updater.nsis.zip' }, // Disable NSIS
        // { url: 'https://example.com/i686-pc-windows-msvc.xxx_0.0.18_x86-setup.updater.nsis.zip.sig/2222', name: 'i686-pc-windows-msvc.xxx_0.0.18_x86-setup.updater.nsis.zip.sig' }, // Disable NSIS
        { url: 'https://example.com/i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.updater.msi.zip/2222', name: 'i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.updater.msi.zip' },
        { url: 'https://example.com/i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.updater.msi.zip.sig/2222', name: 'i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.updater.msi.zip.sig' },
        // Windows ARM64 (windows-aarch64)
        { url: 'https://example.com/aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip/2222', name: 'aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip' },
        { url: 'https://example.com/aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip.sig/2222', name: 'aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip.sig' },
      ],
      preferUniversal: true,
      preferNsis: true,
      expected: {
        version: '0.0.0',
        notes: `Version 0.0.0 brings enhancements and bug fixes for improved performance and stability.`,
        pub_date: new Date('2024-03-16T10:05:30Z').toString(),
        platformsPlaceholder: {
          // Preferring universal, but it's not available fallbacks to platform-specific signatures
          'darwin-aarch64': {
            updater: { url: 'https://example.com/aarch64-apple-darwin.xxx_0.0.18_aarch64.updater.app.tar.gz/2222', name: 'aarch64-apple-darwin.xxx_0.0.18_aarch64.updater.app.tar.gz' },
            signature: { url: 'https://example.com/aarch64-apple-darwin.xxx_0.0.18_aarch64.updater.app.tar.gz.sig/2222', name: 'aarch64-apple-darwin.xxx_0.0.18_aarch64.updater.app.tar.gz.sig' },
          },
          'darwin-x86_64': {
            updater: { url: 'https://example.com/x86_64-apple-darwin.xxx_0.0.18_x64.updater.app.tar.gz/2222', name: 'x86_64-apple-darwin.xxx_0.0.18_x64.updater.app.tar.gz' },
            signature: { url: 'https://example.com/x86_64-apple-darwin.xxx_0.0.18_x64.updater.app.tar.gz.sig/2222', name: 'x86_64-apple-darwin.xxx_0.0.18_x64.updater.app.tar.gz.sig' },
          },
          'windows-aarch64': {
            updater: { url: 'https://example.com/aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip/2222', name: 'aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip' },
            signature: { url: 'https://example.com/aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip.sig/2222', name: 'aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip.sig' },
          },
          // Preferring NSIS, but it's not available, fallbacks to MSI
          'windows-i686': {
            updater: { url: 'https://example.com/i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.updater.msi.zip/2222', name: 'i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.updater.msi.zip' },
            signature: { url: 'https://example.com/i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.updater.msi.zip.sig/2222', name: 'i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.updater.msi.zip.sig' },
          },
          'windows-x86_64': {
            updater: { url: 'https://example.com/x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.updater.msi.zip/2222', name: 'x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.updater.msi.zip' },
            signature: { url: 'https://example.com/x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.updater.msi.zip.sig/2222', name: 'x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.updater.msi.zip.sig' },
          },
        },
      },
    },
    {
      description: 'app build for windows + macOS (not prefer with fallback)',
      appVersion: '0.0.0',
      pubDate: new Date('2024-03-16T10:05:30Z').toString(),
      assets: [
        // macOS Silicon (darwin-aarch64)
        // { url: 'https://example.com/aarch64-apple-darwin.xxx_0.0.18_aarch64.updater.app.tar.gz/2222', name: 'aarch64-apple-darwin.xxx_0.0.18_aarch64.updater.app.tar.gz' }, // Disable platform-specific
        // { url: 'https://example.com/aarch64-apple-darwin.xxx_0.0.18_aarch64.updater.app.tar.gz.sig/2222', name: 'aarch64-apple-darwin.xxx_0.0.18_aarch64.updater.app.tar.gz.sig' }, // Disable platform-specific
        // macOS Intel (darwin-x86_64)
        // { url: 'https://example.com/x86_64-apple-darwin.xxx_0.0.18_x64.updater.app.tar.gz/2222', name: 'x86_64-apple-darwin.xxx_0.0.18_x64.updater.app.tar.gz' }, // Disable platform-specific
        // { url: 'https://example.com/x86_64-apple-darwin.xxx_0.0.18_x64.updater.app.tar.gz.sig/2222', name: 'x86_64-apple-darwin.xxx_0.0.18_x64.updater.app.tar.gz.sig' }, // Disable platform-specific
        // macOS Universal (darwin-aarch64, darwin-x86_64)
        { url: 'https://example.com/universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz/2222', name: 'universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz' },
        { url: 'https://example.com/universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz.sig/2222', name: 'universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz.sig' },
        // Windows 64 (windows-x86_64)
        { url: 'https://example.com/x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.updater.nsis.zip/2222', name: 'x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.updater.nsis.zip' },
        { url: 'https://example.com/x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.updater.nsis.zip.sig/2222', name: 'x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.updater.nsis.zip.sig' },
        // { url: 'https://example.com/x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.updater.msi.zip/2222', name: 'x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.updater.msi.zip' }, // Disable MSI
        // { url: 'https://example.com/x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.updater.msi.zip.sig/2222', name: 'x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.updater.msi.zip.sig' }, // Disable MSI
        // Windows 32 (windows-i686)
        { url: 'https://example.com/i686-pc-windows-msvc.xxx_0.0.18_x86-setup.updater.nsis.zip/2222', name: 'i686-pc-windows-msvc.xxx_0.0.18_x86-setup.updater.nsis.zip' },
        { url: 'https://example.com/i686-pc-windows-msvc.xxx_0.0.18_x86-setup.updater.nsis.zip.sig/2222', name: 'i686-pc-windows-msvc.xxx_0.0.18_x86-setup.updater.nsis.zip.sig' },
        // { url: 'https://example.com/i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.updater.msi.zip/2222', name: 'i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.updater.msi.zip' }, // Disable MSI
        // { url: 'https://example.com/i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.updater.msi.zip.sig/2222', name: 'i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.updater.msi.zip.sig' }, // Disable MSI
        // Windows ARM64 (windows-aarch64)
        { url: 'https://example.com/aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip/2222', name: 'aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip' },
        { url: 'https://example.com/aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip.sig/2222', name: 'aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip.sig' },
      ],
      preferUniversal: false,
      preferNsis: false,
      expected: {
        version: '0.0.0',
        notes: `Version 0.0.0 brings enhancements and bug fixes for improved performance and stability.`,
        pub_date: new Date('2024-03-16T10:05:30Z').toString(),
        platformsPlaceholder: {
          // Preferring platform-specific, but only universal is available, use universal
          'darwin-aarch64': {
            updater: { url: 'https://example.com/universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz/2222', name: 'universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz' },
            signature: { url: 'https://example.com/universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz.sig/2222', name: 'universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz.sig' },
          },
          'darwin-x86_64': {
            updater: { url: 'https://example.com/universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz/2222', name: 'universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz' },
            signature: { url: 'https://example.com/universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz.sig/2222', name: 'universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz.sig' },
          },
          'windows-aarch64': {
            updater: { url: 'https://example.com/aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip/2222', name: 'aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip' },
            signature: { url: 'https://example.com/aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip.sig/2222', name: 'aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip.sig' },
          },
          // Preferring MSI, but it's not available, fallbacks to NSIS
          'windows-i686': {
            updater: { url: 'https://example.com/i686-pc-windows-msvc.xxx_0.0.18_x86-setup.updater.nsis.zip/2222', name: 'i686-pc-windows-msvc.xxx_0.0.18_x86-setup.updater.nsis.zip' },
            signature: { url: 'https://example.com/i686-pc-windows-msvc.xxx_0.0.18_x86-setup.updater.nsis.zip.sig/2222', name: 'i686-pc-windows-msvc.xxx_0.0.18_x86-setup.updater.nsis.zip.sig' },
          },
          'windows-x86_64': {
            updater: { url: 'https://example.com/x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.updater.nsis.zip/2222', name: 'x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.updater.nsis.zip' },
            signature: { url: 'https://example.com/x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.updater.nsis.zip.sig/2222', name: 'x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.updater.nsis.zip.sig' },
          },
        },
      },
    },
    {
      description: 'empty platforms block if no signatures available (no prefer)',
      appVersion: '1.2.3',
      pubDate: new Date('2025-01-12T05:00:03Z').toString(),
      assets: allAssetsWithoutSignatures,
      preferUniversal: false,
      preferNsis: false,
      expected: {
        version: '1.2.3',
        notes: `Version 1.2.3 brings enhancements and bug fixes for improved performance and stability.`,
        pub_date: new Date('2025-01-12T05:00:03Z').toString(),
        platformsPlaceholder: {},
      },
    },
    {
      description: 'empty platforms block if no signatures available (prefer)',
      appVersion: '4.5.6',
      pubDate: new Date('2014-01-02T22:44:04Z').toString(),
      assets: allAssetsWithoutSignatures,
      preferUniversal: true,
      preferNsis: true,
      expected: {
        version: '4.5.6',
        notes: `Version 4.5.6 brings enhancements and bug fixes for improved performance and stability.`,
        pub_date: new Date('2014-01-02T22:44:04Z').toString(),
        platformsPlaceholder: {},
      },
    },
    {
      description: 'empty platforms block if no updater binaries available (no prefer)',
      appVersion: '1.2.3',
      pubDate: new Date('2025-01-12T05:00:03Z').toString(),
      assets: allAssetsWithoutUpdaters,
      preferUniversal: false,
      preferNsis: false,
      expected: {
        version: '1.2.3',
        notes: `Version 1.2.3 brings enhancements and bug fixes for improved performance and stability.`,
        pub_date: new Date('2025-01-12T05:00:03Z').toString(),
        platformsPlaceholder: {},
      },
    },
    {
      description: 'empty platforms block if no updater binaries available (prefer)',
      appVersion: '4.5.6',
      pubDate: new Date('2014-01-02T22:44:04Z').toString(),
      assets: allAssetsWithoutUpdaters,
      preferUniversal: true,
      preferNsis: true,
      expected: {
        version: '4.5.6',
        notes: `Version 4.5.6 brings enhancements and bug fixes for improved performance and stability.`,
        pub_date: new Date('2014-01-02T22:44:04Z').toString(),
        platformsPlaceholder: {},
      },
    },
  ]
  test.each(testCases)('$description preferUniversal: $preferUniversal, preferNsis: $preferNsis, expects: $expected', ({ appVersion, pubDate, assets, preferUniversal, preferNsis, expected }) => {
    const updater = assembleSemiUpdater({
      appVersion,
      pubDate,
      assets,
      preferUniversal,
      preferNsis,
    })
    expect(updater).toEqual(expected)
  })
})
