import fs from "fs";
import os from "os";

/**
 * Returns undefined for aws client to use default profile
 */
const getCredentialsFromProfile = (profile) => {
  if (profile == null) return undefined;

  const file = Buffer.from(fs.readFileSync(`${os.homedir()}/.aws/credentials`)).toString('utf-8');
  const lines = file.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith(`[${profile}]`)) {
      return new AWS.Credentials({
        accessKeyId: lines[i + 1].split('=')[1].trim(),
        secretAccessKey: lines[i + 2].split('=')[1].trim(),
      })
    }
  }
  throw `Profile ${profile} not found`
}
