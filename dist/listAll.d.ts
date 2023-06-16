export declare const listAll: <T, R>(callback: (next: string | undefined) => Promise<R>, getter: (response: R) => {
    NextToken: string | undefined;
    Items: T[] | undefined;
}) => Promise<T[]>;
