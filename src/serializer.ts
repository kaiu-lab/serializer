import 'reflect-metadata';
import { Registration } from './registration';

export class Serializer {

    /**
     * Our current registrations for inheritance handling.
     * @type {Array}
     * @private
     */
    private _registrations: Registration[] = [];

    /**
     * Gets the discriminator field for a given class.
     * @param clazz
     * @returns string | undefined The discriminator field name if present, else undefined.
     */
    private static getDiscriminator(clazz: new(...args: any[]) => any): string | undefined {
        return Reflect.getMetadata('serialize:discriminator', clazz);
    }

    /**
     * Adds the given registrations to our current registration array.
     * @param registration
     */
    public register(registration: Registration[]): void {
        this._registrations = this._registrations.concat(registration);
    }

    /**
     * Adds a class to a given basic object, adding the whole prototype of the class to the basic object.
     * Example
     * (given that you have a Foo class with a bar method)
     *      let object = {'bla':'lol'};
     *      let fooInstance = serializer.deserialize(object, Foo);
     *      fooInstance.bar();//This will work.
     *
     * @param obj
     * @param clazz
     * @returns {any}
     */
    public deserialize<T>(obj: any, clazz?: any): T {
        //if the class parameter is not specified, we can directly return the basic object.
        if (!clazz) {
            return obj;
        }
        //First of all, we'll create an instance of our class
        let result: T = this.getInstance<T>(obj, clazz);
        //Then we copy every property of our object to our clazz
        for (let prop in obj) {
            //Simple check to avoid iterations over strange things.
            if (obj.hasOwnProperty(prop)) {
                //We get our metadata for the class to deserialize
                let metadata: new() => any = Reflect.getMetadata('serialize:class', result, prop);
                //If we have some metadata, we'll handle them
                if (metadata !== undefined) {
                    if (obj[prop] instanceof Array) {
                        result[prop] = [];
                        for (let item of obj[prop]) {
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
        return result;
    }

    /**
     * Creates an instance of a given class using the base object to find which class we need,
     * The base object will be used to get a possible discriminator value to be able to handle inheritance.
     *
     * @param obj The object we need a class for.
     * @param clazz The base class of the object, can be an abstract class.
     * @returns {any} An instance of the class we wanted.
     */
    private getInstance<T>(obj: any, clazz: new(...args: any[]) => T): T {
        let discriminatorField: string = Serializer.getDiscriminator(clazz);
        // If we don't have metadata for inheritance, we can return the instance of the class we created.
        if (discriminatorField === undefined) {
            return new clazz();
        }
        if (obj[discriminatorField] === undefined) {
            return new clazz();
        }
        let resultConstructor: new() => any = this.getClass(clazz, obj, discriminatorField);
        return new resultConstructor();
    }

    /**
     * Used to get the class from our registrations using the parent class and the current discriminator value.
     *
     * @param parent The parent class of our current class.
     * @param obj The javascript object with data inside.
     * @param discriminatorField The field used to discriminate children.
     * @returns constructor The constructor of the class we're looking for, or the parent constructor if none is found.
     */
    private getClass(parent: any, obj: any, discriminatorField: string): new() => any {
        let discriminatorValue: string = obj[discriminatorField];
        let children: { [index: string]: { new(...args: any[]): any } } = {};
        for (let entry of this._registrations) {
            // If the parent of this entry is the one we're looking for.
            // This allows to declare a map for the same parent in different modules.
            if (entry.parent === parent) {
                // We add these children to our children array.
                children = {...children, ...entry.children};
            }
        }
        if (children[discriminatorValue] === undefined) {
            throw new TypeError(`No class for ${parent.name} class with discriminator value ${obj[discriminatorField]}`);
        }
        let childDiscriminatorField: string = Serializer.getDiscriminator(children[discriminatorValue]);
        // If the child used has children too.
        if (childDiscriminatorField !== undefined && childDiscriminatorField !== discriminatorField) {
            return this.getClass(children[discriminatorValue], obj, childDiscriminatorField);
        }
        return children[discriminatorValue];
    }


}
