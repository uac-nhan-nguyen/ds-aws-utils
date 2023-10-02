import { CloudFormation, CloudWatch, CloudWatchLogs, Credentials, Lambda } from "aws-sdk";
export declare class LambdaUtils {
    cf: CloudFormation;
    lambda: Lambda;
    logs: CloudWatchLogs;
    cw: CloudWatch;
    constructor({ region, credentials }: {
        region: string;
        credentials: Credentials;
    });
    listAllStacks(): Promise<CloudFormation.StackSummary[]>;
    listAllResources(stackName: string): Promise<CloudFormation.StackResourceSummary[]>;
    listAllLambdasInStack(stackName: string): Promise<void>;
    filterLogEvents(props: CloudWatchLogs.Types.FilterLogEventsRequest): Promise<CloudWatchLogs.FilteredLogEvent[]>;
}
export declare const iterateAllToken: <T>(callback: (token: string | undefined) => Promise<{
    items: T[];
    next: string | undefined;
}>) => Promise<T[]>;
