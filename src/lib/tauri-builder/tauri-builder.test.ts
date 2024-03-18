import * as tauriBuilder from './tauri-builder'

const buildMock = jest.spyOn(tauriBuilder, 'build')

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('called with correct data must succeed', async () => {
    await tauriBuilder.build('.')
    // Mock so I don't call the pnpm install, here and everywhere the build command is called like in main.test.ts
    expect(buildMock).toHaveReturned()
  })
})
