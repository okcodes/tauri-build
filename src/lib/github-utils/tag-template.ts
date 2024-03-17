import { RustAppInfo } from '../rust-utils/get-rust-app-info'

/**
 * Information used to replace the placeholders of the tag template.
 */
export type TagData = {
  /** The application information including name, version, description, and edition. */
  appInfo: RustAppInfo
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
 * - `{SHORT_SHA}`: Replaced with the first 7 characters of the Git SHA.
 *
 * @param {string} template The template string containing placeholders for tag generation, e.g., "{NAME}-v{VERSION}+{SHORT_SHA}".
 * @param {TagData} params Data used to replace the template placeholders.
 * @returns {string} The generated tag name with placeholders replaced by specific values.
 */
export const tagNameFromTemplate = (template: string, { appInfo, gitSha }: TagData): string => {
  return template
    .replaceAll(/\{VERSION}/g, appInfo.package.version)
    .replaceAll(/\{NAME}/g, appInfo.package.name)
    .replaceAll(/\{SHORT_SHA}/g, gitSha.substring(0, 7))
}
