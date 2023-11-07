import { CognitoIdentityProvider, UserPoolDescriptionType, UserType } from "@aws-sdk/client-cognito-identity-provider";

/**
 * Usage:
 *
 * ```js
 * const credentials = getCredentialsFromProfile('your-profile')
 * const poolName = 'your-pool'
 *
 * const cognito = new CognitoUtils({ region, credentials })
 * const {Id: poolId} = await cognito.findPoolId(poolName)
 * const users = await cognito.listAllUsers(poolId)
 * ```
 */
export class CognitoUtils {
  cognito: CognitoIdentityProvider;

  constructor({region, credentials}: { region: string, credentials }) {
    this.cognito = new CognitoIdentityProvider({
      region,
      credentials
    })
  }

  async findPoolId(poolName: string): Promise<UserPoolDescriptionType> {
    const pools = await this.cognito.listUserPools({MaxResults: 50})
    const ans = pools.UserPools?.find((i) => i.Name === poolName);

    if (ans == null) {
      throw new Error(`Cannot find UserPoolId. Available pools [${pools.UserPools?.map((i) => i.Name).join(', ')}]`)
    }
    return ans;
  }

  async listAllUsers(poolId: string): Promise<UserType & {
    sub: string,
    email?: string,
  }[]> {
    const users: UserType[] = [];
    let token;
    do {
      const userResponse = await this.cognito.listUsers({
        UserPoolId: poolId,
        PaginationToken: token
      })
      users.push(...(userResponse.Users ?? []));
      token = userResponse.PaginationToken;
    } while (token)
    return users.map((i: UserType) => {
      if (i.Username == null) throw Error('Missing Username attribute');
      return {
        ...i,
        sub: i.Username,
        email: i.Attributes?.find((i) => i.Name === 'email')?.Value,
      }
    });
  }

}