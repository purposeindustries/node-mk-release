#! /usr/bin/env node

'use strict';

const minimist = require('minimist');
const pkg = require('./package.json');
const Log = require('log');
const log = new Log();
const _ = require('shelljs');
const s3 = require('s3');

const argv = minimist(process.argv.slice(2));

function createRelease(owner, repo, version, options) {
  options = options || {};
  const token = options.token;
  const url = `https://api.github.com/repos/${owner}/${repo}/releases`;
  const payload = `"{\\"tag_name\\":\\"v${version}\\"}"`;
  log.info(`post to ${url} with ${payload}...`);
  let result = _.exec(
    `curl \
      -s \
      -XPOST \
      -d ${payload} \
      -H 'Content-Type: application/json' \
      -H "Authorization: token ${token}" \
      ${url}`
  ).output;
  try {
    result = JSON.parse(result);
  } catch (error) {
    result = {
      message: error.message
    };
  }
  if (!result.id) {
    log.error(`failed to create release: ${result.message}`);
    process.exit(1);
  }
  return result.id;
}

function uploadAsset(owner, repo, version, options) {
    options = options || {};

    if (options.aws) {

      var client = s3.createClient({
        s3Options: {
          accessKeyId: options.aws.accessKey,
          secretAccessKey: options.aws.secret,
        },
      });
      var uploader = client.uploadFile({
        localFile: `./release/${version}.tgz`,
        s3Params: {
          Bucket: `${owner}-${repo}`,
          Key: `${version}.tgz`,
          ACL: 'authenticated-read',
        },
      });
      uploader.on('error', function(err) {
        log.error(`AWS S3: unable to upload: ${err.stack}`);
      });
      uploader.on('end', function() {
        log.info('AWS S3: done uploading');
      });

    } else {
      const token = options.github.token;
      const url = `https://uploads.github.com/repos/${owner}/${repo}/releases/${release}/assets?name=${version}.tgz`;
      log.info(`GITHUB: uploading to ${url}...`);
      let result = _.exec(
        `curl \
          -s \
          -XPOST \
          -H 'Content-Type: application/gzip' \
          -H "Authorization: token ${token}" \
          --data-binary @release/${version}.tgz \
          ${url}`
      ).output;
      try {
        result = JSON.parse(result);
      } catch (error) {
        result = {
          message: error.message
        };
      }
      const asset = result.id;
      if (!asset) {
        log.info(`GITHUB: upload failed (${result.message}) let\`s try it again`);
        log.info('GITHUB: ', result);
        return uploadAsset(owner, repo, version, options);
      }
      return asset;
    }
}

function createAssetFile(version) {
  _.mkdir('-p', 'release');
  _.rm('release/*');
  log.info(`creating release asset v${version}...`);
  _.exec(`tar cz --exclude .git --exclude release -f "release/${version}.tgz" .`);
  log.info(`release asset v${version} created.`);
}

const owner = argv['gh-user'] || process.env.GITHUB_USER;
const repo = argv['gh-repo'] || process.env.GITHUB_REPO;
const githubToken = argv['gh-token'] || process.env.GITHUB_ACCESS_TOKEN;
const awsAccessKey = argv['aws-access-key-id'] || process.env.AWS_ACCESS_KEY_ID;
const awsSecret = argv['aws-secret-access-key'] || process.env.AWS_SECRET_ACCESS_KEY;
const version = pkg.version;

log.info(`create release v${version} on ${owner}/${repo}...`);

createAssetFile(version);

const release = createRelease(owner, repo, version, {
  token: githubToken
});

log.info(`release id: ${release}`);

const uploadOptions = awsAccessKey && awsSecret ? {
  aws: {
    accessKey: awsAccessKey,
    secret: awsSecret
  }
} : {
  github: {
    token: githubToken
  }
};

const asset = uploadAsset(owner, repo, version, uploadOptions);
log.info(`asset uploaded: ${asset}`);
