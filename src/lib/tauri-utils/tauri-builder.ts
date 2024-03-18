import { executeCommand } from '../command-utils/command-utils'
import { getPackageManager } from './tauri-utils'

export const build = async (tauriContext: string, buildOptions: string) => {
  const packageManager = getPackageManager(tauriContext)
  console.log('Will install node dependencies', { packageManager })
  await executeCommand(packageManager, ['install'], { cwd: tauriContext })
  console.log('Did install node dependencies', { packageManager })
  const options = ['tauri', 'build', ...cleanOptions(buildOptions)]
  console.log('Will build tauri project', { packageManager, options })
  await executeCommand(packageManager, options, { cwd: tauriContext })
  console.log('Did build tauri project', { packageManager, options })
}

export const cleanOptions = (options: string): string[] => {
  return options.replace(/\s+/g, ' ').split(' ').filter(Boolean)
}
