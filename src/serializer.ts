import 'reflect-metadata';
import { Injectable } from '@angular/core';
import { ParentOptions } from './decorator/parent-options';

/**
 * A simple service to inject where you need to be able to use serialization with more than JSON would do.
 */
@Injectable()
export class Serializer {

    public deserialize<T>(obj: any, clazz?: {new(): T}): T {
        //if the class parameter is not specified, we can directly return the basic object.
        if (!clazz) {
            return obj;
        }
        //First of all, we'll create an instance of our class
        let result: T = this.getInstance<T>(clazz);
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

    private getInstance<T>(clazz: new() => T): T {
        // We can't get metadata from the class itself, we have to create an instance of it first.
        let instance: any = new clazz();
        let metadata: ParentOptions = Reflect.getMetadata('serialize:parent', instance);
        console.log('metadata', metadata);
        // If we don't have metadata for inheritance, we can return the instance of the class we created.
        if (metadata === undefined) {
            return instance;
        } else {
            return new metadata.children[new clazz()[metadata.discriminantField]]();
        }

    }
}