'use strict';

const sinon = require('sinon');

module.exports = {

  rejected: () => ({
    post: sinon.stub().callsArgWith(1, new Error('rejected'))
  }),

  resolved: () => ({
    post: sinon.stub().callsArgWith(1, null, {
      body: 'resolved'
    })
  })
};
