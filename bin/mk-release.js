#! /usr/bin/env node

'use strict';

const workDir = process.cwd();
const minimist = require('minimist');
const pkg = require(workDir + '/package.json');
const argv = minimist(process.argv.slice(2));

const owner = argv['gh-user'] || process.env.GITHUB_USER;
const repo = argv['gh-repo'] || process.env.GITHUB_REPO;
const githubToken = argv['gh-token'] || process.env.GITHUB_ACCESS_TOKEN;
const version = pkg.version;

if (githubToken) {
  const createGithubRelease = require('../lib/create-github-release');

  createGithubRelease({
    user: owner,
    repo: repo,
    accessToken: githubToken,
    version: pkg.version
  })
  .then(function (data) {

    if (!(data || {}).id) {
      throw new Error('no release id');
    }

    console.log('uploading file to github');

    const uploadToGithub = require('../lib/upload-to-github');

    uploadToGithub({
      user: owner,
      repo: repo,
      accessToken: githubToken,
      version: pkg.version,
      releaseId: data.id,
      path: workDir
    })
      .then(function (response) {
        if (response.id) {
          console.log('asset uploaded: ', response.id);
        }
      })
      .catch(function (err) {
        throw new Error('upload failed: ', err.message);
      });

  })
    .catch(function (err) {
      console.error(err.message);
    });
} else {
  const awsAccessKey = argv['aws-access-key-id'] || process.env.AWS_ACCESS_KEY_ID;
  const awsSecret = argv['aws-secret-access-key'] || process.env.AWS_SECRET_ACCESS_KEY;
  const bucket = argv['aws-bucket'] || process.env.AWS_BUCKET;

  if (awsAccessKey && awsSecret) {
    const uploadToAWS = require('../lib/upload-to-aws');

    uploadToAWS({
      accessKey: awsAccessKey,
      secret: awsSecret,
      version: version,
      path: workDir,
      bucket: bucket
    })
      .then(function () {
        console.log('asset uploaded');
      })
      .catch(function (err) {
        console.error(err.message);
      });
  }
}
