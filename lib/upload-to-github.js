'use strict';

const request = require('request');
const fs = require('fs');

function noop() {}

module.exports = function uploadToGithub(options) {
  options = options || {};

  return new Promise(function (resolve, reject) {
    const owner = options.user;
    const repo = options.repo;
    const token = options.accessToken;
    const release = options.releaseId;
    const version = options.version;
    const path = options.path || process.cwd();
    const onStart = options.start || noop;
    const onEnd = options.end || noop;
    const url = `https://uploads.github.com/repos/${owner}/${repo}/releases/${release}/assets?name=${version}.tgz`;

    const file = `${path}/${version}.tgz`;

    onStart();
    fs.stat(file, function (err, stats) {
      if (err) {
        onEnd(err);
        return reject(err);
      }

      fs
        .createReadStream(file)
        .pipe(request.post({
          url: url,
          json: true,
          headers: {
            'User-Agent': owner,
            'Content-Type': 'application/gzip',
            'Content-Length': stats.size,
            'Authorization': `token ${token}`,
          }
        }, function (err, response) {
          if (err) {
            onEnd(err);
            return reject(err);
          }
          onEnd(null, response.body);
          resolve(response.body);
        }));
    });
  });
};
