'use strict';

var fs     = require('fs');
var expect = require('chai').expect;
var broccoli = require('broccoli');
var path = require('path');
var TypeScript = require('./index');
var helpers = require('broccoli-test-helpers');
var stringify = require('json-stable-stringify');
var mkdirp = require('mkdirp').sync;
var rm = require('rimraf').sync;
var makeTestHelper = helpers.makeTestHelper;
var cleanupBuilders = helpers.cleanupBuilders;

var inputPath = path.join(__dirname, 'fixtures');
var expectations = path.join(__dirname, 'expectations');

var typescript;

describe('transpile TypeScript', function() {

  before(function() {
    typescript = makeTestHelper({
      subject: function(tree, options) {
        return new TypeScript(tree, options);
      },
      fixturePath: inputPath
    });
  });


  afterEach(function () {
    return cleanupBuilders();
  });

  it('uses tsconfig from CWD by default', function () {
    return typescript('files').then(function(results) {
      var outputPath = results.directory;

      var output = fs.readFileSync(path.join(outputPath, 'fixtures.js')).toString();
      var input = fs.readFileSync(path.join(expectations,  'expected.js')).toString();

      expect(output).to.eql(input);
    });
  });
  
  it('uses tsconfig from options', function () {
    var tsconfigPath = path.join(__dirname, "fixtures", "tsconfig.json");
    
    return typescript('files', {tsconfig: tsconfigPath}).then(function(results) {
      var outputPath = results.directory;

      var output = fs.readFileSync(path.join(outputPath, 'fixtures.js')).toString();
      var input = fs.readFileSync(path.join(expectations,  'expected.es6')).toString();

      expect(output).to.eql(input);
    });
  });
});
