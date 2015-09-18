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

describe('transpile TypeScript to ES6', function() {

  before(function() {
    typescript = makeTestHelper({
      subject: function(tree) {
        return new TypeScript(tree);
      },
      fixturePath: inputPath
    });
  });


  afterEach(function () {
    return cleanupBuilders();
  });

  it('basic', function () {
    return typescript('files').then(function(results) {
      var outputPath = results.directory;

      var output = fs.readFileSync(path.join(outputPath, 'fixtures.js')).toString();
      var input = fs.readFileSync(path.join(expectations,  'expected.js')).toString();

      expect(output).to.eql(input);
    });
  });
});
