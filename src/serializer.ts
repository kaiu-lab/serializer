import 'reflect-metadata';
import { Registration } from './registration';
import { ParentOptions } from './decorator/parent-options';
import { Instantiable } from './instantiable';

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
 * let bar = serializer.deserialize<Bar>({bar: {prop: 'foo'}}, Bar);
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
        return Reflect.getMetadata('serializer:parent', clazz);
    }

    /**
     * Adds the given registrations to our current registration array.
     * @param registration
     */
    public register(registration: Registration[]): void {
        for (const reg of registration) {

            const parentOption = Serializer.getParentOptions(reg.parent);

            for (const value in reg.children) {
                const child = reg.children[value];

                //Check if the child is the parent itself
                if (child === reg.parent) {
                    if (!parentOption.allowSelf) {
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
     * serializer.deserialize<Bar>({bar: {prop: 'foo'}}, Bar);
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
        //Then we copy every property of our object to our clazz
        for (const prop in obj) {
            //Simple check to avoid iterations over strange things.
            if (obj.hasOwnProperty(prop)) {
                //We get our metadata for the class to deserialize
                const metadata: new() => any = Reflect.getMetadata('serializer:class', result, prop);
                //If we have some metadata, we'll handle them
                if (metadata !== undefined) {
                    if (obj[prop] instanceof Array) {
                        result[prop] = [];
                        for (const item of obj[prop]) {
                            result[prop].push(this.deserialize(item, metadata));
                        }
                    } else {
                        result[prop] = this.deserialize(obj[prop], metadata);
                    }
                } else {
                    //Else we can copy the object as it is, since we don't need to create a specific object instance.
                    result[prop] = obj[prop];
                }
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
        const resultConstructor = this.getClass(clazz, obj, parentOptions);
        return new resultConstructor();
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
