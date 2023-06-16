"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudFormationUtils = void 0;
const aws_sdk_1 = require("aws-sdk");
const listAll_1 = require("./listAll");
class CloudFormationUtils {
    constructor({ region, credentials }) {
        this.cloudFormation = new aws_sdk_1.CloudFormation({
            region, credentials: credentials
        });
    }
    async listStacks(params) {
        return (0, listAll_1.listAll)((next) => this.cloudFormation.listStacks({ ...params, NextToken: next }).promise(), (r) => ({ NextToken: r.NextToken, Items: r.StackSummaries }));
    }
    async listStackResources(params) {
        return (0, listAll_1.listAll)((next) => this.cloudFormation.listStackResources({ ...params, NextToken: next }).promise(), (r) => ({ NextToken: r.NextToken, Items: r.StackResourceSummaries }));
    }
}
exports.CloudFormationUtils = CloudFormationUtils;
//# sourceMappingURL=cloud-formation.js.map