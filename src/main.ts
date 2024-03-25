import * as core from '@actions/core'
import { VERSION } from './version'
import { runAssembleUpdaterCommand } from './commands/assemble-updater-command'
import { runBuildAppCommand } from './commands/build-app-command'

export type MainActionInputs = 'command'
type Command = 'build-app' | 'assemble-updater'
export const BUILD_APP_COMMAND = 'build-app'
export const ASSEMBLE_UPDATER_COMMAND = 'assemble-updater'

const input = (name: MainActionInputs, options: core.InputOptions): string => core.getInput(name, options)
const VALID_COMMANDS: Command[] = [BUILD_APP_COMMAND, ASSEMBLE_UPDATER_COMMAND]

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  console.log(`Running tauri-release-action v${VERSION}`)

  // Get command
  const command = input('command', { required: true, trimWhitespace: true }) as Command
  if (!VALID_COMMANDS.some(_ => _ === command)) {
    core.setFailed(`The input "command" must be set to either "${BUILD_APP_COMMAND}" or "${ASSEMBLE_UPDATER_COMMAND}"`)
    return
  }

  switch (command) {
    case BUILD_APP_COMMAND:
      await runBuildAppCommand()
      break
    case ASSEMBLE_UPDATER_COMMAND:
      await runAssembleUpdaterCommand()
      break
  }
}
