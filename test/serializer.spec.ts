import { expect } from 'chai';
import { mock, SinonMock } from 'sinon';
import { DeserializeAs, DeserializeFieldName, FieldName, Registry, Serializer } from '../src';
import { SerializeFieldName } from '../src/decorator/serialize-field-name';
import { Transient } from '../src/decorator/transient';

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

class DifferentFieldNameSerialize {
    @SerializeFieldName('foo')
    bar: string;
}

class TransientProperty {
    bar: string;

    @Transient()
    password: string;
}

describe('Serializer service', () => {

    let serializer: Serializer;

    it('Should have a working constructor', () => {
        expect(new Serializer()).to.be.instanceof(Serializer);
    });

    it('Should have a working constructor with registry', () => {
        expect(new Serializer(new Registry())).to.be.instanceof(Serializer);
    });

    describe('Basic deserialization tests', () => {

        beforeEach(() => {
            serializer = new Serializer();
        });

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

        it('Should throw an error if we ask to deserialize an array but the given param is not', () => {
            const obj: any = {attrString: 'val', attrNumber: 5};
            expect(() => serializer.deserialize(obj, [Foo]))
                .to.throw(TypeError, 'Deserializing an array of Foo can only work with an array of objects.');
        });

        it('Should throw an error if we ask to deserialize an object but the given param is not', () => {
            const obj: any = [{attrString: 'val', attrNumber: 5}];
            expect(() => serializer.deserialize(obj, Foo))
                .to.throw(TypeError, 'Deserializing an instance of Foo can only work with an object, but array given.');
        });

    });

    describe('Recursive deserialization tests', () => {

        beforeEach(() => {
            serializer = new Serializer();
        });

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

    describe('Property name binding', () => {

        beforeEach(() => {
            serializer = new Serializer();
        });

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

    describe('Inheritance tests', () => {

        let mockRegistry: SinonMock;

        beforeEach(() => {
            serializer = new Serializer();
            mockRegistry = mock(serializer.registry);
        });

        it('Should instantiate whatever class returned by the registry', (() => {
            mockRegistry.expects('findClass').once().returns(Foo);
            expect(serializer.deserialize({}, Bar)).to.be.instanceOf(Foo);

            mockRegistry.restore();
            mockRegistry.verify();
        }));

    });

    describe('Serialization tests', () => {

        it('Should be able to serialize classic Javascript object', () => {
            expect(serializer.serialize({
                foo: 'bar',
                baz: 257,
                kek: true
            })).to.equal('{"foo":"bar","baz":257,"kek":true}');
        });

        it('Should be able to use custom field names', () => {
            const mockFieldName = new DifferentFieldName();
            mockFieldName.bar = 'baz';
            expect(serializer.serialize(mockFieldName)).to.equal('{"foo":"baz"}');
            const mockSerializeFieldName = new DifferentFieldNameSerialize();
            mockSerializeFieldName.bar = 'baz';
            expect(serializer.serialize(mockSerializeFieldName)).to.equal('{"foo":"baz"}');
        });

        it('Should be able to use Transient decorator', () => {
            const mockTransient = new TransientProperty();
            mockTransient.bar = 'foo';
            mockTransient.password = 'Super secret';
            expect(serializer.serialize(mockTransient)).to.equal('{"bar":"foo"}');
        });
    });
});
