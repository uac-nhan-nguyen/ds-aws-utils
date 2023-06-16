import { CloudFormation, Credentials } from "aws-sdk";
export declare class CloudFormationUtils {
    cloudFormation: CloudFormation;
    constructor({ region, credentials }: {
        region: string;
        credentials: Credentials;
    });
    listStacks(params: CloudFormation.Types.ListStacksInput): Promise<CloudFormation.StackSummary[]>;
    listStackResources(params: CloudFormation.Types.ListStackResourcesInput): Promise<CloudFormation.StackResourceSummary[]>;
}
