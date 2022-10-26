# promise-cache-retry

[![NPM Version][npm-image]][npm-url]
[![license][license-image]][license-url]
[![GitHub Actions][github-image]][github-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![TypeScript Style Guide][gts-image]][gts-url]
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg)](https://github.com/RichardLitt/standard-readme)

## Table of Contents

- [Security](#security)
- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Security

## Background

If you simply cache the Promise it will always resolve with an error after an error occurs.
On the other hand, retrying within a Promise will leave the Promise unresolved until the error is resolved, blocking further processing.

So this library works like this: If an error occurs, resolve it as an error, automatically perform retry processing (unless you disable it explicitly), and return the retry result when referencing the cache.

## Install


```
npm install --save promise-cache-retry
```

## Usage

```typescript
import { PromiseCache } from 'promise-cache-retry';

const cache = new PromiseCache({
  promiseGenerator: async () => {
    const res = await fetchData(ENDPOINT);
    return res.data;
  },
  options: {
    maxRetries: 2,
    minRetryInterval: 3000,
  },
});

export const handler = async () => {
  const value = await cache.get();
}
```

## Contributing

See [the contributing file](CONTRIBUTING.md)!

PRs accepted.

Small note: If editing the Readme, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

[MIT © RICOH360](./LICENSE)

[github-image]: https://github.com/ricohapi/promise-cache-retry/workflows/Node.js%20CI/badge.svg
[github-url]: https://github.com/ricohapi/promise-cache-retry/actions
[prettier-url]: https://prettier.io/
[gts-image]: https://img.shields.io/badge/code%20style-google-blueviolet.svg
[gts-url]: https://github.com/google/gts
[npm-image]: https://img.shields.io/npm/v/promise-cache-retry.svg
[npm-url]: https://npmjs.org/package/promise-cache-retry
[license-image]: https://img.shields.io/github/license/ricohapi/promise-cache-retry.svg
[license-url]: https://github.com/ricohapi/promise-cache-retry/blob/main/LICENSE
[snyk-image]: https://snyk.io/test/github/ricohapi/promise-cache-retry/badge.svg
[snyk-url]: https://snyk.io/test/github/ricohapi/promise-cache-retry
[standardjs-url]: https://www.npmjs.com/package/standard
[eslint-url]: https://eslint.org/
