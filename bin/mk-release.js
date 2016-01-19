#! /usr/bin/env node

'use strict';

const workDir = process.cwd();
const minimist = require('minimist');
const pkg = require(workDir + '/package.json');
const argv = minimist(process.argv.slice(2));
const chalk = require('chalk');
const spinner = require('elegant-spinner');
const logUpdate = require('log-update');
const symbols = require('log-symbols');

const owner = argv['gh-user'] || process.env.GITHUB_USER;
const repo = argv['gh-repo'] || process.env.GITHUB_REPO;
const githubToken = argv['gh-token'] || process.env.GITHUB_ACCESS_TOKEN;
const version = pkg.version;

const log = console.log.bind(console);
const info = chalk.cyan;
const error = msg => chalk.red(symbols.error, msg);
const success = msg => chalk.green(symbols.success, msg);

let interval;

function startSpinner() {
  const frame = spinner();
  interval = setInterval(() => logUpdate(frame()), 50);
}

function stopSpinner() {
  clearInterval(interval);
}

if (githubToken) {
  const createGithubRelease = require('../lib/create-github-release');

  createGithubRelease({
    user: owner,
    repo: repo,
    accessToken: githubToken,
    version: pkg.version,
    start: () => {
      log(info('Creating github release...'));
      startSpinner();
    },
    end: (err, data) => {
      stopSpinner();

      if (err) {
        logUpdate(error(`Creating github release failed: ${err.message}`));
        process.exit(1);
      }

      if (!(data || {}).id) {
        logUpdate(error('Creating github release failed: No release id.'));
        process.exit(1);
      }

      logUpdate(success('Release has been created successfully.'));

      const uploadToGithub = require('../lib/upload-to-github');

      uploadToGithub({
        user: owner,
        repo: repo,
        accessToken: githubToken,
        version: pkg.version,
        releaseId: data.id,
        path: workDir,

        start: () => {
          log(info('Uploading file to github...'));
          log('next');
          startSpinner();
        },

        end: (err, response) => {
          stopSpinner();

          if (err) {
            logUpdate(error(`Upload failed: ${err.message}`));
            process.exit(1);
          }

          if (response && response.id) {
            logUpdate(success(`Asset has been uploaded: ${response.id}`));
          }
        }
      });
    }
  })
  .catch(err => logUpdate(error(err.message)));

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
      bucket: bucket,

      start: () => {
        log(info('Uploading file to AWS S3...'));
        startSpinner();
      },

      end: (err) => {
        stopSpinner();

        if (err) {
          logUpdate(error(err.message));
          process.exit(1);
        } else {
          logUpdate(success('Asset has been uploaded.'));
        }
      }
    });
  }
}
