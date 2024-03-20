import { executeCommand } from '../command-utils/command-utils'
import { getPackageManager } from './tauri-utils'
import yargs from 'yargs'

const RESET = '\x1b[0m'
const GREEN = '\x1b[32m'
const RED = '\x1b[31m'

export const build = async (tauriContext: string, buildOptions: string): Promise<{ target: string }> => {
  const target = targetFromBuildOptions(buildOptions)

  if (!target) {
    throw new Error('The --target flag must be specified in the build options')
  }

  const packageManager = getPackageManager(tauriContext)
  let command = ''

  try {
    // Install node deps
    command = `${packageManager} install`
    console.log(`${GREEN}Will install node dependencies${RESET}`, { command })
    await executeCommand(command, { cwd: tauriContext })
    console.log(`${GREEN}Did install node dependencies${RESET}`, { command })

    // Install rust target dependencies
    // Apple Universal requires arm and intel rust targets
    if (target === Target_UniversalAppleDarwin) {
      // Add intel support
      command = `rustup target add ${Target_x86_64AppleDarwin}`
      console.log(`${GREEN}Will install rust dependency 1/2 for target${RESET}`, { target, command })
      await executeCommand(command, { cwd: tauriContext })

      // Add apple silicon support
      command = `rustup target add ${Target_Aarch64AppleDarwin}`
      console.log(`${GREEN}Will install rust dependency 2/2 for target${RESET}`, { target, command })
      await executeCommand(command, { cwd: tauriContext })
    } else {
      command = `rustup target add ${target}`
      console.log(`${GREEN}Will install rust dependencies for target${RESET}`, { target, command })
      await executeCommand(command, { cwd: tauriContext })
    }
    console.log(`${GREEN}Did install rust dependencies for target${RESET}`, { target })

    // Build tauri app
    command = `${packageManager} tauri build ${buildOptions}`
    console.log(`${GREEN}Will build tauri project${RESET}`, { command })
    await executeCommand(command, { cwd: tauriContext })
    console.log(`${GREEN}Did build tauri project${RESET}`, { command })
    return { target }
  } catch (error) {
    console.log(`${RED}Build failed when running command${RESET}`, { command })
    throw new Error(`Error building: ${(error as Error).message}`, { cause: error })
  }
}

const Target_x86_64AppleDarwin = 'x86_64-apple-darwin'
const Target_Aarch64AppleDarwin = 'aarch64-apple-darwin'
const Target_UniversalAppleDarwin = 'universal-apple-darwin'

export const targetFromBuildOptions = (optionsString: string): string | undefined => {
  const options = yargs().option('target', { type: 'string', alias: 't' }).parseSync(optionsString)
  return options.target as string | undefined
}

export const bundlesFromBuildOptions = (optionsString: string): string[] => {
  const { bundles = '' } = yargs().option('bundles', { type: 'string', alias: 'b' }).parseSync(optionsString)
  return bundles
    .split(',')
    .map(bundle => bundle.trim())
    .filter(Boolean)
}
