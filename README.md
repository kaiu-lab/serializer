# serializer
[![Build Status](https://travis-ci.org/kaiu-io/serializer.svg?branch=master)](https://travis-ci.org/kaiu-io/serializer)
[![codecov](https://codecov.io/gh/kaiu-io/serializer/branch/master/graph/badge.svg)](https://codecov.io/gh/kaiu-io/serializer)
[![npm version](https://badge.fury.io/js/%40kaiu%2Fserializer.svg)](https://www.npmjs.com/package/@kaiu/serializer)
[![devDependency Status](https://david-dm.org/kaiu-io/serializer/dev-status.svg)](https://david-dm.org/kaiu-io/serializer?type=dev)
[![GitHub issues](https://img.shields.io/github/issues/kaiu-io/serializer.svg)](https://github.com/kaiu-io/serializer/issues)
[![GitHub stars](https://img.shields.io/github/stars/kaiu-io/serializer.svg)](https://github.com/kaiu-io/serializer/stargazers)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/kaiu-io/serializer/master/LICENSE)

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

### Simple usage
Assuming you have a simple model class:
```typescript
export class Foo {
    public bar: string;
    
    public getBar(): string{
        return this.bar;
    }
}
```

You can simply do:

```typescript
// Because the serializer doesn't handle strings, you have to JSON.parse it first.
const data = JSON.parse( '{"bar":"baz"}' );
new Serializer().deserialize<Foo>(jsonObject, Foo);
```

### In Progress
While we're working on a good documentation, please refer to the tests for examples.


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
