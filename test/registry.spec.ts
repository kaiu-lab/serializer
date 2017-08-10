import { expect } from 'chai';
import { Parent, Registry } from '../src';

@Parent({
    discriminatorField: 'type'
})
abstract class AbstractFirstLevel {
}

@Parent({
    discriminatorField: 'typeA',
    allowSelf: true
})
class SecondLevelA extends AbstractFirstLevel {
}

class ThirdLevelA extends SecondLevelA {
}

@Parent({
    discriminatorField: 'typeB'
})
class SecondLevelB extends AbstractFirstLevel {
}

class ThirdLevelB1 extends SecondLevelB {
}

class ThirdLevelB2 extends SecondLevelB {
}


describe('Registry service', () => {
    let registry: Registry;
    beforeEach(() => {
        registry = new Registry();
    });

    it('Should have a working constructor', () => {
        expect(new Registry()).to.be.instanceof(Registry);
    });

    describe('Basic usage', () => {
        it('Should use discriminant field to find correct child', (() => {
            registry.add([
                {
                    parent: SecondLevelA,
                    children: {
                        'child': ThirdLevelA,
                    }
                }
            ]);
            expect(registry.findClass(SecondLevelA, {typeA: 'child'})).to.equal(ThirdLevelA);
        }));

        it('Should works with abstract parent', (() => {
            registry.add([
                {
                    parent: AbstractFirstLevel,
                    children: {
                        'child': SecondLevelA,
                    }
                }
            ]);
            expect(registry.findClass(AbstractFirstLevel, {type: 'child'})).to.equal(SecondLevelA);
        }));

        it('Should handle child of child', (() => {
            registry.add([
                {
                    parent: AbstractFirstLevel,
                    children: {
                        'child': SecondLevelA,
                    }
                },
                {
                    parent: SecondLevelA,
                    children: {
                        'grandchild': ThirdLevelA,
                    }
                }
            ]);
            expect(registry.findClass(AbstractFirstLevel, {type: 'child', typeA: 'grandchild'})).to.equal(ThirdLevelA);
        }));

        it('Should throw an error if no children are found with given discriminator', () => {
            registry.add([
                {
                    parent: AbstractFirstLevel,
                    children: {}
                }
            ]);
            expect(() => registry.findClass(AbstractFirstLevel, {type: 'fail'}))
                .to.throw(TypeError, 'No matching subclass for parent class AbstractFirstLevel with discriminator value fail');
        });

        it('Should throw an error if no children are found with given discriminator and the parent allow itself', () => {
            registry.add([
                    {
                        parent: SecondLevelA,
                        children: {},
                    },
                ],
            );

            expect(() => registry.findClass(SecondLevelA, {typeA: 'fail'}))
                .to.throw(TypeError, 'No matching subclass for parent class SecondLevelA with discriminator value fail');
        });

        it('Should throw an error if the registered parent does not have a Parent decorator', () => {
            expect(() => registry.add([
                {
                    parent: ThirdLevelA,
                    children: {},
                },
            ])).to.throw(TypeError, 'Class ThirdLevelA needs a @Parent decorator to be registered');
        });

        it('Should throw an error if the children does not extends the parent', () => {
            expect(() => registry.add([
                {
                    parent: SecondLevelA,
                    children: {
                        'child': ThirdLevelB1,
                    },
                },
            ])).to.throw(TypeError, 'Class ThirdLevelB1 needs to extend SecondLevelA to be registered as a child');
        });

        it('Should throw an error if the parent is registered among the children without allowing itself', () => {
            expect(() => registry.add([
                {
                    parent: SecondLevelB,
                    children: {
                        'itself': SecondLevelB,
                    },
                },
            ])).to.throw(TypeError, 'Class SecondLevelB cannot be registered among its children');
        });

        it('Should handle a null or undefined discriminator value if the parent allows itself', () => {
            registry.add([
                    {
                        parent: SecondLevelA,
                        children: {},
                    },
                ],
            );

            expect(registry.findClass(SecondLevelA, {typeA: null})).to.equal(SecondLevelA);
            expect(registry.findClass(SecondLevelA, {typeA: undefined})).to.equal(SecondLevelA);
            expect(registry.findClass(SecondLevelA, {})).to.equal(SecondLevelA);
        });

        it('Should handle the parent discriminator value if it allows itself', () => {
            registry.add([
                    {
                        parent: SecondLevelA,
                        children: {
                            'itself': SecondLevelA,
                        },
                    },
                ],
            );

            expect(registry.findClass(SecondLevelA, {typeA: 'itself'})).to.equal(SecondLevelA);
        });

        it('Should throw if the parent discriminator is explicitly defined and the discriminator value is missing', () => {
            registry.add([
                {
                    parent: AbstractFirstLevel,
                    children: {},
                },
            ]);

            const expectedError = 'Missing attribute type to discriminate the subclass of AbstractFirstLevel';

            expect(() => expect(registry.findClass(AbstractFirstLevel, {type: null})))
                .to.throw(TypeError, expectedError);
            expect(() => expect(registry.findClass(AbstractFirstLevel, {type: undefined})))
                .to.throw(TypeError, expectedError);
            expect(() => expect(registry.findClass(AbstractFirstLevel, {})))
                .to.throw(TypeError, expectedError);
        });

        it('Should throw an error if the discriminator is null or undefined and the parent does not allow itself', () => {
            registry.add([
                    {
                        parent: SecondLevelB,
                        children: {
                            'child': ThirdLevelB1,
                        },
                    },
                ],
            );

            const expectedError = 'Missing attribute type to discriminate the subclass of SecondLevelB';

            expect(() => expect(registry.findClass(SecondLevelB, {typeB: null})))
                .to.throw(TypeError, expectedError);
            expect(() => expect(registry.findClass(SecondLevelB, {typeB: undefined})))
                .to.throw(TypeError, expectedError);
            expect(() => expect(registry.findClass(SecondLevelB, {})))
                .to.throw(TypeError, expectedError);
        });

        it('Should throw an error if the discriminator value has no subclass and the parent does not allow itself', () => {
            registry.add([
                    {
                        parent: SecondLevelB,
                        children: {
                            'child': ThirdLevelB1,
                        },
                    },
                ],
            );

            const expectedError = 'No matching subclass for parent class SecondLevelB with discriminator value fail';

            expect(() => expect(registry.findClass(SecondLevelB, {typeB: 'fail'})))
                .to.throw(TypeError, expectedError);
        });
    });

    describe('Override registration tests', () => {
        it('Should allow multiple registrations of the same class under multiple discriminator values', () => {
            registry.add([
                    {
                        parent: AbstractFirstLevel,
                        children: {
                            'child': SecondLevelA,
                            'enfant': SecondLevelA,
                        },
                    },
                ],
            );

            expect(registry.findClass(AbstractFirstLevel, {type: 'child'})).to.equal(SecondLevelA);
            expect(registry.findClass(AbstractFirstLevel, {type: 'enfant'})).to.equal(SecondLevelA);
        });

        it('Should allow to override a discriminator value with an other class', () => {
            registry.add([
                    {
                        parent: SecondLevelB,
                        children: {
                            'child': ThirdLevelB1,
                        },
                    },
                    {
                        parent: SecondLevelB,
                        children: {
                            'child': ThirdLevelB2,
                        },
                    },
                ],
            );

            expect(registry.findClass(SecondLevelB, {typeB: 'child'})).to.equal(ThirdLevelB2);

            registry.add([
                    {
                        parent: SecondLevelB,
                        children: {
                            'child': ThirdLevelB1,
                        },
                    },
                ],
            );

            expect(registry.findClass(SecondLevelB, {typeB: 'child'})).to.equal(ThirdLevelB1);
        });

        it('Should merge registrations of the same parent', () => {
            registry.add([
                {
                    parent: SecondLevelB,
                    children: {
                        'child1': ThirdLevelB1,
                        'childX': ThirdLevelB1,
                    },
                }]);

            expect(registry.findClass(SecondLevelB, {typeB: 'child1'})).to.equal(ThirdLevelB1);
            expect(registry.findClass(SecondLevelB, {typeB: 'childX'})).to.equal(ThirdLevelB1);

            registry.add([
                    {
                        parent: SecondLevelB,
                        children: {
                            'child2': ThirdLevelB2,
                            'childX': ThirdLevelB2,
                        },
                    },
                ],
            );

            expect(registry.findClass(SecondLevelB, {typeB: 'child1'})).to.equal(ThirdLevelB1);
            expect(registry.findClass(SecondLevelB, {typeB: 'child2'})).to.equal(ThirdLevelB2);
            expect(registry.findClass(SecondLevelB, {typeB: 'childX'})).to.equal(ThirdLevelB2);

        });

        it('Should change the parentHasExplicitDiscriminator flag when merging registrations', () => {
            registry.add([
                {
                    parent: SecondLevelA,
                    children: {
                        'child': ThirdLevelA,
                    },
                }]);

            //Get child should work
            expect(registry.findClass(SecondLevelA, {typeA: 'child'})).to.equal(ThirdLevelA);

            //Get parent itself with IMPLICIT discriminator should work
            expect(registry.findClass(SecondLevelA, {typeA: null})).to.equal(SecondLevelA);
            expect(registry.findClass(SecondLevelA, {typeA: undefined})).to.equal(SecondLevelA);
            expect(registry.findClass(SecondLevelA, {})).to.equal(SecondLevelA);

            //Get parent itself with EXPLICIT discriminator should NOT work
            expect(() => expect(registry.findClass(SecondLevelA, {typeA: 'itself'})))
                .to.throw(TypeError, 'No matching subclass for parent class SecondLevelA with discriminator value itself');

            registry.add([
                    {
                        parent: SecondLevelA,
                        children: {
                            'itself': SecondLevelA,
                        },
                    },
                ],
            );

            //Get child should still work
            expect(registry.findClass(SecondLevelA, {typeA: 'child'})).to.equal(ThirdLevelA);

            //Get parent itself with EXPLICIT discriminator should work instead
            expect(registry.findClass(SecondLevelA, {typeA: 'itself'})).to.equal(SecondLevelA);

            //Get parent itself with IMPLICIT discriminator should NOT work
            const expectedError = 'Missing attribute type to discriminate the subclass of SecondLevelA';
            expect(() => expect(registry.findClass(SecondLevelA, {typeA: null})))
                .to.throw(TypeError, expectedError);
            expect(() => expect(registry.findClass(SecondLevelA, {typeA: undefined})))
                .to.throw(TypeError, expectedError);
            expect(() => expect(registry.findClass(SecondLevelA, {})))
                .to.throw(TypeError, expectedError);

        });
    });

});
