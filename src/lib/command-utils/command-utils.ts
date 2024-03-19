export const executeCommand = async (command: string, options?: { cwd?: string }): Promise<{ stdout: string; stderr: string }> => {
  const { execaCommand } = await import('execa')
  const subprocess = execaCommand(command, options)
  // Realtime log subprocess output
  subprocess?.stdout?.on('data', chunk => console.log(chunk.toString()))
  subprocess?.stderr?.on('data', chunk => console.error(chunk.toString()))
  return subprocess
}
