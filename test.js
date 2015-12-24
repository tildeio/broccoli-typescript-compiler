'use strict';

var fs     = require('fs');
var expect = require('chai').expect;
var path = require('path');
var typeScript = require('./index');
var broccoli = require('broccoli');

var inputPath = path.join(__dirname, 'fixtures');
var expectations = path.join(__dirname, 'expectations');

var builder;

describe('transpile TypeScript', function() {
  afterEach(function () {
    return builder.cleanup();
  });

  it('uses tsconfig from options', function () {
    builder = new broccoli.Builder(typeScript('fixtures/files', {
      tsconfig: __dirname + '/fixtures/tsconfig.json'
    }));

    return builder.build().then(function(results) {
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
    }).to.throw(/no such file or directory/);

    expect(function() {
      loadTSConfig('nothing/here');
    }).to.throw(/Cannot load tsconfig.json from/);
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
