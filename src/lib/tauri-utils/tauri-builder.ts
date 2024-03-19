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

    // Install rust target dependencies
    const target = targetFromBuildOptions(buildOptions)

    if (target) {
      // Apple Universal requires arm and intel rust targets
      if (target === Target_UniversalAppleDarwin) {
        command = `rustup target add ${Target_x86_64AppleDarwin} && rustup target add ${Target_Aarch64AppleDarwin}`
      } else {
        command = `rustup target add ${target}`
      }
      console.log(`${GREEN}Will install rust dependencies for target${RESET}`, { target, command })
      await executeCommand(command, { cwd: tauriContext })
      console.log(`${GREEN}Did install rust dependencies for target${RESET}`, { target, command })
    } else {
      console.log(`${GREEN}Target was not specified${RESET}`)
    }

    // Build tauri app
    command = `${packageManager} tauri build ${buildOptions}`
    console.log(`${GREEN}Will build tauri project${RESET}`, { command })
    await executeCommand(command, { cwd: tauriContext })
    console.log(`${GREEN}Did build tauri project${RESET}`, { command })
  } catch (error) {
    console.log(`${RED}Build failed when running command${RESET}`, { command })
  }
}

const Target_x86_64AppleDarwin = 'x86_64-apple-darwin'
const Target_Aarch64AppleDarwin = 'aarch64-apple-darwin'
const Target_UniversalAppleDarwin = 'universal-apple-darwin'

export const targetFromBuildOptions = (optionsString: string): string | undefined => {
  const options = yargs().option('target', { type: 'string', alias: 't' }).parseSync(optionsString)
  return options.target as string | undefined
}
