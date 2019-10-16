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
npm install --save @kaiu/serializer
```

## Usage

### Deserialize

```ts
import { Serializer } from '@kaiu/serializer';

const serializer = new Serializer();

class Foo {
    bar: string;

    public getUpperCaseBar(): string {
        return this.bar.toUpperCase();
    }
}

const foo = serializer.deserialize<Foo>({ bar: 'baz' }, Foo);

console.log(foo.getUpperCaseBar()); // Will print "BAZ"
```

More details: [Class Serializer](https://kaiu-lab.github.io/serializer/classes/serializer.html)

### Serialize

```ts
import { Serializer, Transient } from '@kaiu/serializer';

const serializer = new Serializer();

class Foo {
    bar: string;
    
    @Transient()
    secret: string;

    public getUpperCaseBar(): string {
        return this.bar.toUpperCase();
    }
}

const foo = new Foo();
foo.bar = 'baz';
foo.secret = 's3cr3t';

console.log(serializer.serialize(foo)); // Will print '{ "bar": "baz" }'
```

More details: [Class Serializer](https://kaiu-lab.github.io/serializer/classes/serializer.html)

## Advanced Usages

### Deep class fields

```ts
    import { Serializer, DeserializeAs } from '@kaiu/serializer';

    class Bar {
        baz: string;
   
       public getUpperCaseBaz(): string {
           return this.baz.toUpperCase();
       }   
    } 

   class Foo {
       @DeserializeAs(Bar) 
       bar: Bar;
   }
    
    const foo = serializer.deserialize<Foo>({ bar: { baz: 'baz' } }, Foo);

    console.log(foo.bar.getUpperCaseBar()); // Will print "BAZ"
```

More details: [DeserializeAs](https://kaiu-lab.github.io/serializer/globals.html#deserializeas)

### Arrays

```ts
import { Serializer } from '@kaiu/serializer';

const serializer = new Serializer();

class Foo {
    bar: string;

    public getUpperCaseBar(): string {
        return this.bar.toUpperCase();
    }
}

const foo = serializer.deserialize<Foo>([{ bar: 'baz' }, { bar: 'buz' }], [Foo]);

console.log(foos[1].getUpperCaseBar()); // Will print "BUZ"
```

### Discriminant field

```ts
import { Serializer, Registry, Parent } from '@kaiu/serializer';

@Parent({
    discriminatorField: 'type',
    allowSelf: true // This one is optional.
})
export class Vehicle {
     type: string;
     color: string;

     public getDescription(): string {
        return 'I am just a vehicle';
     }
}

export class Car extends Vehicle {
    public getDescription(): string {
        return 'I am a car, I can move using wheels';
    }
}

const registry = new Registry();

registry.add([
     {
         parent: Vehicle,
         children: {
             car: Car
         }
     }
]);

const serializer = new Serializer(registry);

const foo = serializer.deserialize<Vehicle>({type: 'car', color: 'red'}, Vehicle);

console.log(foo.getDescription()); // Will print "I am a car, I can move using wheels"
```

More details: [Class Registry](https://kaiu-lab.github.io/serializer/classes/registry.html)

### Property mapping

```ts
export class Example{
     @DeserializeFieldName('bar')
     foo: string;
}

const result = serializer.deserialize<Example>({ bar: 'hey' }, Example);
console.log(result.foo); // Will print 'hey'
```

More details: [DeserializeFieldName](https://kaiu-lab.github.io/serializer/globals.html#deserializefieldname)

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
