# ds-aws-utils package

- [ ] get aws creds from profile
- [ ] dynamodb utils
- [ ] cognito utils

## dynamodb

### Type check methods (for single table pattern)

- Use the same object structure as in `aws-sdk`

Example

```ts
export type UserState = 'New' | 'Register'
export interface UserData {
  PK: `User#${string}`          // {userId}
  SK: '#'
  
  GSI1PK: `User`                // -> query all users
  GSI1SK: `${number}`           // {createdTime}
  
  GSI1PK: `User#${UserState}`   // -> query users by state
  GSI1SK: `${number}`           // {updatedTime}
}

const newItem = await updateItem<UserData>({
  TableName: tableName,
  Key: {
    PK: `User#123`,             // literal string check
    SK: '#'                     // literal string check
  },
  UpdateExpression: "SET #GSI2PK=:GSI2PK",
  ExpressionAttributeNames: {
    "#GSI2PK": "GSI2PK"          
  },
  ExpressionAttributeValues: {
    ":GSI2PK": "User#New"       // literal string check
  }
})
```

### One liners

This is meant to be used for quick scripting. For maintainable codes, should still use Type Check methods


```ts
function query(table: string, index: string | null, expression: string, pk, sk?: string, pages: number = 1, forward: boolean = true): Promise<object[]> {}

function getItem(table: string, pk: string, sk: string): Promise<Object> {}

function updateItem(table: string, pk: string, sk: string, expression: string, props: {names, values, condition}): Promise<Object> {}
```

Example Usage

```js
import {query} from "ds-aws-utils"

const table = "your-table";

const users = await query(table, "gsi1-index", "#GSI1PK=:GSI1PK and begin_with(#GSI1PK,:#GSI1SK)", "User", "SignedUp#", 1, false);

const userA = await getItem(table, "User#123", "#");
```

## cognito

```ts
```