import { expect } from 'chai';
import { DeserializeAs, DeserializeFieldName, FieldName, Parent, Serializer } from '../src';

@Parent({
    discriminatorField: 'type'
})
class ParentExample {
}

@Parent({
    discriminatorField: 'type'
})
abstract class AbstractParentExample {
    abstract test(): string;
}

@Parent({
    discriminatorField: 'child',
    allowSelf: true
})
class Child extends AbstractParentExample {
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
    @DeserializeAs([Bar])
    bars: Bar[];
}

class DifferentFieldName {
    @FieldName('foo')
    bar: string;
}

class DifferentFieldNames {
    @FieldName('foo')
    bar: string;

    @DeserializeFieldName('name')
    firstName: string;

    @FieldName('count')
    length: number;
}

class NotOnlyDifferentFieldName {
    @DeserializeFieldName('foo')
    bar: string;

    hey: string;
}

class DifferentFieldNameWithClass {
    @DeserializeAs(Bar)
    @FieldName('foo')
    bar: Bar;
}

class DifferentFieldNameArray {
    @FieldName('foo')
    bar: number[];
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

        it('Should deserialize class instance', (() => {
            const res = serializer.deserialize<Foo>({
                'attrString': 'val',
                'attrNumber': 5,
                'attrBoolean': true
            }, Foo);
            expect(res).to.be.instanceof(Foo);
            expect(res.getMe()).to.eql('val - 5');
        }));

        it('Should deserialize array of class instances', (() => {
            const res = serializer.deserialize<Foo>([
                {
                    'attrString': 'val',
                    'attrNumber': 5,
                    'attrBoolean': true,
                }, {
                    'attrString': 'foo',
                    'attrNumber': 10
                },
            ], [Foo]);
            expect(res).to.be.an('array').of.length(2);

            expect(res[0]).to.be.instanceof(Foo);
            expect(res[0].getMe()).to.eql('val - 5');

            expect(res[1]).to.be.instanceof(Foo);
            expect(res[1].getMe()).to.eql('foo - 10');
        }));
    });

    describe('Recursive deserialization tests', () => {
        it('Has to be able to handle object instance inside an object', (() => {
            expect(serializer.deserialize<Baz>({bar: {prop: 'hey'}}, Baz).bar.getProp()).to.eql('hey');
        }));

        it('Has to be able to handle object instances array inside an object', (() => {
            const example = new BazArray();
            const bar = new Bar();
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
            serializer.registry.add([
                {
                    parent: AbstractParentExample,
                    children: {
                        'child': Child
                    }
                }
            ]);
            expect(serializer.deserialize<AbstractParentExample>({type: 'child'}, AbstractParentExample).test()).to.eql('CHILD 1');
        }));

        it('Should handle child of child', (() => {
            serializer.registry.add([
                {
                    parent: AbstractParentExample,
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
            expect(serializer.deserialize<AbstractParentExample>({
                type: 'child',
                child: 'grandchild'
            }, AbstractParentExample).test()).to.eql('GRAND CHILD');
        }));

        it('Should throw an error if no children are found with given discriminator', () => {
            serializer.registry.add([
                {
                    parent: AbstractParentExample,
                    children: {
                        'child': Child
                    }
                }
            ]);
            expect(() => serializer.deserialize<AbstractParentExample>({type: 'fail'}, AbstractParentExample))
                .to.throw(TypeError, 'No matching subclass for parent class AbstractParentExample with discriminator value fail');
        });

        it('Should throw an error if the children does not extends the parent', () => {
            expect(() => serializer.registry.add([
                {
                    parent: AbstractParentExample,
                    children: {
                        'foo': Foo,
                    },
                },
            ])).to.throw(TypeError, 'Class Foo needs to extend AbstractParentExample to be registered as a child');
        });

        it('Should throw an error if the parent is registered among the children without allowing itself', () => {
            expect(() => serializer.registry.add([
                {
                    parent: ParentExample,
                    children: {
                        'parent': ParentExample,
                    },
                },
            ])).to.throw(TypeError, 'Class ParentExample cannot be registered among its children');
        });

        it('Should handle a null or undefined discriminator value if the parent allows itself', () => {
            serializer.registry.add([
                    {
                        parent: Child,
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
            serializer.registry.add([
                    {
                        parent: Child,
                        children: {
                            'child': Child,
                            'grandchild': GrandChild,
                        },
                    },
                ],
            );

            expect(serializer.deserialize<Child>({child: 'child'}, Child).test()).to.eql('CHILD 1');
        });

        it('Should throw if the parent discriminator is explicitly defined and the discriminator value is missing', () => {
            const expectedError = 'Missing attribute type to discriminate the subclass of AbstractParentExample';

            expect(() => serializer.deserialize<AbstractParentExample>({type: null}, AbstractParentExample))
                .to.throw(TypeError, expectedError);
            expect(() => serializer.deserialize<AbstractParentExample>({type: undefined}, AbstractParentExample))
                .to.throw(TypeError, expectedError);
            expect(() => serializer.deserialize<AbstractParentExample>({}, AbstractParentExample))
                .to.throw(TypeError, expectedError);
        });

        it('Should throw an error if the discriminator is null or undefined and the parent does not allow itself', () => {
            serializer.registry.add([
                    {
                        parent: AbstractParentExample,
                        children: {
                            'child': Child,
                        },
                    },
                ],
            );

            const expectedError = 'Missing attribute type to discriminate the subclass of AbstractParentExample';

            expect(() => serializer.deserialize<AbstractParentExample>({type: null}, AbstractParentExample))
                .to.throw(TypeError, expectedError);
            expect(() => serializer.deserialize<AbstractParentExample>({type: undefined}, AbstractParentExample))
                .to.throw(TypeError, expectedError);
            expect(() => serializer.deserialize<AbstractParentExample>({}, AbstractParentExample))
                .to.throw(TypeError, expectedError);
        });
    });

    describe('Override registration tests', () => {
        it('Should allow multiple registration of the same class under multiple discriminator value', () => {
            serializer.registry.add([
                    {
                        parent: Child,
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
            serializer.registry.add([
                    {
                        parent: Child,
                        children: {
                            'grandchild': GrandChild,
                        },
                    },
                    {
                        parent: Child,
                        children: {
                            'grandchild': OtherGrandChild,
                        },
                    },
                ],
            );

            expect(serializer.deserialize<Child>({child: 'grandchild'}, Child).test()).to.eql('OTHER GRAND CHILD');

            serializer.registry.add([
                    {
                        parent: Child,
                        children: {
                            'grandchild': GrandChild,
                        },
                    },
                ],
            );

            expect(serializer.deserialize<Child>({child: 'grandchild'}, Child).test()).to.eql('GRAND CHILD');
        });
    });

    describe('Property name binding', () => {

        it('Should be able to use a different field name', () => {
            const obj = {foo: 'okay'};
            const res = serializer.deserialize<DifferentFieldName>(obj, DifferentFieldName);
            expect(res.bar).to.eq(obj.foo);
        });

        it('Should be able to use multiple different field names', () => {
            const obj = {foo: 'okay', name: 'testing', count: 5};
            const res = serializer.deserialize<DifferentFieldNames>(obj, DifferentFieldNames);
            expect(res.bar).to.eq(obj.foo);
            expect(res.firstName).to.eq(obj.name);
            expect(res.length).to.eq(obj.count);
        });

        it('Should be able to use a different field name with default bindings in the same class', () => {
            const obj = {foo: 'okay', hey: 'hoo'};
            const res = serializer.deserialize<NotOnlyDifferentFieldName>(obj, NotOnlyDifferentFieldName);
            expect(res.bar).to.eq(obj.foo);
            expect(res.hey).to.eq(obj.hey);
        });

        it('Should be able to use a different field name with class binding', () => {
            const obj = {
                foo: {
                    prop: 'success'
                }
            };
            const res = serializer.deserialize<DifferentFieldNameWithClass>(obj, DifferentFieldNameWithClass);
            expect(res.bar.getProp()).to.eq(obj.foo.prop);
        });

        it('Should be able to use a different field name with array', () => {
            const obj = {
                foo: [1, 2, 3, 4]
            };
            const res = serializer.deserialize<DifferentFieldNameArray>(obj, DifferentFieldNameArray);
            expect(res.bar).to.eq(obj.foo);
        });
    });
});
