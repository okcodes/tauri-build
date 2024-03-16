import { RustAppInfo } from '../rust-utils/get-rust-app-info'
import { toISO8601ForFilename } from '../date-utils/date-format'

/**
 * Information used to replace the placeholders of the tag template.
 */
type TagData = {
  /** The application information including name, version, description, and edition. */
  appInfo: RustAppInfo
  /** The date to use for replacing `{DATE_ISO_8601}` in the template. */
  date: Date
  /** The full Git SHA1 hash to use for replacing `{SHORT_SHA}` in the template. */
  gitSha: string
}

/**
 * Generates a tag name by formatting a template string with values derived from a Rust application's info,
 * a specific date, and a Git SHA.
 *
 * Supported placeholders for the template include:
 * - `{VERSION}`: Replaced with the application version.
 * - `{NAME}`: Replaced with the application name.
 * - `{DATE_ISO_8601}`: Replaced with the date provided in the `@param {Date} now` parameter, formatted in ISO 8601 format suitable for filenames.
 * - `{SHORT_SHA}`: Replaced with the first 7 characters of the Git SHA.
 *
 * @param {string} template The template string containing placeholders for tag generation.
 * @param {TagData} params Data used to replace the template placeholders.
 * @returns {string} The generated tag name with placeholders replaced by specific values.
 */
export const tagNameFromTemplate = (template: string, { appInfo, date, gitSha }: TagData): string => {
  // It can be used for example with this template: "{NAME}-v{VERSION}-alpha-{DATE_ISO_8601}-{SHORT_SHA}".
  return template
    .replaceAll(/\{VERSION}/g, appInfo.package.version)
    .replaceAll(/\{NAME}/g, appInfo.package.name)
    .replaceAll(/\{DATE_ISO_8601}/g, toISO8601ForFilename(date))
    .replaceAll(/\{SHORT_SHA}/g, gitSha.substring(0, 7))
}
