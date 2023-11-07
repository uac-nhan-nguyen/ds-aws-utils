import { CloudFormation, ListStackResourcesCommandInput, ListStacksCommandInput } from "@aws-sdk/client-cloudformation";
import {listAll} from "./listAll";

export class CloudFormationUtils {
  cloudFormation: CloudFormation;

  constructor({region, credentials}: { region: string, credentials }) {
    this.cloudFormation = new CloudFormation({
      region,
      credentials: credentials
    });
  }

  async listStacks(params: ListStacksCommandInput) {
    return listAll(
      (next) => this.cloudFormation.listStacks({...params, NextToken: next}),
      (r) => ({NextToken: r.NextToken, Items: r.StackSummaries})
    )
  }

  async listStackResources(params: ListStackResourcesCommandInput) {
    return listAll(
      (next) => this.cloudFormation.listStackResources({...params, NextToken: next}),
      (r) => ({NextToken: r.NextToken, Items: r.StackResourceSummaries})
    )
  }
}

