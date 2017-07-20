import { createBuilder, createTempDir } from "broccoli-test-helper";
import { typescript } from "../lib/index";

// tslint:disable-next-line:only-arrow-functions
QUnit.module("plugin-rebuild", function() {
  QUnit.test("compiles basic typescript", async (assert) => {
    const input = await createTempDir();
    try {

      input.write({
        "a.ts": `export default class A {}`,
        "index.ts": `export { default as A } from "./a";`,
      });

      const plugin = typescript( input.path(), {
        tsconfig: {
          compilerOptions: {
            module: "commonjs",
            moduleResolution: "node",
            newLine: "LF",
            target: "es2015",
          },
          files: [ "index.ts" ],
        },
      });

      const output = createBuilder( plugin );
      try {

        await output.build();

        assert.deepEqual( output.changes(), {
          "a.js":     "create",
          "index.js": "create",
        });

        assert.deepEqual( output.read(), {
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
`,
        });

        input.write({
          "b.ts": `export default class B {}`,
          "index.ts": `export { default as A } from "./a";
export { default as B } from "./b"`,
        });

        await output.build();

        assert.deepEqual( output.changes(), {
          "b.js": "create",
          "index.js": "change",
        });

        assert.deepEqual( output.read(), {
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
`,
        });

        await output.build();

        assert.deepEqual( output.changes(), {} );

        input.write({
          "b.ts": null,
          "index.ts": `export { default as A } from "./a";`,
        });

        await output.build();

        assert.deepEqual( output.changes(), {
          "b.js": "unlink",
          "index.js": "change",
        });

        assert.deepEqual( output.read(), {
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
`,
        });

      } finally {
        await output.dispose();
      }
    } finally {
      await input.dispose();
    }
  });

  QUnit.test("handles missing files", async (assert) => {
    const input = await createTempDir();
    try {
      input.write({
        "index.ts": `export { default as A } from "./a";`,
      });

      const plugin = typescript(input.path(), {
        tsconfig: {
          compilerOptions: {
            module: "commonjs",
            moduleResolution: "node",
            newLine: "LF",
            target: "es2015",
          },
          files: ["index.ts"],
        },
      });

      let error = "";
      plugin.setDiagnosticWriter((msg) => error += msg)

      const output = createBuilder(plugin);
      try {

        await output.build();

        assert.deepEqual( output.read(), {
          "index.js": `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var a_1 = require("./a");
exports.A = a_1.default;
`,
        });

        assert.equal(error.trim(), "index.ts(1,30): error TS2307: Cannot find module './a'.")

      } finally {
        await output.dispose();
      }
    } finally {
      await input.dispose();
    }
  });
});
