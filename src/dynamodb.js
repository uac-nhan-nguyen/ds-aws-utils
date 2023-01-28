import AWS from "aws-sdk";

export class DynamoDBUtils {
  /** @type {import('aws-sdk/clients/dynamodb').DocumentClient}*/
  db;
  constructor({region, credentials}) {
    this.db = new AWS.DynamoDB.DocumentClient({
      region, credentials: credentials
    });
  }

  async getItem(table, pk, sk) {
    const r = await this.db.get({
      TableName: table,
      Key: {
        PK: pk,
        SK: sk
      }
    }).promise()
    return r.Item;
  }

  async putItem(table, item) {
    const r = await this.db.put({
      TableName: table,
      Item: item,
    }).promise()
  }

  async query(table, index, expression, pk, sk, pages = 1, forward = true, options) {
    const { FilterExpression, Limit } = options ?? {};
    const ans = [];
    let next;
    let i = 0
    for (; i < pages; i++){
      const r = await this.db.query({
        TableName: table,
        IndexName: index,
        ScanIndexForward: forward,
        KeyConditionExpression: expression,
        ExclusiveStartKey: next,
        ExpressionAttributeNames: Object.fromEntries([...expression.matchAll(/(#\w+)/g)].map(([key]) => {
          return [key, key.replace('#', '')]
        })),
        ExpressionAttributeValues: Object.fromEntries([...expression.matchAll(/(:\w+)/g)].map(([key]) => {
          if (key.endsWith('PK')) {
            return [key, pk]
          } else if (key.endsWith('SK')) {
            return [key, sk]
          } else {
            throw `Unhandled value key ${key}`
          }
        })),
        FilterExpression, Limit,
      }).promise();
      ans.push(...r.Items);
      next = r.LastEvaluatedKey;
      if (!next) break;
    }

    return [ans, i + 1];
  }
}
