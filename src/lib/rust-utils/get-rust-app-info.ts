import { promises as fs } from 'fs'
import path from 'path'
import { parse } from '@iarna/toml'

export type RustAppInfo = {
  package: {
    name: string
    version: string
    description: string
    edition: string
  }
}

export const parseCargoTomlFile = async (cargoTomlPath: string): Promise<RustAppInfo> => {
  try {
    const toml = (await fs.readFile(cargoTomlPath)).toString('utf-8')
    const appInfo = parse(toml) as RustAppInfo
    return {
      package: {
        name: appInfo?.package?.name || '',
        version: appInfo?.package?.version || '',
        description: appInfo?.package?.description || '',
        edition: appInfo?.package?.edition || '',
      },
    }
  } catch (error) {
    throw new Error(`Cannot read or parse toml file: ${(error as Error).message}`, { cause: error })
  }
}

const WELL_KNOWN_TAURI_CARGO_RELATIVE_PATH = path.join('src-tauri', 'Cargo.toml')

export const parseTauriCargoTomlFileInContext = (contextPath: string): Promise<RustAppInfo> => {
  return parseCargoTomlFile(path.join(contextPath, WELL_KNOWN_TAURI_CARGO_RELATIVE_PATH))
}
