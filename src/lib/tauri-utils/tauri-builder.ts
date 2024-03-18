import { executeCommand } from '../command-utils/command-utils'
import { getPackageManager } from './tauri-utils'

export const build = async (tauriContext: string) => {
  const packageManager = getPackageManager(tauriContext)
  const { stdout, stderr } = await executeCommand(packageManager, ['install'])
  console.log('Did install node dependencies', { packageManager, stdout, stderr })
}
