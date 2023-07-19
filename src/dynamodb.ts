import {Credentials, DynamoDB} from "aws-sdk";
import {DocumentClient} from 'aws-sdk/clients/dynamodb'
import DataLoader from "dataloader";

const isNotError = <T>(item: T | Error): item is T => !(item instanceof Error)


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

  async getManyItems<T>(table: string, keys: { PK: string, SK: string }[]): Promise<(T | null)[]> {
    const loader = new DataLoader<{ PK: string, SK: string }, T | null>(async (keys) => {
      const r = await this.db.batchGet({
        ReturnConsumedCapacity: "TOTAL",
        RequestItems: {
          [table]: {
            Keys: [...keys]
          }
        }
      }).promise()
      if (r.UnprocessedKeys?.[table]) {
        console.error("Keys", {keys});
        throw new Error('Does not expect to have unprocessed keys if avg size < 300kb')
      }

      const results = r.Responses?.[table];
      if (!results) {
        console.error("Keys", {keys});
        throw new Error('Could not get responses');
      }

      return keys.map((key) => {
        const found = results.find((i) => i.PK === key.PK && i.SK === key.SK)
        return found ? found as T : null;
      })
    }, {
      cache: false,
      maxBatchSize: 100
    })

    const ans = await loader.loadMany(keys);
    const error = ans.find((i) => i instanceof Error);
    if (error) {
      console.error('One of the item failed to load');
      throw error;
    }

    return ans.filter(isNotError);
  }

  async putItem(table: string, item: { [key: string]: DocumentClient.AttributeValue }): Promise<void> {
    const r = await this.db.put({
      TableName: table,
      Item: item,
    }).promise()
  }

  /**
   * Example:
   * await db.queryWithCallback(credfolioTable, 'gsi1-index', 'LEARNER', 'Expired',
   *   {
   *     ProjectionExpression: 'PK',
   *   },
   *   async (items, page) => {
   *     console.log(page, items.length)
   *   })
   *
   * when index is undefined, key pair is PK and SK
   * when index is gsik-index, key pair is GSIKPK and GSIKSK
   * when index is gsi1-index, key pair is GSI1PK and GSI1SK
   */
  async queryWithCallback<T>(table: string,
                             index: string | undefined,
                             pkValue: string,
                             skValue: string | undefined,
                             options: {
                               FilterExpression?: string,
                               ProjectionExpression?: string,
                               Limit?: number,
                               ScanIndexForward?: false,
                               verbose?: boolean,
                               maxPages?: number,
                             },
                             callback: (items: T[], page: number) => Promise<void>, // return true if should continue
                             ): Promise<void> {
    let next: DocumentClient.Key | undefined = undefined;
    let page = 0

    const INDEX_PREFIX = index?.split('-')[0].toUpperCase();
    const pkKey = INDEX_PREFIX ? `${INDEX_PREFIX}PK` : 'PK'
    const skKey = INDEX_PREFIX ? `${INDEX_PREFIX}SK` : 'SK'

    do {
      const params: DocumentClient.QueryInput = {
        TableName: table,
        IndexName: index ?? undefined,
        ScanIndexForward: options.ScanIndexForward,
        KeyConditionExpression: skValue ? `${pkKey}=:${pkKey} AND begins_with(${skKey},:${skKey})` : `${pkKey}=:${pkKey}`,
        ExclusiveStartKey: next,
        ExpressionAttributeValues: {
          [`:${pkKey}`]: pkValue,
          [`:${skKey}`]: skValue,
        },
        ProjectionExpression: options.ProjectionExpression,
        FilterExpression: options.FilterExpression,
        Limit: options.Limit,
      }
      Object.entries(params).forEach(([k, v]) => {
        if (v === undefined) delete params[k]
      })

      if (options.verbose) console.log('PARAMS', params)

      await this.db.query(params).promise()
        .then(async (r) => {
          next = r.LastEvaluatedKey;
          await callback(r.Items as T[] ?? [], page);
        })
        .catch(e => {
          console.log('PARAMS', params)
          throw e;
        });

      page++;
    }
    while (next != null && (!options.maxPages || page < options.maxPages))
  }

  async query<T>(table: string, index: string | null | undefined, expression: string, pk: string, sk?: string, pages: number = 1, forward: boolean = true, props?: {
    FilterExpression?: string,
    Limit?: number,
    verbose?: boolean,
  }): Promise<[T[], number]> {
    const {FilterExpression, Limit, verbose} = props ?? {};
    const ans: DocumentClient.AttributeMap[] = [];
    let next: DocumentClient.Key | undefined;
    let i = 0
    for (; i < pages ?? 1; i++) {
      const params: DocumentClient.QueryInput = {
        TableName: table,
        IndexName: index ?? undefined,
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

  /**
   * Shorted query method
   */
  async queryFirstPage<T>(table: string,
                          index: string | undefined,
                          pkValue: string,
                          skValue: string | undefined,
                          options?: {
                            FilterExpression?: string,
                            ProjectionExpression?: string,
                            Limit?: number,
                            ScanIndexForward?: false,
                            verbose?: boolean,
                          }): Promise<T[]> {
    let next: DocumentClient.Key | undefined = undefined;
    const ans: DocumentClient.AttributeMap[] = [];

    const INDEX_PREFIX = index?.split('-')[0].toUpperCase();
    const pkKey = INDEX_PREFIX ? `${INDEX_PREFIX}PK` : 'PK'
    const skKey = INDEX_PREFIX ? `${INDEX_PREFIX}SK` : 'SK'

    const params: DocumentClient.QueryInput = {
      TableName: table,
      IndexName: index ?? undefined,
      ScanIndexForward: options?.ScanIndexForward,
      KeyConditionExpression: skValue ? `${pkKey}=:${pkKey} AND begins_with(${skKey},:${skKey})` : `${pkKey}=:${pkKey}`,
      ExclusiveStartKey: next,
      ExpressionAttributeValues: {
        [`:${pkKey}`]: pkValue,
        [`:${skKey}`]: skValue,
      },
      ProjectionExpression: options?.ProjectionExpression,
      FilterExpression: options?.FilterExpression,
      Limit: options?.Limit,
    }
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined) delete params[k]
    })

    if (options?.verbose) console.log('PARAMS', params)

    await this.db.query(params).promise()
      .then(async (r) => {
        ans.push(...r.Items ?? [])
      })
      .catch(e => {
        console.log('PARAMS', params)
        throw e;
      });

    return ans as T[];
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

