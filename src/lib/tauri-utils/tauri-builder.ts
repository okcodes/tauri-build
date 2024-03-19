import { executeCommand } from '../command-utils/command-utils'
import { getPackageManager } from './tauri-utils'
import yargs from 'yargs'

const RESET = '\x1b[0m'
const GREEN = '\x1b[32m'
const RED = '\x1b[31m'

export const build = async (tauriContext: string, buildOptions: string) => {
  const packageManager = getPackageManager(tauriContext)
  let command = ''

  try {
    // Install node deps
    command = `${packageManager} install`
    console.log(`${GREEN}Will install node dependencies${RESET}`, { command })
    await executeCommand(command, { cwd: tauriContext })
    console.log(`${GREEN}Did install node dependencies${RESET}`, { command })

    // Build tauri app
    command = `${packageManager} tauri build ${buildOptions}`
    console.log(`${GREEN}Will build tauri project${RESET}`, { command })
    await executeCommand(command, { cwd: tauriContext })
    console.log(`${GREEN}Did build tauri project${RESET}`, { command })
  } catch (error) {
    console.log(`${RED}Build failed when running command${RESET}`, { command })
  }
}

export const targetFromBuildOptions = (optionsString: string): string | undefined => {
  const options = yargs().option('target', { type: 'string', alias: 't' }).parseSync(optionsString)
  return options.target as string | undefined
}
