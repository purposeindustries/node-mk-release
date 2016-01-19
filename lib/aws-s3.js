'use strict';

const s3 = require('s3');

function noop() {}

module.exports = {

  /**
   * Uploads a release asset file to AWS S3.
   *
   * @param options
   *  @param {String} options.accessKey   aws access key id, needed to connect to aws via the api
   *  @param {String} options.secret   aws secret key, needed to connect to aws via the api
   *  @param {String} options.path     where the release is located
   *  @param {String} options.version  the semantic version number of the release
   *  @param {String} options.bucket   to which bucket upload the asset file
   *  @param {Function} [options.start]     called immediately at the beginning of the upload process
   *  @param {Function} [options.end]       called when an error occurs or the process is done successfully
   *  @param {Function} [options.progress]  called when the upload process is happening
   *
   * @return {Promise}    returns a promise
   */
  upload: function (options) {
    options = options || {};

    return new Promise(function (resolve, reject) {
      const accessKey = options.accessKey;
      const secret = options.secret;
      const path = options.path;
      const version = options.version;
      const bucket = options.bucket;
      const onStart = options.start || noop;
      const onProgress = options.progress || noop;
      const onEnd = options.end || noop;

      const client = s3.createClient({
        s3Options: {
          accessKeyId: accessKey,
          secretAccessKey: secret,
        }
      });

      onStart();

      const uploader = client
        .uploadFile({
          localFile: `${path}/${version}.tgz`,
          s3Params: {
            Bucket: bucket,
            Key: `${version}.tgz`,
            ACL: 'authenticated-read',
          },
        })
        .on('error', function(err) {
          onEnd(err);
          reject(err);
        })
        .on('end', function() {
          onEnd();
          resolve();
        })
        .on('progress', function() {
          onProgress(uploader.progressAmount, uploader.progressTotal);
        });
    });
  }
};
