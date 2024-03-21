export const toISO8601ForFilename = (date: Date) => {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0') // getUTCMonth() returns 0-11
  const day = String(date.getUTCDate()).padStart(2, '0')
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  const seconds = String(date.getUTCSeconds()).padStart(2, '0')

  // Constructing the format: YYYY-MM-DDTHH-MM-SSZ
  return `${year}-${month}-${day}T${hours}-${minutes}-${seconds}Z`
}
