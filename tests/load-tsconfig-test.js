'use strict';

var fs = require('fs');
var loadTSConfig = require('../lib/load-ts-config');
var expect = require('chai').expect;
var ensurePosix = require('ensure-posix-path');

describe('loadTSConfig', function() {

  it('throws on invalid input', function() {
    var message = 'The tsconfig option must be a tsconfig JSON object or a path to a valid tsconfig.json file';

    expect(loadTSConfig).to.throw(message);

    expect(function() {
      loadTSConfig(undefined);
    }).to.throw(message);

    expect(function() {
      loadTSConfig(null);
    }).to.throw(message);
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
    var from = __dirname + '/fixtures/empty-ts-config.js';
    expect(function() {
      loadTSConfig(from);
    }).to.throw('Cannot load tsconfig.json from: `' + from + '`\ntsconfig file cannot be empty');
  });

  it('throws for malformed file', function() {
    var from = __dirname + '/fixtures/malformed-ts-config.js';

    expect(function() {
      loadTSConfig(from);
    }).to.throw('Cannot load tsconfig.json from: `' + from + '`\nFailed to parse file \'' + from + '\': Unexpected end of input.');
  });

  it('loads blank', function() {
    expect(loadTSConfig(__dirname + '/fixtures/basic-ts-config.js')).to.deep.eql({
      noEmit: false
    });
  });

  it('loads advanced', function() {
    var config = loadTSConfig(__dirname + '/fixtures/more-advanced-ts-config.js');

    config.mapRoot = ensurePosix(config.mapRoot);
    config.rootDir = ensurePosix(config.rootDir);

    expect(config).to.deep.eql({
      inlineSourceMap: true,
      inlineSources: true,
      mapRoot: ensurePosix(__dirname + '/fixtures/packages'),
      moduleResolution: 2,
      noEmit: false,
      rootDir: ensurePosix(__dirname + '/fixtures/packages'),
      target: 2
    });
  });
});
