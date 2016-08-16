import { readConfigFile, flattenDiagnosticMessageText, sys } from "typescript";
import { findup } from "./helpers";
import { join } from "path";

export function findConfig(root: string): string {
  return join(findup.sync(root, "package.json"), "tsconfig.json");
}

export function readConfig(configFile: string): any {
  let result = readConfigFile(configFile, sys.readFile);
  if (result.error) {
    let message = flattenDiagnosticMessageText(result.error.messageText, "\n");
    throw new Error(message);
  }
  return result.config;
}

const { create: createObject } = Object;

export interface Map<T> {
  [key: string]: T | undefined;
}

export function createMap<T>(): Map<T> {
    const map: Map<T> = createObject(null);
    map["__"] = undefined;
    delete map["__"];
    return map;
}
