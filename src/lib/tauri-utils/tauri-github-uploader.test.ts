import { getAssetMeta, GetAssetMetaParams } from './tauri-github-uploader'

describe('getAssetMeta', () => {
  const appName = 'xxx'

  type SuccessTestCase = {
    inputs: GetAssetMetaParams
    expected: {
      assetName: string
      isUpdater: boolean
      isSignature: boolean
    }
  }

  const successTestCases: SuccessTestCase[] = [
    // macOS silicon
    {
      inputs: {
        appName,
        filePath: 'macos/xxx.app',
        appVersion: '0.0.18',
        rustTarget: 'aarch64-apple-darwin',
        tag: 'v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe',
      },
      expected: { assetName: 'aarch64-apple-darwin.xxx_v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe_aarch64.app', isUpdater: false, isSignature: false },
    },
    {
      inputs: {
        appName,
        filePath: 'dmg/xxx_0.0.18_aarch64.dmg',
        appVersion: '0.0.18',
        rustTarget: 'aarch64-apple-darwin',
        tag: 'v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe',
      },
      expected: { assetName: 'aarch64-apple-darwin.xxx_v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe_aarch64.dmg', isUpdater: false, isSignature: false },
    },
    {
      inputs: {
        appName,
        filePath: 'macos/xxx.app.tar.gz',
        appVersion: '0.0.18',
        rustTarget: 'aarch64-apple-darwin',
        tag: 'v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe',
      },
      expected: { assetName: 'aarch64-apple-darwin.xxx_v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe_aarch64.updater.app.tar.gz', isUpdater: true, isSignature: false },
    },
    {
      inputs: {
        appName,
        filePath: 'macos/xxx.app.tar.gz.sig',
        appVersion: '0.0.18',
        rustTarget: 'aarch64-apple-darwin',
        tag: 'v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe',
      },
      expected: { assetName: 'aarch64-apple-darwin.xxx_v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe_aarch64.updater.app.tar.gz.sig', isUpdater: false, isSignature: true },
    },
    // macOS intel
    {
      inputs: {
        appName,
        filePath: 'macos/xxx.app',
        appVersion: '0.0.18',
        rustTarget: 'x86_64-apple-darwin',
        tag: 'v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe',
      },
      expected: { assetName: 'x86_64-apple-darwin.xxx_v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe_x64.app', isUpdater: false, isSignature: false },
    },
    {
      inputs: {
        appName,
        filePath: 'dmg/xxx_0.0.18_x64.dmg',
        appVersion: '0.0.18',
        rustTarget: 'x86_64-apple-darwin',
        tag: 'v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe',
      },
      expected: { assetName: 'x86_64-apple-darwin.xxx_v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe_x64.dmg', isUpdater: false, isSignature: false },
    },
    {
      inputs: {
        appName,
        filePath: 'macos/xxx.app.tar.gz',
        appVersion: '0.0.18',
        rustTarget: 'x86_64-apple-darwin',
        tag: 'v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe',
      },
      expected: { assetName: 'x86_64-apple-darwin.xxx_v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe_x64.updater.app.tar.gz', isUpdater: true, isSignature: false },
    },
    {
      inputs: {
        appName,
        filePath: 'macos/xxx.app.tar.gz.sig',
        appVersion: '0.0.18',
        rustTarget: 'x86_64-apple-darwin',
        tag: 'v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe',
      },
      expected: { assetName: 'x86_64-apple-darwin.xxx_v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe_x64.updater.app.tar.gz.sig', isUpdater: false, isSignature: true },
    },
    // macOS universal
    {
      inputs: {
        appName,
        filePath: 'macos/xxx.app',
        appVersion: '0.0.18',
        rustTarget: 'universal-apple-darwin',
        tag: 'v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe',
      },
      expected: { assetName: 'universal-apple-darwin.xxx_v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe_universal.app', isUpdater: false, isSignature: false },
    },
    {
      inputs: {
        appName,
        filePath: 'dmg/xxx_0.0.18_universal.dmg',
        appVersion: '0.0.18',
        rustTarget: 'universal-apple-darwin',
        tag: 'v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe',
      },
      expected: { assetName: 'universal-apple-darwin.xxx_v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe_universal.dmg', isUpdater: false, isSignature: false },
    },
    {
      inputs: {
        appName,
        filePath: 'macos/xxx.app.tar.gz',
        appVersion: '0.0.18',
        rustTarget: 'universal-apple-darwin',
        tag: 'v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe',
      },
      expected: { assetName: 'universal-apple-darwin.xxx_v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe_universal.updater.app.tar.gz', isUpdater: true, isSignature: false },
    },
    {
      inputs: {
        appName,
        filePath: 'macos/xxx.app.tar.gz.sig',
        appVersion: '0.0.18',
        rustTarget: 'universal-apple-darwin',
        tag: 'v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe',
      },
      expected: { assetName: 'universal-apple-darwin.xxx_v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe_universal.updater.app.tar.gz.sig', isUpdater: false, isSignature: true },
    },
    // Windows 64
    {
      inputs: {
        appName,
        filePath: 'nsis/xxx_0.0.18_x64-setup.exe',
        appVersion: '0.0.18',
        rustTarget: 'x86_64-pc-windows-msvc',
        tag: 'v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe',
      },
      expected: { assetName: 'x86_64-pc-windows-msvc.xxx_v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe_x64-setup.exe', isUpdater: false, isSignature: false },
    },
    {
      inputs: {
        appName,
        filePath: 'msi/xxx_0.0.18_x64_en-US.msi',
        appVersion: '0.0.18',
        rustTarget: 'x86_64-pc-windows-msvc',
        tag: 'v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe',
      },
      expected: { assetName: 'x86_64-pc-windows-msvc.xxx_v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe_x64_en-US.msi', isUpdater: false, isSignature: false },
    },
    {
      inputs: {
        appName,
        filePath: 'nsis/xxx_0.0.18_x64-setup.nsis.zip',
        appVersion: '0.0.18',
        rustTarget: 'x86_64-pc-windows-msvc',
        tag: 'v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe',
      },
      expected: { assetName: 'x86_64-pc-windows-msvc.xxx_v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe_x64-setup.updater.nsis.zip', isUpdater: true, isSignature: false },
    },
    {
      inputs: {
        appName,
        filePath: 'msi/xxx_0.0.18_x64_en-US.msi.zip',
        appVersion: '0.0.18',
        rustTarget: 'x86_64-pc-windows-msvc',
        tag: 'v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe',
      },
      expected: { assetName: 'x86_64-pc-windows-msvc.xxx_v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe_x64_en-US.updater.msi.zip', isUpdater: true, isSignature: false },
    },
    {
      inputs: {
        appName,
        filePath: 'nsis/xxx_0.0.18_x64-setup.nsis.zip.sig',
        appVersion: '0.0.18',
        rustTarget: 'x86_64-pc-windows-msvc',
        tag: 'v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe',
      },
      expected: { assetName: 'x86_64-pc-windows-msvc.xxx_v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe_x64-setup.updater.nsis.zip.sig', isUpdater: false, isSignature: true },
    },
    {
      inputs: {
        appName,
        filePath: 'msi/xxx_0.0.18_x64_en-US.msi.zip.sig',
        appVersion: '0.0.18',
        rustTarget: 'x86_64-pc-windows-msvc',
        tag: 'v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe',
      },
      expected: { assetName: 'x86_64-pc-windows-msvc.xxx_v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe_x64_en-US.updater.msi.zip.sig', isUpdater: false, isSignature: true },
    },
    // Windows 32
    {
      inputs: {
        appName,
        filePath: 'nsis/xxx_0.0.18_x86-setup.exe',
        appVersion: '0.0.18',
        rustTarget: 'i686-pc-windows-msvc',
        tag: 'v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe',
      },
      expected: { assetName: 'i686-pc-windows-msvc.xxx_v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe_x86-setup.exe', isUpdater: false, isSignature: false },
    },
    {
      inputs: {
        appName,
        filePath: 'msi/xxx_0.0.18_x86_en-US.msi',
        appVersion: '0.0.18',
        rustTarget: 'i686-pc-windows-msvc',
        tag: 'v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe',
      },
      expected: { assetName: 'i686-pc-windows-msvc.xxx_v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe_x86_en-US.msi', isUpdater: false, isSignature: false },
    },
    {
      inputs: {
        appName,
        filePath: 'nsis/xxx_0.0.18_x86-setup.nsis.zip',
        appVersion: '0.0.18',
        rustTarget: 'i686-pc-windows-msvc',
        tag: 'v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe',
      },
      expected: { assetName: 'i686-pc-windows-msvc.xxx_v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe_x86-setup.updater.nsis.zip', isUpdater: true, isSignature: false },
    },
    {
      inputs: {
        appName,
        filePath: 'msi/xxx_0.0.18_x86_en-US.msi.zip',
        appVersion: '0.0.18',
        rustTarget: 'i686-pc-windows-msvc',
        tag: 'v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe',
      },
      expected: { assetName: 'i686-pc-windows-msvc.xxx_v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe_x86_en-US.updater.msi.zip', isUpdater: true, isSignature: false },
    },
    {
      inputs: {
        appName,
        filePath: 'nsis/xxx_0.0.18_x86-setup.nsis.zip.sig',
        appVersion: '0.0.18',
        rustTarget: 'i686-pc-windows-msvc',
        tag: 'v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe',
      },
      expected: { assetName: 'i686-pc-windows-msvc.xxx_v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe_x86-setup.updater.nsis.zip.sig', isUpdater: false, isSignature: true },
    },
    {
      inputs: {
        appName,
        filePath: 'msi/xxx_0.0.18_x86_en-US.msi.zip.sig',
        appVersion: '0.0.18',
        rustTarget: 'i686-pc-windows-msvc',
        tag: 'v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe',
      },
      expected: { assetName: 'i686-pc-windows-msvc.xxx_v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe_x86_en-US.updater.msi.zip.sig', isUpdater: false, isSignature: true },
    },
    // Windows ARM64
    {
      inputs: {
        appName,
        filePath: 'nsis/xxx_0.0.18_arm64-setup.exe',
        appVersion: '0.0.18',
        rustTarget: 'aarch64-pc-windows-msvc',
        tag: 'v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe',
      },
      expected: { assetName: 'aarch64-pc-windows-msvc.xxx_v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe_arm64-setup.exe', isUpdater: false, isSignature: false },
    },
    {
      inputs: {
        appName,
        filePath: 'nsis/xxx_0.0.18_arm64-setup.nsis.zip',
        appVersion: '0.0.18',
        rustTarget: 'aarch64-pc-windows-msvc',
        tag: 'v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe',
      },
      expected: { assetName: 'aarch64-pc-windows-msvc.xxx_v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe_arm64-setup.updater.nsis.zip', isUpdater: true, isSignature: false },
    },
    {
      inputs: {
        appName,
        filePath: 'nsis/xxx_0.0.18_arm64-setup.nsis.zip.sig',
        appVersion: '0.0.18',
        rustTarget: 'aarch64-pc-windows-msvc',
        tag: 'v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe',
      },
      expected: { assetName: 'aarch64-pc-windows-msvc.xxx_v0.0.18--2024.03.28T08.16.00Z-VOICE-40-8971ffe_arm64-setup.updater.nsis.zip.sig', isUpdater: false, isSignature: true },
    },
  ]

  test.each(successTestCases)('Artifact $appName: "$filePath" must have meta: "$expected"', ({ inputs, expected }) => {
    const assetMeta = getAssetMeta(inputs)
    expect(assetMeta).toEqual(expected)
    expect(assetMeta.assetName.startsWith(`${inputs.rustTarget}.`)).toEqual(true)
    if (expected.isSignature) {
      expect(assetMeta.assetName.endsWith('.sig')).toEqual(true)
    } else {
      expect(assetMeta.assetName.endsWith('.sig')).toEqual(false)
    }
  })
})
