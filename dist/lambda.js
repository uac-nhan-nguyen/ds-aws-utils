"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.iterateAllToken = exports.LambdaUtils = void 0;
const aws_sdk_1 = require("aws-sdk");
class LambdaUtils {
    constructor({ region, credentials }) {
        this.cf = new aws_sdk_1.CloudFormation({ region, credentials });
        this.lambda = new aws_sdk_1.Lambda({ region, credentials });
        this.cw = new aws_sdk_1.CloudWatch({ region, credentials });
        this.logs = new aws_sdk_1.CloudWatchLogs({ region, credentials });
    }
    async listAllStacks() {
        const ans = await (0, exports.iterateAllToken)(async (token) => {
            const ans = await this.cf.listStacks({
                NextToken: token
            }).promise();
            return { items: ans.StackSummaries ?? [], next: ans.NextToken };
        });
        return ans;
    }
    async listAllResources(stackName) {
        const ans = await (0, exports.iterateAllToken)(async (token) => {
            const ans = await this.cf.listStackResources({
                StackName: stackName,
                NextToken: token
            }).promise();
            return { items: ans.StackResourceSummaries ?? [], next: ans.NextToken };
        });
        return ans;
    }
    async listAllLambdasInStack(stackName) {
    }
    async filterLogEvents(props) {
        const logs = await this.logs.filterLogEvents(props).promise()
            .catch((e) => {
            return null;
        });
        return logs?.events ?? [];
    }
}
exports.LambdaUtils = LambdaUtils;
const iterateAllToken = async (callback) => {
    let token;
    const ans = [];
    do {
        const { items, next } = await callback(token);
        token = next;
        ans.push(...items);
    } while (token != null);
    return ans;
};
exports.iterateAllToken = iterateAllToken;
//# sourceMappingURL=lambda.js.map