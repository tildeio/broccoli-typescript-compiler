import { readConfigFile, flattenDiagnosticMessageText, sys } from "typescript";
import { findup } from "./helpers";
import { join } from "path";
export function findConfig(root) {
    return join(findup.sync(root, "package.json"), "tsconfig.json");
}
export function readConfig(configFile) {
    let result = readConfigFile(configFile, sys.readFile);
    if (result.error) {
        let message = flattenDiagnosticMessageText(result.error.messageText, "\n");
        throw new Error(message);
    }
    return result.config;
}
const { create: createObject } = Object;
export function createMap() {
    const map = createObject(null);
    map["__"] = undefined;
    delete map["__"];
    return map;
}
//# sourceMappingURL=utils.js.map