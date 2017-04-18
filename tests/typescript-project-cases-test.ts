import { createBuilder, createReadableDir, createTempDir, Output, TempDir, Tree } from "broccoli-test-helper";
import { expect } from "chai";
import * as fs from "fs";
import "mocha";
import * as path from "path";
import { CompilerOptionsConfig, normalizePath, typescript } from "../lib/index";

const globSync: (glob: string) => string[] = require("glob").sync;

const optionDeclarations: OptionDeclaration[] = require("typescript").optionDeclarations;
const optionMap = new Map<string, OptionDeclaration>();
optionDeclarations.forEach((opt) => {
  optionMap.set(opt.name, opt);
});

interface OptionDeclaration {
  name: string;
  type: "string" | "boolean" | "object" | "list" | "number" | Map<string, number>;
}

const TYPESCRIPT_ROOT = path.resolve("vendor/typescript");

interface ProjectTestCase {
  scenario: string;
  // project where it lives - this also is the current directory when compiling
  projectRoot: string;
  // list of input files to be given to program
  inputFiles: string[];
  // should we resolve this map root and give compiler the absolute disk path as map root?
  resolveMapRoot?: boolean;
  // should we resolve this source root and give compiler the absolute disk path as map root?
  resolveSourceRoot?: boolean;
  // Verify the baselines of output files, if this is false, we will write to output to the disk
  // but there is no verification of baselines
  baselineCheck?: boolean;
  // Run the resulting test
  runTest?: boolean;
  // If there is any bug associated with this test case
  bug?: string;
}

class ProjectRunner {
  constructor(private root: string) {
  }

  public enumerateTestFiles() {
    return ;
  }

  public initializeTests() {
    globSync(path.join(this.root, "tests/cases/project/*.json")).slice(0, 10).forEach((fileName) => {
      this.runProjectTestCase(fileName);
    });
  }

  private runProjectTestCase(testCaseFileName: string) {
    const testFileText = fs.readFileSync(testCaseFileName, "utf8");
    const testCase: ProjectTestCase = JSON.parse(testFileText);
    const basename = path.basename(testCaseFileName, path.extname(testCaseFileName));
    const project = createReadableDir(path.join(this.root, testCase.projectRoot));
    const projectCompilerOptions = this.extractCompilerOptions(testCase);

    const baselineDir = createReadableDir(
      path.join(this.root, `tests/baselines/reference/project/${basename}`),
    );

    if (testCase.scenario === "InvalidRootFile" || !testCase.baselineCheck ||
        testCase.resolveMapRoot || testCase.resolveSourceRoot) {
      return;
    }

    describe("Compiling project for " + testCase.scenario + ": testcase " + basename, () => {
      let output: Output;
      let input: TempDir;

      function verifyCompilerResults(module: string) {
        it(`should build for ${module}`, async () => {
          input.write(project.read());

          const compilerOptions = Object.assign(projectCompilerOptions, {
            module,
            moduleResolution: "classic",
            newLine: "CRLF",
            typeRoots: [],
          });

          const options: any = {
            rootPath: project.path(),
            compilerOptions,
          };

          const projectOpt: string | undefined = (compilerOptions as any).project;
          if (projectOpt) {
            options.tsconfig = path.join(projectOpt, "tsconfig.json");
          } else if (testCase.inputFiles) {
            if (!options.tsconfig) {
              options.tsconfig = {};
            }
            options.tsconfig.files = testCase.inputFiles;
          }

          output = createBuilder(typescript(input.path(), options));

          await output.build();

          if (testCase.baselineCheck) {
            const baselinefiles = baselineDir.read(module === "amd" ? "amd" : "node");
            const baselineJsonName = basename + ".json";
            const baselineErrorsName = basename + ".errors.txt";
            const baselineSourcemapName = basename + "sourcemap.txt";
            const baselineJson = JSON.parse(baselinefiles[baselineJsonName] as string);
            // const baselineErrors = baselinefiles[baselineErrorsName];
            // const baselineSourcemap = baselinefiles[baselineSourcemapName];
            delete baselinefiles[baselineJsonName];
            delete baselinefiles[baselineErrorsName];
            delete baselinefiles[baselineSourcemapName];
            const expected = cleanExpectedTree(baselinefiles, baselineJson.emittedFiles);
            const actual = output.read();
            expect(actual).to.deep.equal(expected);
          }

          // expect(true, "ok");
        });
      }

      beforeEach(async () => {
        input = await createTempDir();
      });

      verifyCompilerResults("commonjs");
      verifyCompilerResults("amd");

      afterEach(async () => {
        await input.dispose();
        if (output) {
          await output.dispose();
          output = undefined as any;
        }
      });
    });
  }

  private extractCompilerOptions(testCase: any): CompilerOptionsConfig {
    const options: CompilerOptionsConfig = {};

    optionDeclarations.forEach((opt) => {
      const name = opt.name;
      if (name in testCase) {
        options[name] = testCase[name];
      }
    });

    return options;
  }
}

const runner = new ProjectRunner(TYPESCRIPT_ROOT);

describe("Projects tests", function() {
  this.timeout(10000);
  runner.initializeTests();
});

function normalizeTree(baseline: Tree) {
  const normalized: Tree = {};
  const files = Object.keys(baseline);
  for (const file of files) {
    let value = baseline[file];
    if (typeof value === "object" && value !== null) {
      value = normalizeTree(value);
    } else if (typeof value === "string" && path.extname(file) === ".map") {
      const sourceMapData = JSON.parse(value);
      for (let i = 0; i < sourceMapData.sources.length; i++) {
        sourceMapData.sources[i] = normalizePath(sourceMapData.sources[i]);
      }
      value = JSON.stringify(sourceMapData);
    }
    normalized[normalizePath(file)] = value;
  }
  return normalized;
}

function cleanExpectedTree(baseline: Tree, emittedFiles?: string[]) {
  const clean: Tree = {};
  if (emittedFiles) {
    const normalized = normalizeTree(baseline);
    for (const emittedFile of emittedFiles) {
      const parts = normalizePath(emittedFile).split("/");
      let src: Tree | string | null | undefined = normalized;
      let target: Tree | string | null | undefined = clean;
      for (const part of parts) {
        if (typeof target !== "object" || target === null || typeof src !== "object" || src === null) {
          continue;
        }
        if (part === "..") {
          // we can let you escape the outputPath
          // TODO, maybe support compilerOptions.project as a way to make this pass
          // tslint:disable:no-console
          console.warn(emittedFile);
          break;
        }
        target[part] = src[part];
        src = src[part];
        target = target[part];
      }
    }
  }
  return clean;
}
