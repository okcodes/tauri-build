import * as tauriBuilder from './tauri-builder'

const buildMock = jest.spyOn(tauriBuilder, 'build')

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('called with correct data must succeed', async () => {
    await tauriBuilder.build()
    expect(buildMock).toHaveReturned()
  })
})
