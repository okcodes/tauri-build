import { RustAppInfo } from '../rust-utils/get-rust-app-info'

export const tagNameFromTemplate = ({ template, appInfo }: { template: string; appInfo: RustAppInfo }) => {
  return template.replaceAll(/\{VERSION}/g, appInfo.package.version)
}
