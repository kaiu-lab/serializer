# ng serializer
[![Build Status](https://travis-ci.org/Supamiu/ng-serializer.svg?branch=master)](https://travis-ci.org/Supamiu/ng-serializer)
[![codecov](https://codecov.io/gh/Supamiu/ng-serializer/branch/master/graph/badge.svg)](https://codecov.io/gh/Supamiu/ng-serializer)
[![npm version](https://badge.fury.io/js/ng-serializer.svg)](http://badge.fury.io/js/ng-serializer)
[![devDependency Status](https://david-dm.org/Supamiu/ng-serializer/dev-status.svg)](https://david-dm.org/Supamiu/ng-serializer?type=dev)
[![GitHub issues](https://img.shields.io/github/issues/Supamiu/ng-serializer.svg)](https://github.com/Supamiu/ng-serializer/issues)
[![GitHub stars](https://img.shields.io/github/stars/Supamiu/ng-serializer.svg)](https://github.com/Supamiu/ng-serializer/stargazers)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/Supamiu/ng-serializer/master/LICENSE)

## Demo
https://Supamiu.github.io/ng-serializer/

## Table of contents

- [About](#about)
- [Installation](#installation)
- [Documentation](#documentation)
- [Development](#development)
- [License](#license)

## About



## Installation

Install through npm:
```
npm install --save ng-serializer
```

Then include in your apps module:

```typescript
import { Component, NgModule } from '@angular/core';
import { NgSerializerModule } from 'ng-serializer';

@NgModule({
  imports: [
    NgSerializerModule.forRoot()
  ]
})
export class MyModule {}
```

Finally use in one of your apps components:
```typescript
import { Component } from '@angular/core';

@Component({
  template: '<hello-world></hello-world>'
})
export class MyComponent {}
```

You may also find it useful to view the [demo source](https://github.com/Supamiu/ng-serializer/blob/master/demo/demo.component.ts).

### Usage without a module bundler
```
<script src="node_modules/ng-serializer/bundles/ng-serializer.umd.js"></script>
<script>
    // everything is exported ngSerializer namespace
</script>
```

## Documentation
All documentation is auto-generated from the source via [compodoc](https://compodoc.github.io/compodoc/) and can be viewed here:
https://Supamiu.github.io/ng-serializer/docs/

## Development

### Prepare your environment
* Install [Node.js](http://nodejs.org/) and NPM
* Install local dev dependencies: `npm install` while current directory is this repo

### Development server
Run `npm start` to start a development server on port 8000 with auto reload + tests.

### Testing
Run `npm test` to run tests once or `npm run test:watch` to continually run tests.

### Release
* Bump the version in package.json (once the module hits 1.0 this will become automatic)
```bash
npm run release
```

## License

MIT
