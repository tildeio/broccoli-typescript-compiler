'use strict';

var findTSConfig = require('../lib/find-ts-config');
var expect = require('chai').expect;
var ensurePosix = require('ensure-posix-path');
var path = require('path');

describe('findTSConfig', function() {
  it('basic', function() {
    expect(ensurePosix(findTSConfig(__dirname))).to.eql(ensurePosix(path.join(__dirname, '..', 'tsconfig.json')));
  });

  it('nested, but without own package.json', function() {
    expect(ensurePosix(findTSConfig(__dirname + '/fixtures/nested-a/nested-b'))).to.eql(ensurePosix(__dirname + '/fixtures/nested-a/tsconfig.json'));
  });

  it('nested, but with own package.json', function() {
    expect(ensurePosix(findTSConfig(__dirname + '/fixtures/nested-a/nested-c'))).to.eql(ensurePosix(__dirname + '/fixtures/nested-a/nested-c/tsconfig.json'));
  });
});
