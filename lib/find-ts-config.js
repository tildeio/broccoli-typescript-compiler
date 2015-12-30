'use strict';

var findup = require('findup');

module.exports = function(root) {
  return findup.sync(root, 'package.json') + '/tsconfig.json';
};
