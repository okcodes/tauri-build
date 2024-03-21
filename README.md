# Create a GitHub Action Using TypeScript

## Example Usage

```yaml
jobs:
  # The long tag must be calculated in a separate job because the "build" job is a matrix, and we want the same timestamp-dependent matrix jobs to share the same tag.
  long-tag:
    name: Get Pre-Release Long Tag
    runs-on: [self-hosted, Linux]
    timeout-minutes: 1
    outputs:
      tag: ${{ steps.get-tag.outputs.tag }}
    steps:
      - id: get-tag
        # The pre-release branch name will be like "app-name-v0.0.0+2024.12.31T10.33.59Z-BRANCH-NAME-6a7a8dd".
        run: |
          echo "tag={NAME}-v{VERSION}+$(date -u '+%Y.%m.%dT%H.%M.%SZ')-${{ github.ref_name }}-$(echo ${{ github.sha }} | cut -c1-7)" >> $GITHUB_OUTPUT
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
            expectedArtifacts: 4 # .app + .dmg + updater + signature
          - name: Apple Intel
            os: [self-hosted, macOS, X64]
            target: x86_64-apple-darwin
            bundles: app,dmg,updater
            expectedArtifacts: 4 # .app + .dmg + updater + signature
          - name: Apple Universal
            os: [self-hosted, macOS, X64]
            target: universal-apple-darwin
            expectedArtifacts: 4 # .app + .dmg + updater + signature
            bundles: app,dmg,updater
          - name: Windows 64
            os: [self-hosted, Windows, X64]
            target: x86_64-pc-windows-msvc
            bundles: nsis,msi,updater
            expectedArtifacts: 6 # NSIS: (.exe + updater + signature) + MSI (.msi + updater + signature)
          - name: Windows 32
            os: [self-hosted, Windows, X64] # Win-32 can be built from a X64 runner
            target: i686-pc-windows-msvc
            bundles: nsis,msi,updater
            expectedArtifacts: 6 # NSIS: (.exe + updater + signature) + MSI (.msi + updater + signature)
          - name: Windows ARM64
            os: [self-hosted, Windows, X64] # Win ARM64 can be built from a X64 runner
            target: aarch64-pc-windows-msvc
            bundles: nsis,updater
            expectedArtifacts: 3 # NSIS: (.exe + updater + signature). Only NSIS is supported in Win-ARM64.
    steps:
      - uses: actions/checkout@v4
      - uses: okcodes/tauri-release-action@tauri-integration
        id: tauri
        with:
          tauriContext: ${{ github.workspace }}
          tagTemplate: ${{ github.event_name == 'push' && needs.long-tag.outputs.tag || '{NAME}-v{VERSION}' }}
          draft: false
          prerelease: true
          buildOptions: --target ${{ matrix.target }} --bundles ${{ matrix.bundles }} --verbose
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

[![GitHub Super-Linter](https://github.com/actions/typescript-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/typescript-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

Use this template to bootstrap the creation of a TypeScript action. :rocket:

This template includes compilation support, tests, a validation workflow, publishing, and versioning guidance.

If you are new, there's also a simpler introduction in the [Hello world JavaScript action repository](https://github.com/actions/hello-world-javascript-action).

## Run Unit Tests

Make sure you declare this env var to run your tests. It's required to run code with dynamic imports.

```shell
NODE_OPTIONS=--experimental-vm-modules
```

For example, this is a dynamic import:

```javascript
const { execa } = await import('execa')
```

## Create Your Own Action

To create your own action, you can use this repository as a template! Just follow the below instructions:

1. Click the **Use this template** button at the top of the repository
1. Select **Create a new repository**
1. Select an owner and name for your new repository
1. Click **Create repository**
1. Clone your new repository

> [!IMPORTANT]
>
> Make sure to remove or update the [`CODEOWNERS`](./CODEOWNERS) file! For details on how to use this file, see
> [About code owners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners).

## Initial Setup

After you've cloned the repository to your local machine or codespace, you'll need to perform some initial setup steps before you can develop your action.

> [!NOTE]
>
> You'll need to have a reasonably modern version of [Node.js](https://nodejs.org) handy (20.x or later should work!). If you are using a version manager like [`nodenv`](https://github.com/nodenv/nodenv) or
> [`nvm`](https://github.com/nvm-sh/nvm), this template has a `.node-version` file at the root of the repository that will be used to automatically switch to the correct version when you `cd` into the repository. Additionally, this
> `.node-version` file is used by GitHub Actions in any `actions/setup-node` actions.

1. :hammer_and_wrench: Install the dependencies

   ```bash
   npm install
   ```

1. :building_construction: Package the TypeScript for distribution

   ```bash
   npm run bundle
   ```

1. :white_check_mark: Run the tests

   ```bash
   $ npm test

   PASS  ./index.test.js
     ✓ throws invalid number (3ms)
     ✓ wait 500 ms (504ms)
     ✓ test runs (95ms)

   ...
   ```

## Update the Action Metadata

The [`action.yml`](action.yml) file defines metadata about your action, such as input(s) and output(s). For details about this file, see
[Metadata syntax for GitHub Actions](https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions).

When you copy this repository, update `action.yml` with the name, description, inputs, and outputs for your action.

## Update the Action Code

The [`src/`](./src/) directory is the heart of your action! This contains the source code that will be run when your action is invoked. You can replace the contents of this directory with your own code.

There are a few things to keep in mind when writing your action code:

- Most GitHub Actions toolkit and CI/CD operations are processed asynchronously. In `main.ts`, you will see that the action is run in an `async` function.

  ```javascript
  import * as core from '@actions/core'
  //...

  async function run() {
    try {
      //...
    } catch (error) {
      core.setFailed(error.message)
    }
  }
  ```

  For more information about the GitHub Actions toolkit, see the [documentation](https://github.com/actions/toolkit/blob/master/README.md).

So, what are you waiting for? Go ahead and start customizing your action!

1. Create a new branch

   ```bash
   git checkout -b releases/v1
   ```

1. Replace the contents of `src/` with your action code
1. Add tests to `__tests__/` for your source code
1. Format, test, and build the action

   ```bash
   npm run all
   ```

   > This step is important! It will run [`ncc`](https://github.com/vercel/ncc) to build the final JavaScript action code with all dependencies included. If you do not run this step, your action will not work correctly when it is used in a
   > workflow. This step also includes the `--license` option for `ncc`, which will create a license file for all of the production node modules used in your project.

1. Commit your changes

   ```bash
   git add .
   git commit -m "My first action is ready!"
   ```

1. Push them to your repository

   ```bash
   git push -u origin releases/v1
   ```

1. Create a pull request and get feedback on your action
1. Merge the pull request into the `main` branch

Your action is now published! :rocket:

For information about versioning your action, see [Versioning](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md) in the GitHub Actions toolkit.

## Validate the Action

You can now validate the action by referencing it in a workflow file. For example, [`ci.yml`](./.github/workflows/ci.yml) demonstrates how to reference an action in the same repository.

```yaml
steps:
  - name: Checkout
    id: checkout
    uses: actions/checkout@v4

  - name: Test Local Action
    id: test-action
    uses: ./
    with:
      milliseconds: 1000

  - name: Print Output
    id: output
    run: echo "${{ steps.test-action.outputs.time }}"
```

For example workflow runs, check out the [Actions tab](https://github.com/actions/typescript-action/actions)! :rocket:

## Usage

After testing, you can create version tag(s) that developers can use to reference different stable versions of your action. For more information, see [Versioning](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md) in
the GitHub Actions toolkit.

To include the action in a workflow in another repository, you can use the `uses` syntax with the `@` symbol to reference a specific branch, tag, or commit hash.

```yaml
steps:
  - name: Checkout
    id: checkout
    uses: actions/checkout@v4

  - name: Test Local Action
    id: test-action
    uses: actions/typescript-action@v1 # Commit with the `v1` tag
    with:
      milliseconds: 1000

  - name: Print Output
    id: output
    run: echo "${{ steps.test-action.outputs.time }}"
```

## Publishing a New Release

This project includes a helper script, [`script/release`](./script/release) designed to streamline the process of tagging and pushing new releases for GitHub Actions.

GitHub Actions allows users to select a specific version of the action to use, based on release tags. This script simplifies this process by performing the following steps:

1. **Retrieving the latest release tag:** The script starts by fetching the most recent release tag by looking at the local data available in your repository.
1. **Prompting for a new release tag:** The user is then prompted to enter a new release tag. To assist with this, the script displays the latest release tag and provides a regular expression to validate the format of the new tag.
1. **Tagging the new release:** Once a valid new tag is entered, the script tags the new release.
1. **Pushing the new tag to the remote:** Finally, the script pushes the new tag to the remote repository. From here, you will need to create a new release in GitHub and users can easily reference the new tag in their workflows.
