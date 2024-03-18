import fs from 'fs'
import path from 'path'

export const build = async (tauriContext: string) => {
  const { execa } = await import('execa')
  const packageManager = getPackageManager(tauriContext)
  const { stdout, stderr } = await execa(packageManager, ['install'])
  console.log('Testing execa', { stdout, stderr })
}

const usesPnpm = (tauriContext: string): boolean => {
  return fs.existsSync(path.join(tauriContext, 'pnpm-lock.yaml'))
}

const usesYarn = (tauriContext: string): boolean => {
  return fs.existsSync(path.join(tauriContext, 'yarn.lock'))
}

const getPackageManager = (tauriContext: string) => {
  if (usesPnpm(tauriContext)) {
    return 'pnpm'
  }
  if (usesYarn(tauriContext)) {
    return 'yarn'
  }
  return 'npm'
}
