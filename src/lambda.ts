import {CloudFormation, CloudWatch, CloudWatchLogs, Credentials, Lambda} from "aws-sdk";

export class LambdaUtils {
  cf: CloudFormation
  lambda: Lambda
  logs: CloudWatchLogs
  cw: CloudWatch

  constructor({region, credentials}: { region: string, credentials: Credentials }) {
    this.cf = new CloudFormation({region, credentials})
    this.lambda = new Lambda({region, credentials})
    this.cw = new CloudWatch({region, credentials})
    this.logs = new CloudWatchLogs({region, credentials})
  }

  async listAllStacks(): Promise<CloudFormation.StackSummary[]> {
    const ans = await iterateAllToken(async (token) => {
      const ans = await this.cf.listStacks({
        NextToken: token
      }).promise()
      return {items: ans.StackSummaries ?? [], next: ans.NextToken};
    })
    return ans;
  }

  async listAllResources(stackName: string): Promise<CloudFormation.StackResourceSummary[]> {
    const ans = await iterateAllToken(async (token) => {
      const ans = await this.cf.listStackResources({
        StackName: stackName,
        NextToken: token
      }).promise()
      return {items: ans.StackResourceSummaries ?? [], next: ans.NextToken};
    })

    return ans;
  }

  async listAllLambdasInStack(stackName: string) {

  }

  async filterLogEvents(props: CloudWatchLogs.Types.FilterLogEventsRequest): Promise<CloudWatchLogs.FilteredLogEvent[]> {
    const logs = await this.logs.filterLogEvents(props).promise()
      .catch((e) => {
        return null
      })

    return logs?.events ?? [];
  }
}

export const iterateAllToken = async <T>(callback: (token: string | undefined) => Promise<{
  items: T[],
  next: string | undefined
}>) => {
  let token: string | undefined;
  const ans: T[] = [];
  do {
    const {items, next} = await callback(token)
    token = next;
    ans.push(...items);
  } while (token != null)
  return ans;
}
