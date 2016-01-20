#! /usr/bin/env node

'use strict';

const chalk = require('chalk');
const symbols = require('log-symbols');

const fn = require('../lib');
/*eslint-disable no-console*/
const log = console.log.bind(console);
/*eslint-enable no-console*/
const info = chalk.cyan;
const error = msg => chalk.red(symbols.error, msg);
const success = msg => chalk.green(symbols.success, msg);

const minimist = require('minimist');
const argv = minimist(process.argv.slice(2));

const githubToken = argv['gh-token'] || process.env.GITHUB_ACCESS_TOKEN;
const githubUser = argv['gh-user'] || process.env.GITHUB_USER;
const githubRepo = argv['gh-repo'] || process.env.GITHUB_REPO;
const version = argv.version || process.env.RELEASE_VERSION;
const path = argv['asset-folder'] || process.env.RELEASE_ASSET_FOLDER;

if (githubToken) {

  log(info('Creating github release...'));
  fn
    .github({
      accessToken: githubToken,
      user: githubUser,
      repo: githubRepo,
      path: path,
      version: version
    })
    .then(() => log(success('Github release has been created successfully.')))
    .catch(err => log(error(err.message)));

} else {

  const awsAccessKey = argv['aws-access-key-id'] ||
    process.env.AWS_ACCESS_KEY_ID;
  const awsSecret = argv['aws-secret-access-key'] ||
    process.env.AWS_SECRET_ACCESS_KEY;

  if (awsAccessKey && awsSecret) {

    const awsBucket = argv['aws-bucket'] || process.env.AWS_BUCKET;

    log(info('Creating AWS S3 release...'));
    fn
      .s3({
        bucket: awsBucket,
        accessKey: awsAccessKey,
        secret: awsSecret
      })
      .then(() => log(success('AWS S3 release has been created successfully.')))
      .catch(err => log(error(err.message)));
  }
}
