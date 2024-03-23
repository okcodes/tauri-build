import { assembleSemiUpdater, TauriSemiUpdater } from './tauri-updater-assembler'

const allAssets: string[] = [
  // macOS Silicon (darwin-aarch64)
  'aarch64-apple-darwin.xxx_0.0.18_aarch64.app.tar.gz',
  'aarch64-apple-darwin.xxx_0.0.18_aarch64.dmg',
  'aarch64-apple-darwin.xxx_0.0.18_aarch64.updater.app.tar.gz',
  'aarch64-apple-darwin.xxx_0.0.18_aarch64.updater.app.tar.gz.sig',
  // macOS Intel (darwin-x86_64)
  'x86_64-apple-darwin.xxx_0.0.18_x64.app.tar.gz',
  'x86_64-apple-darwin.xxx_0.0.18_x64.dmg',
  'x86_64-apple-darwin.xxx_0.0.18_x64.updater.app.tar.gz',
  'x86_64-apple-darwin.xxx_0.0.18_x64.updater.app.tar.gz.sig',
  // macOS Universal (darwin-aarch64, darwin-x86_64)
  'universal-apple-darwin.xxx_0.0.18_universal.app.tar.gz',
  'universal-apple-darwin.xxx_0.0.18_universal.dmg',
  'universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz',
  'universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz.sig',
  // Windows 64 (windows-x86_64)
  'x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.exe',
  'x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.updater.nsis.zip',
  'x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.updater.nsis.zip.sig',
  'x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.msi',
  'x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.updater.msi.zip',
  'x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.updater.msi.zip.sig',
  // Windows 32 (windows-i686)
  'i686-pc-windows-msvc.xxx_0.0.18_x86-setup.exe',
  'i686-pc-windows-msvc.xxx_0.0.18_x86-setup.updater.nsis.zip',
  'i686-pc-windows-msvc.xxx_0.0.18_x86-setup.updater.nsis.zip.sig',
  'i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.msi',
  'i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.updater.msi.zip',
  'i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.updater.msi.zip.sig',
  // Windows ARM64 (windows-aarch64)
  'aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.exe',
  'aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip',
  'aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip.sig',
  // Invalid Random Assets
  'an-asset.txt',
  'README.md',
  'INVALIDaarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip.sig',
]

describe('assembleSemiUpdater', () => {
  type TestCase = {
    description: string
    appVersion: string
    pubDate: string
    assetNames: string[]
    preferUniversal: boolean
    preferNsis: boolean
    expected: TauriSemiUpdater
  }
  const testCases: TestCase[] = [
    {
      description: 'app build for windows + macOS',
      appVersion: '0.0.0',
      pubDate: new Date('2024-03-16T10:05:30Z').toString(),
      assetNames: allAssets,
      preferUniversal: false,
      preferNsis: false,
      expected: {
        version: '0.0.0',
        notes: `Version 0.0.0 brings enhancements and bug fixes for improved performance and stability.`,
        pub_date: new Date('2024-03-16T10:05:30Z').toString(),
        platformsPlaceholder: {
          'darwin-aarch64': 'aarch64-apple-darwin.xxx_0.0.18_aarch64.updater.app.tar.gz.sig',
          'darwin-x86_64': 'x86_64-apple-darwin.xxx_0.0.18_x64.updater.app.tar.gz.sig',
          'windows-aarch64': 'aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip.sig',
          'windows-i686': 'i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.updater.msi.zip.sig',
          'windows-x86_64': 'x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.updater.msi.zip.sig',
        },
      },
    },
    {
      description: 'app build for windows + macOS',
      appVersion: '0.0.0',
      pubDate: new Date('2024-03-16T10:05:30Z').toString(),
      assetNames: allAssets,
      preferUniversal: true,
      preferNsis: false,
      expected: {
        version: '0.0.0',
        notes: `Version 0.0.0 brings enhancements and bug fixes for improved performance and stability.`,
        pub_date: new Date('2024-03-16T10:05:30Z').toString(),
        platformsPlaceholder: {
          'darwin-aarch64': 'universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz.sig',
          'darwin-x86_64': 'universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz.sig',
          'windows-aarch64': 'aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip.sig',
          'windows-i686': 'i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.updater.msi.zip.sig',
          'windows-x86_64': 'x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.updater.msi.zip.sig',
        },
      },
    },
    {
      description: 'app build for windows + macOS',
      appVersion: '0.0.0',
      pubDate: new Date('2024-03-16T10:05:30Z').toString(),
      assetNames: allAssets,
      preferUniversal: false,
      preferNsis: true,
      expected: {
        version: '0.0.0',
        notes: `Version 0.0.0 brings enhancements and bug fixes for improved performance and stability.`,
        pub_date: new Date('2024-03-16T10:05:30Z').toString(),
        platformsPlaceholder: {
          'darwin-aarch64': 'aarch64-apple-darwin.xxx_0.0.18_aarch64.updater.app.tar.gz.sig',
          'darwin-x86_64': 'x86_64-apple-darwin.xxx_0.0.18_x64.updater.app.tar.gz.sig',
          'windows-aarch64': 'aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip.sig',
          'windows-i686': 'i686-pc-windows-msvc.xxx_0.0.18_x86-setup.updater.nsis.zip.sig',
          'windows-x86_64': 'x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.updater.nsis.zip.sig',
        },
      },
    },
    {
      description: 'app build for windows + macOS',
      appVersion: '0.0.0',
      pubDate: new Date('2024-03-16T10:05:30Z').toString(),
      assetNames: allAssets,
      preferUniversal: true,
      preferNsis: true,
      expected: {
        version: '0.0.0',
        notes: `Version 0.0.0 brings enhancements and bug fixes for improved performance and stability.`,
        pub_date: new Date('2024-03-16T10:05:30Z').toString(),
        platformsPlaceholder: {
          'darwin-aarch64': 'universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz.sig',
          'darwin-x86_64': 'universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz.sig',
          'windows-aarch64': 'aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip.sig',
          'windows-i686': 'i686-pc-windows-msvc.xxx_0.0.18_x86-setup.updater.nsis.zip.sig',
          'windows-x86_64': 'x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.updater.nsis.zip.sig',
        },
      },
    },
  ]
  test.each(testCases)('$description preferUniversal: $preferUniversal, preferNsis: $preferNsis, expects: $expected', ({ appVersion, pubDate, assetNames, preferUniversal, preferNsis, expected }) => {
    const updater = assembleSemiUpdater({
      appVersion,
      pubDate,
      assetNames,
      preferUniversal,
      preferNsis,
    })
    expect(updater).toEqual(expected)
  })
})
