import { AssetName, SignatureAssetsMap, getTauriTargetToSignatureAssetsMap, getTauriTargetsFromAssets, TauriTarget, OsArchToSignatureAsset, getOsArchsFromAssets, OS_Arch } from './tauri-updater-assembler'

const allNames: AssetName[] = [
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
]

type TestCase = {
  description: string
  names: AssetName[]
  preferUniversal: boolean
  preferNsis: boolean
  expectedSignatureAssets: OsArchToSignatureAsset
}

const testCases: TestCase[] = [
  {
    description: 'All names',
    names: allNames,
    preferUniversal: false,
    preferNsis: false,
    expectedSignatureAssets: {
      // macOS Silicon
      'darwin-aarch64': 'aarch64-apple-darwin.xxx_0.0.18_aarch64.updater.app.tar.gz.sig',
      // 'darwin-aarch64': 'universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz.sig',

      // macOS Intel
      'darwin-x86_64': 'x86_64-apple-darwin.xxx_0.0.18_x64.updater.app.tar.gz.sig',
      // 'darwin-x86_64': 'universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz.sig'

      // Win 64
      'windows-x86_64': 'x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.updater.msi.zip.sig',
      // 'windows-x86_64': 'x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.updater.nsis.zip.sig',

      // Win 32
      'windows-i686': 'i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.updater.msi.zip.sig',
      // 'windows-i686': 'i686-pc-windows-msvc.xxx_0.0.18_x86-setup.updater.nsis.zip.sig',

      // Win ARM64
      'windows-aarch64': 'aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip.sig',
    },
  },
]

describe('getTauriTargetToSignatureAssetsMap', () => {
  it('Returns only the asset names that are signatures', () => {
    const signatureAssets: SignatureAssetsMap = getTauriTargetToSignatureAssetsMap(allNames)
    const expected: SignatureAssetsMap = {
      // macOS Silicon (darwin-aarch64)
      'aarch64-apple-darwin': ['aarch64-apple-darwin.xxx_0.0.18_aarch64.updater.app.tar.gz.sig'],
      // macOS Intel (darwin-x86_64)
      'x86_64-apple-darwin': ['x86_64-apple-darwin.xxx_0.0.18_x64.updater.app.tar.gz.sig'],
      // macOS Universal (darwin-aarch64, darwin-x86_64)
      'universal-apple-darwin': ['universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz.sig'],
      // Windows 64 (windows-x86_64)
      'x86_64-pc-windows-msvc': ['x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.updater.nsis.zip.sig', 'x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.updater.msi.zip.sig'],
      // Windows 32 (windows-i686)
      'i686-pc-windows-msvc': ['i686-pc-windows-msvc.xxx_0.0.18_x86-setup.updater.nsis.zip.sig', 'i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.updater.msi.zip.sig'],
      // Windows ARM64 (windows-aarch64)
      'aarch64-pc-windows-msvc': ['aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip.sig'],
    }

    expect(signatureAssets).toEqual(expected)
  })

  it('When asset name has invalid OS_ARCH prefix, they are not included as signature assets', () => {
    const signatureAssets: SignatureAssetsMap = getTauriTargetToSignatureAssetsMap(allNames.map(name => `INVALIDATE-${name}`))
    expect(signatureAssets).toEqual({})
  })
})

describe('getTauriTargetsFromAssets', () => {
  it('Returns the correct targets', () => {
    const rustTargets: Set<TauriTarget> = getTauriTargetsFromAssets(allNames)
    const expectedRustTargets: Set<TauriTarget> = new Set<TauriTarget>(['aarch64-apple-darwin', 'x86_64-apple-darwin', 'universal-apple-darwin', 'x86_64-pc-windows-msvc', 'i686-pc-windows-msvc', 'aarch64-pc-windows-msvc'])
    expect(rustTargets).toEqual(expectedRustTargets)
  })

  it('Invalid asset names must return no rust targets', () => {
    const signatureAssets: Set<TauriTarget> = getTauriTargetsFromAssets(allNames.map(name => `INVALIDATE-${name}`))
    expect(signatureAssets).toEqual(new Set<TauriTarget>())
  })
})

describe('getOsArchsFromAssets', () => {
  const testCases: { description: string; assetNames: AssetName[]; expected: Set<OS_Arch> }[] = [
    { description: 'all', assetNames: allNames, expected: new Set<OS_Arch>(['darwin-aarch64', 'darwin-x86_64', 'windows-x86_64', 'windows-i686', 'windows-aarch64']) },
    {
      description: 'apple universal',
      assetNames: ['universal-apple-darwin.xxx_0.0.18_universal.updater.app.tar.gz.sig'],
      expected: new Set<OS_Arch>(['darwin-aarch64', 'darwin-x86_64']),
    },
    {
      description: 'apple silicon',
      assetNames: ['aarch64-apple-darwin.xxx_0.0.18_aarch64.updater.app.tar.gz.sig'],
      expected: new Set<OS_Arch>(['darwin-aarch64']),
    },
    {
      description: 'apple intel',
      assetNames: ['x86_64-apple-darwin.xxx_0.0.18_x64.updater.app.tar.gz.sig'],
      expected: new Set<OS_Arch>(['darwin-x86_64']),
    },
    {
      description: 'win 64 (nsis)',
      assetNames: ['x86_64-pc-windows-msvc.xxx_0.0.18_x64-setup.updater.nsis.zip.sig'],
      expected: new Set<OS_Arch>(['windows-x86_64']),
    },
    {
      description: 'win 64 (msi)',
      assetNames: ['x86_64-pc-windows-msvc.xxx_0.0.18_x64_en-US.updater.msi.zip.sig'],
      expected: new Set<OS_Arch>(['windows-x86_64']),
    },
    {
      description: 'win 32 (nsis)',
      assetNames: ['i686-pc-windows-msvc.xxx_0.0.18_x86-setup.updater.nsis.zip.sig'],
      expected: new Set<OS_Arch>(['windows-i686']),
    },
    {
      description: 'win 32 (msi)',
      assetNames: ['i686-pc-windows-msvc.xxx_0.0.18_x86_en-US.updater.msi.zip.sig'],
      expected: new Set<OS_Arch>(['windows-i686']),
    },
    {
      description: 'win arm64 (nsis)',
      assetNames: ['aarch64-pc-windows-msvc.xxx_0.0.18_arm64-setup.updater.nsis.zip.sig'],
      expected: new Set<OS_Arch>(['windows-aarch64']),
    },
    {
      description: 'all invalid',
      assetNames: allNames.map(name => `INVALIDATE-${name}`) as AssetName[],
      expected: new Set<OS_Arch>(),
    },
  ]

  test.each(testCases)('$description must enable os-archs: $expected', ({ assetNames, expected }) => {
    const osArchs: Set<OS_Arch> = getOsArchsFromAssets(assetNames)
    expect(osArchs).toEqual(expected)
  })
})
