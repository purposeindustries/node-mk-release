'use strict';

const s3 = require('s3');

/**
 * Uploads the given version of an application to AWS S3 storage.
 *
 * @param options
 *  @param {String} options.accessKey - aws access key id, needed to connect to aws via the api
 *  @param {String} options.secret - aws secret key, needed to connect to aws via the api
 *  @param {String} options.path - where the release is located
 *  @param {String} options.version - the semantic version number of the release
 *  @param {String} options.bucket - to which bucket upload the asset file
 *
 * @returns {Promise}
 */
module.exports = function uploadToAWS(options) {
  options = options || {};

  return new Promise(function (resolve, reject) {
    const accessKey = options.accessKey;
    const secret = options.secret;
    const path = options.path;
    const version = options.version;
    const bucket = options.bucket;

    const client = s3.createClient({
      s3Options: {
        accessKeyId: accessKey,
        secretAccessKey: secret,
      }
    });

    client
      .uploadFile({
        localFile: `${path}/${version}.tgz`,
        s3Params: {
          Bucket: bucket,
          Key: `${version}.tgz`,
          ACL: 'authenticated-read',
        },
      })
      .on('error', function(err) {
        reject(err);
      })
      .on('end', function() {
        resolve();
      });
  });
};