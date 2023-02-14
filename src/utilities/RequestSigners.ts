import { SignatureV4 } from '@aws-sdk/signature-v4'
import { Sha256 } from '@aws-crypto/sha256-js'
import { HttpRequest } from '@aws-sdk/protocol-http'
import type { HttpRequest as TypeHR } from '@aws-sdk/types'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import { Signer } from '@aws-amplify/core'
import assert from 'assert'
import type { ICredentials, IInterceptorTargetServiceInformation } from './types.js'
import { retrieveAssumeRoleCredentials } from './AssumeRoleCredentialsRetriever.js'

/**
 * Api Gateway request IAM signer for HttpRequest.
 * @param credentials Credentials for signing process.
 * @param path Path of the request. Ex: /requests
 * @param method Method of the request. Ex: GET
 * @param headers Headers of the request. Ex: {host: HOST_NAME}
 * @param body Body of the request. Ex: {foo: 233}
 * @param region (Optional) Region of the target microservice.
 * @param service (Optional) Service name.
 */
export const signRequestHttpRequest = async (
  credentials: ICredentials,
  path: string,
  method: string,
  headers: Record<string | 'host', string>,
  body?: unknown,
  region: string = 'ap-northeast-1',
  service: string = 'execute-api'
): Promise<TypeHR> =>
  await new SignatureV4({
    credentials: credentials,
    service    : service,
    region     : region,
    sha256     : Sha256
  }).sign(
    new HttpRequest({
      hostname: headers['host'] ?? '',
      path,
      method  : method.toUpperCase(),
      headers,
      body    : body ? JSON.stringify(body) : undefined
    })
  )

/**
 * Request signer as Axios request interceptor.
 * @param roleArn Arn of the AssumeRole.
 * @param targetServiceInformation Information about target service. Default is for execute-api in region ap-northeast-1.
 * @param credentials Caller credentials for signing process.
 */
export const signRequestAxiosInterceptor = (
  roleArn: string,
  targetServiceInformation: IInterceptorTargetServiceInformation = {
    region : 'ap-northeast-1',
    service: 'execute-api'
  },
  credentials?: ICredentials
) => async (cfg: AxiosRequestConfig) => {
  const assumedCredentials = await retrieveAssumeRoleCredentials(roleArn, credentials)

  assert(assumedCredentials.Credentials, 'No assumed credentials.')

  const request = {
    method: cfg.method?.toUpperCase() ?? 'GET',
    url   : cfg.url,
    data  : JSON.stringify(cfg.data)
  }
  const accessInfo = {
    access_key   : assumedCredentials.Credentials.AccessKeyId,
    secret_key   : assumedCredentials.Credentials.SecretAccessKey,
    session_token: assumedCredentials.Credentials.SessionToken
  }
  const serviceInfo = {
    service: targetServiceInformation.service,
    region : targetServiceInformation.region
  }
  const signedRequest = Signer.sign(request, accessInfo, serviceInfo)

  cfg.headers = { ...cfg.headers, ...signedRequest.headers }

  return cfg
}


/**
 * Attach signer as request interceptor to axios instance.
 * @param axios Axios to attach to.
 * @param targetRoleArn Arn of the AssumeRole.
 * @param targetServiceInformation Information about target service. Default is for execute-api in region ap-northeast-1.
 * @param credentials Caller credentials for signing process.
 */
export const attachDesignatedSignRequestAxiosInterceptor = (
  axios: AxiosInstance,
  targetRoleArn: string,
  targetServiceInformation: IInterceptorTargetServiceInformation = {
    region : 'ap-northeast-1',
    service: 'execute-api'
  },
  credentials?: ICredentials
) =>
  axios.interceptors.request.use(signRequestAxiosInterceptor(targetRoleArn, targetServiceInformation, credentials))
