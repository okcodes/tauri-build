type OS = 'darwin' | 'linux' | 'windows'
type Arch = 'aarch64' | 'armv7' | 'i686' | 'x86_64'
type InvalidOs_Arch = 'darwin-armv7' | 'darwin-i686' // Excluding 2 os-archs not defined in tauri docs
type OS_Arch = Exclude<`${OS}-${Arch}`, InvalidOs_Arch>
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

type TauriUpdater = {
  version: string
  notes: string
  pub_date: string // "2020-06-22T19:25:57Z"
  platformsPlaceholder: Partial<Record<OS_Arch, string>>
}

/**
 * Returns the rust target of an asset name if it starts with a rust target and a dot; undefined otherwise.
 * @param name
 */
const getTauriTargetFromAsset = (name: string): TauriTarget | undefined => {
  return ALL_TAURI_TARGETS.find(tauriTarget => name.startsWith(`${tauriTarget}.`))
}

type TauriTargetToAssetNames = Partial<Record<TauriTarget, Set<string>>>

const getTauriTargetToSignatureAssetsMap = (names: string[]): TauriTargetToAssetNames => {
  return names.reduce((acc, name) => {
    const tauriTarget = getTauriTargetFromAsset(name)
    if (tauriTarget && name.endsWith('.sig')) {
      if (!acc[tauriTarget]) {
        acc[tauriTarget] = new Set()
      }
      acc[tauriTarget]?.add(name)
    }
    return acc
  }, {} as TauriTargetToAssetNames)
}

const getOsArchsFromAssetNames = (names: string[]): Set<OS_Arch> => {
  const result = new Set<OS_Arch>()
  for (const name of names) {
    const tauriTarget = getTauriTargetFromAsset(name)
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

export const assembleUpdater = ({ appVersion, pubDate, assetNames }: { appVersion: string; pubDate: string; assetNames: string[] }): TauriUpdater => {
  const updater: TauriUpdater = {
    version: appVersion,
    notes: `Version ${appVersion} brings enhancements and bug fixes for improved performance and stability.`,
    pub_date: pubDate,
    platformsPlaceholder: {},
  }

  const osArchs = getOsArchsFromAssetNames(assetNames)
  const sigMap = getTauriTargetToSignatureAssetsMap(assetNames)
  for (const osArch of osArchs) {
    console.log(osArch)
  }
  return updater
}
