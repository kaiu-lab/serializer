import 'reflect-metadata';
import { Class, Instantiable } from './class';
import { METADATA_DESERIALIZE_AS } from './decorator/deserialize-as';
import { METADATA_DESERIALIZE_FIELD_NAME } from './decorator/deserialize-field-name';
import { METADATA_CUSTOM_FIELDS } from './decorator/field-name';
import { Registry } from './registry';
import { METADATA_SERIALIZE_FIELD_NAME } from './decorator/serialize-field-name';
import { METADATA_TRANSIENT_PROPERTY } from './decorator/transient';

/**
 * The main class of the serializer, used to deserialize `Objects` into class instances in order to add
 * class's prototype to the object.
 *
 * ## Simple example:
 * ```typescript
 * class Bar {
 *     prop: string;
 *     getProp() {
 *         return this.prop;
 *     }
 * }
 * const serializer = new Serializer();
 * const bar = serializer.deserialize({ prop: 'foo' }, Bar);
 * console.log(bar.getProp());
 * // This will print 'foo' to the console because bar is an instance of Bar,
 * // not a simple Object anymore.
 * ```
 *
 * This implementation can use a [[Registry]] to handle inheritance.
 * ## Example with inheritance:
 * ```typescript
 * ​@Parent({
 *      discriminatorField: 'type'
 * })
 * class Bar {
 *     echo() { return 'I am Bar'; }
 * }
 *
 * class SubBar extends Bar {
 *     echo() { return 'I am Sub Bar'; }
 * }
 *
 * const serializer = new Serializer();
 * serializer.registry.add([
 *      { parent: Bar, children: { 'sub': SubBar }},
 * ]);
 * const bar = serializer.deserialize({ type: 'sub' }, Bar);
 * console.log(bar.echo());
 * // This will print 'I am Sub Bar' to the console
 * // because bar is an instance of SubBar after following the inheritance.
 * ```
 */
export class Serializer {

    constructor(public readonly registry = new Registry()) {
    }

    /**
     * Deserialize an object into a specified class.
     *
     * @return an instance of the class `T`.
     */
    public deserialize<T>(obj: any, clazz: Class<T>, additionalData?: any): T;

    /**
     * Deserialize an array of objects into an array of specified classes.
     *
     * @return an array of instances of the class `T`.
     */
    public deserialize<T>(array: any[], clazz: [Class<T>], additionalData?: any): T[];

    /**
     * Deserialize an object or an array of objects into instances of specified class,
     * adding the whole prototype of the class to the basic objects.
     *
     * For an array of objects, the type specified should be an array of the class.
     * ## Example
     * ```typescript
     * serializer.deserialize({ prop: 'bar' }, Foo); // -> Foo
     * serializer.deserialize([{ prop: 'bar' }, {prop: 'baz'}], [Foo]); // -> [Foo, Foo]
     * ```
     *
     * @returns an instance (or an array of instances) of the class `T`.
     */
    public deserialize<T>(obj: any, clazz: Class<T> | [Class<T>], additionalData?: any): T | T[] {

        //If the object is an array, we have to handle it as an array.
        if (clazz instanceof Array) {
            //Check the consistency between the type of deserialization and the type of the given object.
            if (!(obj instanceof Array)) {
                const itemClazz = clazz[0];
                throw new TypeError(`Deserializing an array of ${itemClazz.name} can only work with an array of objects.`);
            }

            return this.deserializeArray<T>(obj, clazz[0], additionalData);
        }

        //Check the consistency between the type of deserialization and the type of the given object.
        if (obj instanceof Array) {
            throw new TypeError(`Deserializing an instance of ${clazz.name} can only work with an object, but array given.`);
        }
        return this.deserializeObject<T>(obj, clazz);
    }

    /**
     * Serialize an object into JSON string, taking Decorators in count for it.
     *
     * `@FieldName`, `@SerializeFieldName` and `@Transient` can affect this method.
     *
     * Example:
     *
     * ```typescript
     * export class Example{
     *      @SerializeFieldName('bar')
     *      foo: string;
     *
     *      @Transient()
     *      password: string;
     * }
     *
     * const obj = new Example();
     * obj.foo = 'baz'
     * const result = serializer.serialize(obj);
     * console.log(obj);
     * ```
     *
     * This will print a JSON string for `obj`, without `password` property in it, and `foo` property renamed to `bar`.
     *
     * @param data
     * @param additionalData additional data you want to add to keep trace of a context during serialization in a
     * child class, the goal behind that is to provide a way for serializers extending this one to use custom data
     * across a single object, no matter how deep we are in the object.
     * @returns {string}
     */
    public serialize(data: any, additionalData?: any): string {
        //We have to create a clone of data in order to avoid deleting properties in the original object.
        const obj = this.prepareSerialize(JSON.parse(JSON.stringify(data)), data, additionalData);
        return JSON.stringify(obj);
    }

    protected prepareSerialize(obj: any, instance: any, propertyKey?: string, additionalData?: any): any {
        let target = propertyKey === undefined ? obj : obj[propertyKey];
        const targetInstance = propertyKey === undefined ? instance : instance[propertyKey];
        //First of all, we have to map the data object in order to process transient fields and custom field names.
        // If this is not an object, we can skip the recursion part
        if (target !== null && typeof target === 'object') {
            // Else, for each property, we have to transform the object to handle the specific case of each property.
            for (const key of Object.keys(target)) {
                target = this.prepareSerialize(target, targetInstance, key, additionalData);
            }
        }
        if (propertyKey !== undefined) {
            //First of all, check if property is transient, as we don't have to go further if it is.
            if (Reflect.getMetadata(METADATA_TRANSIENT_PROPERTY, instance, propertyKey)) {
                delete obj[propertyKey];
            } else {
                //We need to get metadata from data as targetObj doesn't have metadata informations.
                const customFieldName = Reflect.getMetadata(METADATA_SERIALIZE_FIELD_NAME, instance, propertyKey);
                if (customFieldName !== undefined) {
                    obj[customFieldName] = obj[propertyKey];
                    delete obj[propertyKey];
                }
            }
        }
        return obj;
    }

    /**
     * Deserialize an object into a specified class.
     * @param obj The object.
     * @param clazz The class constructor.
     * @param additionalData additional data you want to add to keep trace of a context during serialization in a
     * child class, the goal behind that is to provide a way for serializers extending this one to use custom data
     * across a single object, no matter how deep we are in the object.
     * @return an instance of the class `T`.
     */
    protected deserializeObject<T>(obj: any, clazz: Class<T>, additionalData?: any): T {
        //First of all, we'll find if the registry knows any subclass
        const instantiable: Instantiable = this.registry.findClass(clazz, obj);

        const result = new instantiable();

        //And we get the property binding map.
        const properties = this.getDeserializePropertyMap(obj, result);
        //Then we copy every property of our object to our instance, using bindings.
        for (const originalPropertyName in properties) {
            const targetPropertyName = properties[originalPropertyName];
            //We get our metadata for the class to deserialize.
            const propClazz: Class = Reflect.getMetadata(METADATA_DESERIALIZE_AS, result, targetPropertyName);
            //If we have some class-related metadata, we'll handle them.
            if (propClazz !== undefined) {
                result[targetPropertyName] = this.deserialize(obj[originalPropertyName], propClazz, additionalData);
            } else {
                //Else we can copy the object as it is, since we don't need to create a specific object instance.
                result[targetPropertyName] = obj[originalPropertyName];
            }
        }
        return result as T;
    }

    /**
     * Deserialize an array of objects into an array of specified classes.
     * @param array The array of objects.
     * @param clazz The class constructor.
     * @param additionalData additional data you want to add to keep trace of a context during serialization in a
     * child class, the goal behind that is to provide a way for serializers extending this one to use custom data
     * across a single object, no matter how deep we are in the object.
     * @returns An array of instances of the type `T`.
     */
    protected deserializeArray<T>(array: any[], clazz: Class<T>, additionalData?: any): T[] {
        const results = [];
        for (const item of array) {
            results.push(this.deserialize<T>(item, clazz, additionalData));
        }
        return results;
    }

    /**
     * Returns the fields used to map data properties on result's ones for deserialization.
     *
     * @param instance An instance of the class we're using.
     * @param obj The current object we're deserializing.
     * @returns A custom array containing obj's field as index and corresponding result's field as value.
     */
    protected getDeserializePropertyMap(obj: any, instance: any): { [index: string]: string } {
        const propsMap: { [index: string]: string } = {};
        //We create a first property map based on obj's properties.
        Object.keys(obj).forEach(prop => {
            propsMap[prop] = prop;
        });
        //We get our metadata registry for custom properties
        const customProperties = Reflect.getMetadata(METADATA_CUSTOM_FIELDS, instance);
        if (customProperties === undefined) {
            //If we don't have custom properties, going further is useless.
            return propsMap;
        }
        //Using our custom properties
        for (const property of customProperties) {
            //We override current properties with the ones defined as custom.
            propsMap[Reflect.getMetadata(METADATA_DESERIALIZE_FIELD_NAME, instance, property)] = property;
        }
        return propsMap;
    }
}
