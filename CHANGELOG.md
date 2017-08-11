# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="1.0.1"></a>
## [1.0.1](https://github.com/kaiu-lab/serializer/compare/v1.0.0...v1.0.1) (2017-08-11)



<a name="1.0.0"></a>
# [1.0.0](https://github.com/kaiu-lab/serializer/compare/v0.5.5...v1.0.0) (2017-08-10)


### Bug Fixes

* add support for class array deserialization ([ecb7527](https://github.com/kaiu-lab/serializer/commit/ecb7527)), closes [#23](https://github.com/kaiu-lab/serializer/issues/23)
* added FieldName to exported members. ([b233c07](https://github.com/kaiu-lab/serializer/commit/b233c07))
* changed error message + tests optimization. ([a9f0089](https://github.com/kaiu-lab/serializer/commit/a9f0089))
* remove stupid error importing from deleted file. ([ce3dbe6](https://github.com/kaiu-lab/serializer/commit/ce3dbe6))
* rename parentOption variable to match pluralization ([86b0a5f](https://github.com/kaiu-lab/serializer/commit/86b0a5f))
* rename resultConstructor to match getClass return type ([f68135c](https://github.com/kaiu-lab/serializer/commit/f68135c))
* **doc:** remove the @ escape before the decorator in code example, and add Zero-width space to prev ([5b0b60e](https://github.com/kaiu-lab/serializer/commit/5b0b60e))
* **registry:** fix the behavior when deserializing the parent itself with explicit or implicit discr ([d5b072e](https://github.com/kaiu-lab/serializer/commit/d5b072e)), closes [#12](https://github.com/kaiu-lab/serializer/issues/12)


### Code Refactoring

* add better type hinting for deserialize and fix the tests accordingly ([a35960d](https://github.com/kaiu-lab/serializer/commit/a35960d)), closes [#24](https://github.com/kaiu-lab/serializer/issues/24)


### Features

* add fake parent class to test not abstract self disallowed parent ([044f800](https://github.com/kaiu-lab/serializer/commit/044f800))
* add support for attribute names mapping ([7396537](https://github.com/kaiu-lab/serializer/commit/7396537)), closes [#17](https://github.com/kaiu-lab/serializer/issues/17)
* added allowSelf flag to allow parent class to be returned if no children is found. ([dd16c14](https://github.com/kaiu-lab/serializer/commit/dd16c14))
* added multiple checks to handle edge cases for inheritance ([129df55](https://github.com/kaiu-lab/serializer/commit/129df55))


### BREAKING CHANGES

* Serializer.deserialize() cannot be use without explicit clazz parameter anymore



<a name="0.5.5"></a>
## [0.5.5](https://github.com/kaiu-io/serializer/compare/v0.5.4...v0.5.5) (2017-07-15)


### Features

* added support for discriminator field with undefined value (it now returns the parent class). ([27a31b6](https://github.com/kaiu-io/serializer/commit/27a31b6))



<a name="0.5.4"></a>
## [0.5.4](https://github.com/kaiu-io/serializer/compare/v0.5.3...v0.5.4) (2017-07-15)



<a name="0.5.3"></a>
## [0.5.3](https://github.com/kaiu-io/serializer/compare/v0.5.0...v0.5.3) (2017-07-13)



<a name="0.5.1"></a>
## [0.5.1](https://github.com/kaiu-io/serializer/compare/v0.5.0...v0.5.1) (2017-07-13)



<a name="0.5.0"></a>
# 0.5.0 (2017-07-12)


### Features

* [WIP] added inheritance management, but some issues come with webpack ([b333b69](https://github.com/kaiu-io/serializer/commit/b333b69))
* added basic deserialization, with type conservation. ([f946d21](https://github.com/kaiu-io/serializer/commit/f946d21))
* inheritence management is now done. ([0149709](https://github.com/kaiu-io/serializer/commit/0149709))
