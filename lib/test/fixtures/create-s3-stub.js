'use strict';

const sinon = require('sinon');

module.exports = stubReturn => ({
  createClient: sinon.stub().returns(stubReturn)
});
