import Compiler from "./compiler";
import DiagnosticsHandler from "./diagnostics-handler";
import { toPath } from "./fs/path-utils";
import { BroccoliPlugin, heimdall } from "./helpers";
import { NormalizedOptions, TypeScriptPluginOptions } from "./interfaces";
import normalizeOptions from "./normalize-options";

export { TypeScriptPluginOptions, TypeScriptConfig, CompilerOptionsConfig } from "./interfaces";

/**
 * Returns a Broccoli plugin instance that compiles
 * the files in the tsconfig.
 *
 * It is rooted to the inputNode's outputPath, all
 * files it imports must be resolvable from its input
 * except for the default library file.
 *
 * Errors are logged and it will try to emit whatever
 * it could successfully compile.
 *
 * It will only emit based on the root source files
 * you give it, by default it will look for all .ts
 * files, but if you specify a files or filesGlob
 * it will these as entry points and only compile
 * the files and files they reference from the input.
 */
export function typescript(inputNode: any, options?: TypeScriptPluginOptions) {
  return new TypeScriptPlugin(inputNode, options);
}

/**
 * TypeScript Broccoli plugin class.
 */
export class TypeScriptPlugin extends BroccoliPlugin {
  private compiler: Compiler | undefined;
  private diagnosticHandler: DiagnosticsHandler;
  private options: NormalizedOptions;

  constructor(inputNode: any, options?: TypeScriptPluginOptions) {
    super([ inputNode ], {
      annotation: options && options.annotation,
      name: "broccoli-typescript-compiler",
      persistentOutput: true,
    });
    const normalizedOptions = normalizeOptions(options || {});
    this.options = normalizedOptions;
    this.diagnosticHandler = new DiagnosticsHandler(normalizedOptions);
  }

  public build() {
    const token = heimdall.start("TypeScript:compile");
    let compiler = this.compiler;
    if (!compiler) {
      compiler = this.compiler = new Compiler(
        toPath( this.inputPaths[0] ),
        toPath( this.outputPath ),
        this.options,
        this.diagnosticHandler,
      );
    }
    compiler.compile();
    heimdall.stop(token);
  }

  public setDiagnosticWriter(write: (message: string) => void) {
    this.diagnosticHandler.setWrite(write);
  }
}
