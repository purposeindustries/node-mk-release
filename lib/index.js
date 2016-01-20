'use strict';

const workDir = process.cwd();

module.exports = {

  /**
   * Exposes Github releaser
   *
   * @param {Object} options    holds configuration parameters
   *
   * @return {Promise}    returns a promise
   */
  github: options => {
    options = options || {};

    const github = require('./github');
    const release = github.release;
    const upload = github.upload;

    const user = options.user;
    const repo = options.repo;
    const accessToken = options.accessToken;
    const version = options.version || require(`${workDir}/package.json`).version;
    const path = options.path || `${workDir}/release`;

    return release({
      user: user,
      repo: repo,
      accessToken: accessToken,
      version: version
    })
    .then((data) => {
      data = data || {};

      if (!data.id) {
        throw new Error(data.message || 'Sorry! Unable to create github release.');
      }

      upload({
        user: user,
        repo: repo,
        accessToken: accessToken,
        version: version,
        releaseId: data.id,
        path: path,
      })
      .catch(err => {
        throw err;
      });
    });
  },

  /**
   * Exposes AWS S3 releaser
   *
   * @param {Object} options    holds configuration parameters
   *
   * @return {Promise}    returns a promise
   */
  s3: options => {
    const upload = require('./aws-s3').upload;

    const accessKey = options.accessKey;
    const secret = options.secret;
    const bucket = options.bucket;
    const version = options.version || require(`${workDir}/package.json`).version;
    const path = options.path || `${workDir}/release`;

    return upload({
      accessKey: accessKey,
      secret: secret,
      version: version,
      path: path,
      bucket: bucket
    });
  }
};
