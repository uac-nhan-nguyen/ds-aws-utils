import {Credentials } from 'aws-sdk'
import {DocumentClient} from "aws-sdk/clients/dynamodb";

export class DynamoDBUtils {
  constructor({region: string, credentials: Credentials});

  query(table: string, index: string | null, expression: string, pk, sk?: string, pages?: number, forward?: boolean): Promise<object[]>;

  getItem(table: string, pk: string, sk: string): Promise<object>;

  putItem(table: string, item: object): Promise<void>;

  db: DocumentClient;
}

export function getCredentialsFromProfile (profile: string) : Credentials