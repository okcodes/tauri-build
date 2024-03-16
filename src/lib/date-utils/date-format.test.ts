import { toISO8601ForFilename } from './date-format'

describe('toISO8601ForFilename', () => {
  it('returns a formatted string suitable for filenames', () => {
    const result = toISO8601ForFilename(new Date('2024-03-16T10:05:30Z'))
    expect(result).toBe('2024-03-16T10-05-30Z')
  })
})
