"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitoUtils = void 0;
const aws_sdk_1 = require("aws-sdk");
class CognitoUtils {
    constructor({ region, credentials }) {
        this.cognito = new aws_sdk_1.CognitoIdentityServiceProvider({ region, credentials });
    }
    async findPoolId(poolName) {
        const pools = await this.cognito.listUserPools({ MaxResults: 50 }).promise();
        const ans = pools.UserPools?.find((i) => i.Name === poolName);
        if (ans == null) {
            throw new Error(`Cannot find UserPoolId. Available pools [${pools.UserPools?.map((i) => i.Name).join(', ')}]`);
        }
        return ans;
    }
    async listAllUsers(poolId) {
        const users = [];
        let token;
        do {
            const userResponse = await this.cognito.listUsers({
                UserPoolId: poolId,
                PaginationToken: token
            }).promise();
            users.push(...(userResponse.Users ?? []));
            token = userResponse.PaginationToken;
        } while (token);
        return users.map((i) => {
            if (i.Username == null)
                throw Error('Missing Username attribute');
            return {
                ...i,
                sub: i.Username,
                email: i.Attributes?.find((i) => i.Name === 'email')?.Value,
            };
        });
    }
}
exports.CognitoUtils = CognitoUtils;
//# sourceMappingURL=cognito.js.map