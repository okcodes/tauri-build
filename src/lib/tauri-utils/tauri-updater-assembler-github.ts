import { OS_Arch, TauriSemiUpdater } from './tauri-semi-updater-assembler'
import axios from 'axios'

export type TauriUpdater = {
  version: string
  notes: string
  pub_date: string // "2020-06-22T19:25:57Z"
  platforms: Partial<
    Record<
      OS_Arch,
      {
        /**
         * Url to download the updater binary.
         */
        url: string
        /**
         * Content of the .sig file used to verify the updater binary.
         */
        signature: string
      }
    >
  >
}

export const assembleUpdaterFromSemi = async ({ semiUpdater, githubToken }: { semiUpdater: TauriSemiUpdater; githubToken: string }): Promise<TauriUpdater> => {
  const updater: TauriUpdater = {
    version: semiUpdater.version,
    platforms: {},
    notes: semiUpdater.notes,
    pub_date: semiUpdater.pub_date,
  }

  for (const osArch in semiUpdater.platformsPlaceholder) {
    const { updater: updaterAsset, signature: signatureAsset } = semiUpdater.platformsPlaceholder[osArch as OS_Arch]!
    const signatureContent = await getSignatureContent({ url: signatureAsset.url, githubToken })
    if (signatureContent) {
      updater.platforms[osArch as OS_Arch] = {
        url: updaterAsset.url,
        signature: signatureContent,
      }
    }
  }
  return updater
}

const getSignatureContent = async ({ url, githubToken }: { url: string; githubToken: string }): Promise<string> => {
  const response = await axios({
    method: 'get',
    url,
    responseType: 'text',
    headers: {
      Authorization: `token ${githubToken}`,
      Accept: 'application/octet-stream',
    },
  })
  return response.data
}
