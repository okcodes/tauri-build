import { Octokit } from '@octokit/rest'
import { findNameWithExtension } from './tauri-extensions'

type OS = 'darwin' | 'linux' | 'windows'
type Arch = 'aarch64' | 'armv7' | 'i686' | 'x86_64'

// Excluding 2 os-archs not defined in tauri docs
export type InvalidOs_Arch = 'darwin-armv7' | 'darwin-i686'

export type OS_Arch = Exclude<`${OS}-${Arch}`, InvalidOs_Arch>

export type RustTargetTriple = 'aarch64-apple-darwin' | 'x86_64-apple-darwin' | 'aarch64-pc-windows-msvc' | 'i686-pc-windows-msvc' | 'x86_64-pc-windows-msvc'

export type TauriTarget = RustTargetTriple | 'universal-apple-darwin'

export type AssetName = `${TauriTarget}.${string}`
export type SignatureAssetName = `${TauriTarget}.${string}.sig`

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

type UpdaterAsset = {
  signature: string
  url: string
}

export type UpdaterPlatforms = Partial<Record<OS_Arch, UpdaterAsset>>
export type OsArchToSignatureAsset = Partial<Record<OS_Arch, SignatureAssetName>>

type TauriUpdater = {
  version: string
  notes: string
  pub_date: string // "2020-06-22T19:25:57Z"
  platforms: UpdaterPlatforms
}

/**
 * Returns the rust target of an asset name if it starts with a rust target and a dot, or undefined.
 * @param name
 */
const getTauriTargetFromAsset = (name: string): TauriTarget | undefined => {
  return ALL_TAURI_TARGETS.find(tauriTarget => name.startsWith(`${tauriTarget}.`))
}

export type SignatureAssetsMap = Partial<Record<TauriTarget, SignatureAssetName[]>>

export const getTauriTargetToSignatureAssetsMap = (names: string[]): SignatureAssetsMap => {
  return names.reduce((acc, name) => {
    const tauriTarget = getTauriTargetFromAsset(name)
    if (tauriTarget && name.endsWith('.sig')) {
      acc[tauriTarget] = [...(acc[tauriTarget] || []), name as SignatureAssetName]
    }
    return acc
  }, {} as SignatureAssetsMap)
}

export const getTauriTargetsFromAssets = (names: string[]): Set<TauriTarget> => {
  return new Set(names.map(getTauriTargetFromAsset).filter(Boolean) as TauriTarget[])
}

export const getOsArchsFromAssets = (names: string[]): Set<OS_Arch> => {
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

export const getSignatureForOsArch = ({ assetNames, osArch, preferNsis, preferUniversal }: { osArch: OS_Arch; assetNames: SignatureAssetsMap; preferUniversal: boolean; preferNsis: boolean }): SignatureAssetName | undefined => {
  if (osArch.startsWith('darwin')) {
    // On macOS, we might end up with an extra build, the universal. If universal signature is preferred use that one.
    const universalSignature: SignatureAssetName | undefined = assetNames['universal-apple-darwin']?.[0]
    const platformSignature: SignatureAssetName | undefined = assetNames[OS_ARCH_TO_RUST_TARGET[osArch]]?.[0]
    return preferUniversal ? universalSignature || platformSignature : platformSignature || universalSignature
  }

  if (osArch.startsWith('windows')) {
    // If we have msi+nsis one, find if we have available the preferred one.
    const matchingSignatures: SignatureAssetName[] = assetNames[OS_ARCH_TO_RUST_TARGET[osArch]] || []
    const nsisSignature: SignatureAssetName | undefined = findNameWithExtension(matchingSignatures, 'nsis.zip.sig')
    const msiSignature: SignatureAssetName | undefined = findNameWithExtension(matchingSignatures, 'msi.zip.sig')
    return preferNsis ? nsisSignature || msiSignature : msiSignature || nsisSignature
  }

  return assetNames[OS_ARCH_TO_RUST_TARGET[osArch]]?.[0]
}

type AssembleUpdaterParams = {
  githubToken: string
  appVersion: string
}

export const assembleUpdater = async ({ githubToken, appVersion }: AssembleUpdaterParams) => {
  const octokit = new Octokit({ auth: githubToken })
  const updater: TauriUpdater = {
    version: appVersion,
    notes: `Version ${appVersion} brings enhancements and bug fixes for improved performance and stability.`,
    pub_date: new Date().toISOString(),
    platforms: {
      'darwin-aarch64': { url: '', signature: '' },
      'darwin-x86_64': { url: '', signature: '' },
    },
  }
}
