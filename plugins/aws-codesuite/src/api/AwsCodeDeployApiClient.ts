/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  BatchGetDeploymentGroupsCommandOutput,
  BatchGetDeploymentsCommandOutput,
} from "@aws-sdk/client-codedeploy";
import { IdentityApi, ConfigApi } from "@backstage/core-plugin-api";
import { ResponseError } from "@backstage/errors";
import { AwsCodeDeployApi } from ".";

export class AwsCodeDeployApiClient implements AwsCodeDeployApi {
  private readonly configApi: ConfigApi;
  private readonly identityApi: IdentityApi;

  public constructor(options: {
    configApi: ConfigApi;
    identityApi: IdentityApi;
  }) {
    this.configApi = options.configApi;
    this.identityApi = options.identityApi;
  }

  async getDeploymentGroup({
    arn,
  }: {
    arn: string;
  }): Promise<BatchGetDeploymentGroupsCommandOutput> {
    const queryString = new URLSearchParams();
    queryString.append("arn", arn);

    const urlSegment = `deploymentGroup?${queryString}`;

    return await this.get<BatchGetDeploymentGroupsCommandOutput>(urlSegment);
  }

  async getDeployments({
    arn,
  }: {
    arn: string;
  }): Promise<BatchGetDeploymentsCommandOutput> {
    const queryString = new URLSearchParams();
    queryString.append("arn", arn);

    const urlSegment = `deployments?${queryString}`;

    return await this.get<BatchGetDeploymentsCommandOutput>(urlSegment);
  }

  private async get<T>(path: string): Promise<T> {
    const baseUrl = `${await this.configApi.getString(
      "backend.baseUrl"
    )}/api/aws-codesuite-backend/codedeploy/}`;

    const url = new URL(path, baseUrl);

    const { token: idToken } = await this.identityApi.getCredentials();

    const response = await fetch(url.toString(), {
      headers: idToken ? { Authorization: `Bearer ${idToken}` } : {},
    });

    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }

    return response.json() as Promise<T>;
  }
}
