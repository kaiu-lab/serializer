# serializer
[![Build Status](https://travis-ci.org/kaiu-lab/serializer.svg?branch=master)](https://travis-ci.org/kaiu-lab/serializer)
[![codecov](https://codecov.io/gh/kaiu-lab/serializer/branch/master/graph/badge.svg)](https://codecov.io/gh/kaiu-lab/serializer)
[![npm version](https://badge.fury.io/js/%40kaiu%2Fserializer.svg)](https://www.npmjs.com/package/@kaiu/serializer)
[![devDependency Status](https://david-dm.org/kaiu-lab/serializer/dev-status.svg)](https://david-dm.org/kaiu-lab/serializer?type=dev)
[![GitHub issues](https://img.shields.io/github/issues/kaiu-lab/serializer.svg)](https://github.com/kaiu-lab/serializer/issues)
[![GitHub stars](https://img.shields.io/github/stars/kaiu-lab/serializer.svg)](https://github.com/kaiu-lab/serializer/stargazers)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/kaiu-lab/serializer/master/LICENSE)

## Table of contents

- [About](#about)
- [Installation](#installation)
- [Documentation](#documentation)
- [Development](#development)
- [License](#license)

## About

Serializer is a serialization library written in Typescript made to handle typing in deserialized objects.

## Installation

Install through npm:
```bash 
npm install --save serializer
```

## Documentation

Everything is detailed on our [documentation website](https://kaiu-lab.github.io/serializer/).


## Development

### Prepare your environment
* Install [Node.js](http://nodejs.org/) and NPM
* Install local dev dependencies: `npm install` while current directory is this repo

### Testing
Run `npm test` to run tests once or `npm run test:watch` to continually run tests.

### Release
* Bump the version in package.json (once the module hits 1.0 this will become automatic)
```bash
npm run release
```

## License

MIT
