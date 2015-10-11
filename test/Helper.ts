/// <reference path="../typings/tsd.d.ts" />
import chai = require("chai");
import _sinon = require("sinon");
import sinonChai = require('sinon-chai');

chai.use(sinonChai);
export var expect = chai.expect;
export var sinon = _sinon;