import { toISO8601ForFilename } from './date-format'

describe('toISO8601ForFilename', () => {
  test.each([
    [new Date('2024-03-16T10:05:30Z'), '2024-03-16T10-05-30Z'],
    [new Date('2024-01-01T00:00:00Z'), '2024-01-01T00-00-00Z'],
    [new Date('2024-12-31T23:59:59Z'), '2024-12-31T23-59-59Z'],
  ])('returns "%s" for the date "%s"', (inputDate, expected) => {
    const result = toISO8601ForFilename(inputDate)
    expect(result).toBe(expected)
  })
})
