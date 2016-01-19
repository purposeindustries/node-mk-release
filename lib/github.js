'use strict';

const request = require('request');

function noop() {}

module.exports = {

  /**
   * Creates a github release via the API.
   *
   * @param {Object} options     holds the configuration params
   *   @param {String} options.user   the github user of the project
   *   @param {String} options.repo    the name of the github repository
   *   @param {String} options.accessToken    the personal github access token
   *   @param {String} options.version    the (semantic) version of the release
   *
   * @return {Promise}  returns a promise
   */
  release: function (options) {
    options = options || {};
    return new Promise(function (resolve, reject) {
      const owner = options.user;
      const repo = options.repo;
      const token = options.accessToken;
      const version = options.version;

      const url = `https://api.github.com/repos/${owner}/${repo}/releases`;

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
          return reject(err);
        }

        resolve(response.body);
      });
    });
  },

  /**
   * Uploads the release asset file to github via the API.
   *
   * @param {Object} options   holds the configuration params
   *   @param {String} options.user   the github user of the project
   *   @param {String} options.repo    the name of the github repository
   *   @param {String} options.accessToken    the personal github access token
   *   @param {String} options.releaseId    the id of the release the asset file belongs to
   *   @param {String} options.version    the (semantic) version of the release
   *   @param {String} options.path     path to the local asset file
   *
   * @return {Promise}  returns a promise
   */
  upload: function (options) {
    options = options || {};

    return new Promise(function (resolve, reject) {
      const owner = options.user;
      const repo = options.repo;
      const token = options.accessToken;
      const release = options.releaseId;
      const version = options.version;
      const path = options.path || process.cwd();

      const url = `https://uploads.github.com/repos/${owner}/${repo}/releases/${release}/assets?name=${version}.tgz`;
      const file = `${path}/${version}.tgz`;

      fs.stat(file, function (err, stats) {
        if (err) {
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
              return reject(err);
            }

            resolve(response.body);
          }));
      });
    });
  }

};
