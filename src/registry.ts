import { Class, Instantiable } from './class';
import { METADATA_PARENT } from './decorator/parent';
import { ParentOptions } from './decorator/parent-options';
import { ProcessedRegistration, Registration } from './registration';

export class Registry {

    /**
     * Our current registrations for inheritance handling.
     */
    private _registrations = new Map<Class, ProcessedRegistration>();

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
            const parentOptions: ParentOptions = Reflect.getMetadata(METADATA_PARENT, reg.parent);

            if (parentOptions === undefined) {
                throw new TypeError(`Class ${reg.parent.name} needs a @Parent decorator to be registered`);
            }

            let parentHasExplicitDiscriminator = false;

            for (const value in reg.children) {
                const child = reg.children[value];

                //Check if the child is the parent itself
                if (child === reg.parent) {
                    if (!parentOptions.allowSelf) {
                        throw new TypeError(`Class ${reg.parent.name} cannot be registered among its children`);
                    }

                    parentHasExplicitDiscriminator = true;
                } else {
                    //Check if the child extends the parent
                    if (!(child.prototype instanceof reg.parent)) {
                        throw new TypeError(`Class ${child.name} needs to extend ${reg.parent.name} to be registered as a child`);
                    }
                }
            }

            this._registrations.set(reg.parent, {...reg, parentOptions, parentHasExplicitDiscriminator});
        }
    }

    /**
     * Use the class `Parent` metadata in combination with the registrations to find
     * the correct class for the given object.
     * @returns the class of the given object.
     */
    public findClass<T, V extends T>(clazz: Class<T>, obj: any): Instantiable<V> {
        const registration = this._registrations.get(clazz);

        // If we don't have metadata for inheritance, it doesn't concern the registry.
        if (registration === undefined) {
            return clazz as Instantiable;
        }

        const discriminatorValue = obj[registration.parentOptions.discriminatorField];
        // In case of missing discriminator value...
        if (discriminatorValue === undefined || discriminatorValue === null) {
            // ...check if the parent allows itself and no explicit discriminators are defined.
            if (!registration.parentOptions.allowSelf && !registration.parentHasExplicitDiscriminator) {
                throw new TypeError(`Missing attribute type to discriminate the subclass of ${clazz.name}`);
            }

            return clazz as Instantiable;
        }

        return this.getInstantiable(registration, obj);
    }

    /**
     * Used to get the class from our registrations using the parent class and the current discriminator value.
     *
     * @returns the class we're looking for, or the parent if none is found.
     */
    private getInstantiable(registration: ProcessedRegistration, obj: any): Instantiable {

        const discriminatorField = registration.parentOptions.discriminatorField;
        const discriminatorValue: string = obj[discriminatorField];
        if (typeof discriminatorValue !== 'string' && typeof discriminatorValue !== 'number') {
            throw new TypeError(`Field ${discriminatorField} used for ${registration.parent} \
discrimination should be a string, ${discriminatorValue} given.`);
        }

        const child = registration.children[discriminatorValue];
        if (child === undefined || child === registration.parent) {
            if (!registration.parentOptions.allowSelf) {
                throw new TypeError(`No matching subclass for parent class ${registration.parent.name} \
with discriminator value ${obj[discriminatorField]}.` );
            }

            return registration.parent as Instantiable;
        }

        return this.findClass(child, obj);
    }

}
