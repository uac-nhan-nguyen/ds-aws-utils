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
    query<T>(table: string, index: string | null | undefined, expression: string, pk: string, sk?: string, pages?: number, forward?: boolean, props?: {
        FilterExpression?: string;
        Limit?: number;
        verbose?: boolean;
    }): Promise<[T[], number]>;
    createBackup(table: string, backupName: string): Promise<DynamoDB.Types.CreateBackupOutput>;
}
