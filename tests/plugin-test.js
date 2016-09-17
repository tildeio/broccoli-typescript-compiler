'use strict';

var fs = require('fs');
var expect = require('chai').expect;
var filter = require('..');
var broccoli = require('broccoli');
var walkSync = require('walk-sync');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');

var expectations = __dirname + '/expectations';

function entryFor(path, entries) {
  for (var i = 0; i < entries.length; i++) {
    if (entries[i].relativePath === path) {
      return entries[i];
    }
  }
}

describe('transpile TypeScript', function() {
  this.timeout(5000);
  var builder;

  afterEach(function () {
    return builder && builder.cleanup();
  });

  describe('tsconfig', function() {
    it('uses tsconfig path from options', function () {
      builder = new broccoli.Builder(filter('tests/fixtures/files', {
        tsconfig: __dirname + '/fixtures/tsconfig.json'
      }));

      return builder.build().then(function(results) {
        var outputPath = results.directory;
        var entries = walkSync.entries(outputPath);

        expect(entries).to.have.length(3);

        var output = fs.readFileSync(outputPath + '/fixtures.js', 'UTF8');
        var input = fs.readFileSync(expectations + '/expected.es6', 'UTF8');

        expect(output).to.eql(input);
      });
    });

    it('uses tsconfig json from options', function () {
      builder = new broccoli.Builder(filter('tests/fixtures/files', {
        tsconfig: {
          "compilerOptions": {
            "target": "es2015",
            "module": "es2015",
            "sourceMap": false,
            "newLine": "LF"
          }
        }
      }));

      return builder.build().then(function(results) {
        var outputPath = results.directory;
        var entries = walkSync.entries(outputPath);

        expect(entries).to.have.length(3);

        var output = fs.readFileSync(outputPath + '/fixtures.js', 'UTF8');
        var input = fs.readFileSync(expectations + '/expected.es6', 'UTF8');

        expect(output).to.eql(input);
      });
    });

    describe('tsconfig resolution', function() {
      it('basic resolution', function () {
        // since this uses the project tsconfig I need these in lib
        var Funnel = require('broccoli-funnel');
        var input = new Funnel('tests/fixtures/files', {
          destDir: 'lib'
        });
        builder = new broccoli.Builder(filter(input));

        return builder.build().then(function(results) {
          var outputPath = results.directory;

          var actualJS = fs.readFileSync(outputPath + '/dist/fixtures.js').toString();
          var actualMap = fs.readFileSync(outputPath + '/dist/fixtures.js.map').toString();
          var expectedJS = fs.readFileSync(expectations + '/expected.js').toString();
          var expectedMap = fs.readFileSync(expectations + '/expected.js.map').toString();

          expect(actualJS).to.eql(expectedJS);
          expect(actualMap).to.eql(expectedMap);
        });
      });
    });
  });

  describe('rebuilds', function() {
    var lastEntries, outputPath;

    beforeEach(function() {
      cleanup();
      builder = new broccoli.Builder(filter('tests/fixtures/files', {
        tsconfig: __dirname + '/fixtures/tsconfig.json'
      }));

      return builder.build().then(function(results) {
        outputPath = results.directory;

        lastEntries = walkSync.entries(outputPath);
        expect(lastEntries).to.have.length(3);
        expect(lastEntries.map(function(entry) { return entry.relativePath; })).to.deep.eql([
          'fixtures.js',
          'orange.js',
          'types.js'
        ]);
      });
    });

    afterEach(function() {
      cleanup();
    });

    it('noop rebuild', function() {
      return builder.build().then(function(results) {
        var entries = walkSync.entries(results.directory);

        expect(entries).to.deep.equal(lastEntries);
        expect(entries).to.have.length(3);
      });
    });

    it('mixed rebuild', function() {
      fs.writeFileSync('tests/fixtures/files/apple.ts', 'var apple : String;');
      mkdirp.sync('tests/fixtures/files/red/');
      fs.writeFileSync('tests/fixtures/files/red/one.ts', 'var one : String');

      return builder.build().then(function(results) {
        var entries = walkSync.entries(results.directory);
        expect(entries.map(function(entry) { return entry.relativePath; })).to.deep.eql([
          'apple.js',
          'fixtures.js',
          'orange.js',
          'red/',
          'red/one.js',
          'types.js'
        ]);

        expect(entryFor('fixtures.js', entries)).to.eql(entryFor('fixtures.js', lastEntries));
        expect(entryFor('types.js',    entries)).to.eql(entryFor('types.js',    lastEntries));
        expect(entryFor('orange.js',   entries)).to.eql(entryFor('orange.js', lastEntries));

        expect(entryFor('apple.js',   entries)).to.not.eql(entryFor('apple.js',   lastEntries));
        expect(entryFor('red/',       entries)).to.not.eql(entryFor('red/',       lastEntries));
        expect(entryFor('red/one.js', entries)).to.not.eql(entryFor('red/one.js', lastEntries));

        cleanup();

        lastEntries = entries;

        return builder.build();
      }).then(function(results) {
        var entries = walkSync.entries(results.directory);
        expect(entries).to.not.deep.equal(lastEntries);
        expect(entries).to.have.length(3);

        // expected stability
        expect(entryFor('fixtures.js', entries)).to.eql(entryFor('fixtures.js', lastEntries));
        expect(entryFor('types.js',    entries)).to.eql(entryFor('types.js', lastEntries));
        expect(entryFor('orange.js',    entries)).to.eql(entryFor('orange.js', lastEntries));

        expect(entries.map(function(entry) { return entry.relativePath; })).to.deep.eql([
          'fixtures.js',
          'orange.js',
          'types.js'
        ]);
      });
    });
  });
});

function cleanup() {
  try {
    fs.unlinkSync('tests/fixtures/files/apple.ts');
    rimraf.sync('tests/fixtures/files/red/');
  } catch (e) { }
}