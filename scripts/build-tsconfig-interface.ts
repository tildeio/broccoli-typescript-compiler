import * as fs from "fs";
import * as http from "http";
import { compile } from "json-schema-to-typescript";
import * as path from "path";

http.get(
  {
    host: "json.schemastore.org",
    path: "/tsconfig",
  },
  (res) => {
    const chunks: Buffer[] = [];
    res.on("data", (chunk) => chunks.push(chunk as Buffer));
    res.on("end", () => {
      const schema = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      schema.title = "Typescript Config";
      schema.allOf = schema.allOf.filter((def) => {
        return (
          def.$ref !== "#/definitions/compileOnSaveDefinition" &&
          def.$ref !== "#/definitions/typeAcquisitionDefinition"
        );
      });
      compile(schema, "tsconfig").then((code) => {
        fs.writeFileSync(
          path.join(__dirname, "../src/generated/typescript-config.ts"),
          "// tslint:disable\n" + code
        );
      });
    });
  }
);
