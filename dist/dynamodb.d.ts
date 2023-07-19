import { Credentials, DynamoDB } from "aws-sdk";
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
export declare class DynamoDBUtils {
    db: DocumentClient;
    dynamoDB: DynamoDB;
    constructor({ region, credentials }: {
        region: string;
        credentials: Credentials;
    });
    getItem<T>(table: string, pk: string, sk: string): Promise<T | null>;
    getManyItems<T>(table: string, keys: {
        PK: string;
        SK: string;
    }[]): Promise<(T | null)[]>;
    putItem(table: string, item: {
        [key: string]: DocumentClient.AttributeValue;
    }): Promise<void>;
    queryWithCallback<T>(table: string, index: string | undefined, pkValue: string, skValue: string | undefined, options: {
        FilterExpression?: string;
        ProjectionExpression?: string;
        Limit?: number;
        ScanIndexForward?: false;
        verbose?: boolean;
        maxPages?: number;
    }, callback: (items: T[], page: number) => Promise<void>): Promise<void>;
    query<T>(table: string, index: string | null | undefined, expression: string, pk: string, sk?: string, pages?: number, forward?: boolean, props?: {
        FilterExpression?: string;
        Limit?: number;
        verbose?: boolean;
    }): Promise<[T[], number]>;
    queryFirstPage<T>(table: string, index: string | undefined, pkValue: string, skValue: string | undefined, props?: {
        FilterExpression?: string;
        ProjectionExpression?: string;
        Limit?: number;
        ScanIndexForward?: false;
        verbose?: boolean;
    }): Promise<T[]>;
    createBackup(table: string, backupName: string): Promise<DynamoDB.Types.CreateBackupOutput>;
}
