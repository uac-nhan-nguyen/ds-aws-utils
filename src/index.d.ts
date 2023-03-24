import {Credentials, DynamoDB} from 'aws-sdk'
import {DocumentClient} from "aws-sdk/clients/dynamodb";

export class DynamoDBUtils {
  constructor({region: string, credentials: Credentials});

  /**
   *
   * @param table
   * @param index
   * @param expression
   * @param pk
   * @param sk
   * @param pages default 1
   * @param forward default true
   * @param props
   * @return [items, pages]
   */
  query(table: string, index: string | null, expression: string, pk, sk?: string, pages?: number, forward?: boolean, props?: {
    FilterExpression?: string,
    Limit?: number,
  }): Promise<[object[], number]>;

  getItem(table: string, pk: string, sk: string): Promise<object>;

  putItem(table: string, item: object): Promise<void>;

  createBackup(table: string, backupName: string): Promise<DynamoDB.Types.CreateBackupOutput>;

  db: DocumentClient;
}

export function getCredentialsFromProfile (profile: string) : Credentials