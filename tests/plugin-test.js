'use strict';

var fs = require('fs');
var expect = require('chai').expect;
var TypeScript = require('..');
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
  var builder;

  afterEach(function () {
    return builder && builder.cleanup();
  });

  describe('tsconfig', function() {
    it('uses tsconfig path from options', function () {
      builder = new broccoli.Builder(new TypeScript('tests/fixtures/files', {
        tsconfig: __dirname + '/fixtures/tsconfig.json'
      }));

      return builder.build().then(function(results) {
        var outputPath = results.directory;
        var entries = walkSync.entries(outputPath);

        expect(entries).to.have.length(2);

        var output = fs.readFileSync(outputPath + '/fixtures.js', 'UTF8');
        var input = fs.readFileSync(expectations + '/expected.es6', 'UTF8');

        expect(output).to.eql(input);
      });
    });

    it('uses tsconfig json from options', function () {
      builder = new broccoli.Builder(new TypeScript('tests/fixtures/files', {
        tsconfig: {
          "compilerOptions": {
            "target": "ES6"
          }
        }
      }));

      return builder.build().then(function(results) {
        var outputPath = results.directory;
        var entries = walkSync.entries(outputPath);

        expect(entries).to.have.length(2);

        var output = fs.readFileSync(outputPath + '/fixtures.js', 'UTF8');
        var input = fs.readFileSync(expectations + '/expected.es6', 'UTF8');

        expect(output).to.eql(input);
      });
    });

    describe('tsconfig resolution', function() {
      it('basic resolution', function () {
        builder = new broccoli.Builder(new TypeScript('tests/fixtures/files'));

        return builder.build().then(function(results) {
          var outputPath = results.directory;

          var output = fs.readFileSync(outputPath + '/fixtures.js').toString();
          var input = fs.readFileSync(expectations + '/expected.js').toString();

          expect(output).to.eql(input);
        });
      });
    });
  });

  describe('rebuilds', function() {
    var lastEntries, outputPath;

    beforeEach(function() {
      builder = new broccoli.Builder(new TypeScript('tests/fixtures/files', {
        tsconfig: __dirname + '/fixtures/tsconfig.json'
      }));

      return builder.build().then(function(results) {
        outputPath = results.directory;

        lastEntries = walkSync.entries(outputPath);
        expect(lastEntries).to.have.length(2);
        return builder.build();
      });
    });

    afterEach(function() {
      rimraf.sync('tests/fixtures/files/apple.ts');
      rimraf.sync('tests/fixtures/files/orange.js');

      rimraf.sync('tests/fixtures/files/red/');
      rimraf.sync('tests/fixtures/files/orange/');
    });

    it('noop rebuild', function() {
      return builder.build().then(function(results) {
        var entries = walkSync.entries(results.directory);

        expect(entries).to.deep.equal(lastEntries);
        expect(entries).to.have.length(2);
      });
    });

    it('mixed rebuild', function() {
      var entries = walkSync.entries(outputPath);
      expect(entries).to.have.length(2);

      fs.writeFileSync('tests/fixtures/files/apple.ts', 'var apple : String;');
      fs.writeFileSync('tests/fixtures/files/orange.js', 'var orange;');

      mkdirp.sync('tests/fixtures/files/red/');
      mkdirp.sync('tests/fixtures/files/orange/');

      fs.writeFileSync('tests/fixtures/files/red/one.ts', 'var one : String');
      fs.writeFileSync('tests/fixtures/files/orange/two.js', 'var two');

      return builder.build().then(function(results) {
        var entries = walkSync.entries(results.directory);

        expect(entries).to.not.deep.equal(lastEntries);
        expect(entries).to.have.length(8);

        rimraf.sync('tests/fixtures/files/apple.ts');
        fs.writeFileSync('tests/fixtures/files/orange.js', 'var orange : String;');

        rimraf.sync('tests/fixtures/files/red/');

        rimraf.sync('tests/fixtures/files/red/one.ts');
        fs.writeFileSync('tests/fixtures/files/orange/two.js', 'var wasTwo;');

        return builder.build();
      }).then(function(results) {
        var entries = walkSync.entries(results.directory);

        expect(entries).to.not.deep.equal(lastEntries);
        expect(entries).to.have.length(5);

        // expected stability
        expect(entryFor('fixtures.js', entries)).to.eql(entryFor('fixtures.js', lastEntries));
        expect(entryFor('oranges/',    entries)).to.eql(entryFor('oranges/', lastEntries));
        expect(entryFor('types.js',    entries)).to.eql(entryFor('types.js', lastEntries));

        // expected in-stability
        expect(entryFor('orange.js',     entries)).to.not.eql(entryFor('orange.js', lastEntries));
        expect(entryFor('orange/two.js', entries)).to.not.eql(entryFor('orange/two.js', lastEntries));

        expect(entries.map(function(entry) { return entry.relativePath; })).to.deep.eql([
          'fixtures.js',
          'orange.js',
          'orange/',
          'orange/two.js',
          'types.js'
        ]);
      });
    });
  });
});
