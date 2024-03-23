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

const allAssetsWithoutSignatures: string[] = [
  // macOS Silicon (darwin-aarch64)
  'aarch64-apple-darwin.xxx_0.0.18_aarch64.app.tar.gz',
  'aarch64-apple-darwin.xxx_0.0.18_aarch64.dmg',
  'aarch64-apple-darwin.xxx_0.0.18_aarch64.updater.app.tar.gz',
  // macOS Intel (darwin-x86_64)
  'x86_64-apple-darwin.xxx_0.0.18_x64.app.tar.gz',
  'x86_64-apple-darwin.xxx_0.0.18_x64.dmg',
  'x86_64-apple-darwin.xxx_0.0.18_x64.updater.app.tar.gz',
  // macOS Universal (darwin-aarch64, darwin-x86_64)
  'universal-apple-darwin.xxx_0.0.18_universal.app.tar.gz',
  'universal-apple-darwin.xxx_0.0.18_universal.dmg',
  'universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz',
  // Windows 64 (windows-x86_64)
  'x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.exe',
  'x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.updater.nsis.zip',
  'x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.msi',
  'x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.updater.msi.zip',
  // Windows 32 (windows-i686)
  'i686-pc-windows-msvc.xxx_0.0.18_x86-setup.exe',
  'i686-pc-windows-msvc.xxx_0.0.18_x86-setup.updater.nsis.zip',
  'i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.msi',
  'i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.updater.msi.zip',
  // Windows ARM64 (windows-aarch64)
  'aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.exe',
  'aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip',
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
    {
      description: 'app build for windows + macOS (prefer with fallback)',
      appVersion: '0.0.0',
      pubDate: new Date('2024-03-16T10:05:30Z').toString(),
      assetNames: [
        // macOS Silicon (darwin-aarch64)
        'aarch64-apple-darwin.xxx_0.0.18_aarch64.updater.app.tar.gz.sig',
        // macOS Intel (darwin-x86_64)
        'x86_64-apple-darwin.xxx_0.0.18_x64.updater.app.tar.gz.sig',
        // macOS Universal (darwin-aarch64, darwin-x86_64)
        // 'universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz.sig', // Disable universal
        // Windows 64 (windows-x86_64)
        // 'x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.updater.nsis.zip.sig', // Disable NSIS
        'x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.updater.msi.zip.sig',
        // Windows 32 (windows-i686)
        // 'i686-pc-windows-msvc.xxx_0.0.18_x86-setup.updater.nsis.zip.sig', // Disable NSIS
        'i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.updater.msi.zip.sig',
        // Windows ARM64 (windows-aarch64)
        'aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip.sig',
      ],
      preferUniversal: true,
      preferNsis: true,
      expected: {
        version: '0.0.0',
        notes: `Version 0.0.0 brings enhancements and bug fixes for improved performance and stability.`,
        pub_date: new Date('2024-03-16T10:05:30Z').toString(),
        platformsPlaceholder: {
          // Preferring universal, but it's not available fallbacks to platform-specific signatures
          'darwin-aarch64': 'aarch64-apple-darwin.xxx_0.0.18_aarch64.updater.app.tar.gz.sig',
          'darwin-x86_64': 'x86_64-apple-darwin.xxx_0.0.18_x64.updater.app.tar.gz.sig',
          'windows-aarch64': 'aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip.sig',
          // Preferring NSIS, but it's not available, fallbacks to MSI
          'windows-i686': 'i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.updater.msi.zip.sig',
          'windows-x86_64': 'x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.updater.msi.zip.sig',
        },
      },
    },
    {
      description: 'app build for windows + macOS (not prefer with fallback)',
      appVersion: '0.0.0',
      pubDate: new Date('2024-03-16T10:05:30Z').toString(),
      assetNames: [
        // macOS Silicon (darwin-aarch64)
        // 'aarch64-apple-darwin.xxx_0.0.18_aarch64.updater.app.tar.gz.sig', // Disable platform-specific
        // macOS Intel (darwin-x86_64)
        // 'x86_64-apple-darwin.xxx_0.0.18_x64.updater.app.tar.gz.sig', // Disable platform-specific
        // macOS Universal (darwin-aarch64, darwin-x86_64)
        'universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz.sig',
        // Windows 64 (windows-x86_64)
        'x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.updater.nsis.zip.sig',
        // 'x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.updater.msi.zip.sig', // Disable MSI
        // Windows 32 (windows-i686)
        'i686-pc-windows-msvc.xxx_0.0.18_x86-setup.updater.nsis.zip.sig',
        // 'i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.updater.msi.zip.sig', // Disable MSI
        // Windows ARM64 (windows-aarch64)
        'aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip.sig',
      ],
      preferUniversal: false,
      preferNsis: false,
      expected: {
        version: '0.0.0',
        notes: `Version 0.0.0 brings enhancements and bug fixes for improved performance and stability.`,
        pub_date: new Date('2024-03-16T10:05:30Z').toString(),
        platformsPlaceholder: {
          // Preferring platform-specific, but only universal is available, use universal
          'darwin-aarch64': 'universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz.sig',
          'darwin-x86_64': 'universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz.sig',
          'windows-aarch64': 'aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip.sig',
          // Preferring MSI, but it's not available, fallbacks to NSIS
          'windows-i686': 'i686-pc-windows-msvc.xxx_0.0.18_x86-setup.updater.nsis.zip.sig',
          'windows-x86_64': 'x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.updater.nsis.zip.sig',
        },
      },
    },
    {
      description: 'empty platforms block if no signatures available (no prefer)',
      appVersion: '1.2.3',
      pubDate: new Date('2025-01-12T05:00:03Z').toString(),
      assetNames: allAssetsWithoutSignatures,
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
      assetNames: allAssetsWithoutSignatures,
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
