var plugin = require("./dist/plugin");
var TypeScript = plugin.TypeScript;
var MergeTrees = require("broccoli-merge-trees");
var Funnel = require("broccoli-funnel");

// Mimic filter behavior for backwards compat
function filter(inputNode, options) {
  var passthrough = new Funnel(inputNode, {
    exclude: ["**/*.ts"],
    annotation: "TypeScript passthrough"
  });
  var filter = new Funnel(inputNode, {
    include: ["**/*.ts"],
    annotation: "TypeScript input"
  });
  return new MergeTrees([
    passthrough,
    new TypeScript(filter, options)
  ], {
    overwrite: true,
    annotation: "TypeScript passthrough + ouput"
  });
}

filter.findConfig = plugin.findConfig;
filter.TypeScript = TypeScript;
filter.typescript = function typescript(inputNode, options) {
  return new TypeScript(inputNode, options);
};

module.exports = filter;
