import 'reflect-metadata';
import { Registration } from './registration';
import { ParentOptions } from './decorator/parent-options';
import { Instantiable } from './instantiable';
import { METADATA_DESERIALIZE_AS } from './decorator/deserialize-as';
import { METADATA_CUSTOM_FIELDS } from './decorator/field-name';
import { METADATA_PARENT } from './decorator/parent';
import { METADATA_DESERIALIZE_FIELD_NAME } from './decorator/deserialize-field-name';

/**
 * The main class of the serializer, used to deserialize `Objects` into class instances in order to add
 * class's prototype to the object.
 *
 * ## Example:
 * ```typescript
 * class Bar {
 *     prop: string;
 *     getProp(): string {
 *         return this.prop;
 *     }
 * }
 * let serializer = new Serializer();
 * let bar = serializer.deserialize<Bar>({ prop: 'foo' }, Bar);
 * console.log(bar.getProp());
 * ```
 * This will print 'foo' to the console because bar is an instance of `Bar`, not a simple `Object` anymore.
 */
export class Serializer {

    /**
     * Our current registrations for inheritance handling.
     */
    private _registrations: Registration[] = [];

    /**
     * Gets the discriminator field for a given class.
     */
    private static getParentOptions(clazz: Instantiable): ParentOptions | undefined {
        return Reflect.getMetadata(METADATA_PARENT, clazz);
    }

    /**
     * Returns the fields used to map data properties on result's ones.
     *
     * @param instance An instance of the class we're using.
     * @param obj The current object we're deserializing.
     * @returns A custom array containing obj's field as index and corresponding result's field as value.
     */
    private static getPropertyMap(obj: any, instance: any): { [index: string]: string } {
        const propsMap: { [index: string]: string } = {};
        //We create a first property map based on obj's properties.
        for (const prop in obj) {
            //Simple check to avoid iterations over strange things.
            if (obj.hasOwnProperty(prop)) {
                //The initial map will have identical keys and values.
                propsMap[prop] = prop;
            }
        }
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

    /**
     * Adds the given registrations to our current registration array.
     *
     * ## Example:
     * ```typescript
     * let serializer = new Serializer();
     * serializer.register([
     *      {
     *          parent: Foo,
     *          children: {
     *              'bar':Bar,
     *              'baz':Baz
     *          }
     *      }
     * ]);
     * ```
     * @param registration The `Registration` array we want to register.
     */
    public register(registration: Registration[]): void {
        for (const reg of registration) {

            const parentOptions = Serializer.getParentOptions(reg.parent);

            for (const value in reg.children) {
                const child = reg.children[value];

                //Check if the child is the parent itself
                if (child === reg.parent) {
                    if (!parentOptions.allowSelf) {
                        throw new TypeError(`Class ${reg.parent.name} cannot be registered among its children`);
                    }
                } else {
                    //Check if the child extends the parent
                    if (!(child.prototype instanceof reg.parent)) {
                        throw new TypeError(`Class ${child.name} needs to extend ${reg.parent.name} to be registered as a child`);
                    }
                }
            }
        }
        this._registrations = this._registrations.concat(registration);
    }

    /**
     * Adds a class to a given basic object, adding the whole prototype of the class to the basic object.
     * ## Example
     * ```typescript
     * serializer.deserialize<Bar>({ prop: 'foo' }, Bar);
     * ```
     * @param obj The object, usually coming from a simple `JSON.parse`
     * @param clazz The class constructor.
     * @returns An instance of the type `T` with the prototype of `clazz` or one of its registered children.
     */
    public deserialize<T>(obj: any, clazz?: any): T {
        //if the class parameter is not specified, we can directly return the basic object.
        if (!clazz) {
            return obj;
        }
        //First of all, we'll create an instance of our class
        const result: any = this.getInstance<T>(obj, clazz);
        //And we get the property binding map.
        const properties = Serializer.getPropertyMap(obj, result);
        //Then we copy every property of our object to our instance, using bindings.
        for (const prop in properties) {
            //We get our metadata for the class to deserialize.
            const className: new() => any = Reflect.getMetadata(METADATA_DESERIALIZE_AS, result, properties[prop]);
            //If we have some class-related metadata, we'll handle them.
            if (className !== undefined) {
                if (obj[prop] instanceof Array) {
                    result[properties[prop]] = [];
                    for (const item of obj[prop]) {
                        result[properties[prop]].push(this.deserialize(item, className));
                    }
                } else {
                    result[properties[prop]] = this.deserialize(obj[prop], className);
                }
            } else {
                //Else we can copy the object as it is, since we don't need to create a specific object instance.
                result[properties[prop]] = obj[prop];
            }
        }
        return result as T;
    }

    /**
     * Creates an instance of a given class using the base object to find which class we need,
     * The base object will be used to get a possible discriminator value to be able to handle inheritance.
     *
     * @param obj The object we need a class for.
     * @param clazz The base class of the object, can be an abstract class.
     * @returns An instance of the class we wanted.
     */
    private getInstance<T>(obj: any, clazz: Instantiable<T>): T {
        const parentOptions = Serializer.getParentOptions(clazz);
        // If we don't have metadata for inheritance, we can return the instance of the class we created.
        if (parentOptions === undefined) {
            return new clazz();
        }
        const discriminatorValue = obj[parentOptions.discriminatorField];
        // In case of missing discriminator value...
        if (discriminatorValue === undefined || discriminatorValue === null) {
            // ...check if the parent allows itself and no explicit discriminators are defined.
            if (!parentOptions.allowSelf && !this.parentHasExplicitDiscriminator(clazz)) {
                throw new TypeError(`Missing attribute type to discriminate the subclass of ${clazz.name}`);
            }

            return new clazz();
        }
        const resultInstantiable = this.getClass(clazz, obj, parentOptions);
        return new resultInstantiable();
    }

    /**
     * Check if the given parent class has explicitly defined its discriminator value.
     */
    private parentHasExplicitDiscriminator(clazz: Instantiable): boolean {
        for (const reg of this._registrations) {
            // Ignore registrations that does not concern this parent.
            if (reg.parent !== clazz) {
                continue;
            }

            for (const value in reg.children) {
                if (reg.children[value] === clazz) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Used to get the class from our registrations using the parent class and the current discriminator value.
     *
     * @param parent The parent class of our current class.
     * @param obj The javascript object with data inside.
     * @param options The Options used to configure the parent class.
     * @returns The constructor of the class we're looking for, or the parent constructor if none is found.
     */
    private getClass(parent: any, obj: any, options: ParentOptions): Instantiable {
        const discriminatorValue: string = obj[options.discriminatorField];
        let children: { [index: string]: Instantiable } = {};
        for (const entry of this._registrations) {
            // If the parent of this entry is the one we're looking for.
            // This allows to declare a map for the same parent in different modules.
            if (entry.parent === parent) {
                // We add these children to our children array.
                children = {...children, ...entry.children};
            }
        }
        if (children[discriminatorValue] === undefined) {
            if (options.allowSelf) {
                return parent;
            } else {
                throw new TypeError(`No matching subclass for parent class ${parent.name} ` +
                    `with discriminator value ${obj[options.discriminatorField]}`);
            }
        }
        const childOptions = Serializer.getParentOptions(children[discriminatorValue]);
        // If the child used has children too.
        if (childOptions !== undefined
            && childOptions.discriminatorField !== undefined
            && childOptions.discriminatorField !== options.discriminatorField) {
            return this.getClass(children[discriminatorValue], obj, childOptions);
        }
        return children[discriminatorValue];
    }
}
