import * as process from 'process'

/**
 * Environment variables required during the execution of a GitHub action.
 *
 * More info: https://docs.github.com/en/actions/learn-github-actions/variables
 */
export type GithubRequiredEnvVars = 'GITHUB_TOKEN' | 'GITHUB_REPOSITORY' | 'GITHUB_SHA'

/**
 * Returns an object with all the required env vars for the action to run.
 *
 * It uses an empty string if an env var is not set.
 */
export const getRequiredEnvVars = (): Record<GithubRequiredEnvVars, string> => {
  return {
    GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',
    GITHUB_REPOSITORY: process.env.GITHUB_REPOSITORY || '',
    GITHUB_SHA: process.env.GITHUB_SHA || '',
  }
}

/**
 * Deletes all the required env vars from 'process.env'.
 * This function is only intended to be used for testing.
 */
export const test_deleteAllRequiredEnvVars = () => {
  Object.keys(getRequiredEnvVars()).forEach(key => delete process.env[key])
}

/**
 * Sets an env var.
 *
 * This function is only intended to be used for testing.
 */
export const test_setEnvVar = (key: GithubRequiredEnvVars, value: string) => {
  process.env[key] = value
}
