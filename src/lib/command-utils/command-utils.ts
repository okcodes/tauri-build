export const executeCommand = async (file: string, args?: readonly string[], options?: { cwd?: string }): Promise<{ stdout: string; stderr: string }> => {
  const { execa } = await import('execa')
  const subprocess = execa(file, args, options)
  // Realtime log subprocess output
  subprocess?.stdout?.on('data', chunk => console.log(chunk.toString()))
  subprocess?.stderr?.on('data', chunk => console.error(chunk.toString()))
  return subprocess
}
