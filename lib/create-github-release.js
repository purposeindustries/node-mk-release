'use strict';

const request = require('request');

function noop() {}

module.exports = function createRelease(options) {
  options = options || {};
  return new Promise(function (resolve, reject) {
    const owner = options.user;
    const repo = options.repo;
    const token = options.accessToken;
    const version = options.version;
    const onStart = options.start || noop;
    const onEnd = options.end || noop;
    const url = `https://api.github.com/repos/${owner}/${repo}/releases`;

    onStart();
    request.post({
      url: url,
      json: true,
      body: {
        'tag_name': `v${version}`
      },
      headers: {
        'User-Agent': owner,
        'Content-Type': 'application/json',
        'Authorization': `token ${token}`
      }
    }, function (err, response) {
      if (err) {
        onEnd(err);
        return reject(err);
      }
      onEnd(null, response.body);
      resolve(response.body);
    });
  });
};
