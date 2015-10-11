/// <reference path="../typings/tsd.d.ts" />
import chai = require("chai");
const expect = chai.expect;

import sinon = require("sinon");
import sinonChai = require('sinon-chai');
chai.use(sinonChai);

import ConfigParser = require("../lib/ConfigParser")

describe('parsing FilterOptions', function() {
  var subject: ConfigParser;
  var generalOptions: TypeScriptFilterGeneralOptions = 
    {id: 'these are the general options'};
  
  after(function() {
    subject = undefined;
  });
  
  context('with no parameters', function() {
      before(function() {
        subject = new ConfigParser(undefined);
      });
      
      it('returns empty options', function() {
        expect(subject.generalOptions()).to.eql({});
      });
      
      it('returns empty tsOptions', function() {
        expect(subject.tsOptions()).to.eql({});
      });
  });
  
  describe('#generalOptions', function() {  
    context('with options', function() {
      before(function() {
        subject = new ConfigParser({
          options: generalOptions
        });
      });
      
      it('returns the options', function() {
        expect(subject.generalOptions()).to.eql(generalOptions);
      });
    });

    context('without options', function() {
      before(function() {
        subject = new ConfigParser({});
      });
      
      it('returns empty options', function() {
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

    context('with a file', function() { 
      before(function() {
        tsconfigMock = {
          loadSync: sinon.stub().returns(tsConfigResult),
        };
        subject = new ConfigParser({
          tsConfigPath: tsConfigPath
        }, <any>tsconfigMock);
      });
      
      it('delegates to tsconfig', function() {
        expect(subject.tsOptions()).to.eql(tsConfigResult);
        expect(tsconfigMock.loadSync).to.have.been.calledWithExactly(tsConfigPath, {});
      });
    });
    
    context('without a file', function() { 
      before(function() {
        tsconfigMock = {
          loadSync: sinon.stub(),
        };
        subject = new ConfigParser({
          tsOptions: tsOptions
        }, <any>tsconfigMock);
      });
      
      it('does not delegates to tsconfig', function() {
        expect(subject.tsOptions()).to.eql(tsOptions);
        expect(tsconfigMock.loadSync).not.to.have.been.called;
      });
    });
    
    context('with a file and config', function() { 
      before(function() {
        tsconfigMock = {
          loadSync: sinon.stub().returns(tsConfigResult),
        };
        subject = new ConfigParser({
          tsConfigPath: tsConfigPath,
          tsOptions: tsOptions
        }, <any>tsconfigMock);
      });
      
      it('delegates to tsconfig', function() {
        expect(subject.tsOptions()).to.eql(tsConfigResult);
        expect(tsconfigMock.loadSync).to.have.been.calledWithExactly(tsConfigPath, tsOptions);
      });
    });
  });
});