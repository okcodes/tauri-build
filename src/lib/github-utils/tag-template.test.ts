import { tagNameFromTemplate } from './tag-template'
import { RustAppInfo } from '../rust-utils/get-rust-app-info'

const appInfo: RustAppInfo = {
  package: {
    name: 'my-app',
    version: '1.0.0',
    description: 'A test application',
    edition: '2021',
  },
}

const now = new Date('2024-03-16T10:05:30Z')

describe('tagNameFromTemplate', () => {
  test.each([
    ['{NAME}-v{VERSION}-alpha-{DATE_ISO_8601}-{SHORT_SHA}', now, 'abcdef1234567890', appInfo, 'my-app-v1.0.0-alpha-2024-03-16T10-05-30Z-abcdef1'],
    ['{NAME}-v{VERSION}', now, 'abcdef1234567890', appInfo, 'my-app-v1.0.0'],
    ['my-tag', now, 'abcdef1234567890', appInfo, 'my-tag'],
    ['{NAME}-{VERSION}-{DATE_ISO_8601}-{SHORT_SHA}--{NAME}-{VERSION}-{DATE_ISO_8601}-{SHORT_SHA}', now, 'abcdef1234567890', appInfo, 'my-app-1.0.0-2024-03-16T10-05-30Z-abcdef1--my-app-1.0.0-2024-03-16T10-05-30Z-abcdef1'],
  ])('correctly formats tag name from template "%s"', (template, now, gitSha, appInfo: RustAppInfo, expected) => {
    const result = tagNameFromTemplate({ template, appInfo, now, gitSha })
    expect(result).toBe(expected)
  })
})
