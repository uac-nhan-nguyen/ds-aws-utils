export declare function queueAndFlat<T>(limit: number, promises: () => Promise<T[]>[]): Promise<T[]>;
