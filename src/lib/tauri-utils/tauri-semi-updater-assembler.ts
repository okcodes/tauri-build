type OS = 'darwin' | 'linux' | 'windows'
type Arch = 'aarch64' | 'armv7' | 'i686' | 'x86_64'
type InvalidOs_Arch = 'darwin-armv7' | 'darwin-i686' // Excluding 2 os-archs not defined in tauri docs
export type OS_Arch = Exclude<`${OS}-${Arch}`, InvalidOs_Arch>
type RustTargetTriple = 'aarch64-apple-darwin' | 'x86_64-apple-darwin' | 'aarch64-pc-windows-msvc' | 'i686-pc-windows-msvc' | 'x86_64-pc-windows-msvc'
type TauriTarget = RustTargetTriple | 'universal-apple-darwin'

// If this target was compiled, it gives support to these platforms
const RUST_TARGET_TRIPLE_TO_OS_ARCH: Record<RustTargetTriple, OS_Arch> = {
  // macOS
  'aarch64-apple-darwin': 'darwin-aarch64',
  'x86_64-apple-darwin': 'darwin-x86_64',
  // 'universal-apple-darwin': ['darwin-aarch64', 'darwin-x86_64'] as const,
  // Windows
  'aarch64-pc-windows-msvc': 'windows-aarch64',
  'i686-pc-windows-msvc': 'windows-i686',
  'x86_64-pc-windows-msvc': 'windows-x86_64',
} as const

const OS_ARCH_TO_RUST_TARGET: Record<OS_Arch, RustTargetTriple> = Object.entries(RUST_TARGET_TRIPLE_TO_OS_ARCH).reduce(
  (acc, [key, value]) => {
    acc[value] = key as RustTargetTriple
    return acc
  },
  {} as Record<OS_Arch, RustTargetTriple>
)

const ALL_RUST_TARGET_TRIPLES: RustTargetTriple[] = Object.keys(RUST_TARGET_TRIPLE_TO_OS_ARCH) as RustTargetTriple[]
const ALL_TAURI_TARGETS: TauriTarget[] = [...ALL_RUST_TARGET_TRIPLES, 'universal-apple-darwin']

export type TauriSemiUpdater = {
  version: string
  notes: string
  pub_date: string // "2020-06-22T19:25:57Z"
  platformsPlaceholder: Partial<Record<OS_Arch, { updater: GithubAsset; signature: GithubAsset }>>
}

/**
 * Returns the rust target of an asset name if it starts with a rust target and a dot; undefined otherwise.
 */
const getTauriTargetFromAsset = (asset: GithubAsset): TauriTarget | undefined => {
  return ALL_TAURI_TARGETS.find(tauriTarget => asset.name.startsWith(`${tauriTarget}.`))
}

type TauriTargetToAssetNames = Partial<Record<TauriTarget, GithubAsset[]>>

const getTauriTargetToSignatureAssetsMap = (assets: GithubAsset[]): TauriTargetToAssetNames => {
  return assets.reduce((acc, asset) => {
    const tauriTarget = getTauriTargetFromAsset(asset)
    if (tauriTarget && asset.name.endsWith('.sig')) {
      acc[tauriTarget] = [...(acc[tauriTarget] || []), asset]
    }
    return acc
  }, {} as TauriTargetToAssetNames)
}

const getOsArchsFromAssets = (assets: GithubAsset[]): Set<OS_Arch> => {
  const result = new Set<OS_Arch>()
  for (const asset of assets) {
    const tauriTarget = getTauriTargetFromAsset(asset)
    if (!tauriTarget) {
      continue
    }

    if (tauriTarget === 'universal-apple-darwin') {
      result.add('darwin-aarch64')
      result.add('darwin-x86_64')
    } else {
      result.add(RUST_TARGET_TRIPLE_TO_OS_ARCH[tauriTarget])
    }
  }
  return result
}

const getSignatureAssetForOsArch = ({ osArch, sigMap, preferUniversal, preferNsis }: { osArch: OS_Arch; sigMap: TauriTargetToAssetNames; preferUniversal: boolean; preferNsis: boolean }): GithubAsset | undefined => {
  if (osArch.startsWith('darwin')) {
    // On macOS, we might end up with an extra build, the universal. If universal signature is preferred use that one.
    const universalSignature = sigMap['universal-apple-darwin']?.[0]
    const platformSignature = sigMap[OS_ARCH_TO_RUST_TARGET[osArch]]?.[0]
    return preferUniversal ? universalSignature || platformSignature : platformSignature || universalSignature
  }

  if (osArch.startsWith('windows')) {
    // If we have msi+nsis one, find if we have available the preferred one.
    const matchingSignatures = sigMap[OS_ARCH_TO_RUST_TARGET[osArch]] || []
    const nsisSignature = matchingSignatures.find(_ => _.name.endsWith('.nsis.zip.sig'))
    const msiSignature = matchingSignatures.find(_ => _.name.endsWith('.msi.zip.sig'))
    return preferNsis ? nsisSignature || msiSignature : msiSignature || nsisSignature
  }

  return sigMap[OS_ARCH_TO_RUST_TARGET[osArch]]?.[0]
}

const getUpdaterAssetForSignatureAsset = ({ signatureAsset, assets }: { signatureAsset: GithubAsset | undefined; assets: GithubAsset[] }): GithubAsset | undefined => {
  if (!signatureAsset || !signatureAsset.name.endsWith('.sig')) {
    return void 0
  }
  // The name of the updater asset is always the same as the signature asset without the '.sig' ending.
  const updaterAssetName = signatureAsset.name.slice(0, -'.sig'.length)
  return assets.find(asset => asset.name === updaterAssetName)
}

export const assembleSemiUpdater = ({ appVersion, pubDate, assets, preferUniversal, preferNsis }: { appVersion: string; pubDate: string; assets: GithubAsset[]; preferUniversal: boolean; preferNsis: boolean }): TauriSemiUpdater => {
  const updater: TauriSemiUpdater = {
    version: appVersion,
    notes: `Version ${appVersion} brings enhancements and bug fixes for improved performance and stability.`,
    pub_date: pubDate,
    platformsPlaceholder: {},
  }

  const osArchs = getOsArchsFromAssets(assets)
  const sigMap = getTauriTargetToSignatureAssetsMap(assets)
  for (const osArch of osArchs) {
    const signatureAsset = getSignatureAssetForOsArch({ sigMap, osArch, preferUniversal, preferNsis })
    const updaterAsset = getUpdaterAssetForSignatureAsset({ assets, signatureAsset })
    if (signatureAsset && updaterAsset) {
      updater.platformsPlaceholder[osArch] = { updater: updaterAsset, signature: signatureAsset }
    }
  }
  return updater
}
