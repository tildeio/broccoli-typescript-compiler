'use strict';

var fs = require('fs-extra');
var expect = require('chai').expect;
var filter = require('..');
var broccoli = require('broccoli');
var walkSync = require('walk-sync');
var path = require('path');
var fixturify = require('fixturify');

var expectations = __dirname + '/expectations';

function entryFor(path, entries) {
  for (var i = 0; i < entries.length; i++) {
    if (entries[i].relativePath === path) {
      return entries[i];
    }
  }
}

describe('transpile TypeScript', function() {
  this.timeout(10000);
  var builder;

  // TODO: random tmpdir
  var INPUT_PATH = path.resolve(__dirname, '../tmp/input');

  beforeEach(function() {
    fs.mkdirpSync(INPUT_PATH);
    fixturify.writeSync(INPUT_PATH, fixturify.readSync(__dirname + '/fixtures/files'));
  });

  afterEach(function () {
    fs.removeSync(INPUT_PATH);
    return builder.cleanup();
  });

  describe('tsconfig', function() {
    it('uses tsconfig path from options', function () {
      builder = new broccoli.Builder(filter(INPUT_PATH, {
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
      builder = new broccoli.Builder(filter(INPUT_PATH, {
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
        var input = new Funnel(INPUT_PATH, {
          destDir: 'src'
        });
        builder = new broccoli.Builder(filter(input));

        return builder.build().then(function(results) {
          var outputPath = results.directory;

          var actualJS = fs.readFileSync(outputPath + '/lib/fixtures.js').toString();
          var actualMap = fs.readFileSync(outputPath + '/lib/fixtures.js.map').toString();
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
      builder = new broccoli.Builder(filter(INPUT_PATH, {
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

    it('noop rebuild', function() {
      return builder.build().then(function(results) {
        var entries = walkSync.entries(results.directory);

        expect(entries).to.deep.equal(lastEntries);
        expect(entries).to.have.length(3);
      });
    });

    it('mixed rebuild', function() {
      fixturify.writeSync(INPUT_PATH, {
        'apple.ts': 'var apple : String',
        red: {
          'one.ts': 'var one : String',
        }
      });

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

        var update = fs.readFileSync('tests/fixtures/files/fixtures.ts', 'utf8');

        fixturify.writeSync(INPUT_PATH, {
          'apple.ts': update
        })

        lastEntries = entries;
        return builder.build();
      }).then(function (results) {
        var entries = walkSync.entries(results.directory);
        expect(entryFor('fixtures.js', entries)).to.eql(entryFor('fixtures.js', lastEntries));
        expect(entryFor('types.js',    entries)).to.eql(entryFor('types.js',    lastEntries));
        expect(entryFor('orange.js',   entries)).to.eql(entryFor('orange.js', lastEntries));
        expect(entryFor('red/',        entries)).to.eql(entryFor('red/', lastEntries));
        expect(entryFor('red/one.js',  entries)).to.eql(entryFor('red/one.js', lastEntries));

        expect(entryFor('apple.js',    entries)).to.not.eql(entryFor('apple.js',   lastEntries));

        var expectedJS = fs.readFileSync(expectations + '/expected.es6').toString();
        var actualJS = fs.readFileSync(outputPath + '/apple.js').toString();

        expect(actualJS).to.eql(expectedJS);

        fixturify.writeSync(INPUT_PATH, {
          'apple.ts': null,
          red: null,
        });

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
