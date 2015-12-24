'use strict';

var fs = require('fs');
var expect = require('chai').expect;
var TypeScript = require('..');
var broccoli = require('broccoli');

var expectations = __dirname + '/expectations';

describe('transpile TypeScript', function() {
  describe('tsconfig', function() {
    var builder;

    afterEach(function () {
      return builder.cleanup();
    });

    it('uses tsconfig from options', function () {
      builder = new broccoli.Builder(new TypeScript('tests/fixtures/files', {
        tsconfig: __dirname + '/fixtures/tsconfig.json'
      }));

      return builder.build().then(function(results) {
        var outputPath = results.directory;

        var output = fs.readFileSync(outputPath + '/fixtures.js', 'UTF8');
        var input = fs.readFileSync(expectations + '/expected.es6', 'UTF8');

        expect(output).to.eql(input);
      });
    });
  });
});
