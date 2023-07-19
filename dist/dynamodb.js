"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoDBUtils = void 0;
const aws_sdk_1 = require("aws-sdk");
const dataloader_1 = __importDefault(require("dataloader"));
const isNotError = (item) => !(item instanceof Error);
class DynamoDBUtils {
    constructor({ region, credentials }) {
        this.db = new aws_sdk_1.DynamoDB.DocumentClient({
            region, credentials: credentials
        });
        this.dynamoDB = new aws_sdk_1.DynamoDB({
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
        }).promise();
        return r.Item ?? null;
    }
    async getManyItems(table, keys) {
        const loader = new dataloader_1.default(async (keys) => {
            const r = await this.db.batchGet({
                ReturnConsumedCapacity: "TOTAL",
                RequestItems: {
                    [table]: {
                        Keys: [...keys]
                    }
                }
            }).promise();
            if (r.UnprocessedKeys?.[table]) {
                console.error("Keys", { keys });
                throw new Error('Does not expect to have unprocessed keys if avg size < 300kb');
            }
            const results = r.Responses?.[table];
            if (!results) {
                console.error("Keys", { keys });
                throw new Error('Could not get responses');
            }
            return keys.map((key) => {
                const found = results.find((i) => i.PK === key.PK && i.SK === key.SK);
                return found ? found : null;
            });
        }, {
            cache: false,
            maxBatchSize: 100
        });
        const ans = await loader.loadMany(keys);
        const error = ans.find((i) => i instanceof Error);
        if (error) {
            console.error('One of the item failed to load');
            throw error;
        }
        return ans.filter(isNotError);
    }
    async putItem(table, item) {
        const r = await this.db.put({
            TableName: table,
            Item: item,
        }).promise();
    }
    async queryWithCallback(table, index, pkValue, skValue, callback, props) {
        const { FilterExpression, Limit, verbose } = props ?? {};
        let next = undefined;
        let page = 0;
        const INDEX_PREFIX = index?.split('-')[0].toUpperCase();
        const pkKey = INDEX_PREFIX ? `${INDEX_PREFIX}PK` : 'PK';
        const skKey = INDEX_PREFIX ? `${INDEX_PREFIX}SK` : 'SK';
        do {
            const params = {
                TableName: table,
                IndexName: index ?? undefined,
                ScanIndexForward: props?.ScanIndexForward,
                KeyConditionExpression: skValue ? `${pkKey}=:${pkKey} AND begins_with(${skKey},:${skKey})` : `${pkKey}=:${pkKey}`,
                ExclusiveStartKey: next,
                ExpressionAttributeValues: {
                    [`:${pkKey}`]: pkValue,
                    [`:${skKey}`]: skValue,
                },
                FilterExpression, Limit,
            };
            Object.entries(params).forEach(([k, v]) => {
                if (v === undefined)
                    delete params[k];
            });
            if (verbose)
                console.log('PARAMS', params);
            await this.db.query(params).promise()
                .then(async (r) => {
                next = r.LastEvaluatedKey;
                await callback(r.Items ?? [], page);
            })
                .catch(e => {
                console.log('PARAMS', params);
                throw e;
            });
            page++;
        } while (next != null);
    }
    async query(table, index, expression, pk, sk, pages = 1, forward = true, props) {
        const { FilterExpression, Limit, verbose } = props ?? {};
        const ans = [];
        let next;
        let i = 0;
        for (; i < pages ?? 1; i++) {
            const params = {
                TableName: table,
                IndexName: index ?? undefined,
                ScanIndexForward: forward,
                KeyConditionExpression: expression,
                ExclusiveStartKey: next,
                ExpressionAttributeNames: Object.fromEntries([...expression.matchAll(/(#\w+)/g)].map((m) => {
                    const key = m[1];
                    return [key, key.replace('#', '')];
                })),
                ExpressionAttributeValues: Object.fromEntries([...expression.matchAll(/(:\w+)/g)].map((m) => {
                    const key = m[1];
                    if (key.endsWith('PK')) {
                        return [key, pk];
                    }
                    else if (key.endsWith('SK') && sk != null) {
                        return [key, sk];
                    }
                    else {
                        throw `Unhandled value key ${key}`;
                    }
                })),
                FilterExpression, Limit,
            };
            if (verbose)
                console.log(params);
            const r = await this.db.query(params).promise();
            ans.push(...r.Items ?? []);
            next = r.LastEvaluatedKey;
            if (!next) {
                return [ans, i + 1];
            }
        }
        return [ans, i];
    }
    async createBackup(table, backupName) {
        const r = await this.dynamoDB.createBackup({
            TableName: table,
            BackupName: backupName,
        }).promise();
        return r;
    }
}
exports.DynamoDBUtils = DynamoDBUtils;
//# sourceMappingURL=dynamodb.js.map