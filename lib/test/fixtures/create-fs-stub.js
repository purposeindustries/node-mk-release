'use strict';

const sinon = require('sinon');

module.exports = {

  resolved: () => {
    const stub = {};

    stub.stat = sinon.stub().callsArgWith(1, null, { size: 123 });

    stub.createReadStream = sinon.stub().returns(stub);

    stub.pipe = sinon.spy();

    return stub;
  },

  rejected: () => ({
    stat: sinon.stub().callsArgWith(1, new Error('rejected'))
  })
};
