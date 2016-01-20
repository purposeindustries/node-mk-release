'use strict';

const describe = require('blue-tape');
const proxyquire = require('proxyquire');
const createRequestResolvedStub = require('./test/fixtures/create-request-stub').resolved;
const createRequestRejectedStub = require('./test/fixtures/create-request-stub').rejected;
const createFsStub = require('./test/fixtures/create-fs-stub');

describe('github', (nest) => {

  const test = nest.test;

  test('release', (assert) => {

    const requestResolvedStub = createRequestResolvedStub();

    const release = proxyquire('./github', {
      'request': requestResolvedStub
    }).release;

    const promise = release({
      user: 'foo',
      repo: 'bar',
      version: '9.9.9',
      accessToken: 'secret'
    })
      .then(result => {
        assert.equal(result, 'resolved', 'it should be resolved.');
      });

    assert.ok(
      requestResolvedStub.post.calledOnce,
      'it should be called once.'
    );

    assert.deepLooseEqual(
      requestResolvedStub.post.args[0][0],
      {
        url: 'https://api.github.com/repos/foo/bar/releases',
        json: true,
        body: {
          'tag_name': 'v9.9.9'
        },
        headers: {
          'User-Agent': 'foo',
          'Content-Type': 'application/json',
          'Authorization': 'token secret'
        }
      },
      'it should be called with the proper params.'
    );

    return promise;
  });

  test('release / error', (assert) => {

    const requestRejectedStub = createRequestRejectedStub();

    const release = proxyquire('./github', {
      'request': requestRejectedStub
    }).release;

    release({
      user: 'foo',
      repo: 'bar',
      version: '9.9.9',
      accessToken: 'secret'
    }).catch(err => {
      assert.equal(err.message, 'rejected',
        'it should be rejected.');
    });

    assert.end();
  });

  test('upload', (assert) => {

    const fsResolvedStub = createFsStub.resolved();
    const requestResolvedStub = createRequestResolvedStub();

    const upload = proxyquire('./github', {
      'fs': fsResolvedStub,
      'request': requestResolvedStub
    }).upload;

    const promise = upload({
      path: 'foobar',
      version: '9.9.9',
      user: 'foo',
      repo: 'bar',
      releaseId: '123',
      accessToken: 'secret'
    });

    assert.ok(fsResolvedStub.stat.calledOnce,
      'it should be called once.');

    assert.deepLooseEqual(
      fsResolvedStub.stat.args[0][0],
      'foobar/9.9.9.tgz'
    );

    assert.ok(fsResolvedStub.createReadStream.calledOnce);
    assert.deepLooseEqual(
      fsResolvedStub.createReadStream.args[0][0],
      'foobar/9.9.9.tgz'
    );
    assert.ok(fsResolvedStub.pipe.calledOnce);
    assert.ok(requestResolvedStub.post.calledOnce);
    assert.deepLooseEqual(
      requestResolvedStub.post.args[0][0],
      {
        url: 'https://uploads.github.com/repos/foo/bar/releases/123/assets?name=9.9.9.tgz',
        json: true,
        headers: {
          'User-Agent': 'foo',
          'Content-Type': 'application/gzip',
          'Content-Length': 123,
          'Authorization': 'token secret',
        }
      }
    );

    return promise;
  });
});
