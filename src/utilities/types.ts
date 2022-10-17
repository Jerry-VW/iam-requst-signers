/**
 * Credentials interface.
 */
export interface ICredentials {
  /**
   *  Access key id used for signing process.
   */
  accessKeyId: string
  /**
   *  Secret access key used for signing process.
   */
  secretAccessKey: string
  /**
   *  Session token used for signing process.
   */
  sessionToken?: string
}

/**
 * Information about target service interface.
 */
export interface IInterceptorTargetServiceInformation {
  /**
   * Region of the target service.
   */
  region: string
  /**
   * Name of the target service.
   */
  service: string
}
