export function query(table: string, index: string | null, expression: string, pk, sk?: string, pages?: number, forward?: boolean): Promise<object[]>
