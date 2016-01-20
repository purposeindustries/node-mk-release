'use strict';

const sinon = require('sinon');
const EventEmitter = require('events');

module.exports = () => {
  const stub = new EventEmitter();

  stub.uploadFile = sinon.stub().returns(stub);

  return stub;
};
