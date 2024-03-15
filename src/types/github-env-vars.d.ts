/**
 * Environment variables available during the execution of a GitHub action.
 *
 * More info: https://docs.github.com/en/actions/learn-github-actions/variables
 */
type GithubEnvVars = {
  /**
   * Token to authenticate requests to the GitHub APIs.
   */
  GITHUB_TOKEN: string

  /**
   * The owner and repository name. For example, octocat/Hello-World.
   */
  GITHUB_REPOSITORY: string

  /**
   * The commit SHA that triggered the workflow. The value of this commit SHA
   * depends on the event that triggered the workflow. For more information, see
   * "Events that trigger workflows." For example,
   * ffac537e6cbbf934b08745a378932722df287a53.
   */
  GITHUB_SHA: string
}
