# ng serializer
[![Build Status](https://travis-ci.org/Supamiu/ng-serializer.svg?branch=master)](https://travis-ci.org/Supamiu/ng-serializer)
[![codecov](https://codecov.io/gh/Supamiu/ng-serializer/branch/master/graph/badge.svg)](https://codecov.io/gh/Supamiu/ng-serializer)
[![npm version](https://badge.fury.io/js/ng-serializer.svg)](http://badge.fury.io/js/ng-serializer)
[![devDependency Status](https://david-dm.org/Supamiu/ng-serializer/dev-status.svg)](https://david-dm.org/Supamiu/ng-serializer?type=dev)
[![GitHub issues](https://img.shields.io/github/issues/Supamiu/ng-serializer.svg)](https://github.com/Supamiu/ng-serializer/issues)
[![GitHub stars](https://img.shields.io/github/stars/Supamiu/ng-serializer.svg)](https://github.com/Supamiu/ng-serializer/stargazers)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/Supamiu/ng-serializer/master/LICENSE)

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
```
npm install --save serializer
```

## Documentation

### Simple usage
Assuming you have a simple model class:
```
export class Foo{
    public bar:string;
    
    public getBar():string{
        return this.bar;
    }
}
```

You can simply do:

```
// Because the serializer doesn't handle strings, you have to JSON.parse it first.
const data = JSON.parse('{"bar":"baz"}';
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
