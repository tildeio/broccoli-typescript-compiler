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

  it('uses tsconfig from options', function () {
    var tsconfigPath = path.join(__dirname, "fixtures", "tsconfig.json");

    return typescript('files', {
      tsconfig: tsconfigPath
    }).then(function(results) {
      var outputPath = results.directory;

      var output = fs.readFileSync(path.join(outputPath, 'fixtures.js')).toString();
      var input = fs.readFileSync(path.join(expectations,  'expected.es6')).toString();

      expect(output).to.eql(input);
    });
  });
});

describe('loadTSConfig', function() {
  var loadTSConfig = require('./lib/load-ts-config');

  it('throws on invalid input', function() {
    expect(loadTSConfig).to.throw(/to be a string/);
    expect(function() {
      loadTSConfig(undefined);
    }).to.throw(/to be a string/);

    expect(function() {
      loadTSConfig(null);
    }).to.throw(/to be a string/);
  });

  it('throws for missing file', function() {
    expect(function() {
      loadTSConfig('nothing/here');
    }).to.throw('Cannot load tsconfig.json from: `nothing/here`\nENOENT: no such file or directory, open \'nothing/here\'');
  });

  it('throws for empty file', function() {
    expect(function() {
      loadTSConfig('tests/fixtures/empty-ts-config.js');
    }).to.throw('Cannot load tsconfig.json from: `tests/fixtures/empty-ts-config.js`\ntsconfig file cannot be empty');
  });

  it('throws for malformed file', function() {
    expect(function() {
      loadTSConfig('tests/fixtures/malformed-ts-config.js');
    }).to.throw('Cannot load tsconfig.json from: `tests/fixtures/malformed-ts-config.js`\nFailed to parse file \'tests/fixtures/malformed-ts-config.js\': Unexpected end of input.');
  });

  it('loads blank', function() {
    expect(loadTSConfig('tests/fixtures/basic-ts-config.js')).to.deep.eql({
      noEmit: false
    });
  });

  it('loads advanced', function() {
    expect(loadTSConfig('tests/fixtures/more-advanced-ts-config.js')).to.deep.eql({
      inlineSourceMap: true,
      inlineSources: true,
      mapRoot: 'tests/fixtures/packages',
      moduleResolution: 2,
      noEmit: false,
      rootDir: 'tests/fixtures/packages',
      target: 2
    });
  });




});
