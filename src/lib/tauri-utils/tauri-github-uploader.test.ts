import { getAssetMeta } from './tauri-github-uploader'

describe('getAssetMeta', () => {
  const appName = 'xxx'

  test.each([
    // macOS silicon
    { appName, filePath: 'macos/xxx.app', appVersion: '0.0.18', rustTarget: 'aarch64-apple-darwin', expected: { assetName: 'xxx_0.0.18_aarch64.app', isUpdater: false, isSignature: false } },
    { appName, filePath: 'dmg/xxx_0.0.18_aarch64.dmg', appVersion: '0.0.18', rustTarget: 'aarch64-apple-darwin', expected: { assetName: 'xxx_0.0.18_aarch64.dmg', isUpdater: false, isSignature: false } },
    { appName, filePath: 'macos/xxx.app.tar.gz', appVersion: '0.0.18', rustTarget: 'aarch64-apple-darwin', expected: { assetName: 'xxx_0.0.18_aarch64-updater.app.tar.gz', isUpdater: true, isSignature: false } },
    { appName, filePath: 'macos/xxx.app.tar.gz.sig', appVersion: '0.0.18', rustTarget: 'aarch64-apple-darwin', expected: { assetName: 'xxx_0.0.18_aarch64-updater.app.tar.gz.sig', isUpdater: false, isSignature: true } },
    // macOS intel
    { appName, filePath: 'macos/xxx.app', appVersion: '0.0.18', rustTarget: 'x86_64-apple-darwin', expected: { assetName: 'xxx_0.0.18_x64.app', isUpdater: false, isSignature: false } },
    { appName, filePath: 'dmg/xxx_0.0.18_x64.dmg', appVersion: '0.0.18', rustTarget: 'x86_64-apple-darwin', expected: { assetName: 'xxx_0.0.18_x64.dmg', isUpdater: false, isSignature: false } },
    { appName, filePath: 'macos/xxx.app.tar.gz', appVersion: '0.0.18', rustTarget: 'x86_64-apple-darwin', expected: { assetName: 'xxx_0.0.18_x64-updater.app.tar.gz', isUpdater: true, isSignature: false } },
    { appName, filePath: 'macos/xxx.app.tar.gz.sig', appVersion: '0.0.18', rustTarget: 'x86_64-apple-darwin', expected: { assetName: 'xxx_0.0.18_x64-updater.app.tar.gz.sig', isUpdater: false, isSignature: true } },
    // macOS universal
    { appName, filePath: 'macos/xxx.app', appVersion: '0.0.18', rustTarget: 'universal-apple-darwin', expected: { assetName: 'xxx_0.0.18_universal.app', isUpdater: false, isSignature: false } },
    { appName, filePath: 'dmg/xxx_0.0.18_universal.dmg', appVersion: '0.0.18', rustTarget: 'universal-apple-darwin', expected: { assetName: 'xxx_0.0.18_universal.dmg', isUpdater: false, isSignature: false } },
    { appName, filePath: 'macos/xxx.app.tar.gz', appVersion: '0.0.18', rustTarget: 'universal-apple-darwin', expected: { assetName: 'xxx_0.0.18_universal-updater.app.tar.gz', isUpdater: true, isSignature: false } },
    { appName, filePath: 'macos/xxx.app.tar.gz.sig', appVersion: '0.0.18', rustTarget: 'universal-apple-darwin', expected: { assetName: 'xxx_0.0.18_universal-updater.app.tar.gz.sig', isUpdater: false, isSignature: true } },
    // Windows 64
    { appName, filePath: 'nsis/xxx_0.0.18_x64-setup.exe', appVersion: '0.0.18', rustTarget: 'x86_64-pc-windows-msvc', expected: { assetName: 'xxx_0.0.18_x64-setup.exe', isUpdater: false, isSignature: false } },
    { appName, filePath: 'msi/xxx_0.0.18_x64_en-US.msi', appVersion: '0.0.18', rustTarget: 'x86_64-pc-windows-msvc', expected: { assetName: 'xxx_0.0.18_x64_en-US.msi', isUpdater: false, isSignature: false } },
    { appName, filePath: 'nsis/xxx_0.0.18_x64-setup.nsis.zip', appVersion: '0.0.18', rustTarget: 'x86_64-pc-windows-msvc', expected: { assetName: 'xxx_0.0.18_x64-setup.nsis.zip', isUpdater: true, isSignature: false } },
    { appName, filePath: 'msi/xxx_0.0.18_x64_en-US.msi.zip', appVersion: '0.0.18', rustTarget: 'x86_64-pc-windows-msvc', expected: { assetName: 'xxx_0.0.18_x64_en-US.msi.zip', isUpdater: true, isSignature: false } },
    { appName, filePath: 'nsis/xxx_0.0.18_x64-setup.nsis.zip.sig', appVersion: '0.0.18', rustTarget: 'x86_64-pc-windows-msvc', expected: { assetName: 'xxx_0.0.18_x64-setup.nsis.zip.sig', isUpdater: false, isSignature: true } },
    { appName, filePath: 'msi/xxx_0.0.18_x64_en-US.msi.zip.sig', appVersion: '0.0.18', rustTarget: 'x86_64-pc-windows-msvc', expected: { assetName: 'xxx_0.0.18_x64_en-US.msi.zip.sig', isUpdater: false, isSignature: true } },
    // Windows 32
    { appName, filePath: 'nsis/xxx_0.0.18_x86-setup.exe', appVersion: '0.0.18', rustTarget: 'i686-pc-windows-msvc', expected: { assetName: 'xxx_0.0.18_x86-setup.exe', isUpdater: false, isSignature: false } },
    { appName, filePath: 'msi/xxx_0.0.18_x86_en-US.msi', appVersion: '0.0.18', rustTarget: 'i686-pc-windows-msvc', expected: { assetName: 'xxx_0.0.18_x86_en-US.msi', isUpdater: false, isSignature: false } },
    { appName, filePath: 'nsis/xxx_0.0.18_x86-setup.nsis.zip', appVersion: '0.0.18', rustTarget: 'i686-pc-windows-msvc', expected: { assetName: 'xxx_0.0.18_x86-setup.nsis.zip', isUpdater: true, isSignature: false } },
    { appName, filePath: 'msi/xxx_0.0.18_x86_en-US.msi.zip', appVersion: '0.0.18', rustTarget: 'i686-pc-windows-msvc', expected: { assetName: 'xxx_0.0.18_x86_en-US.msi.zip', isUpdater: true, isSignature: false } },
    { appName, filePath: 'nsis/xxx_0.0.18_x86-setup.nsis.zip.sig', appVersion: '0.0.18', rustTarget: 'i686-pc-windows-msvc', expected: { assetName: 'xxx_0.0.18_x86-setup.nsis.zip.sig', isUpdater: false, isSignature: true } },
    { appName, filePath: 'msi/xxx_0.0.18_x86_en-US.msi.zip.sig', appVersion: '0.0.18', rustTarget: 'i686-pc-windows-msvc', expected: { assetName: 'xxx_0.0.18_x86_en-US.msi.zip.sig', isUpdater: false, isSignature: true } },
    // Windows ARM64
    { appName, filePath: 'nsis/xxx_0.0.18_arm64-setup.exe', appVersion: '0.0.18', rustTarget: 'aarch64-pc-windows-msvc', expected: { assetName: 'xxx_0.0.18_arm64-setup.exe', isUpdater: false, isSignature: false } },
    { appName, filePath: 'nsis/xxx_0.0.18_arm64-setup.nsis.zip', appVersion: '0.0.18', rustTarget: 'aarch64-pc-windows-msvc', expected: { assetName: 'xxx_0.0.18_arm64-setup.nsis.zip', isUpdater: true, isSignature: false } },
    { appName, filePath: 'nsis/xxx_0.0.18_arm64-setup.nsis.zip.sig', appVersion: '0.0.18', rustTarget: 'aarch64-pc-windows-msvc', expected: { assetName: 'xxx_0.0.18_arm64-setup.nsis.zip.sig', isUpdater: false, isSignature: true } },
  ])('Artifact $appName: "$filePath" must have meta: "$expected"', ({ rustTarget, appName, appVersion, filePath, expected }) => {
    const assetMeta = getAssetMeta({ filePath, appVersion, rustTarget, appName })
    expect(assetMeta).toEqual(expected)
    if (expected.isSignature) {
      expect(expected.assetName.endsWith('.sig')).toEqual(true)
    } else {
      expect(expected.assetName.endsWith('.sig')).toEqual(false)
    }
  })
})
