export const executeCommand = async (binary: string, args: string[]): Promise<{ stdout: string; stderr: string }> => {
  const { execa } = await import('execa')
  return execa(binary, args)
}
