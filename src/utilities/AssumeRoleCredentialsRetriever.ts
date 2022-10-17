import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts'
import { ICredentials } from './types'

/**
 * Assume role credentials retriever.
 * @param credentials Credentials for signing process.
 * @param roleArn Arn string of the role that is getting assumed.
 */
const retrieveAssumeRoleCredentials = async (
  roleArn: string,
  credentials?: ICredentials
) =>
  await new STSClient({
    region     : 'ap-northeast-1',
    credentials: credentials
  }).send(new AssumeRoleCommand({
    RoleArn        : roleArn,
    RoleSessionName: 'DefaultAssumedRoleSession'
  }))

export default retrieveAssumeRoleCredentials
