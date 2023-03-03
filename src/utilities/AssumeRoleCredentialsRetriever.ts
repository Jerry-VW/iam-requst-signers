import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts'
import type { ICredentials } from './types.js'

/**
 * Assume role credentials retriever.
 * @param credentials Credentials for signing process.
 * @param roleArn Arn string of the role that is getting assumed.
 * @param region
 * @param roleSessionName
 */
export const retrieveAssumeRoleCredentials = async (
  roleArn: string,
  credentials?: ICredentials,
  region: string = 'ap-northeast-1',
  roleSessionName: string = 'DefaultAssumedRoleSession'
) =>
  await new STSClient({
    region: region,
    ...(credentials && { credentials: credentials })
  }).send(new AssumeRoleCommand({
    RoleArn        : roleArn,
    RoleSessionName: roleSessionName
  }))
