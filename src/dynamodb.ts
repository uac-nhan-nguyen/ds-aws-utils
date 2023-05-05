import {Credentials, DynamoDB} from "aws-sdk";
import {DocumentClient} from 'aws-sdk/clients/dynamodb'

export class DynamoDBUtils {
  db: DocumentClient;

  dynamoDB: DynamoDB;

  constructor({region, credentials}: { region: string, credentials: Credentials }) {
    this.db = new DynamoDB.DocumentClient({
      region, credentials: credentials
    });
    this.dynamoDB = new DynamoDB({
      region, credentials: credentials
    })
  }

  async getItem<T>(table: string, pk: string, sk: string): Promise<T | null> {
    const r = await this.db.get({
      TableName: table,
      Key: {
        PK: pk,
        SK: sk
      }
    }).promise()
    return r.Item as T ?? null;
  }

  async putItem(table: string, item: {[key: string]: DocumentClient.AttributeValue}): Promise<void> {
    const r = await this.db.put({
      TableName: table,
      Item: item,
    }).promise()
  }

  async query<T>(table: string, index: string | null | undefined, expression: string, pk: string, sk?: string, pages: number = 1, forward: boolean = true, props?: {
    FilterExpression?: string,
    Limit?: number,
    verbose?: boolean,
  }): Promise<[T[], number]> {
    const {FilterExpression, Limit, verbose} = props ?? {};
    const ans : DocumentClient.AttributeMap[] = [];
    let next: DocumentClient.Key | undefined;
    let i = 0
    for (; i < pages ?? 1; i++) {
      const params: DocumentClient.QueryInput = {
        TableName: table,
        IndexName: index??undefined,
        ScanIndexForward: forward,
        KeyConditionExpression: expression,
        ExclusiveStartKey: next,
        ExpressionAttributeNames: Object.fromEntries([...expression.matchAll(/(#\w+)/g)].map((m): [string, string] => {
          const key = m[1];
          return [key, key.replace('#', '')]
        })),
        ExpressionAttributeValues: Object.fromEntries([...expression.matchAll(/(:\w+)/g)].map((m) => {
          const key = m[1];
          if (key.endsWith('PK')) {
            return [key, pk]
          }
          else if (key.endsWith('SK') && sk != null) {
            return [key, sk]
          }
          else {
            throw `Unhandled value key ${key}`
          }
        })),
        FilterExpression, Limit,
      }
      if (verbose) console.log(params)
      const r = await this.db.query(params).promise();
      ans.push(...r.Items ?? []);
      next = r.LastEvaluatedKey;
      if (!next) {
        return [ans as T[], i + 1];
      }
    }

    return [ans as T[], i];
  }

  async createBackup(table: string, backupName: string): Promise<DynamoDB.Types.CreateBackupOutput> {
    const r = await this.dynamoDB.createBackup({
      TableName: table,
      BackupName: backupName,
    }).promise();
    return r;
    // const status = await this.dynamoDB.describeBackup({
    //   BackupArn: r.BackupDetails.BackupArn,
    // }).promise()
    // console.log(status)
    // return status;
  }
}

