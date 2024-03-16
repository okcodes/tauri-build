import { RustAppInfo } from '../rust-utils/get-rust-app-info'
import { toISO8601ForFilename } from '../date-utils/date-format'

export const tagNameFromTemplate = ({ template, appInfo, now, gitSha }: { template: string; appInfo: RustAppInfo; now: Date; gitSha: string }) => {
  // It can be used for example with this template: "{NAME}-v{VERSION}-alpha-{DATE_ISO_8601}-{SHORT_SHA}".
  return template
    .replaceAll(/\{VERSION}/g, appInfo.package.version)
    .replaceAll(/\{NAME}/g, appInfo.package.name)
    .replaceAll(/\{DATE_ISO_8601}/g, toISO8601ForFilename(now))
    .replaceAll(/\{SHORT_SHA}/g, gitSha.substring(0, 7))
}
