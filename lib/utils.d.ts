export declare function findConfig(root: string): string;
export declare function readConfig(configFile: string): any;
export interface Map<T> {
    [key: string]: T | undefined;
}
export declare function createMap<T>(): Map<T>;
