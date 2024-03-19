import { executeCommand } from '../command-utils/command-utils'
import { getPackageManager } from './tauri-utils'

const RESET = '\x1b[0m'
const GREEN = '\x1b[32m'
const RED = '\x1b[31m'

export const build = async (tauriContext: string, buildOptions: string) => {
  const packageManager = getPackageManager(tauriContext)
  let args: string[] = []

  try {
    // Install node deps
    console.log(`${GREEN}Will install node dependencies${RESET}`, { packageManager })
    args = ['install']
    await executeCommand(packageManager, args, { cwd: tauriContext })
    console.log(`${GREEN}Did install node dependencies${RESET}`, { packageManager })

    // Build tauri app
    args = ['tauri', 'build', ...cleanOptions(buildOptions)]
    console.log(`${GREEN}Will build tauri project${RESET}`, { packageManager })
    await executeCommand(packageManager, args, { cwd: tauriContext })
    console.log(`${GREEN}Did build tauri project${RESET}`, { packageManager })
  } catch (error) {
    console.log(`${RED}Build failed when running command${RESET}`, { packageManager, args })
  }
}

export const cleanOptions = (options: string): string[] => {
  return options.replace(/\s+/g, ' ').split(' ').filter(Boolean)
}

export const targetFromOptions = (options: string): string | undefined => {
  const optionsArray = cleanOptions(options)
  const index = optionsArray.findIndex(_ => _ === '--target' || _ === '-t')

  if (index === -1) {
    return void 0
  }

  return optionsArray[index + 1]
}
