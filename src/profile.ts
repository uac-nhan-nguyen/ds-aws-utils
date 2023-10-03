import AWS, {Credentials} from 'aws-sdk'
import fs from "fs";
import os from "os";

/**
 * Returns undefined for aws client to use default profile
 */
export const getCredentialsFromProfile = (profile: string): Credentials | undefined => {
  if (profile == null) return undefined;

  const file = Buffer.from(fs.readFileSync(`${os.homedir()}/.aws/credentials`)).toString('utf-8');
  const lines = file.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith(`[${profile}]`)) {
      let accessKeyId, secretAccessKey, sessionToken;
      for (let j = 1; j< 4; j++){
        const [k,v] = lines[i + j].split('=');
        if (k === 'aws_access_key_id'){
          accessKeyId = v.trim()
        }
        else if (k === 'aws_secret_access_key') {
          secretAccessKey = v.trim()
        }
        else if (k === 'aws_session_token') {
          sessionToken = v.trim()
        }
      }

      return new AWS.Credentials({
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
        sessionToken,
      })
    }
  }
  throw `Profile ${profile} not found`
}
