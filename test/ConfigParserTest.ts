/// <reference path="../typings/tsd.d.ts" />
import chai = require("chai");
const expect = chai.expect;

import sinon = require("sinon");
import sinonChai = require('sinon-chai');
chai.use(sinonChai);

import ConfigParser = require("../lib/ConfigParser");

describe('ConfigParser', function() {
  context('with no parameters', function() { 
      it('returns empty options', function() {
        const subject = new ConfigParser(undefined);
        expect(subject.generalOptions()).to.eql({});
      });
      
      it('returns empty tsOptions', function() {
        const subject = new ConfigParser(undefined);
        expect(subject.tsOptions()).to.eql({});
      });
  });
  
  describe('#generalOptions', function() {  
    context('with options', function() {
      var generalOptions = {id: 'these are the general options'};
      
      it('returns the options', function() {
        const subject = new ConfigParser({
          options: generalOptions
        });
        expect(subject.generalOptions()).to.eql(generalOptions);
      });
    });

    context('without options', function() {
      it('returns empty options', function() {
        const subject = new ConfigParser({});
        expect(subject.generalOptions()).to.eql({});
      });
    });
  });
  
  describe('#tsOptions', function() {
    var tsconfigMock: {
        loadSync: Sinon.SinonStub
    };
    var tsConfigPath = 'test-tsconfig.json';
    var tsOptions = {
      id: 'these are the ts options'
    };
    var tsConfigResult = 'the result!';
    
    var buildParser = function(o: TypeScriptFilterOptions) {
      return new ConfigParser(o, <any>tsconfigMock);
    }

    beforeEach(function() {
        tsconfigMock = {
          loadSync: sinon.stub().returns(tsConfigResult),
        };
    });

    context('with a file', function() { 
      it('delegates to tsconfig', function() {
        const subject = buildParser({tsConfigPath});
        expect(subject.tsOptions()).to.eql(tsConfigResult);
        expect(tsconfigMock.loadSync).to.have.been.calledWithExactly(tsConfigPath, {});
      });
    });
    
    context('without a file', function() { 
      it('does not delegates to tsconfig', function() {
        const subject = buildParser({tsOptions});
        expect(subject.tsOptions()).to.eql(tsOptions);
        expect(tsconfigMock.loadSync).not.to.have.been.called;
      });
    });
    
    context('with a file and config', function() { 
      it('delegates to tsconfig', function() {
        const subject = buildParser({tsConfigPath, tsOptions});
        expect(subject.tsOptions()).to.eql(tsConfigResult);
        expect(tsconfigMock.loadSync).to.have.been.calledWithExactly(tsConfigPath, tsOptions);
      });
    });
  });
});