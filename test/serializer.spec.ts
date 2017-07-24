import { Serializer } from '../src/serializer';
import { expect } from 'chai';
import { DeserializeAs } from '../src/decorator/deserialize-as';
import { Parent } from '../src/decorator/parent';

@Parent({
    discriminatorField: 'type'
})
class ParentExample {
    test(): string {
        return 'PARENT';
    }
}

@Parent({
    discriminatorField: 'child',
    allowSelf: true
})
class Child extends ParentExample {
    test(): string {
        return 'CHILD 1';
    }
}

class GrandChild extends Child {
    test(): string {
        return 'GRAND CHILD';
    }
}

class OtherGrandChild extends Child {
    test(): string {
        return 'OTHER GRAND CHILD';
    }
}

class Foo {
    public attrString: string;
    public attrNumber: number;

    public getMe(): string {
        return this.attrString + ' - ' + this.attrNumber;
    }
}

class Bar {
    prop: string;

    getProp(): string {
        return this.prop;
    }
}

class Baz {
    @DeserializeAs(Bar)
    bar: Bar;
}

class BazArray {
    @DeserializeAs(Bar)
    bars: Bar[];
}


describe('Serializer service', () => {
    let serializer: Serializer;
    beforeEach(() => {
        serializer = new Serializer();
    });

    it('Should have a working constructor', () => {
        expect(new Serializer()).to.be.instanceof(Serializer);
    });

    describe('Basic deserialization tests', () => {

        it('Should deserialize array of strings', (() => {
            expect(serializer.deserialize<any>(['val1', 'val2'])).to.eql(['val1', 'val2']);
        }));

        it('Should deserialize array of numbers', (() => {
            expect(serializer.deserialize<any>([1, 2])).to.eql([1, 2]);
        }));

        it('Should deserialize array of nulls', (() => {
            expect(serializer.deserialize<any>([null, null])).to.eql([null, null]);
        }));

        it('Should deserialize array of booleans', (() => {
            expect(serializer.deserialize<any>([true, false])).to.eql([true, false]);
        }));

        it('Should deserialize array of arrays', (() => {
            expect(serializer.deserialize<any>([['val1', 'val2'], [5, 6]]))
                .to.eql([['val1', 'val2'], [5, 6]]);
        }));

        it('Should deserialize array of arrays', (() => {
            expect(serializer.deserialize<any>(['val', 5, null, true, ['val1', 'val2']]))
                .to.eql(['val', 5, null, true, ['val1', 'val2']]);
        }));

        it('Should deserialize standard object', (() => {
            expect(serializer.deserialize<any>({
                'attr_string': 'val',
                'attr_number': 5,
                'attr_boolean': true,
                'attr_null': null,
                'attr_array': ['val1', 5, null, [true, false]]
            }))
                .to.eql({
                    attr_string: 'val',
                    attr_number: 5,
                    attr_boolean: true,
                    attr_null: null,
                    attr_array: ['val1', 5, null, [true, false]]
                }
            );
        }));

        it('Should deserialize array of standard objects', (() => {
            expect(serializer.deserialize<any>(
                [
                    {
                        'attr_string': 'val1',
                        'attr_number': 1,
                        'attr_boolean': true,
                        'attr_array': ['val1', 5, null, [true, false]]
                    },
                    {
                        'attr_string': 'val2',
                        'attr_number': 2,
                        'attr_boolean': false,
                        'attr_null': null,
                        'attr_object': {'foo': ['bar', 'baz']}
                    },
                    {
                        'attr_string': 'val3',
                        'attr_objects': [
                            {'foo': 'bar'},
                            {'john': 'snow'},
                            {'no-idea': [1, 2]}
                        ]
                    }
                ]
            ))
                .to.eql([
                    {
                        'attr_string': 'val1',
                        'attr_number': 1,
                        'attr_boolean': true,
                        'attr_array': ['val1', 5, null, [true, false]]
                    },
                    {
                        'attr_string': 'val2',
                        'attr_number': 2,
                        'attr_boolean': false,
                        'attr_null': null,
                        'attr_object': {'foo': ['bar', 'baz']}
                    },
                    {
                        'attr_string': 'val3',
                        'attr_objects': [
                            {'foo': 'bar'},
                            {'john': 'snow'},
                            {'no-idea': [1, 2]}
                        ]
                    }
                ]
            );
        }));

        it('Should deserialize class instance', (() => {
            let res: Foo = serializer.deserialize<Foo>({
                'attrString': 'val',
                'attrNumber': 5,
                'attrBoolean': true
            }, Foo);
            expect(typeof(res)).to.eql(typeof(new Foo()));
            expect(res.getMe()).to.eql('val - 5');
        }));
    });

    describe('Recursive deserialization tests', () => {
        it('Has to be able to handle object instance inside an object', (() => {
            expect(serializer.deserialize<Baz>({bar: {prop: 'hey'}}, Baz).bar.getProp()).to.eql('hey');
        }));

        it('Has to be able to handle object instances array inside an object', (() => {
            let example: BazArray = new BazArray();
            let bar: Bar = new Bar();
            bar.prop = 'hey';
            example.bars = [];
            example.bars.push(bar);
            example.bars.push(bar);
            expect(serializer.deserialize<BazArray>(
                {
                    bars: [
                        {prop: 'hey'},
                        {prop: 'hey'}
                    ]
                }, BazArray).bars[0].getProp()).to.eql('hey');
        }));
    });

    describe('Inheritance tests', () => {
        it('Should use discriminant field to find correct child', (() => {
            serializer.register([
                {
                    parent: ParentExample,
                    children: {
                        'child': Child
                    }
                }
            ]);
            expect(serializer.deserialize<ParentExample>({type: 'child'}, ParentExample).test()).to.eql('CHILD 1');
        }));

        it('Should handle child of child', (() => {
            serializer.register([
                {
                    parent: ParentExample,
                    children: {
                        'child': Child
                    }
                },
                {
                    parent: Child,
                    children: {
                        'grandchild': GrandChild
                    }
                }
            ]);
            expect(serializer.deserialize<ParentExample>({
                type: 'child',
                child: 'grandchild'
            }, ParentExample).test()).to.eql('GRAND CHILD');
        }));

        it('Should throw an error if no children are found with given discriminator', () => {
            serializer.register([
                {
                    parent: ParentExample,
                    children: {
                        'child': Child
                    }
                }
            ]);
            expect(() => serializer.deserialize<ParentExample>({type: 'fail'}, ParentExample))
                .to.throw(TypeError, 'No matching subclass for parent class ParentExample with discriminator value fail');
        });

        it('Should throw an error if the children does not extends the parent', () => {
            expect(() => serializer.register([
                {
                    parent  : ParentExample,
                    children: {
                        'foo': Foo,
                    },
                },
            ])).to.throw(TypeError, 'Class Foo needs to extend ParentExample to be registered as a child');
        });

        it('Should throw an error if the parent is registered among the children without allowing itself', () => {
            expect(() => serializer.register([
                {
                    parent  : ParentExample,
                    children: {
                        'child' : Child,
                        'parent': ParentExample,
                    },
                },
            ])).to.throw(TypeError, 'Class ParentExample cannot be registered among its children');
        });

        it('Should handle a null or undefined discriminator value if the parent allows itself', () => {
            serializer.register([
                    {
                        parent  : Child,
                        children: {
                            'grandchild': GrandChild,
                        },
                    },
                ],
            );

            expect(serializer.deserialize<Child>({child: null}, Child).test()).to.eql('CHILD 1');
            expect(serializer.deserialize<Child>({child: undefined}, Child).test()).to.eql('CHILD 1');
            expect(serializer.deserialize<Child>({}, Child).test()).to.eql('CHILD 1');
        });

        it('Should handle the parent discriminator value if it allows itself', () => {
            serializer.register([
                    {
                        parent  : Child,
                        children: {
                            'child'     : Child,
                            'grandchild': GrandChild,
                        },
                    },
                ],
            );

            expect(serializer.deserialize<Child>({child: 'child'}, Child).test()).to.eql('CHILD 1');
        });

        it('Should throw if the parent discriminator is explicitly defined and the discriminator value is missing', () => {
            serializer.register([
                    {
                        parent  : Child,
                        children: {
                            'child'     : Child,
                            'grandchild': GrandChild,
                        },
                    },
                ],
            );

            const expectedError: string = 'Missing attribute type to discriminate the subclass of ParentExample';

            expect(() => serializer.deserialize<ParentExample>({type: null}, ParentExample))
                .to.throw(TypeError, expectedError);
            expect(() => serializer.deserialize<ParentExample>({type: undefined}, ParentExample))
                .to.throw(TypeError, expectedError);
            expect(() => serializer.deserialize<ParentExample>({}, ParentExample))
                .to.throw(TypeError, expectedError);
        });

        it('Should throw an error if the discriminator is null or undefined and the parent does not allow itself', () => {
            serializer.register([
                    {
                        parent  : ParentExample,
                        children: {
                            'child': Child,
                        },
                    },
                ],
            );

            const expectedError: string = 'Missing attribute type to discriminate the subclass of ParentExample';

            expect(() => serializer.deserialize<ParentExample>({type: null}, ParentExample))
                .to.throw(TypeError, expectedError);
            expect(() => serializer.deserialize<ParentExample>({type: undefined}, ParentExample))
                .to.throw(TypeError, expectedError);
            expect(() => serializer.deserialize<ParentExample>({}, ParentExample))
                .to.throw(TypeError, expectedError);
        });
    });

    describe('Override registration tests', () => {
        it('Should allow multiple registration of the same class under multiple discriminator value', () => {
            serializer.register([
                    {
                        parent  : Child,
                        children: {
                            'grandchild': GrandChild,
                            'otherchild': GrandChild,
                        },
                    },
                ],
            );

            expect(serializer.deserialize<Child>({child: 'grandchild'}, Child).test()).to.eql('GRAND CHILD');
            expect(serializer.deserialize<Child>({child: 'otherchild'}, Child).test()).to.eql('GRAND CHILD');
        });

        it('Should allow to override a discriminator value with an other class', () => {
            serializer.register([
                    {
                        parent  : Child,
                        children: {
                            'grandchild': GrandChild,
                        },
                    },
                    {
                        parent  : Child,
                        children: {
                            'grandchild': OtherGrandChild,
                        },
                    },
                ],
            );

            expect(serializer.deserialize<Child>({child: 'grandchild'}, Child).test()).to.eql('OTHER GRAND CHILD');

            serializer.register([
                    {
                        parent  : Child,
                        children: {
                            'grandchild': GrandChild,
                        },
                    },
                ],
            );

            expect(serializer.deserialize<Child>({child: 'grandchild'}, Child).test()).to.eql('GRAND CHILD');
        });
    });
});
