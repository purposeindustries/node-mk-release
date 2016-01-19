mk-release
==========

> Creating a Github or a AWS S3 release has never been easier.

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [CLI Usage](#cli)
- [API](#api)
- [License](#license)

## Install

```sh
$ npm install -g mk-release
```

## Usage

```js

const release = require('mk-release');

// create a github release
release
  .github({
    user: 'YOUR_GITHUB_USERNAME',
    repo: 'YOUR_GITHUB_REPO_NAME',
    accessToken: 'YOUR_PERSONAL_GITHUB_ACCESS_TOKEN'
  })
  .then(() => console.log('Done.'))
  .catch(err => console.log(`Oops... ${err.message}`));

//create an AWS S3 release
release
  .s3({
    accessKey: 'YOUR_AWS_S3_ACCESS_KEY_ID',
    secret: 'YOUR_AWS_S3_SECRET_KEY',
    bucket: 'YOUR_AWS_S3_BUCKET_NAME'
  })
  .then(() => console.log('Done.'))
  .catch(err => console.log(`Opps... ${err.message}`));

```

## CLI

```sh
$ mk-release [options]

  options (Github):
    --gh-user       The github user who owns the repo.
    --gh-repo       The name of the github repo which has the release.
    --gh-token      Github personal access token to prove that you have access to the repo.

  options (AWS S3):
    --aws-access-key-id       The Amazon Web Services S3 [access key id](http://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html).
    --aws-secret-access-key   The Amazon Web Services S3 [secret key](http://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html).
    --aws-bucket              The name of your AWS S3 [bucket](http://docs.aws.amazon.com/AmazonS3/latest/gsg/CreatingABucket.html) in which you want the release file to be.

  options (Common):
    --version       The (semantic) version of the release.
    --asset-folder  The path where the release file is located.

```

### The CLI optionally accepts the following environment variables.

It's pretty useful for example when you'd like to set these sensitive properties on a CI system's (like [Circle](https://circleci.com/)) UI.

NOTE: The option arguments has higher precedence over environment variables.

`GITHUB_USER`

The github user who owns the repo.

`GITHUB_REPO`

The name of the github repo which has the release.

`GITHUB_ACCESS_TOKEN`

Github personal access token to prove that you have access to the repo.

`AWS_ACCESS_KEY_ID`

The Amazon Web Services S3 [access key id](http://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html).

`AWS_SECRET_ACCESS_KEY`

The Amazon Web Services S3 [secret key](http://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html).

`AWS_BUCKET`

The name of your AWS S3 [bucket](http://docs.aws.amazon.com/AmazonS3/latest/gsg/CreatingABucket.html) in which you want the release file to be.

`RELEASE_VERSION`

The (semantic) version of the release.

`RELEASE_ASSET_FOLDER`

The path where the release file is located.

## API

### `github(options);`

Return: `Promise`

#### `options.user` **required**

The github user who owns the repo.

Type: `String`

#### `options.repo` **required**

The name of the github repo which has the release.

Type: `String`

#### `options.accessToken` **required**

Github personal access token to prove that you have access to the repo. [Here](https://help.github.com/articles/creating-an-access-token-for-command-line-use/) you can find how you can create one.

Type: `String`

#### `options.version`

The (semantic) version of the release.

Type: `String`
Default: *By default the script parses the `package.json` to get the version.*

#### `options.path`

The path where the release file is located.

Type: `String`
Default: *the `release` folder in the root of your project.*

---

### `s3(options);`

Return: `Promise`

#### `options.accessKey` **required**

The Amazon Web Services S3 [access key id](http://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html).

Type: `String`

#### `options.secret` **required**

The Amazon Web Services S3 [secret key](http://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html).

Type: `String`

#### `options.bucket` **required**

The name of your AWS S3 [bucket](http://docs.aws.amazon.com/AmazonS3/latest/gsg/CreatingABucket.html) in which you want the release file to be.

Type: `String`

#### `options.version`

Type: `String`
Default: *By default the script parses the `package.json` to get the version.*

#### `options.path`

Type: `String`
Default: *the `release` folder in the root of your project.*

---

NOTE: By default, all the releasers use the following pattern when they look for the release file (in case the version of your release is `1.0.0`):

`./release/1.0.0.tgz`

The release file itself always has to be named after the release version and always has to be a `.tgz`.

If you'd like to put this file to a different location, it's fine just make sure you pass the appropriate `path` in the `options` object.

## License

#### The MIT License (MIT)

Copyright (c) 2016 Purpose Industries

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
