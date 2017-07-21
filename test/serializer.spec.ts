import { Serializer } from '../src/serializer';
import { expect } from 'chai';
import { DeserializeAs } from '../src/decorator/deserialize-as';
import { ParentExample } from './parent-example';
import { Child } from './child';
import { GrandChild } from './grand-child';

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
            let example: Baz = new Baz();
            example.bar = new Bar();
            example.bar.prop = 'hey';
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
    });
});
