'use strict';

const describe = require('blue-tape');
const proxyquire = require('proxyquire');
const s3ClientStub = require('./test/fixtures/create-s3-client-stub')();
const s3Stub = require('./test/fixtures/create-s3-stub')(s3ClientStub);
const upload = proxyquire('./aws-s3', {
  's3': s3Stub
}).upload;

describe('aws-s3', (nest) => {

  const test = nest.test;

  test('upload', (assert) => {

    const promise = upload({
      accessKey: 'foo',
      secret: 'bar',
      path: 'foobar',
      version: '9.9.9',
      bucket: 'challenge'
    });

    // the upload promise will be resolved
    // when the s3 client emits end
    s3ClientStub.emit('end');

    assert.ok(s3Stub.createClient.calledOnce,
      'it should create a s3 client.');

    assert.deepLooseEqual(s3Stub.createClient.args[0][0], {
      s3Options: {
        accessKeyId: 'foo',
        secretAccessKey: 'bar',
      }
    }, 'it should pass the proper credentials.');

    assert.ok(s3ClientStub.uploadFile.calledOnce,
      'it should call `uploadFile`');

    assert.deepLooseEqual(s3ClientStub.uploadFile.args[0][0],
      {
        localFile: 'foobar/9.9.9.tgz',
        s3Params: {
          Bucket: 'challenge',
          Key: '9.9.9.tgz',
          ACL: 'authenticated-read',
        },
      },
      'it should upload the file with the proper params.');

    return promise;
  });

  test('upload / required arguments', (assert) => {

    upload()
      .catch(err => {
        assert.equal(
          err.message,
          'Missing access key id.',
          '`accessKeyId` should be required'
        );
      });

    upload({
      accessKey: 'foo'
    })
      .catch(err => {
        assert.equal(
          err.message,
          'Missing secret key.',
          '`secret` should be required'
        );
      });

      upload({
        accessKey: 'foo',
        secret: 'bar'
      })
        .catch(err => {
          assert.equal(
            err.message,
            'The location of the release file is unknown.',
            '`path` should be required'
          );
        });

      upload({
        accessKey: 'foo',
        secret: 'bar'
      })
        .catch(err => {
          assert.equal(
            err.message,
            'The location of the release file is unknown.',
            '`path` should be required'
          );
        });

      upload({
        accessKey: 'foo',
        secret: 'bar',
        path: 'foobar'
      })
        .catch(err => {
          assert.equal(
            err.message,
            'Missing version number.',
            '`version` should be required'
          );
        });

      upload({
        accessKey: 'foo',
        secret: 'bar',
        path: 'foobar',
        version: '9.9.9'
      })
        .catch(err => {
          assert.equal(
            err.message,
            'Missing bucket name.',
            '`bucket` should be required'
          );
        });

    assert.end();
  });
});
