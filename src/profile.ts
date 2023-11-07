import { fromIni } from "@aws-sdk/credential-providers";
import { AwsCredentialIdentity } from "@smithy/types";

/**
 * Returns undefined for aws client to use default profile
 */
export const getCredentialsFromProfile = async (profile: string) : Promise<AwsCredentialIdentity | undefined> => {
  if (profile == null) return undefined;
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    // prioritize loading credentials from env var
    return {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      sessionToken: process.env.AWS_SESSION_TOKEN,
    };
  } else {
    const credentials = await fromIni()();
    return credentials;
  }
};
