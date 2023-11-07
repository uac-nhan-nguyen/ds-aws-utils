import { CloudFormation, StackResourceSummary, StackSummary } from "@aws-sdk/client-cloudformation";
import { CloudWatch } from "@aws-sdk/client-cloudwatch";
import { CloudWatchLogs, FilterLogEventsRequest, FilteredLogEvent } from "@aws-sdk/client-cloudwatch-logs";
import { Lambda } from "@aws-sdk/client-lambda";

export class LambdaUtils {
  cf: CloudFormation
  lambda: Lambda
  logs: CloudWatchLogs
  cw: CloudWatch

  constructor({region, credentials}: { region: string, credentials }) {
    this.cf = new CloudFormation({
      region,
      credentials
    })
    this.lambda = new Lambda({
      region,
      credentials
    })
    this.cw = new CloudWatch({
      region,
      credentials
    })
    this.logs = new CloudWatchLogs({
      region,
      credentials
    })
  }

  async listAllStacks(): Promise<StackSummary[]> {
    const ans = await iterateAllToken(async (token) => {
      const ans = await this.cf.listStacks({
        NextToken: token
      })
      return {items: ans.StackSummaries ?? [], next: ans.NextToken};
    })
    return ans;
  }

  async listAllResources(stackName: string): Promise<StackResourceSummary[]> {
    const ans = await iterateAllToken(async (token) => {
      const ans = await this.cf.listStackResources({
        StackName: stackName,
        NextToken: token
      })
      return {items: ans.StackResourceSummaries ?? [], next: ans.NextToken};
    })

    return ans;
  }

  async listAllLambdasInStack(stackName: string) {

  }

  async filterLogEvents(props: FilterLogEventsRequest): Promise<FilteredLogEvent[]> {
    const logs = await this.logs.filterLogEvents(props)
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
