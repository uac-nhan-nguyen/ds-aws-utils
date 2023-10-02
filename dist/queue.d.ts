export declare function queue<T>(options: {
    limit?: number;
}, callbacks: (() => Promise<T>)[]): Promise<T[]>;
export declare function queueAndFlat<T>(options: {
    limit?: number;
}, callbacks: (() => Promise<T[]>)[]): Promise<T[]>;
