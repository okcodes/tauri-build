import fs from 'fs'
import path from 'path'

const usesPnpm = (tauriContext: string): boolean => {
  return fs.existsSync(path.join(tauriContext, 'pnpm-lock.yaml'))
}

const usesYarn = (tauriContext: string): boolean => {
  return fs.existsSync(path.join(tauriContext, 'yarn.lock'))
}

export const getPackageManager = (tauriContext: string) => {
  if (usesPnpm(tauriContext)) {
    return 'pnpm'
  }
  if (usesYarn(tauriContext)) {
    return 'yarn'
  }
  return 'npm'
}
