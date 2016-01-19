'use strict';

const minimist = require('minimist');
const argv = minimist(process.argv.slice(2));

const workDir = process.cwd();
const pkg = require(workDir + '/package.json');
const version = pkg.version;

const chalk = require('chalk');
const spinner = require('elegant-spinner');
const logUpdate = require('log-update');
const symbols = require('log-symbols');

const owner = argv['gh-user'] || process.env.GITHUB_USER;
const repo = argv['gh-repo'] || process.env.GITHUB_REPO;

const log = console.log.bind(console);
const info = chalk.cyan;
const error = msg => chalk.red(symbols.error, msg);
const success = msg => chalk.green(symbols.success, msg);

/**
 * Holds animation progress id
 *
 * @var {Number}
 */
let interval;

/**
 * Displays the spinner in the terminal.
 *
 * @return {void}
 */
function startSpinner() {
  const frame = spinner();
  interval = setInterval(() => logUpdate(frame()), 50);
}

/**
 * Stops the already running spinner in the terminal.
 *
 * @return {void}
 */
function stopSpinner() {
  clearInterval(interval);
}

const githubToken = argv['gh-token'] || process.env.GITHUB_ACCESS_TOKEN;

if (githubToken) {
  const github = require('./github');
  const release = github.release;
  const upload = github.upload;

  release({
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

      upload({
        user: owner,
        repo: repo,
        accessToken: githubToken,
        version: pkg.version,
        releaseId: data.id,
        path: `${workDir}/release`,

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

  if (awsAccessKey && awsSecret) {
    const bucket = argv['aws-bucket'] || process.env.AWS_BUCKET;
    const upload = require('./aws-s3').upload;

    upload({
      accessKey: awsAccessKey,
      secret: awsSecret,
      version: version,
      path: `${workDir}/release`,
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
