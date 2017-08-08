import { Registration } from './registration';
import { Class, Instantiable } from './class';
import { ParentOptions } from './decorator/parent-options';
import { METADATA_PARENT } from './decorator/parent';

export class Registry {

    /**
     * Our current registrations for inheritance handling.
     */
    private _registrations: Registration[] = [];

    /**
     * Creates an instance of a given class using the base object to find which class we need,
     * The base object will be used to get a possible discriminator value to be able to handle inheritance.
     *
     * @param obj The object we need a class for.
     * @param clazz The base class of the object, can be an abstract class.
     * @returns An instance of the class we wanted.
     */
    public getInstance<T>(obj: any, clazz: Class<T>): T {
        const parentOptions = this.getParentOptions(clazz);
        // If we don't have metadata for inheritance, we can return the instance of the class we created.
        if (parentOptions === undefined) {
            return new (clazz as Instantiable<T>)();
        }
        const discriminatorValue = obj[parentOptions.discriminatorField];
        // In case of missing discriminator value...
        if (discriminatorValue === undefined || discriminatorValue === null) {
            // ...check if the parent allows itself and no explicit discriminators are defined.
            if (!parentOptions.allowSelf && !this.parentHasExplicitDiscriminator(clazz)) {
                throw new TypeError(`Missing attribute type to discriminate the subclass of ${clazz.name}`);
            }

            return new (clazz as Instantiable<T>)();
        }
        const resultInstantiable = this.getInstantiable(clazz, obj, parentOptions);
        return new resultInstantiable();
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
    public add(registration: Registration[]): void {
        for (const reg of registration) {

            const parentOptions = this.getParentOptions(reg.parent);

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
     * Gets the discriminator field for a given class.
     */
    private getParentOptions(clazz: Class): ParentOptions | undefined {
        return Reflect.getMetadata(METADATA_PARENT, clazz);
    }

    /**
     * Used to get the class from our registrations using the parent class and the current discriminator value.
     *
     * @param parent The parent class of our current class.
     * @param obj The javascript object with data inside.
     * @param options The Options used to configure the parent class.
     * @returns The constructor of the class we're looking for, or the parent constructor if none is found.
     */
    private getInstantiable(parent: Class, obj: any, options: ParentOptions): Instantiable {
        const discriminatorValue: string = obj[options.discriminatorField];
        let children: { [index: string]: Class } = {};
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
                return parent as Instantiable;
            } else {
                throw new TypeError(`No matching subclass for parent class ${parent.name} ` +
                    `with discriminator value ${obj[options.discriminatorField]}`);
            }
        }
        const childOptions = this.getParentOptions(children[discriminatorValue]);
        // If the child used has children too.
        if (childOptions !== undefined
            && childOptions.discriminatorField !== undefined
            && childOptions.discriminatorField !== options.discriminatorField) {
            return this.getInstantiable(children[discriminatorValue], obj, childOptions);
        }
        return children[discriminatorValue] as Instantiable;
    }


    /**
     * Check if the given parent class has explicitly defined its discriminator value.
     */
    private parentHasExplicitDiscriminator(clazz: Class): boolean {
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
}
