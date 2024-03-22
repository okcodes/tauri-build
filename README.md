# Tauri Release

GitHub action that:

- Builds your Tauri app for macOS, Windows (Linux support comming soon).
- Creates a GitHub release automatically.
- Uploads the artifacts to the GitHub Release.

It supports the [Apple Signing and Notarization](https://tauri.app/v1/guides/distribution/sign-macos/) process, you just need to pass these environment variables to the action `APPLE_SIGNING_IDENTITY`, `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`.

The [generation of the updater binaries and updater signatures](https://tauri.app/v1/guides/distribution/updater/) is also supported, the action will automatically detect them and upload them to GitHub. You just need to pass the `TAURI_PRIVATE_KEY` and `TAURI_KEY_PASSWORD` environment variables as described in the [tauri docs](https://tauri.app/v1/guides/distribution/updater/).

## Example Usage

```yaml
jobs:
  # The long tag must be calculated in a separate job because the "build" job is
  # a matrix, and we want the same timestamp-dependent matrix jobs to share the
  # same tag.
  long-tag:
    name: Get Pre-Release Long Tag
    runs-on: [self-hosted, Linux]
    timeout-minutes: 1
    outputs:
      tag: ${{ steps.get-tag.outputs.tag }}
    steps:
      - id: get-tag
        # The pre-release branch name will be like
        # "app-name-v0.0.0+2024.12.31T10.33.59Z-BRANCH-NAME-6a7a8dd".
        run: |
          echo "tag=${NAME}-v${VERSION}+"\
          "$(date -u '+%Y.%m.%dT%H.%M.%SZ')-"\
          "${{ github.ref_name }}-"\
          "$(echo ${{ github.sha }} | cut -c1-7)" >> $GITHUB_OUTPUT
  build:
    needs: [long-tag]
    name: Build ${{ matrix.name }}
    runs-on: ${{ matrix.os }}
    timeout-minutes: 15
    permissions:
      contents: 'write'
    outputs:
      appName: ${{ steps.tauri.outputs.appName }}
      appVersion: ${{ steps.tauri.outputs.appVersion }}
      tag: ${{ steps.tauri.outputs.tag }}
    strategy:
      fail-fast: false
      matrix:
        include:
          - name: Apple Silicon
            os: [self-hosted, macOS, X64]
            target: aarch64-apple-darwin
            bundles: app,dmg,updater
            # .app + .dmg + updater + sig
            expectedArtifacts: 4
          - name: Apple Intel
            os: [self-hosted, macOS, X64]
            target: x86_64-apple-darwin
            bundles: app,dmg,updater
            # .app + .dmg + updater + sig
            expectedArtifacts: 4
          - name: Apple Universal
            os: [self-hosted, macOS, X64]
            target: universal-apple-darwin
            # .app + .dmg + updater + sig
            expectedArtifacts: 4
            bundles: app,dmg,updater
          - name: Windows 64
            os: [self-hosted, Windows, X64]
            target: x86_64-pc-windows-msvc
            bundles: nsis,msi,updater
            # NSIS: (.exe + updater + sig) + MSI (.msi + updater + sig)
            expectedArtifacts: 6
          - name: Windows 32
            # Win-32 can be built from a X64 runner
            os: [self-hosted, Windows, X64]
            target: i686-pc-windows-msvc
            bundles: nsis,msi,updater
            # NSIS: (.exe + updater + sig) + MSI (.msi + updater + sig)
            expectedArtifacts: 6
          - name: Windows ARM64
            # Win ARM64 can be built from a X64 runner
            os: [self-hosted, Windows, X64]
            target: aarch64-pc-windows-msvc
            bundles: nsis,updater
            # NSIS: (.exe + updater + sig).
            # Only NSIS is supported in Win-ARM64.
            expectedArtifacts: 3
    steps:
      - uses: actions/checkout@v4
      - uses: okcodes/tauri-release-action@tauri-integration
        id: tauri
        with:
          tauriContext: ${{ github.workspace }}
          tagTemplate: ${{ needs.long-tag.outputs.tag }}
          draft: false
          prerelease: true
          buildOptions: >
            --target ${{ matrix.target }} --bundles ${{ matrix.bundles }}
          expectedArtifacts: ${{ matrix.expectedArtifacts }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          APPLE_SIGNING_IDENTITY: ${{ secrets.APPLE_SIGNING_IDENTITY }}
          APPLE_CERTIFICATE: ${{ secrets.APPLE_CERTIFICATE }}
          APPLE_CERTIFICATE_PASSWORD: ${{ secrets.APPLE_CERTIFICATE_PASSWORD }}
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_PASSWORD: ${{ secrets.APPLE_PASSWORD }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
          TAURI_PRIVATE_KEY: ${{ secrets.TAURI_PRIVATE_KEY }}
          TAURI_KEY_PASSWORD: ${{ secrets.TAURI_KEY_PASSWORD }}
      - run: |
          echo "App Name ${{ steps.tauri.outputs.appName }}"
          echo "App Version ${{ steps.tauri.outputs.appVersion }}"
          echo "Tag ${{ steps.tauri.outputs.tag }}"
```
