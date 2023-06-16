import {CloudFormation, Credentials} from "aws-sdk";
import {listAll} from "./listAll";

export class CloudFormationUtils {
  cloudFormation: CloudFormation;

  constructor({region, credentials}: { region: string, credentials: Credentials }) {
    this.cloudFormation = new CloudFormation({
      region, credentials: credentials
    });
  }

  async listStacks(params: CloudFormation.Types.ListStacksInput) {
    return listAll(
      (next) => this.cloudFormation.listStacks({...params, NextToken: next}).promise(),
      (r) => ({NextToken: r.NextToken, Items: r.StackSummaries})
    )
  }

  async listStackResources(params: CloudFormation.Types.ListStackResourcesInput) {
    return listAll(
      (next) => this.cloudFormation.listStackResources({...params, NextToken: next}).promise(),
      (r) => ({NextToken: r.NextToken, Items: r.StackResourceSummaries})
    )
  }
}

