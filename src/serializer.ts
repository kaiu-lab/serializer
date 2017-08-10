import 'reflect-metadata';
import { Class, Instantiable } from './class';
import { METADATA_DESERIALIZE_AS } from './decorator/deserialize-as';
import { METADATA_DESERIALIZE_FIELD_NAME } from './decorator/deserialize-field-name';
import { METADATA_CUSTOM_FIELDS } from './decorator/field-name';
import { Registry } from './registry';
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
    public deserialize<T>(obj: any, clazz: Class<T>): T;

    /**
     * Deserialize an array of objects into an array of specified classes.
     *
     * @return an array of instances of the class `T`.
     */
    public deserialize<T>(array: any[], clazz: [Class<T>]): T[];

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
    public deserialize<T>(obj: any, clazz: Class<T> | [Class<T>]): T | T[] {

        //If the object is an array, we have to handle it as an array.
        if (clazz instanceof Array) {
            //Check the consistency between the type of deserialization and the type of the given object.
            if (!(obj instanceof Array)) {
                const itemClazz = clazz[0];
                throw new TypeError(`Deserializing an array of ${itemClazz.name} can only work with an array of objects.`);
            }

            return this.deserializeArray<T>(obj, clazz[0]);
        }

        //Check the consistency between the type of deserialization and the type of the given object.
        if (obj instanceof Array) {
            throw new TypeError(`Deserializing an instance of ${clazz.name} can only work with an object, but array given.`);
        }
        return this.deserializeObject<T>(obj, clazz);
    }

    /**
     * Deserialize an object into a specified class.
     * @param obj The object.
     * @param clazz The class constructor.
     * @return an instance of the class `T`.
     */
    private deserializeObject<T>(obj: any, clazz: Class<T>): T {
        //First of all, we'll find if the registry knows any subclass
        const instantiable: Instantiable = this.registry.findClass(clazz, obj);

        const result = new instantiable();

        //And we get the property binding map.
        const properties = this.getPropertyMap(obj, result);
        //Then we copy every property of our object to our instance, using bindings.
        for (const originalPropertyName in properties) {
            const targetPropertyName = properties[originalPropertyName];
            //We get our metadata for the class to deserialize.
            const propClazz: Class = Reflect.getMetadata(METADATA_DESERIALIZE_AS, result, targetPropertyName);
            //If we have some class-related metadata, we'll handle them.
            if (propClazz !== undefined) {
                result[targetPropertyName] = this.deserialize(obj[originalPropertyName], propClazz);
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
     * @returns An array of instances of the type `T`.
     */
    private deserializeArray<T>(array: any[], clazz: Class<T>): T[] {
        const results = [];
        for (const item of array) {
            results.push(this.deserialize<T>(item, clazz));
        }
        return results;
    }

    /**
     * Returns the fields used to map data properties on result's ones.
     *
     * @param instance An instance of the class we're using.
     * @param obj The current object we're deserializing.
     * @returns A custom array containing obj's field as index and corresponding result's field as value.
     */
    private getPropertyMap(obj: any, instance: any): { [index: string]: string } {
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
