import { promises as fs } from 'fs'
import { parse } from '@iarna/toml'

export type RustAppInfo = {
  package: {
    name: string
    version: string
    description: string
    edition: string
  }
}

export const parseCargoTomlFile = async (
  cargoTomlPath: string
): Promise<RustAppInfo> => {
  const toml = (await fs.readFile(cargoTomlPath)).toString('utf-8')
  const appInfo = parse(toml) as RustAppInfo
  return {
    package: {
      name: appInfo?.package?.name || '',
      version: appInfo?.package?.version || '',
      description: appInfo?.package?.description || '',
      edition: appInfo?.package?.edition || ''
    }
  }
}
