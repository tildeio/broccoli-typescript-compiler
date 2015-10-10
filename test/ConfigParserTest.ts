/// <reference path="../typings/tsd.d.ts" />
import chai = require("chai");
const expect = chai.expect;

import ConfigParser = require("../lib/ConfigParser")

describe('transpile TypeScript', function() {
  var subject: ConfigParser;
  
  before(function() {
    subject = new ConfigParser({});
  });
  
  after(function() {
    subject = undefined;
  });
  
  it('should test', function () {
    expect(1).to.eql(1);
  });
});