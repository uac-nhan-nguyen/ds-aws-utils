import { CognitoIdentityServiceProvider, Credentials } from "aws-sdk";
import { UserPoolDescriptionType, UserType } from "aws-sdk/clients/cognitoidentityserviceprovider";
export declare class CognitoUtils {
    cognito: CognitoIdentityServiceProvider;
    constructor({ region, credentials }: {
        region: string;
        credentials: Credentials;
    });
    findPoolId(poolName: string): Promise<UserPoolDescriptionType>;
    listAllUsers(poolId: string): Promise<UserType & {
        sub: string;
        email?: string;
    }[]>;
}
