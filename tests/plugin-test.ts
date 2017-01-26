import "mocha";
import { expect } from "chai";
import { createBuilder, createTempDir, TempDir, Output } from "broccoli-test-helper";

import filter = require("../index");

const typescript = filter.typescript;

describe("transpile TypeScript", function () {
  this.timeout(10000);

  let input: TempDir;
  let output: Output;

  beforeEach(async () => {
    input = await createTempDir();
  });

  afterEach(async () => {
    await input.dispose();
    if (output) {
      await output.dispose();
    }
  });

  it("compiles basic typescript", async () => {
    input.write({
      "a.ts": `export default class A {}`,
      "index.ts": `export { default as A } from "./a";`
    });

    output = createBuilder(typescript(input.path(), {
      tsconfig: {
        "compilerOptions": {
          "module": "commonjs",
          "moduleResolution": "node",
          "target": "es2015",
          "newLine": "LF"
        },
        "files": ["index.ts"]
      }
    }));

    await output.build();

    expect(
      output.changes()
    ).to.be.deep.equal({
      "a.js": "create",
      "index.js": "create"
    });

    expect(
      output.read()
    ).to.deep.equal({
      "a.js": `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class A {
}
exports.default = A;
`,
      "index.js": `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var a_1 = require("./a");
exports.A = a_1.default;
`
    });

    await output.build();

    expect(
      output.changes()
    ).to.be.deep.equal({
    });

    input.write({
      "b.ts": `export default class B {}`,
      "index.ts": `export { default as A } from "./a";
export { default as B } from "./b"`
    });

    await output.build();

    expect(
      output.changes()
    ).to.be.deep.equal({
      "b.js": "create",
      "index.js": "change"
    });

    expect(
      output.read()
    ).to.deep.equal({
      "a.js": `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class A {
}
exports.default = A;
`,
      "b.js": `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class B {
}
exports.default = B;
`,
      "index.js": `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var a_1 = require("./a");
exports.A = a_1.default;
var b_1 = require("./b");
exports.B = b_1.default;
`
    });

    input.write({
      "b.ts": null,
      "index.ts": `export { default as A } from "./a";`
    });

    await output.build();

    expect(
      output.changes()
    ).to.be.deep.equal({
      "b.js": "unlink",
      "index.js": "change"
    });

    expect(
      output.read()
    ).to.deep.equal({
      "a.js": `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class A {
}
exports.default = A;
`,
      "index.js": `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var a_1 = require("./a");
exports.A = a_1.default;
`
    });
  });

  it("handles missing files", async () => {
    input.write({
      "index.ts": `export { default as A } from "./a";`
    });

    output = createBuilder(typescript(input.path(), {
      tsconfig: {
        "compilerOptions": {
          "module": "commonjs",
          "moduleResolution": "node",
          "target": "es2015",
          "newLine": "LF"
        },
        "files": ["index.ts"]
      }
    }));

    await output.build();

    expect(
      output.read()
    ).to.deep.equal({
      "index.js": `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var a_1 = require("./a");
exports.A = a_1.default;
`
    });
  });
});
