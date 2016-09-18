export default class OutputPatcher {
    private outputPath;
    private entries;
    private contents;
    private lastTree;
    private isUnchanged;
    constructor(outputPath: string);
    add(relativePath: string, content: string): void;
    patch(): void;
    private _patch();
}
