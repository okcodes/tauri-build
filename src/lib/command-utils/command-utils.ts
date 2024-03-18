export const executeCommand = async (file: string, args?: readonly string[], options?: { cwd?: string }): Promise<{ stdout: string; stderr: string }> => {
  const { execa } = await import('execa')
  return execa(file, args, options)
}
