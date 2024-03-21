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

describe('tagNameFromTemplate', () => {
  test.each([
    ['{NAME}-v{VERSION}-alpha-{SHORT_SHA}', 'abcdef1234567890', appInfo, 'my-app-v1.0.0-alpha-abcdef1'],
    ['{NAME}-v{VERSION}', 'abcdef1234567890', appInfo, 'my-app-v1.0.0'],
    ['my-tag', 'abcdef1234567890', appInfo, 'my-tag'],
    ['{NAME}-{VERSION}+{SHORT_SHA}--{NAME}-{VERSION}+{SHORT_SHA}', 'abcdef1234567890', appInfo, 'my-app-1.0.0+abcdef1--my-app-1.0.0+abcdef1'],
  ])('correctly formats tag name from template "%s"', (template, gitSha, appInfo: RustAppInfo, expected) => {
    const result = tagNameFromTemplate(template, { appInfo, gitSha })
    expect(result).toBe(expected)
  })
})
