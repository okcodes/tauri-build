export const build = async () => {
  const { execa } = await import('execa')
  const cwd = await execa('pwd', [])
  console.log('Testing execa', { cwd })
}
