#! /usr/bin/env node

'use strict';

const minimist = require('minimist');
const pkg = require('./package.json');
const Log = require('log');
const log = new Log();
const _ = require('shelljs');

const argv = minimist(process.argv.slice(2), {
  alias: {
    'gh-user': 'u',
    'gh-repo': 'r',
    'gh-token': 't'
  }
});

function createRelease(owner, repo, version, options) {
  options = options || {};
  const token = options.token
  const url = `https://api.github.com/repos/${owner}/${repo}/releases`;
  const payload = `"{\\"tag_name\\":\\"v${version}\\"}"`;
  log.info(`post to ${url} with ${payload}...`);
  let result = _.exec(`curl -s -XPOST -d ${payload} -H 'Content-Type: application/json' -H "Authorization: token ${token}" ${url}`).output;
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
    const token = options.token
    const url= `https://uploads.github.com/repos/${owner}/${repo}/releases/${release}/assets?name=${version}.tgz`;
    log.info(`uploading to ${url}...`);
    let result = _.exec(`curl -s -XPOST -H 'Content-Type: application/gzip' -H "Authorization: token ${token}" --data-binary @release/${version}.tgz ${url}`).output;
    try {
      result = JSON.parse(result);
    } catch (error) {
      result = {
        message: error.message
      };
    }
    const asset = result.id;
    if (!asset) {
      log.info(`upload failed (${result.message})let\`s try it again`);
      log.info(result);
      return uploadAsset(owner, repo, version, options);
    }
    return asset;
}

function createAssetFile(version) {
  _.mkdir('-p', 'release');
  _.rm('release/*');
  log.info(`creating release asset v${version}...`);
  _.exec(`tar cz --exclude .git --exclude release -f "release/${version}.tgz" .`);
  log.info(`release asset v${version} created.`);
}

const owner = argv['gh-user'];
const repo = argv['gh-repo'];
const token = argv['gh-token'];
const version = pkg.version;

const GITHUB_ACCESS_TOKEN = token || process.env.GITHUB_ACCESS_TOKEN;

log.info(`create release v${version} on ${owner}/${repo}...`);

createAssetFile(version);

const release = createRelease(owner, repo, version, {
  token: GITHUB_ACCESS_TOKEN
});

log.info(`release id: ${release}`);
const asset = uploadAsset(owner, repo, version, {
  token: GITHUB_ACCESS_TOKEN
});
log.info(`asset uploaded: ${asset}`);
