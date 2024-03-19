import { executeCommand } from '../command-utils/command-utils'
import { getPackageManager } from './tauri-utils'
import yargs from 'yargs'

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
    args = ['tauri', 'build', ...parseArgsString(buildOptions)]
    console.log(`${GREEN}Will build tauri project${RESET}`, { packageManager })
    await executeCommand(packageManager, args, { cwd: tauriContext })
    console.log(`${GREEN}Did build tauri project${RESET}`, { packageManager })
  } catch (error) {
    console.log(`${RED}Build failed when running command${RESET}`, { packageManager, args })
  }
}

/**
 * Parses a command line arguments string into a flat array of keys and values.
 *
 * @param {string} argsString - The raw string of command line arguments.
 * @returns {string[]} An array containing the parsed keys and values, where each key is immediately followed by its corresponding value. The values are always surrounded by single quotes.
 *
 * Example:
 * Input: "--name John Doe --age 30"
 * Output: ["--name", "'John Doe'", "age", "'30'"]
 */
export const parseArgsString = (argsString: string): string[] => {
  const { $0, _, ...params } = yargs().parserConfiguration({ 'camel-case-expansion': false, 'parse-numbers': false, 'boolean-negation': false }).strict(false).help(false).version(false).parseSync(argsString)
  return Object.entries(params as Record<string, unknown>).flatMap(([key, value]) => [key.length === 1 ? `-${key}` : `--${key}`, `'${value}'`])
}

export const targetFromOptions = (options: string): string | undefined => {
  const optionsArray = parseArgsString(options)
  const index = optionsArray.findIndex(_ => _ === '--target' || _ === '-t')

  if (index === -1) {
    return void 0
  }

  return optionsArray[index + 1]
}
