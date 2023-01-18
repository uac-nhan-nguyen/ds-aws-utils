import {Credentials} from 'aws-sdk'

export class DynamoDBUtils {
  constructor({region: string, credentials: Credentials});

  query(table: string, index: string | null, expression: string, pk, sk?: string, pages?: number, forward?: boolean): Promise<object[]>;
}

export function getCredentialsFromProfile (profile: string) : Credentials